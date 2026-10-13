import express from 'express';
import { scoringService } from '../services/scoringService.js';

const router = express.Router();

// Memory store for in-flight attempts (will link to SQL database in Phase 7)
const activeAttempts = new Map();
const completedAttempts = [];

// GET /api/assessments - list available assessments
router.get('/', (req, res) => {
  const list = scoringService.getPublicAssessments();
  res.json({
    ok: true,
    data: list
  });
});

// GET /api/assessments/:id - get assessment questions (sanitized)
router.get('/:id', (req, res) => {
  const assessment = scoringService.getAssessmentForTaking(req.params.id);
  if (!assessment) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: `Assessment '${req.params.id}' not found.` }
    });
  }
  res.json({
    ok: true,
    data: assessment
  });
});

// POST /api/assessments/:id/start - start assessment session
router.post('/:id/start', (req, res) => {
  const assessment = scoringService.getAssessmentForTaking(req.params.id);
  if (!assessment) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: `Assessment '${req.params.id}' not found.` }
    });
  }

  const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const startedAt = Date.now();

  activeAttempts.set(attemptId, {
    attemptId,
    assessmentId: assessment.id,
    startedAt,
    timeLimitSeconds: assessment.timeLimitSeconds
  });

  res.json({
    ok: true,
    data: {
      attemptId,
      assessmentId: assessment.id,
      startedAt,
      timeLimitSeconds: assessment.timeLimitSeconds
    }
  });
});

// GET /api/assessments/:id/hidden-inputs - retrieve hidden test inputs (without answers!)
router.get('/:id/hidden-inputs', (req, res) => {
  const hiddenInputs = scoringService.getHiddenTestInputs(req.params.id);
  if (!hiddenInputs) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: `Assessment '${req.params.id}' not found.` }
    });
  }
  res.json({
    ok: true,
    data: hiddenInputs
  });
});

// POST /api/assessments/:id/submit - evaluate and grade submission
router.post('/:id/submit', (req, res) => {
  const { attemptId, answers, hiddenOutputs } = req.body;

  try {
    const report = scoringService.gradeSubmission(req.params.id, answers, hiddenOutputs);
    const submissionRecord = {
      attemptId: attemptId || `sub_${Date.now()}`,
      assessmentId: req.params.id,
      submittedAt: new Date().toISOString(),
      ...report
    };

    completedAttempts.push(submissionRecord);
    if (attemptId) activeAttempts.delete(attemptId);

    res.json({
      ok: true,
      data: submissionRecord
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
      error: { code: 'GRADING_ERROR', message: err.message }
    });
  }
});

// GET /api/assessment-attempts - attempt history
router.get('/attempts/history', (req, res) => {
  res.json({
    ok: true,
    data: completedAttempts
  });
});

export default router;

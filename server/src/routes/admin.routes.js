import express from 'express';
import db from '../config/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Enforce authentication and admin privileges for all admin routes
router.use(requireAuth);
router.use(requireAdmin);

// GET /api/admin/stats - System aggregate metrics
router.get('/stats', async (req, res) => {
  try {
    const [userCount] = await db('users').count('id as count');
    const [lessonCompletions] = await db('lesson_progress').count('id as count');
    const [quizAttempts] = await db('quiz_attempts').count('id as count');
    const [correctQuizzes] = await db('quiz_attempts').where({ correct: 1 }).orWhere({ correct: true }).count('id as count');
    const [assessmentAttempts] = await db('assessment_attempts').count('id as count');
    const [avgScore] = await db('assessment_attempts').avg('score as avg');
    const [projectCount] = await db('projects').count('id as count');

    const totalQuiz = Number(quizAttempts?.count || 0);
    const correctQuiz = Number(correctQuizzes?.count || 0);
    const quizAccuracy = totalQuiz > 0 ? Math.round((correctQuiz / totalQuiz) * 100) : 0;

    res.json({
      ok: true,
      data: {
        totalUsers: Number(userCount?.count || 0),
        totalLessonsCompleted: Number(lessonCompletions?.count || 0),
        totalQuizAttempts: totalQuiz,
        quizAccuracy,
        totalAssessmentAttempts: Number(assessmentAttempts?.count || 0),
        averageAssessmentScore: Math.round(Number(avgScore?.avg || 0)),
        totalProjects: Number(projectCount?.count || 0),
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// GET /api/admin/users - List all users
router.get('/users', async (req, res) => {
  try {
    const users = await db('users')
      .select('id', 'username', 'email', 'role', 'display_name', 'xp', 'level', 'created_at')
      .orderBy('created_at', 'desc');

    res.json({
      ok: true,
      data: users
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// GET /api/admin/lessons - List lessons with engagement statistics
router.get('/lessons', async (req, res) => {
  try {
    const lessons = await db('lessons')
      .join('topics', 'lessons.topic_id', 'topics.id')
      .leftJoin('lesson_progress', 'lessons.id', 'lesson_progress.lesson_id')
      .select(
        'lessons.id',
        'lessons.title',
        'lessons.slug',
        'lessons.difficulty',
        'lessons.estimated_time',
        'lessons.is_interactive',
        'topics.title as topic_title'
      )
      .count('lesson_progress.id as completions_count')
      .groupBy('lessons.id')
      .orderBy('lessons.order_index', 'asc');

    res.json({
      ok: true,
      data: lessons
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// GET /api/admin/questions - List practice questions
router.get('/questions', async (req, res) => {
  try {
    const questions = await db('practice_questions')
      .join('topics', 'practice_questions.topic_id', 'topics.id')
      .select(
        'practice_questions.id',
        'practice_questions.title',
        'practice_questions.type',
        'practice_questions.difficulty',
        'topics.title as topic_title'
      )
      .orderBy('practice_questions.id', 'desc');

    res.json({
      ok: true,
      data: questions
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// POST /api/admin/questions - Create a new practice question
router.post('/questions', async (req, res) => {
  const { topic_id, type, title, prompt, starter_code, code, answer, difficulty, explanation, options } = req.body;

  if (!topic_id || !title || !prompt) {
    return res.status(400).json({
      ok: false,
      error: { code: 'VALIDATION_ERROR', message: 'topic_id, title, and prompt are required.' }
    });
  }

  try {
    const newId = `pq_${Date.now()}`;
    await db('practice_questions').insert({
      id: newId,
      topic_id,
      type: type || 'coding',
      title,
      prompt,
      code: starter_code || code || '',
      answer: answer || 'Instructor created solution',
      options: options ? JSON.stringify(options) : null,
      difficulty: difficulty || 'Medium',
      hints: JSON.stringify(['Review the prompt carefully.', 'Test with simple edge cases.']),
      explanation: explanation || 'Instructor created practice problem.'
    });

    const created = await db('practice_questions').where({ id: newId }).first();

    res.status(201).json({
      ok: true,
      data: created
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});


// GET /api/admin/assessments - List recent assessment submissions
router.get('/assessments', async (req, res) => {
  try {
    const attempts = await db('assessment_attempts')
      .join('users', 'assessment_attempts.user_id', 'users.id')
      .join('assessments', 'assessment_attempts.assessment_id', 'assessments.id')
      .select(
        'assessment_attempts.id',
        'assessment_attempts.score',
        'assessment_attempts.passed',
        'assessment_attempts.time_spent_seconds',
        'assessment_attempts.completed_at',
        'users.username',
        'users.display_name',
        'assessments.title as assessment_title'
      )
      .orderBy('assessment_attempts.completed_at', 'desc')
      .limit(50);

    res.json({
      ok: true,
      data: attempts
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

export default router;

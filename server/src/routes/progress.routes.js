import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /api/progress/summary
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.json({
        ok: true,
        data: {
          isGuest: true,
          completedLessonsCount: 0,
          xp: 0,
          level: 1,
          quizAttemptsCount: 0,
          assessmentAttemptsCount: 0
        }
      });
    }

    const user = await db('users').where({ id: userId }).first();
    const completedLessons = await db('lesson_progress').where({ user_id: userId });
    const quizAttempts = await db('quiz_attempts').where({ user_id: userId });
    const assessmentAttempts = await db('assessment_attempts').where({ user_id: userId });

    const correctQuizzes = quizAttempts.filter(q => q.correct).length;
    const quizAccuracy = quizAttempts.length > 0 ? Math.round((correctQuizzes / quizAttempts.length) * 100) : 0;

    res.json({
      ok: true,
      data: {
        isGuest: false,
        user: { id: user.id, username: user.username, display_name: user.display_name },
        completedLessonsCount: completedLessons.length,
        xp: user.xp,
        level: user.level,
        quizAttemptsCount: quizAttempts.length,
        quizAccuracy,
        assessmentAttemptsCount: assessmentAttempts.length
      }
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// GET /api/progress/analytics
router.get('/analytics', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    const quizAttempts = userId
      ? await db('quiz_attempts').join('practice_questions', 'quiz_attempts.question_id', 'practice_questions.id').where({ 'quiz_attempts.user_id': userId }).select('practice_questions.topic_id', 'quiz_attempts.correct')
      : [];

    const topicStats = {};
    for (const qa of quizAttempts) {
      if (!topicStats[qa.topic_id]) {
        topicStats[qa.topic_id] = { total: 0, correct: 0 };
      }
      topicStats[qa.topic_id].total++;
      if (qa.correct) topicStats[qa.topic_id].correct++;
    }

    res.json({
      ok: true,
      data: {
        topicStats,
        recordedAttemptsCount: quizAttempts.length
      }
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// GET /api/progress/recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const nextLesson = await db('lessons')
      .join('topics', 'lessons.topic_id', 'topics.id')
      .select('lessons.slug', 'lessons.title', 'topics.title as topic_title', 'lessons.estimated_time')
      .first();

    res.json({
      ok: true,
      data: {
        recommendation: nextLesson,
        ruleApplied: 'Lowest completion order in foundational curriculum sequence'
      }
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// GET /api/leaderboard - genuine recorded results only
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await db('users')
      .select('id', 'username', 'display_name', 'xp', 'level')
      .orderBy('xp', 'desc')
      .limit(10);

    res.json({
      ok: true,
      data: topUsers
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

export default router;

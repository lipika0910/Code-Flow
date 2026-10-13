import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// Helper to parse JSON fields safely
function parseJson(str, fallback = []) {
  try {
    return typeof str === 'string' ? JSON.parse(str) : str || fallback;
  } catch {
    return fallback;
  }
}

// GET /api/lessons - list lessons with topic and completion status
router.get('/', async (req, res) => {
  try {
    const lessons = await db('lessons')
      .join('topics', 'lessons.topic_id', 'topics.id')
      .select(
        'lessons.id',
        'lessons.topic_id',
        'topics.title as topic_title',
        'topics.slug as topic_slug',
        'lessons.slug',
        'lessons.title',
        'lessons.order_index',
        'lessons.estimated_time',
        'lessons.difficulty',
        'lessons.is_interactive'
      )
      .orderBy('topics.order_index', 'asc')
      .orderBy('lessons.order_index', 'asc');

    // If user is authenticated, attach completion state
    let completedIds = new Set();
    if (req.user) {
      const progress = await db('lesson_progress').where({ user_id: req.user.id });
      completedIds = new Set(progress.map(p => p.lesson_id));
    }

    const result = lessons.map(l => ({
      ...l,
      is_completed: completedIds.has(l.id)
    }));

    res.json({
      ok: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// GET /api/lessons/:slug - get detailed lesson
router.get('/:slug', async (req, res) => {
  try {
    const lesson = await db('lessons')
      .join('topics', 'lessons.topic_id', 'topics.id')
      .where('lessons.slug', req.params.slug)
      .orWhere('lessons.id', req.params.slug)
      .select(
        'lessons.*',
        'topics.title as topic_title',
        'topics.slug as topic_slug',
        'topics.category as topic_category'
      )
      .first();

    if (!lesson) {
      return res.status(404).json({
        ok: false,
        error: { code: 'NOT_FOUND', message: `Lesson '${req.params.slug}' not found.` }
      });
    }

    let isCompleted = false;
    if (req.user) {
      const comp = await db('lesson_progress')
        .where({ user_id: req.user.id, lesson_id: lesson.id })
        .first();
      isCompleted = Boolean(comp);
    }

    res.json({
      ok: true,
      data: {
        ...lesson,
        objectives: parseJson(lesson.objectives),
        common_mistakes: parseJson(lesson.common_mistakes),
        is_completed: isCompleted
      }
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// POST /api/lessons/:id/complete - mark complete and award XP
router.post('/:id/complete', async (req, res) => {
  const lessonId = req.params.id;

  try {
    const lesson = await db('lessons').where({ id: lessonId }).orWhere({ slug: lessonId }).first();
    if (!lesson) {
      return res.status(404).json({
        ok: false,
        error: { code: 'NOT_FOUND', message: `Lesson '${lessonId}' not found.` }
      });
    }

    const userId = req.user ? req.user.id : 'guest';
    const rewardKey = `lesson_${lesson.id}`;
    let xpAwarded = 0;

    if (userId !== 'guest') {
      // Record progress if not already present
      const alreadyCompleted = await db('lesson_progress')
        .where({ user_id: userId, lesson_id: lesson.id })
        .first();

      if (!alreadyCompleted) {
        await db('lesson_progress').insert({
          user_id: userId,
          lesson_id: lesson.id
        });

        // Award XP once via unique reward_key constraint
        try {
          await db('xp_events').insert({
            user_id: userId,
            reward_key: rewardKey,
            xp_amount: 25
          });
          await db('users').where({ id: userId }).increment('xp', 25);
          xpAwarded = 25;
        } catch {
          // Already awarded
        }
      }
    } else {
      xpAwarded = 25;
    }

    res.json({
      ok: true,
      data: {
        message: 'Lesson marked complete',
        lessonId: lesson.id,
        xpAwarded
      }
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

export default router;

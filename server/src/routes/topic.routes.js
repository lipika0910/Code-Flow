import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /api/topics - list topics in curriculum order
router.get('/', async (req, res) => {
  try {
    const topics = await db('topics').orderBy('order_index', 'asc');
    res.json({
      ok: true,
      data: topics
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

export default router;

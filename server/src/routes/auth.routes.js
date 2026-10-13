import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import db from '../config/db.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1)
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      ok: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid registration details', details: parseResult.error.format() }
    });
  }

  const { username, email, password } = parseResult.data;

  try {
    const existing = await db('users')
      .where({ username })
      .orWhere({ email })
      .first();

    if (existing) {
      return res.status(409).json({
        ok: false,
        error: { code: 'CONFLICT', message: 'Username or email already in use.' }
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newUser = {
      id: userId,
      username,
      email,
      password_hash,
      role: 'student',
      xp: 0,
      level: 1,
      display_name: username
    };

    await db('users').insert(newUser);

    const token = signToken(newUser);
    res.cookie('cf_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const { password_hash: _, ...safeUser } = newUser;
    res.status(201).json({
      ok: true,
      data: { user: safeUser, token }
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      ok: false,
      error: { code: 'VALIDATION_ERROR', message: 'Identifier and password are required.' }
    });
  }

  const { identifier, password } = parseResult.data;

  try {
    const user = await db('users')
      .where({ username: identifier })
      .orWhere({ email: identifier })
      .first();

    if (!user) {
      return res.status(401).json({
        ok: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username/email or password.' }
      });
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      return res.status(401).json({
        ok: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username/email or password.' }
      });
    }

    const token = signToken(user);
    res.cookie('cf_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const { password_hash: _, ...safeUser } = user;
    res.status(200).json({
      ok: true,
      data: { user: safeUser, token }
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('cf_token');
  res.json({
    ok: true,
    data: { message: 'Logged out successfully.' }
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({
    ok: true,
    data: { user: req.user }
  });
});

// PATCH /api/profile
router.patch('/profile', requireAuth, async (req, res) => {
  const { display_name } = req.body;
  if (!display_name || typeof display_name !== 'string') {
    return res.status(400).json({
      ok: false,
      error: { code: 'VALIDATION_ERROR', message: 'display_name is required.' }
    });
  }

  try {
    await db('users').where({ id: req.user.id }).update({ display_name });
    req.user.display_name = display_name;
    res.json({
      ok: true,
      data: { user: req.user }
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

export default router;

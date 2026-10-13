import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import db from '../config/db.js';

describe('Admin Routes Integration', () => {
  let adminToken = '';
  let studentToken = '';

  beforeAll(async () => {
    // Login as admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'admin@codeflow.edu', password: 'ChangeThisPassword123!' });
    adminToken = adminRes.body.data?.token;

    // Login as student
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'student@codeflow.edu', password: 'Student123!' });
    studentToken = studentRes.body.data?.token;
  });


  it('GET /api/admin/stats rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  it('GET /api/admin/stats rejects non-admin student with 403', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('GET /api/admin/stats succeeds for admin user', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveProperty('totalUsers');
    expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(1);
    expect(res.body.data).toHaveProperty('totalLessonsCompleted');
    expect(res.body.data).toHaveProperty('quizAccuracy');
  });

  it('GET /api/admin/users lists registered accounts', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some(u => u.username === 'admin')).toBe(true);
  });

  it('GET /api/admin/lessons lists curriculum with completion metrics', async () => {
    const res = await request(app)
      .get('/api/admin/lessons')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/admin/questions creates a new practice question', async () => {
    const newQ = {
      topic_id: 't_dom',
      type: 'coding',
      title: 'Admin Created Test Question',
      prompt: 'Test query selector querySelectorAll',
      starter_code: 'document.querySelectorAll(".card");',
      difficulty: 'intermediate',
      points: 25
    };

    const res = await request(app)
      .post('/api/admin/questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newQ);


    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.title).toBe(newQ.title);

    // Verify it is in database
    const inDb = await db('practice_questions').where({ id: res.body.data.id }).first();
    expect(inDb).toBeDefined();
    expect(inDb.title).toBe(newQ.title);
  });
});

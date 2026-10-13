import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import db from '../config/db.js';

describe('Auth & User Routes Integration', () => {
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@codeflow.edu`,
    password: 'Password123!'
  };
  let userToken = '';

  it('POST /api/auth/register creates user and returns httpOnly cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.user.username).toBe(testUser.username);
    expect(res.body.data.token).toBeDefined();
    userToken = res.body.data.token;
  });

  it('POST /api/auth/register rejects duplicate username or email with 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('POST /api/auth/login succeeds with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: testUser.email,
        password: testUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('POST /api/auth/login rejects incorrect password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: testUser.email,
        password: 'WrongPassword999!'
      });

    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('GET /api/auth/me returns authenticated user details', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.user.username).toBe(testUser.username);
  });

  it('GET /api/auth/me rejects unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });
});

describe('Topics and Lessons Integration', () => {
  it('GET /api/topics returns curriculum topics ordered', async () => {
    const res = await request(app).get('/api/topics');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(6);
    expect(res.body.data[0].slug).toBe('html');
  });

  it('GET /api/lessons returns lessons list', async () => {
    const res = await request(app).get('/api/lessons');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(10);
  });

  it('GET /api/lessons/:slug returns detailed lesson content', async () => {
    const res = await request(app).get('/api/lessons/html-intro');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.title).toContain('HTML5');
    expect(Array.isArray(res.body.data.objectives)).toBe(true);
  });

  it('POST /api/lessons/:id/complete marks complete and awards XP', async () => {
    const res = await request(app).post('/api/lessons/les_html_01/complete');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.xpAwarded).toBe(25);
  });
});

describe('Projects and Versions Integration', () => {
  let token = '';
  let projectId = '';

  beforeAll(async () => {
    // Login with sample student
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'student@codeflow.edu', password: 'Student123!' });
    token = res.body.data.token;
  });

  it('POST /api/projects rejects unauthenticated request with 401', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'Unauthorized Project' });

    expect(res.status).toBe(401);
  });

  it('POST /api/projects creates a project and initial version', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'My Canvas Game',
        html_code: '<canvas></canvas>',
        css_code: 'body { margin: 0; }',
        js_code: 'console.log("Game started");'
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.name).toBe('My Canvas Game');
    projectId = res.body.data.id;
  });

  it('PATCH /api/projects/:id updates code and creates a new version', async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        js_code: 'console.log("Game updated v2");'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.js_code).toContain('v2');

    // Verify versions
    const verRes = await request(app)
      .get(`/api/projects/${projectId}/versions`)
      .set('Authorization', `Bearer ${token}`);

    expect(verRes.status).toBe(200);
    expect(verRes.body.data.length).toBe(2);
  });

  it('POST /api/projects/:id/duplicate duplicates the project', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/duplicate`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toContain('(Copy)');
  });
});

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Production SPA fallback and Static Serving', () => {
  it('serves index.html for root path /', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('CodeFlow');
  });

  it('serves index.html for nested SPA route /learn/js-loops', async () => {
    const res = await request(app).get('/learn/js-loops');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('CodeFlow');
  });

  it('still responds with JSON for /api routes rather than falling back to SPA', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });
});

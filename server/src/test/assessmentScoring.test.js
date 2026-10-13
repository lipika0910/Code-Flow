import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { scoringService } from '../services/scoringService.js';

describe('Assessment Scoring & Integrity Service', () => {
  it('does NOT leak server answers or hidden tests in public metadata', () => {
    const publicList = scoringService.getPublicAssessments();
    expect(publicList.length).toBeGreaterThanOrEqual(2);

    for (const a of publicList) {
      expect(a.questions).toBeUndefined();
      expect(a.serverAnswer).toBeUndefined();
      expect(a.hiddenTests).toBeUndefined();
    }
  });

  it('omits server answers and hidden tests from questions fetched for taking', () => {
    const assessment = scoringService.getAssessmentForTaking('assessment-web-core');
    expect(assessment).toBeDefined();

    for (const q of assessment.questions) {
      expect(q.serverAnswer).toBeUndefined();
      expect(q.hiddenTests).toBeUndefined();
      if (q.type === 'coding') {
        expect(q.visibleTests).toBeDefined();
        // Visible tests must not contain hidden flags
        expect(q.visibleTests.length).toBeGreaterThan(0);
      }
    }
  });

  it('calculates full credit when all questions and hidden tests are correct', () => {
    const answers = {
      q1: '<aside>',
      q2: 'The total element width remains 300px, and content area shrinks to 260px',
      q3: '30',
      q4: '==='
    };

    const reportedHidden = {
      q5: {
        v1: '12',
        v2: '0',
        h1: '30',
        h2: '0',
        h3: '4'
      },
      q6: {
        v1: '"Hello World"',
        h1: '"Web Programming In Codeflow"',
        h2: '"Javascript"'
      }
    };

    const report = scoringService.gradeSubmission('assessment-web-core', answers, reportedHidden);
    expect(report.totalPoints).toBe(100);
    expect(report.earnedPoints).toBe(100);
    expect(report.percentage).toBe(100);
    expect(report.passed).toBe(true);
  });

  it('correctly calculates partial credit for failing some hidden tests', () => {
    const answers = {
      q1: '<aside>', // 10 pts
      q2: 'Wrong answer', // 0 pts
      q3: '30', // 10 pts
      q4: '===' // 10 pts
    };

    // q5 has 5 tests total. Pass 3 of 5 -> 3/5 * 30 = 18 pts
    const reportedHidden = {
      q5: {
        v1: '12',
        v2: '0',
        h1: '30',
        h2: 'WRONG',
        h3: 'WRONG'
      },
      q6: {
        v1: 'WRONG',
        h1: 'WRONG',
        h2: 'WRONG'
      }
    };

    const report = scoringService.gradeSubmission('assessment-web-core', answers, reportedHidden);
    // Earned: 10 (q1) + 0 (q2) + 10 (q3) + 10 (q4) + 18 (q5) + 0 (q6) = 48
    expect(report.earnedPoints).toBe(48);
    expect(report.percentage).toBe(48);
    expect(report.passed).toBe(false);
  });
});

describe('Assessment API Endpoints', () => {
  it('GET /api/assessments returns 200 with sanitized list', async () => {
    const res = await request(app).get('/api/assessments');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);

    const first = res.body.data[0];
    expect(first.serverAnswer).toBeUndefined();
    expect(first.hiddenTests).toBeUndefined();
  });

  it('GET /api/assessments/:id returns questions without hidden tests', async () => {
    const res = await request(app).get('/api/assessments/assessment-web-core');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const strResponse = JSON.stringify(res.body.data);
    expect(strResponse).not.toContain('hiddenTests');
    expect(strResponse).not.toContain('serverAnswer');
  });

  it('POST /api/assessments/:id/submit grades submission and returns report', async () => {
    const res = await request(app)
      .post('/api/assessments/assessment-web-core/submit')
      .send({
        attemptId: 'test_attempt_1',
        answers: { q1: '<aside>', q3: '30', q4: '===' },
        hiddenOutputs: {}
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.earnedPoints).toBe(30);
    expect(res.body.data.questionsFeedback).toBeDefined();
  });
});

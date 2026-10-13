import React from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import { storage } from '../services/storage';

export default function AssessmentResultPage() {
  const { id } = useParams();
  const location = useLocation();

  // Retrieve report from router state or fall back to storage
  const attempts = storage.getAssessmentAttempts();
  const report = location.state?.report || attempts[attempts.length - 1];

  if (!report) {
    return (
      <div className="container py-5 text-center">
        <h2 className="h4 text-light">No Report Available</h2>
        <p className="text-secondary">Please complete an assessment to view score diagnostics.</p>
        <Link to="/assessment" className="cf-btn-primary">Go to Assessments</Link>
      </div>
    );
  }

  const isPassed = report.passed;

  return (
    <div className="container py-4">
      {/* Top Banner & Score Overview */}
      <div className="cf-card-elevated text-center py-5 mb-4">
        <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ background: isPassed ? 'var(--status-success-bg)' : 'var(--status-error-bg)', border: `1px solid ${isPassed ? 'var(--status-success)' : 'var(--status-error)'}` }}>
          <i className={`bi bi-${isPassed ? 'patch-check-fill' : 'exclamation-triangle-fill'} fs-1`} style={{ color: isPassed ? 'var(--status-success)' : 'var(--status-error)' }}></i>
        </div>

        <span className={`badge mb-2 ${isPassed ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '0.9rem' }}>
          {isPassed ? 'ASSESSMENT PASSED' : 'NEEDS REVISION (PASSING SCORE: 70%)'}
        </span>

        <h1 className="display-4 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          {report.percentage}%
        </h1>
        <p className="lead mb-3" style={{ color: 'var(--text-secondary)' }}>
          Earned {report.earnedPoints} of {report.totalPoints} total points in <strong>{report.title}</strong>
        </p>

        <div className="d-flex justify-content-center gap-3">
          <Link to="/assessment" className="cf-btn-secondary btn-sm">
            <i className="bi bi-arrow-left"></i> Assessment Centre
          </Link>
          <Link to="/dashboard" className="cf-btn-primary btn-sm">
            <i className="bi bi-speedometer2"></i> View Dashboard
          </Link>
        </div>
      </div>

      {/* Review Section */}
      <div className="cf-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h2 className="h5 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
              <i className="bi bi-journal-check me-2" style={{ color: 'var(--accent-teal)' }}></i>
              Authoritative Solution Review
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Correct answer keys and hidden test results revealed post-submission
            </span>
          </div>
          <span className="badge" style={{ background: 'var(--bg-surface-elevated)', color: 'var(--accent-violet)', border: '1px solid var(--border-subtle)' }}>
            {report.questionsFeedback?.length || 0} Questions Evaluated
          </span>
        </div>

        <div className="d-flex flex-column gap-4">
          {report.questionsFeedback?.map((q, idx) => (
            <div
              key={q.questionId}
              className="p-3 rounded-3"
              style={{
                background: 'var(--bg-app)',
                border: `1px solid ${q.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}
            >
              {/* Question Header */}
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <span className={`badge ${q.isCorrect ? 'bg-success' : q.pointsEarned > 0 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                    {q.isCorrect ? 'FULL MARKS' : q.pointsEarned > 0 ? 'PARTIAL CREDIT' : 'INCORRECT'}
                  </span>
                  <span className="fw-semibold text-light" style={{ fontSize: '0.9rem' }}>
                    {idx + 1}. {q.title}
                  </span>
                </div>
                <span className="fw-mono" style={{ fontSize: '0.85rem', color: 'var(--accent-teal)' }}>
                  {q.pointsEarned} / {q.pointsPossible} pts
                </span>
              </div>

              {/* Answer Key */}
              <div className="mb-2" style={{ fontSize: '0.85rem' }}>
                <span className="text-muted">Expected Answer / Outcome: </span>
                <span className="fw-semibold text-light font-mono">{q.correctAnswer}</span>
              </div>

              {/* Test Cases breakdown if coding question */}
              {q.testResults && (
                <div className="my-2 p-2 rounded" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <span className="fw-semibold text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>
                    Test Suite Evaluation (Visible & Hidden Tests):
                  </span>
                  <div className="d-flex flex-wrap gap-2">
                    {q.testResults.map((tr, i) => (
                      <span key={i} className={`badge ${tr.passed ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`} style={{ fontSize: '0.72rem' }}>
                        {tr.type === 'hidden' ? 'Hidden Test' : 'Visible Test'} #{i + 1}: {tr.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pedagogical Explanation */}
              <div className="pt-2 border-top" style={{ borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <strong>Explanation: </strong>
                <span>{q.explanation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';

export default function AssessmentCenterPage() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pastAttempts, setPastAttempts] = useState(storage.getAssessmentAttempts());

  useEffect(() => {
    async function loadAssessments() {
      try {
        const res = await fetch('/api/assessments');
        const json = await res.json();
        if (json.ok) {
          setAssessments(json.data);
        } else {
          fallbackAssessments();
        }
      } catch {
        fallbackAssessments();
      } finally {
        setLoading(false);
      }
    }

    function fallbackAssessments() {
      setAssessments([
        {
          id: 'assessment-web-core',
          title: 'Web Foundations & JavaScript Core Exam',
          topic: 'Web Programming',
          difficulty: 'Intermediate',
          timeLimitSeconds: 1800,
          passingScore: 70,
          questionCount: 6,
          totalPoints: 100
        },
        {
          id: 'assessment-dom-async',
          title: 'DOM, Events & Async Practical Assessment',
          topic: 'DOM & Async',
          difficulty: 'Advanced',
          timeLimitSeconds: 2400,
          passingScore: 70,
          questionCount: 3,
          totalPoints: 100
        }
      ]);
    }

    loadAssessments();
    setPastAttempts(storage.getAssessmentAttempts());
  }, []);

  return (
    <div className="container py-4">
      {/* Banner */}
      <div className="cf-card-elevated mb-4">
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="badge" style={{ background: 'var(--accent-violet)' }}>Academic Examination</span>
          <span className="cf-badge cf-badge-interactive">Server-Evaluated Integrity</span>
        </div>
        <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Assessment Centre
        </h1>
        <p className="mb-0 text-secondary" style={{ fontSize: '0.9rem' }}>
          Rigorous server-graded assessments featuring multiple choice, output predictions, and coding tasks evaluated against hidden test cases.
        </p>
      </div>

      {/* Rules Notice */}
      <div className="p-3 rounded-3 mb-4 d-flex align-items-start gap-3" style={{ background: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.25)' }}>
        <i className="bi bi-shield-lock-fill fs-4" style={{ color: 'var(--accent-teal)' }}></i>
        <div style={{ fontSize: '0.85rem' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Integrity Protocol & Evaluation Rules:</strong>
          <ul className="mb-0 mt-1 ps-3 text-secondary" style={{ lineHeight: '1.5' }}>
            <li>Answer keys and hidden test cases reside strictly on the server and are never included in API payloads.</li>
            <li>For coding challenges, visible test cases can be run in the browser worker; upon submission, the server evaluates hidden test inputs with normalized deep equality comparison.</li>
            <li>Timed assessments enforce server-synced countdown timers that auto-submit when the duration lapses.</li>
          </ul>
        </div>
      </div>

      {/* Assessments Grid */}
      <h2 className="h5 fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Available Assessments</h2>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="row g-4 mb-5">
          {assessments.map(a => (
            <div key={a.id} className="col-12 col-md-6">
              <div className="cf-card h-100 d-flex flex-column p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="badge" style={{ background: 'var(--accent-violet)' }}>{a.topic}</span>
                  <span className={`badge ${a.difficulty === 'Intermediate' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'}`}>
                    {a.difficulty}
                  </span>
                </div>

                <h3 className="h5 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>{a.title}</h3>

                <div className="d-flex flex-wrap gap-3 my-3 py-2 border-top border-bottom" style={{ borderColor: 'var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div><i className="bi bi-question-circle me-1 text-muted"></i>{a.questionCount} Questions</div>
                  <div><i className="bi bi-award me-1 text-muted"></i>{a.totalPoints} Total Points</div>
                  <div><i className="bi bi-clock me-1 text-muted"></i>{Math.round(a.timeLimitSeconds / 60)} Minutes</div>
                  <div><i className="bi bi-check2-circle me-1 text-muted"></i>Pass: {a.passingScore}%</div>
                </div>

                <div className="mt-auto pt-2">
                  <Link to={`/assessment/${a.id}/take`} className="cf-btn-primary w-100 justify-content-center">
                    <i className="bi bi-pencil-square"></i> Begin Assessment
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past Attempts History */}
      <h2 className="h5 fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
        <i className="bi bi-clock-history me-2" style={{ color: 'var(--accent-violet)' }}></i>
        Your Assessment History
      </h2>
      {pastAttempts.length === 0 ? (
        <div className="cf-card p-4 text-center text-muted fst-italic" style={{ fontSize: '0.85rem' }}>
          No assessment attempts recorded yet. Completed scores and reports will appear here.
        </div>
      ) : (
        <div className="cf-card p-0 overflow-hidden">
          <table className="table table-dark table-hover mb-0" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)' }}>
                <th style={{ background: 'var(--bg-surface-elevated)' }}>Assessment</th>
                <th style={{ background: 'var(--bg-surface-elevated)' }}>Score</th>
                <th style={{ background: 'var(--bg-surface-elevated)' }}>Result</th>
                <th style={{ background: 'var(--bg-surface-elevated)' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {pastAttempts.map((att, idx) => (
                <tr key={idx}>
                  <td className="fw-semibold text-light">{att.title || att.assessmentId}</td>
                  <td style={{ color: 'var(--accent-teal)' }}>{att.percentage || att.score}% ({att.earnedPoints || att.score}/{att.totalPoints || 100} pts)</td>
                  <td>
                    <span className={`badge ${att.passed ? 'bg-success' : 'bg-danger'}`}>
                      {att.passed ? 'PASSED' : 'NEEDS REVISION'}
                    </span>
                  </td>
                  <td className="text-muted">{new Date(att.timestamp || att.submittedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

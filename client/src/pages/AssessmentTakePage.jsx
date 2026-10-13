import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CodeMirrorEditor from '../components/editor/CodeMirrorEditor';
import { runJavaScriptInWorker } from '../services/workerRunner';
import { storage } from '../services/storage';

export default function AssessmentTakePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Student answers mapping: { q1: '...', q5: 'function ...' }
  const [answers, setAnswers] = useState({});

  // Coding question visible test outcomes: { q5: [ { testId: 'v1', passed: true, actual: '12' } ] }
  const [visibleTestResults, setVisibleTestResults] = useState({});
  const [runningVisibleTests, setRunningVisibleTests] = useState(false);

  // Timer & Session
  const [secondsRemaining, setSecondsRemaining] = useState(1800);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    async function initAssessment() {
      try {
        const res = await fetch(`/api/assessments/${id}`);
        const json = await res.json();
        if (json.ok) {
          setAssessment(json.data);
          setSecondsRemaining(json.data.timeLimitSeconds || 1800);
          initializeAnswers(json.data.questions);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }

    function initializeAnswers(questions) {
      const initial = {};
      for (const q of questions) {
        initial[q.id] = q.type === 'coding' ? q.starterCode : '';
      }
      setAnswers(initial);
    }

    initAssessment();
  }, [id]);

  // Countdown timer with auto-submit
  useEffect(() => {
    if (loading || isSubmitting) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(); // Auto-submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isSubmitting]);

  // Run Visible Tests for current coding question
  const handleRunVisibleTests = async (q) => {
    setRunningVisibleTests(true);
    const code = answers[q.id] || '';
    const results = [];

    for (const test of q.visibleTests) {
      // Execute function with test input inside Worker
      const wrappedScript = `
        ${code}
        // Execute target function with input
        const fnName = '${q.id === 'q5' ? 'sumEvens' : q.id === 'q6' ? 'capitalizeWords' : q.id === 'q2' ? 'flattenArray' : 'countWords'}';
        try {
          const fn = eval(fnName);
          const res = fn(${test.input});
          console.log(typeof res === 'object' ? JSON.stringify(res) : String(res));
        } catch(e) {
          console.error(e.message);
        }
      `;

      const runRes = await runJavaScriptInWorker(wrappedScript, 2000);
      const actual = runRes.logs[0]?.message || 'undefined';
      const cleanExpected = test.expectedOutput.replace(/^"|"$/g, '');
      const passed = actual === cleanExpected || JSON.stringify(actual) === JSON.stringify(cleanExpected);

      results.push({
        id: test.id,
        input: test.input,
        expected: test.expectedOutput,
        actual,
        passed
      });
    }

    setVisibleTestResults(prev => ({ ...prev, [q.id]: results }));
    setRunningVisibleTests(false);
  };

  // Final Submission Protocol with Hidden Tests Execution
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setConfirmModalOpen(false);

    try {
      // 1. Fetch hidden test inputs only from server
      const inputsRes = await fetch(`/api/assessments/${id}/hidden-inputs`);
      const inputsJson = await inputsRes.json();
      const hiddenInputsMap = inputsJson.ok ? inputsJson.data : {};

      const reportedOutputs = {};

      // 2. Run coding tasks on hidden inputs in the client Web Worker
      for (const q of assessment.questions) {
        if (q.type === 'coding') {
          const hiddenTests = hiddenInputsMap[q.id] || [];
          const code = answers[q.id] || '';
          reportedOutputs[q.id] = {};

          // Include visible tests reported outputs
          const visList = visibleTestResults[q.id] || [];
          for (const vr of visList) {
            reportedOutputs[q.id][vr.id] = vr.actual;
          }

          // Run each hidden test
          for (const ht of hiddenTests) {
            const fnName = q.id === 'q5' ? 'sumEvens' : q.id === 'q6' ? 'capitalizeWords' : q.id === 'q2' ? 'flattenArray' : 'countWords';
            const wrappedScript = `
              ${code}
              try {
                const fn = eval('${fnName}');
                const res = fn(${ht.input});
                console.log(typeof res === 'object' ? JSON.stringify(res) : String(res));
              } catch(e) {
                console.error(e.message);
              }
            `;
            const runRes = await runJavaScriptInWorker(wrappedScript, 2000);
            reportedOutputs[q.id][ht.id] = runRes.logs[0]?.message || '';
          }
        }
      }

      // 3. Post to server submit route for authoritative grading
      const submitRes = await fetch(`/api/assessments/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: `att_${Date.now()}`,
          answers,
          hiddenOutputs: reportedOutputs
        })
      });

      const submitJson = await submitRes.json();
      if (submitJson.ok) {
        // Record in guest storage
        storage.recordAssessmentAttempt(submitJson.data);
        navigate(`/assessment/${id}/result`, { state: { report: submitJson.data } });
      } else {
        alert('Grading failed: ' + submitJson.error.message);
        setIsSubmitting(false);
      }
    } catch (e) {
      alert('Error during submission: ' + e.message);
      setIsSubmitting(false);
    }
  };

  if (loading || !assessment) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-secondary">Loading assessment sandbox...</p>
      </div>
    );
  }

  const q = assessment.questions[currentQuestionIdx];
  const answeredCount = Object.values(answers).filter(v => v && v.trim().length > 0).length;

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-3" style={{ background: 'var(--bg-app)', minHeight: 'calc(100vh - 120px)' }}>
      {/* Header with Title, Timer, and Submit CTA */}
      <div className="d-flex flex-wrap align-items-center justify-content-between p-3 rounded-3 mb-3 border gap-2" style={{ background: 'var(--bg-surface-elevated)', borderColor: 'var(--border-subtle)' }}>
        <div>
          <span className="badge mb-1" style={{ background: 'var(--accent-violet)' }}>{assessment.topic}</span>
          <h1 className="h4 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>{assessment.title}</h1>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Countdown Clock */}
          <div className="d-flex align-items-center gap-2 px-3 py-1 rounded" style={{ background: secondsRemaining < 300 ? 'var(--status-error-bg)' : 'var(--bg-app)', border: `1px solid ${secondsRemaining < 300 ? 'var(--status-error)' : 'var(--border-subtle)'}` }}>
            <i className={`bi bi-alarm ${secondsRemaining < 300 ? 'text-danger' : 'text-teal'}`}></i>
            <span className="fw-mono fw-bold" style={{ fontSize: '1rem', color: secondsRemaining < 300 ? 'var(--status-error)' : 'var(--text-primary)' }}>
              {formatTimer(secondsRemaining)}
            </span>
          </div>

          <button
            onClick={() => setConfirmModalOpen(true)}
            disabled={isSubmitting}
            className="cf-btn-primary btn-sm py-2 px-3"
          >
            <i className="bi bi-send-check"></i> Submit Assessment
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* Navigation Sidebar */}
        <div className="col-12 col-md-3">
          <div className="cf-card p-3 h-100">
            <h2 className="h6 fw-bold mb-3 text-uppercase text-muted" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
              Questions ({answeredCount}/{assessment.questions.length} Answered)
            </h2>

            <div className="d-grid gap-2">
              {assessment.questions.map((quest, idx) => {
                const isAnswered = Boolean(answers[quest.id] && answers[quest.id].trim());
                const isCurrent = currentQuestionIdx === idx;
                return (
                  <button
                    key={quest.id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`btn btn-sm text-start p-2 rounded d-flex justify-content-between align-items-center ${
                      isCurrent ? 'btn-primary' : 'btn-outline-secondary'
                    }`}
                    style={{
                      background: isCurrent ? 'var(--accent-violet)' : 'transparent',
                      borderColor: 'var(--border-subtle)',
                      color: isCurrent ? '#fff' : 'var(--text-primary)'
                    }}
                  >
                    <span style={{ fontSize: '0.82rem' }}>{idx + 1}. {quest.title}</span>
                    <span className="badge rounded-circle p-1" style={{ background: isAnswered ? 'var(--status-success)' : 'rgba(255,255,255,0.1)' }}>
                      <i className={`bi bi-${isAnswered ? 'check' : 'circle'} text-white`} style={{ fontSize: '0.65rem' }}></i>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Question Content & Workspace */}
        <div className="col-12 col-md-9">
          <div className="cf-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge" style={{ background: 'var(--bg-surface-elevated)', color: 'var(--accent-teal)', border: '1px solid var(--border-subtle)' }}>
                Question {currentQuestionIdx + 1} of {assessment.questions.length} • {q.points} Points
              </span>
              <span className="badge bg-secondary-subtle text-secondary-emphasis text-uppercase">{q.type}</span>
            </div>

            <h2 className="h5 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>{q.title}</h2>
            <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {q.prompt}
            </p>

            {/* Code Snippet for Prompt */}
            {q.code && (
              <div className="p-3 rounded-3 font-mono mb-4" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                <pre className="mb-0">{q.code}</pre>
              </div>
            )}

            {/* Input by Question Type */}
            {q.type === 'mcq' && q.options && (
              <div className="d-flex flex-column gap-2 mb-4">
                {q.options.map((opt, i) => (
                  <label
                    key={i}
                    className="p-3 rounded-3 border d-flex align-items-center gap-3 cursor-pointer"
                    style={{
                      background: answers[q.id] === opt ? 'var(--bg-surface-elevated)' : 'var(--bg-app)',
                      borderColor: answers[q.id] === opt ? 'var(--accent-violet)' : 'var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name={`ans_${q.id}`}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                      className="form-check-input"
                    />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'predict' && q.options && (
              <div className="d-flex flex-column gap-2 mb-4">
                {q.options.map((opt, i) => (
                  <label
                    key={i}
                    className="p-3 rounded-3 border d-flex align-items-center gap-3 cursor-pointer"
                    style={{
                      background: answers[q.id] === opt ? 'var(--bg-surface-elevated)' : 'var(--bg-app)',
                      borderColor: answers[q.id] === opt ? 'var(--accent-violet)' : 'var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name={`ans_${q.id}`}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                      className="form-check-input"
                    />
                    <span className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'fill_blank' && (
              <div className="mb-4">
                <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Enter Answer:</label>
                <input
                  type="text"
                  className="form-control font-mono p-3"
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="Exact string answer..."
                  style={{ background: 'var(--bg-app)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
            )}

            {/* Coding Challenge View */}
            {q.type === 'coding' && (
              <div className="d-flex flex-column gap-3 mb-4">
                <div style={{ height: '240px', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
                  <CodeMirrorEditor
                    value={answers[q.id] || q.starterCode}
                    onChange={(val) => setAnswers(prev => ({ ...prev, [q.id]: val }))}
                    language="javascript"
                    fontSize={14}
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>
                    <i className="bi bi-check2-all me-1"></i> Visible Test Cases ({q.visibleTests.length})
                  </span>
                  <button
                    onClick={() => handleRunVisibleTests(q)}
                    disabled={runningVisibleTests}
                    className="cf-btn-teal btn-sm py-1 px-3"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <i className={`bi bi-${runningVisibleTests ? 'hourglass-split' : 'play-fill'}`}></i>
                    <span>{runningVisibleTests ? 'Evaluating...' : 'Run Visible Tests'}</span>
                  </button>
                </div>

                {/* Visible Tests Table */}
                <div className="p-0 rounded overflow-hidden" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-app)' }}>
                  <table className="table table-dark table-sm mb-0 font-mono" style={{ fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted)' }}>
                        <th style={{ background: 'var(--bg-surface)' }}>Test Input</th>
                        <th style={{ background: 'var(--bg-surface)' }}>Expected Output</th>
                        <th style={{ background: 'var(--bg-surface)' }}>Actual Output</th>
                        <th style={{ background: 'var(--bg-surface)' }}>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {q.visibleTests.map(vt => {
                        const runOutcome = visibleTestResults[q.id]?.find(r => r.id === vt.id);
                        return (
                          <tr key={vt.id}>
                            <td className="text-light">{vt.input}</td>
                            <td style={{ color: 'var(--accent-teal)' }}>{vt.expectedOutput}</td>
                            <td className="text-light">{runOutcome ? runOutcome.actual : '—'}</td>
                            <td>
                              {runOutcome ? (
                                <span className={`badge ${runOutcome.passed ? 'bg-success' : 'bg-danger'}`}>
                                  {runOutcome.passed ? 'PASS' : 'FAIL'}
                                </span>
                              ) : (
                                <span className="badge bg-secondary-subtle text-secondary-emphasis">NOT RUN</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="d-flex justify-content-between pt-3 border-top" style={{ borderColor: 'var(--border-subtle)' }}>
              <button
                onClick={() => setCurrentQuestionIdx(idx => Math.max(0, idx - 1))}
                disabled={currentQuestionIdx === 0}
                className="cf-btn-secondary btn-sm"
              >
                <i className="bi bi-chevron-left"></i> Previous Question
              </button>
              {currentQuestionIdx < assessment.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIdx(idx => idx + 1)}
                  className="cf-btn-primary btn-sm"
                >
                  Next Question <i className="bi bi-chevron-right"></i>
                </button>
              ) : (
                <button
                  onClick={() => setConfirmModalOpen(true)}
                  className="cf-btn-teal btn-sm"
                >
                  Review & Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-start" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
              <div className="modal-header border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
                <h5 className="modal-title fw-bold">Submit Assessment for Final Grading?</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setConfirmModalOpen(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body py-4">
                <p className="mb-2">
                  You have answered <strong>{answeredCount}</strong> of <strong>{assessment.questions.length}</strong> questions.
                </p>
                <p className="mb-0 text-secondary" style={{ fontSize: '0.85rem' }}>
                  Upon clicking confirm, your coding solutions will be run against server hidden test inputs, and your answers will be evaluated. This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-top" style={{ borderColor: 'var(--border-subtle)' }}>
                <button type="button" className="cf-btn-secondary btn-sm" onClick={() => setConfirmModalOpen(false)}>
                  Return to Exam
                </button>
                <button type="button" className="cf-btn-primary btn-sm" onClick={handleFinalSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Evaluating Submission...' : 'Confirm & Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

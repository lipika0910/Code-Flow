import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CodeMirrorEditor from '../components/editor/CodeMirrorEditor';
import IframePreview from '../components/editor/IframePreview';
import OutputConsole from '../components/editor/OutputConsole';
import { storage } from '../services/storage';

export default function LessonDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editable Code & Runner State
  const [editableCode, setEditableCode] = useState('');
  const [runTrigger, setRunTrigger] = useState(1);
  const [logs, setLogs] = useState([]);
  const [errorDiagnostic, setErrorDiagnostic] = useState(null);

  // Completion State
  const [isCompleted, setIsCompleted] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Knowledge Check Questions
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState({});

  useEffect(() => {
    async function loadLesson() {
      setLoading(true);
      try {
        const res = await fetch(`/api/lessons/${slug}`);
        const json = await res.json();
        if (json.ok) {
          setLesson(json.data);
          setEditableCode(json.data.runnable_code || '');
          const completedList = storage.getLessonProgress();
          setIsCompleted(completedList.includes(json.data.id) || json.data.is_completed);
        }
      } catch (err) {
        console.error('Error fetching lesson:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
    setLogs([]);
    setErrorDiagnostic(null);
  }, [slug]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRun = () => {
    setLogs([]);
    setErrorDiagnostic(null);
    setRunTrigger(t => t + 1);
    storage.recordActivity('code_executed');
  };

  const handleReset = () => {
    if (window.confirm('Reset code to initial lesson example?')) {
      setEditableCode(lesson.runnable_code || '');
      setLogs([]);
      setErrorDiagnostic(null);
      setRunTrigger(t => t + 1);
    }
  };

  const handleMarkComplete = async () => {
    if (!lesson) return;

    try {
      await fetch(`/api/lessons/${lesson.id}/complete`, { method: 'POST' });
    } catch {
      // Local fallback
    }

    storage.markLessonComplete(lesson.id, lesson.slug);
    setIsCompleted(true);
    showToast('Lesson marked complete! +25 XP earned.');
  };

  // Sample Knowledge Check Questions for HTML & CSS & JS
  const sampleQuizzes = [
    {
      id: 'k1',
      question: 'Why do semantic HTML elements improve accessibility?',
      options: [
        'They provide clear structural landmarks for screen readers and assistive tools',
        'They load faster than generic div tags',
        'They automatically style the page with modern colors',
        'They are required for JavaScript to run'
      ],
      correctAnswer: 'They provide clear structural landmarks for screen readers and assistive tools',
      explanation: 'Assistive devices use semantic landmarks (e.g. main, nav, header) to enable users to navigate documents without vision.'
    },
    {
      id: 'k2',
      question: 'What is the primary difference between let and const in modern JavaScript?',
      options: [
        'let variables can be reassigned, while const variable bindings cannot be reassigned',
        'let is function scoped, while const is block scoped',
        'const variables can only hold numbers',
        'let is hoisted, but const is never hoisted'
      ],
      correctAnswer: 'let variables can be reassigned, while const variable bindings cannot be reassigned',
      explanation: 'Both let and const are block-scoped, but const creates an immutable binding that prevents variable reassignment.'
    }
  ];

  const handleAnswerQuiz = (qId, option) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: option }));
    const quiz = sampleQuizzes.find(q => q.id === qId);
    const isCorrect = option === quiz.correctAnswer;
    setQuizResults(prev => ({ ...prev, [qId]: { isCorrect, explanation: quiz.explanation } }));
    if (isCorrect) {
      storage.addXP(10);
    }
  };

  if (loading || !lesson) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-secondary">Loading lesson content...</p>
      </div>
    );
  }

  const isInteractive = lesson.is_interactive;

  return (
    <div className="container py-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
          <div className="toast show align-items-center text-white border-0 px-3 py-2" style={{ background: 'var(--status-success)' }}>
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-check-circle-fill"></i>
              <span>{toastMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb & Navigation Top Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0" style={{ fontSize: '0.85rem' }}>
            <li className="breadcrumb-item"><Link to="/learn" style={{ color: 'var(--text-secondary)' }}>Lessons</Link></li>
            <li className="breadcrumb-item active text-light" aria-current="page">{lesson.title}</li>
          </ol>
        </nav>

        <div className="d-flex align-items-center gap-2">
          {isCompleted && (
            <span className="badge bg-success-subtle text-success d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
              <i className="bi bi-check-circle-fill"></i> Completed
            </span>
          )}
          <button
            onClick={handleMarkComplete}
            disabled={isCompleted}
            className={`btn btn-sm ${isCompleted ? 'btn-outline-success' : 'cf-btn-teal'}`}
            style={{ fontSize: '0.8rem' }}
          >
            <i className={`bi bi-${isCompleted ? 'check-all' : 'check2-circle'}`}></i>
            <span>{isCompleted ? 'Completed' : 'Mark as Complete (+25 XP)'}</span>
          </button>
        </div>
      </div>

      {/* Lesson Header Card */}
      <div className="cf-card-elevated mb-4 p-4">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="badge" style={{ background: 'var(--accent-violet)' }}>{lesson.topic_title}</span>
          <span className={`cf-badge ${isInteractive ? 'cf-badge-interactive' : 'cf-badge-readonly'}`}>
            {isInteractive ? 'Interactive' : 'Read-only — not executable in CodeFlow'}
          </span>
        </div>

        <h1 className="h3 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>{lesson.title}</h1>

        <div className="d-flex flex-wrap gap-3 py-2 border-top border-bottom my-3" style={{ borderColor: 'var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div><i className="bi bi-clock me-1 text-muted"></i>{lesson.estimated_time}</div>
          <div><i className="bi bi-speedometer2 me-1 text-muted"></i>{lesson.difficulty}</div>
          <div><i className="bi bi-journal-check me-1 text-muted"></i>Core Curriculum</div>
        </div>

        {/* Objectives */}
        {lesson.objectives && lesson.objectives.length > 0 && (
          <div className="p-3 rounded-3 mt-3" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
            <span className="fw-semibold text-muted d-block mb-2 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
              Learning Objectives
            </span>
            <ul className="mb-0 ps-3 text-secondary" style={{ fontSize: '0.85rem' }}>
              {lesson.objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Main Lesson Content & Theory */}
      <div className="cf-card p-4 mb-4">
        <div className="markdown-content" style={{ fontSize: '0.95rem', lineHeight: '1.7', color: 'var(--text-primary)' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', background: 'transparent', border: 'none', color: 'inherit', padding: 0 }}>
            {lesson.content_markdown}
          </pre>
        </div>
      </div>

      {/* Runnable Example Workspace (or Read-only static card) */}
      {isInteractive ? (
        <div className="cf-card p-0 mb-4 overflow-hidden border" style={{ borderColor: 'var(--border-subtle)' }}>
          {/* Header */}
          <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center" style={{ background: 'var(--bg-surface-elevated)', borderColor: 'var(--border-subtle)' }}>
            <div className="d-flex align-items-center gap-2">
              <span className="badge rounded-circle p-1" style={{ background: 'var(--accent-teal)' }}>
                <i className="bi bi-play text-dark"></i>
              </span>
              <span className="fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                Interactive Code Example
              </span>
            </div>

            <div className="d-flex gap-2">
              <button onClick={handleRun} className="cf-btn-teal btn-sm py-1 px-3" style={{ fontSize: '0.8rem' }}>
                <i className="bi bi-play-fill"></i> Run
              </button>
              <button onClick={handleReset} className="btn btn-sm btn-outline-secondary py-1 px-2" style={{ fontSize: '0.8rem' }}>
                <i className="bi bi-arrow-counterclockwise"></i> Reset
              </button>
            </div>
          </div>

          {/* Split Editor and Preview */}
          <div className="row g-0">
            <div className="col-12 col-lg-6 border-end" style={{ borderColor: 'var(--border-subtle)', minHeight: '320px' }}>
              <CodeMirrorEditor
                value={editableCode}
                onChange={setEditableCode}
                language={lesson.slug.startsWith('html') ? 'html' : lesson.slug.startsWith('css') ? 'css' : 'javascript'}
                fontSize={14}
              />
            </div>

            <div className="col-12 col-lg-6 d-flex flex-column" style={{ minHeight: '320px' }}>
              <div className="flex-grow-1" style={{ minHeight: '200px' }}>
                <IframePreview
                  html={editableCode.includes('<html') ? editableCode : `<div style="padding:15px; font-family:sans-serif;">${editableCode}</div>`}
                  css=""
                  js=""
                  onConsoleMessage={(m) => setLogs(prev => [...prev.slice(-99), m])}
                  onRuntimeError={(e) => setErrorDiagnostic(e)}
                  runTrigger={runTrigger}
                />
              </div>

              <div style={{ height: '140px' }}>
                <OutputConsole
                  logs={logs}
                  error={errorDiagnostic}
                  onClearLogs={() => setLogs([])}
                  onClearError={() => setErrorDiagnostic(null)}
                />
              </div>
            </div>
          </div>

          {/* Expected Output Notice */}
          {lesson.expected_output && (
            <div className="p-3 border-top" style={{ background: 'var(--bg-app)', borderColor: 'var(--border-subtle)', fontSize: '0.85rem' }}>
              <strong style={{ color: 'var(--accent-teal)' }}>Expected Outcome: </strong>
              <span style={{ color: 'var(--text-secondary)' }}>{lesson.expected_output}</span>
            </div>
          )}
        </div>
      ) : (
        /* Read-Only Lesson Notice */
        <div className="p-4 rounded-3 mb-4 text-center border" style={{ background: 'rgba(148, 163, 184, 0.08)', borderColor: 'rgba(148, 163, 184, 0.25)' }}>
          <i className="bi bi-info-circle-fill fs-3 text-secondary mb-2 d-block"></i>
          <h3 className="h6 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Catalogue Reference Lesson</h3>
          <p className="mb-0 text-secondary" style={{ fontSize: '0.85rem' }}>
            This framework concept is provided for foundational understanding. Code samples are read-only and not executable inside CodeFlow's browser runtimes.
          </p>
        </div>
      )}

      {/* Common Mistakes */}
      {lesson.common_mistakes && lesson.common_mistakes.length > 0 && (
        <div className="cf-card p-4 mb-4 border-warning-subtle">
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="bi bi-exclamation-triangle-fill text-warning"></i>
            <h2 className="h6 fw-bold mb-0 text-warning text-uppercase" style={{ letterSpacing: '0.04em' }}>
              Common Mistakes to Avoid
            </h2>
          </div>
          <ul className="mb-0 ps-3 text-secondary" style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
            {lesson.common_mistakes.map((mistake, i) => (
              <li key={i}>{mistake}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Knowledge Check Questions */}
      <div className="cf-card p-4 mb-4">
        <h2 className="h5 fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          <i className="bi bi-patch-question me-2" style={{ color: 'var(--accent-violet)' }}></i>
          Knowledge Check Questions
        </h2>

        <div className="d-flex flex-column gap-3">
          {sampleQuizzes.map((quiz, i) => {
            const result = quizResults[quiz.id];

            return (
              <div key={quiz.id} className="p-3 rounded-3" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
                <h3 className="h6 fw-bold mb-2 text-light">{i + 1}. {quiz.question}</h3>

                <div className="d-flex flex-column gap-2 mb-2">
                  {quiz.options.map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      className="p-2 rounded border d-flex align-items-center gap-2 cursor-pointer"
                      style={{
                        background: quizAnswers[quiz.id] === opt ? 'var(--bg-surface-elevated)' : 'transparent',
                        borderColor: quizAnswers[quiz.id] === opt ? 'var(--accent-violet)' : 'var(--border-subtle)',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="radio"
                        name={`quiz_${quiz.id}`}
                        checked={quizAnswers[quiz.id] === opt}
                        onChange={() => handleAnswerQuiz(quiz.id, opt)}
                        className="form-check-input"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>

                {result && (
                  <div className={`p-2 rounded mt-2 ${result.isCorrect ? 'text-success' : 'text-danger'}`} style={{ background: result.isCorrect ? 'var(--status-success-bg)' : 'var(--status-error-bg)', fontSize: '0.8rem' }}>
                    <i className={`bi bi-${result.isCorrect ? 'check-circle' : 'x-circle'} me-1`}></i>
                    <strong>{result.isCorrect ? 'Correct! (+10 XP)' : 'Incorrect.'}</strong> {result.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="d-flex justify-content-between align-items-center pt-3 border-top" style={{ borderColor: 'var(--border-subtle)' }}>
        <Link to="/learn" className="cf-btn-secondary btn-sm">
          <i className="bi bi-arrow-left"></i> Back to Syllabus
        </Link>
        <Link to="/practice" className="cf-btn-primary btn-sm">
          Recommended Practice Drills <i className="bi bi-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../services/storage';
import EmptyState from '../components/common/EmptyState';

export default function DashboardPage() {
  const [user, setUser] = useState(storage.getUser());
  const [xp, setXp] = useState(storage.getXP());
  const [completedLessons, setCompletedLessons] = useState(storage.getLessonProgress());
  const [quizAttempts, setQuizAttempts] = useState(storage.getQuizAttempts());
  const [assessmentAttempts, setAssessmentAttempts] = useState(storage.getAssessmentAttempts());
  const [streak, setStreak] = useState(storage.getStreak());
  const [recentActivity, setRecentActivity] = useState(storage.getRecentActivity());

  // Reload data on mount or storage update
  useEffect(() => {
    setUser(storage.getUser());
    setXp(storage.getXP());
    setCompletedLessons(storage.getLessonProgress());
    setQuizAttempts(storage.getQuizAttempts());
    setAssessmentAttempts(storage.getAssessmentAttempts());
    setStreak(storage.getStreak());
    setRecentActivity(storage.getRecentActivity());
  }, []);

  // Compute Level from XP
  // Level 1: 0 - 99, Level 2: 100 - 249, Level 3: 250 - 499, Level 4: 500+
  const computeLevel = (currentXp) => {
    if (currentXp >= 500) return { level: 4, title: 'Web Architect', nextXp: 1000, progress: 100 };
    if (currentXp >= 250) return { level: 3, title: 'DOM Navigator', nextXp: 500, progress: Math.min(100, Math.round(((currentXp - 250) / 250) * 100)) };
    if (currentXp >= 100) return { level: 2, title: 'Script Apprentice', nextXp: 250, progress: Math.min(100, Math.round(((currentXp - 100) / 150) * 100)) };
    return { level: 1, title: 'Syntax Explorer', nextXp: 100, progress: Math.min(100, Math.round((currentXp / 100) * 100)) };
  };

  const levelInfo = computeLevel(xp);

  // Compute Quiz Accuracy
  const quizAccuracy = quizAttempts.length > 0
    ? Math.round((quizAttempts.filter(q => q.correct).length / quizAttempts.length) * 100)
    : null;

  // Compute Assessment Average
  const assessmentAvg = assessmentAttempts.length > 0
    ? Math.round(assessmentAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / assessmentAttempts.length)
    : null;

  // Daily Goal (50 XP per day target)
  const dailyGoalTarget = 50;
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayXpEst = Math.min(dailyGoalTarget, xp % 100); // Approximate daily progress
  const dailyGoalPercent = Math.min(100, Math.round((todayXpEst / dailyGoalTarget) * 100));

  // Recommended Lesson Logic
  const lessonSequence = [
    { id: 'html-intro', title: 'HTML5 Semantic Document Structure', topic: 'HTML', time: '10 min', slug: 'html-intro' },
    { id: 'css-box-model', title: 'The CSS Box Model: Margin, Border & Padding', topic: 'CSS', time: '15 min', slug: 'css-box-model' },
    { id: 'js-variables', title: 'JavaScript Variables: let, const & Types', topic: 'JavaScript', time: '12 min', slug: 'js-variables' },
    { id: 'dom-events', title: 'DOM Queries & Event Listeners', topic: 'DOM', time: '20 min', slug: 'dom-events' }
  ];

  const nextLesson = lessonSequence.find(l => !completedLessons.includes(l.id)) || lessonSequence[0];

  const handleClearData = () => {
    if (window.confirm('Reset local demo data for guest session? This will reset local XP and progress.')) {
      storage.clearAllData();
      setUser(storage.getUser());
      setXp(0);
      setCompletedLessons([]);
      setQuizAttempts([]);
      setAssessmentAttempts([]);
      setStreak({ count: 0, lastDate: null });
      setRecentActivity([]);
    }
  };

  return (
    <div className="container py-4">
      {/* Top Header Card */}
      <div className="cf-card-elevated mb-4">
        <div className="row align-items-center gy-3">
          <div className="col-12 col-md-7">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge" style={{ background: 'var(--accent-violet)' }}>
                {user.isGuest ? 'Guest Learner' : 'Student'}
              </span>
              <span className="badge" style={{ background: 'var(--bg-app)', color: 'var(--accent-teal)', border: '1px solid var(--border-subtle)' }}>
                Level {levelInfo.level}: {levelInfo.title}
              </span>
            </div>
            <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Welcome back, {user.username}!
            </h1>
            <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Keep up your execution-first practice. Real understanding comes from predicting and testing runtime behaviour.
            </p>
          </div>

          <div className="col-12 col-md-5 d-flex flex-wrap gap-2 justify-content-md-end">
            <Link to={`/learn/${nextLesson.slug}`} className="cf-btn-primary">
              <i className="bi bi-play-circle-fill"></i> Continue Learning
            </Link>
            <Link to="/codelab" className="cf-btn-secondary">
              <i className="bi bi-code-slash"></i> Open CodeLab
            </Link>
          </div>
        </div>

        {/* Level & Daily Goal Bar */}
        <div className="row mt-4 pt-3 border-top gy-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="col-12 col-md-6">
            <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Level {levelInfo.level} Progress</span>
              <span className="fw-semibold" style={{ color: 'var(--accent-violet)' }}>{xp} / {levelInfo.nextXp} XP</span>
            </div>
            <div className="progress" style={{ height: '8px', background: 'var(--bg-app)' }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${levelInfo.progress}%`, background: 'var(--accent-violet)' }}
                aria-valuenow={levelInfo.progress}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Daily Target (50 XP)</span>
              <span className="fw-semibold" style={{ color: 'var(--accent-teal)' }}>{dailyGoalPercent}% Achieved</span>
            </div>
            <div className="progress" style={{ height: '8px', background: 'var(--bg-app)' }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${dailyGoalPercent}%`, background: 'var(--accent-teal)' }}
                aria-valuenow={dailyGoalPercent}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="row g-3 mb-4">
        {/* Streak */}
        <div className="col-6 col-lg-3">
          <div className="cf-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active Streak</span>
              <i className="bi bi-fire text-warning fs-5"></i>
            </div>
            <div className="h3 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
              {streak.count} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>days</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {streak.count > 0 ? `Last active: ${streak.lastDate}` : 'No active streak yet'}
            </span>
          </div>
        </div>

        {/* Lessons Completed */}
        <div className="col-6 col-lg-3">
          <div className="cf-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Lessons Completed</span>
              <i className="bi bi-journal-check fs-5" style={{ color: 'var(--accent-violet)' }}></i>
            </div>
            <div className="h3 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
              {completedLessons.length} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 16</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {completedLessons.length === 0 ? 'No completed lessons' : `${Math.round((completedLessons.length / 16) * 100)}% of core syllabus`}
            </span>
          </div>
        </div>

        {/* Quiz Accuracy */}
        <div className="col-6 col-lg-3">
          <div className="cf-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Quiz Accuracy</span>
              <i className="bi bi-pie-chart fs-5" style={{ color: 'var(--accent-teal)' }}></i>
            </div>
            <div className="h3 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
              {quizAccuracy !== null ? `${quizAccuracy}%` : '—'}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {quizAttempts.length > 0 ? `${quizAttempts.length} questions answered` : 'No quizzes taken yet'}
            </span>
          </div>
        </div>

        {/* Assessment Score */}
        <div className="col-6 col-lg-3">
          <div className="cf-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assessment Avg</span>
              <i className="bi bi-award fs-5 text-warning"></i>
            </div>
            <div className="h3 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
              {assessmentAvg !== null ? `${assessmentAvg}%` : '—'}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {assessmentAttempts.length > 0 ? `${assessmentAttempts.length} assessments completed` : 'No assessments taken yet'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Recommended Lesson & Recent Activity */}
      <div className="row g-4">
        {/* Left Column: Recommended Next Lesson & Quick Launch */}
        <div className="col-12 col-lg-7">
          <div className="cf-card mb-4 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
                <i className="bi bi-compass me-2" style={{ color: 'var(--accent-teal)' }}></i>
                Recommended Next Step
              </h2>
              <span className="cf-badge cf-badge-interactive">Syllabus Sequence</span>
            </div>

            <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <span className="badge" style={{ background: 'var(--accent-violet)' }}>{nextLesson.topic}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}><i className="bi bi-clock me-1"></i>{nextLesson.time}</span>
              </div>
              <h3 className="h6 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{nextLesson.title}</h3>
              <p className="mb-3 text-secondary" style={{ fontSize: '0.85rem' }}>
                Master essential syntax and test real execution in our sandboxed runner.
              </p>
              <div className="d-flex gap-2">
                <Link to={`/learn/${nextLesson.slug}`} className="cf-btn-primary btn-sm">
                  Start Lesson Now
                </Link>
                <Link to="/learn" className="cf-btn-secondary btn-sm">
                  View All Lessons
                </Link>
              </div>
            </div>

            {/* Quick module links */}
            <h3 className="h6 fw-bold mb-2 text-muted text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              Quick Workspaces & Diagnostics
            </h3>
            <div className="row g-2">
              <div className="col-6 col-sm-4">
                <Link to="/codelab" className="cf-card p-2 text-decoration-none d-flex align-items-center gap-2 h-100" style={{ background: 'var(--bg-app)' }}>
                  <i className="bi bi-code-square fs-5" style={{ color: 'var(--accent-teal)' }}></i>
                  <div>
                    <div className="fw-semibold text-truncate" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>CodeLab</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Freeform IDE</div>
                  </div>
                </Link>
              </div>
              <div className="col-6 col-sm-4">
                <Link to="/codetrace" className="cf-card p-2 text-decoration-none d-flex align-items-center gap-2 h-100" style={{ background: 'var(--bg-app)' }}>
                  <i className="bi bi-diagram-3 fs-5" style={{ color: 'var(--accent-violet)' }}></i>
                  <div>
                    <div className="fw-semibold text-truncate" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>CodeTrace</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AST Stepper</div>
                  </div>
                </Link>
              </div>
              <div className="col-6 col-sm-4">
                <Link to="/debug" className="cf-card p-2 text-decoration-none d-flex align-items-center gap-2 h-100" style={{ background: 'var(--bg-app)' }}>
                  <i className="bi bi-bug fs-5 text-warning"></i>
                  <div>
                    <div className="fw-semibold text-truncate" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Debug Lab</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Staged Hints</div>
                  </div>
                </Link>
              </div>
              <div className="col-6 col-sm-4">
                <Link to="/dom-explorer" className="cf-card p-2 text-decoration-none d-flex align-items-center gap-2 h-100" style={{ background: 'var(--bg-app)' }}>
                  <i className="bi bi-diagram-2 fs-5" style={{ color: '#0dcaf0' }}></i>
                  <div>
                    <div className="fw-semibold text-truncate" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>DOM Tree</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Live Inspector</div>
                  </div>
                </Link>
              </div>
              <div className="col-6 col-sm-4">
                <Link to="/leaderboard" className="cf-card p-2 text-decoration-none d-flex align-items-center gap-2 h-100" style={{ background: 'var(--bg-app)' }}>
                  <i className="bi bi-trophy fs-5 text-warning"></i>
                  <div>
                    <div className="fw-semibold text-truncate" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Leaderboard</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>XP Standings</div>
                  </div>
                </Link>
              </div>
              <div className="col-6 col-sm-4">
                <Link to="/analytics" className="cf-card p-2 text-decoration-none d-flex align-items-center gap-2 h-100" style={{ background: 'var(--bg-app)' }}>
                  <i className="bi bi-graph-up fs-5 text-success"></i>
                  <div>
                    <div className="fw-semibold text-truncate" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Analytics</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Report & Charts</div>
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Activity History with Honest Empty State */}
        <div className="col-12 col-lg-5">
          <div className="cf-card p-4 h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
                <i className="bi bi-clock-history me-2" style={{ color: 'var(--accent-violet)' }}></i>
                Recent Activity
              </h2>
              {recentActivity.length > 0 && (
                <button
                  onClick={handleClearData}
                  className="btn btn-sm btn-link text-danger p-0 text-decoration-none"
                  style={{ fontSize: '0.75rem' }}
                >
                  Clear Data
                </button>
              )}
            </div>

            {recentActivity.length === 0 ? (
              <EmptyState
                icon="bi-journal-x"
                title="No Activity Recorded Yet"
                message="Your executions, quizzes, and completed lessons will appear here in chronological order."
                actionText="Explore First Lesson"
                actionLink="/learn"
              />
            ) : (
              <div className="flex-grow-1 overflow-auto" style={{ maxHeight: '380px' }}>
                <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                  {recentActivity.map((act, index) => (
                    <li key={index} className="p-2 rounded d-flex align-items-center justify-content-between" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge rounded-pill" style={{ background: act.type === 'lesson_completed' ? 'var(--status-success-bg)' : 'var(--status-info-bg)', color: act.type === 'lesson_completed' ? 'var(--status-success)' : 'var(--status-info)' }}>
                          <i className={`bi ${act.type === 'lesson_completed' ? 'bi-check-circle' : 'bi-lightning'}`}></i>
                        </span>
                        <span style={{ color: 'var(--text-primary)' }}>
                          {act.type === 'lesson_completed' ? 'Completed Lesson' : act.type === 'assessment_completed' ? 'Submitted Assessment' : 'Completed Activity'}
                        </span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

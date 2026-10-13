import React, { useState } from 'react';
import { PRACTICE_QUESTIONS } from '../services/practiceQuestions';
import { storage } from '../services/storage';

export default function PracticePage() {
  const [topicFilter, setTopicFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [selectedQuestionId, setSelectedQuestionId] = useState(PRACTICE_QUESTIONS[0].id);

  // Active question interaction state
  const [userAnswer, setUserAnswer] = useState('');
  const [rearrangedOrder, setRearrangedOrder] = useState([]);
  const [hintStage, setHintStage] = useState(0);
  const [submissionResult, setSubmissionResult] = useState(null); // { isCorrect, explanation }

  const activeQuestion = PRACTICE_QUESTIONS.find(q => q.id === selectedQuestionId) || PRACTICE_QUESTIONS[0];

  // Filtered question list
  const filteredQuestions = PRACTICE_QUESTIONS.filter(q => {
    if (topicFilter !== 'All' && q.topic !== topicFilter) return false;
    if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) return false;
    return true;
  });

  const handleSelectQuestion = (q) => {
    setSelectedQuestionId(q.id);
    setUserAnswer('');
    setHintStage(0);
    setSubmissionResult(null);
    if (q.type === 'rearrange') {
      // Shuffle statements for rearrange
      setRearrangedOrder(q.statements.map((_, i) => i).sort(() => Math.random() - 0.5));
    }
  };

  const handleMoveStatement = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= rearrangedOrder.length) return;
    const updated = [...rearrangedOrder];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setRearrangedOrder(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let isCorrect = false;

    if (activeQuestion.type === 'rearrange') {
      isCorrect = JSON.stringify(rearrangedOrder) === JSON.stringify(activeQuestion.correctOrder);
    } else if (activeQuestion.type === 'fill_blank') {
      isCorrect = userAnswer.trim().toLowerCase() === activeQuestion.answer.trim().toLowerCase();
    } else {
      isCorrect = userAnswer.trim() === activeQuestion.answer.trim();
    }

    setSubmissionResult({
      isCorrect,
      explanation: activeQuestion.explanation
    });

    // Record attempt in storage
    storage.recordQuizAttempt({
      questionId: activeQuestion.id,
      topic: activeQuestion.topic,
      difficulty: activeQuestion.difficulty,
      correct: isCorrect,
      hintsUsed: hintStage
    });
  };

  const handleNextQuestion = () => {
    const currentIndex = filteredQuestions.findIndex(q => q.id === activeQuestion.id);
    if (currentIndex < filteredQuestions.length - 1) {
      handleSelectQuestion(filteredQuestions[currentIndex + 1]);
    }
  };

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="cf-card-elevated mb-4">
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="badge" style={{ background: 'var(--accent-violet)' }}>Targeted Drills</span>
          <span className="cf-badge cf-badge-interactive">30+ Concept Challenges</span>
        </div>
        <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Practice Arena
        </h1>
        <p className="mb-0 text-secondary" style={{ fontSize: '0.9rem' }}>
          Reinforce web concepts through output prediction, bug hunting, statement reordering, and instant pedagogical feedback.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="cf-card p-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
        {/* Topic Filters */}
        <div className="d-flex align-items-center gap-1 flex-wrap">
          <span className="fw-semibold me-2" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOPIC:</span>
          {['All', 'HTML', 'CSS', 'JavaScript', 'DOM', 'Async'].map(t => (
            <button
              key={t}
              onClick={() => setTopicFilter(t)}
              className={`btn btn-sm ${topicFilter === t ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{
                fontSize: '0.78rem',
                background: topicFilter === t ? 'var(--accent-violet)' : 'transparent',
                borderColor: 'var(--border-subtle)',
                color: topicFilter === t ? '#fff' : 'var(--text-secondary)'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Difficulty Filters */}
        <div className="d-flex align-items-center gap-1">
          <span className="fw-semibold me-2" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DIFFICULTY:</span>
          {['All', 'Easy', 'Medium', 'Hard'].map(d => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`btn btn-sm ${difficultyFilter === d ? 'btn-secondary' : 'btn-outline-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="row g-4">
        {/* Question Selector List */}
        <div className="col-12 col-md-4">
          <div className="cf-card p-3 h-100">
            <h2 className="h6 fw-bold mb-3 text-uppercase text-muted" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
              Questions ({filteredQuestions.length})
            </h2>

            <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '580px' }}>
              {filteredQuestions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  className={`btn btn-sm text-start p-2 rounded transition-all ${
                    selectedQuestionId === q.id ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                  style={{
                    background: selectedQuestionId === q.id ? 'var(--bg-surface-elevated)' : 'transparent',
                    borderColor: selectedQuestionId === q.id ? 'var(--accent-violet)' : 'var(--border-subtle)',
                    color: selectedQuestionId === q.id ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold text-truncate" style={{ fontSize: '0.82rem' }}>
                      {idx + 1}. {q.title}
                    </span>
                  </div>
                  <div className="d-flex gap-1">
                    <span className="badge" style={{ background: 'var(--bg-app)', color: 'var(--accent-teal)', fontSize: '0.65rem' }}>
                      {q.topic}
                    </span>
                    <span className={`badge ${q.difficulty === 'Easy' ? 'bg-success-subtle text-success' : q.difficulty === 'Medium' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'}`} style={{ fontSize: '0.65rem' }}>
                      {q.difficulty}
                    </span>
                    <span className="badge bg-secondary-subtle text-secondary-emphasis" style={{ fontSize: '0.65rem' }}>
                      {q.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Question Panel */}
        <div className="col-12 col-md-8">
          <div className="cf-card p-4">
            {/* Question Header */}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <div className="d-flex gap-2 mb-1">
                  <span className="badge" style={{ background: 'var(--accent-violet)' }}>{activeQuestion.topic}</span>
                  <span className={`badge ${activeQuestion.difficulty === 'Easy' ? 'bg-success-subtle text-success' : activeQuestion.difficulty === 'Medium' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'}`}>
                    {activeQuestion.difficulty}
                  </span>
                  <span className="badge bg-secondary-subtle text-secondary-emphasis">
                    {activeQuestion.type.toUpperCase()}
                  </span>
                </div>
                <h2 className="h5 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>{activeQuestion.title}</h2>
              </div>

              {/* Reveal Hint Button */}
              {hintStage < activeQuestion.hints.length && (
                <button
                  onClick={() => setHintStage(s => s + 1)}
                  className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                  style={{ fontSize: '0.78rem' }}
                >
                  <i className="bi bi-lightbulb"></i>
                  <span>Hint ({hintStage + 1}/{activeQuestion.hints.length})</span>
                </button>
              )}
            </div>

            {/* Prompt */}
            <p className="mb-3" style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {activeQuestion.prompt}
            </p>

            {/* Code Block if present */}
            {activeQuestion.code && (
              <div className="p-3 rounded-3 font-mono mb-4" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {activeQuestion.code}
                </pre>
              </div>
            )}

            {/* Staged Hints Box */}
            {hintStage > 0 && (
              <div className="p-3 rounded-3 mb-4" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', fontSize: '0.85rem', color: 'var(--status-warning)' }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className="bi bi-lightbulb-fill"></i>
                  <span className="fw-semibold">Staged Hint ({hintStage}/{activeQuestion.hints.length}):</span>
                </div>
                <div>{activeQuestion.hints[hintStage - 1]}</div>
              </div>
            )}

            {/* Answer Input Forms */}
            {!submissionResult ? (
              <form onSubmit={handleSubmit}>
                {/* Type: MCQ, Predict, Find Bug, Match */}
                {activeQuestion.options && (
                  <div className="d-flex flex-column gap-2 mb-4">
                    {activeQuestion.options.map((opt, i) => (
                      <label
                        key={i}
                        className={`p-3 rounded-3 border d-flex align-items-center gap-3 transition-all cursor-pointer ${
                          userAnswer === opt ? 'border-primary' : ''
                        }`}
                        style={{
                          background: userAnswer === opt ? 'var(--bg-surface-elevated)' : 'var(--bg-app)',
                          borderColor: userAnswer === opt ? 'var(--accent-violet)' : 'var(--border-subtle)',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="radio"
                          name="answer_opt"
                          checked={userAnswer === opt}
                          onChange={() => setUserAnswer(opt)}
                          className="form-check-input"
                        />
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Type: Rearrange statements */}
                {activeQuestion.type === 'rearrange' && (
                  <div className="mb-4">
                    <span className="text-muted d-block mb-2" style={{ fontSize: '0.8rem' }}>
                      Use the up/down arrows to order the lines correctly:
                    </span>
                    <div className="d-flex flex-column gap-2 font-mono">
                      {rearrangedOrder.map((origIdx, currentPos) => (
                        <div
                          key={origIdx}
                          className="p-2 rounded d-flex align-items-center justify-content-between"
                          style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
                        >
                          <span style={{ color: 'var(--text-primary)' }}>{activeQuestion.statements[origIdx]}</span>
                          <div className="d-flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveStatement(currentPos, -1)}
                              disabled={currentPos === 0}
                              className="btn btn-sm btn-outline-secondary py-0 px-2"
                              style={{ fontSize: '0.75rem' }}
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveStatement(currentPos, 1)}
                              disabled={currentPos === rearrangedOrder.length - 1}
                              className="btn btn-sm btn-outline-secondary py-0 px-2"
                              style={{ fontSize: '0.75rem' }}
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Type: Fill in the blank */}
                {activeQuestion.type === 'fill_blank' && (
                  <div className="mb-4">
                    <input
                      type="text"
                      className="form-control font-mono p-3"
                      placeholder="Type the exact keyword or property..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      style={{
                        background: 'var(--bg-app)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem'
                      }}
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={activeQuestion.type !== 'rearrange' && !userAnswer.trim()}
                  className="cf-btn-primary w-100 justify-content-center"
                >
                  <i className="bi bi-check-circle-fill"></i> Submit Answer
                </button>
              </form>
            ) : (
              /* Submission Result & Feedback Box */
              <div className="d-flex flex-column gap-3">
                <div className={`alert ${submissionResult.isCorrect ? 'alert-success' : 'alert-danger'} d-flex align-items-center gap-2 mb-0`}>
                  <i className={`bi bi-${submissionResult.isCorrect ? 'check-circle-fill' : 'x-circle-fill'} fs-4`}></i>
                  <div>
                    <strong>{submissionResult.isCorrect ? 'Correct! (+10 XP)' : 'Incorrect Solution'}</strong>
                    <div style={{ fontSize: '0.85rem' }}>
                      {submissionResult.isCorrect
                        ? 'Great job! You answered accurately.'
                        : `Expected: ${activeQuestion.type === 'rearrange' ? 'Correct Order' : activeQuestion.answer}`}
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-3 rounded-3" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <span className="fw-semibold d-block mb-1" style={{ fontSize: '0.85rem', color: 'var(--accent-teal)' }}>
                    <i className="bi bi-info-circle me-1"></i> Pedagogical Explanation:
                  </span>
                  <p className="mb-0 text-secondary" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                    {submissionResult.explanation}
                  </p>
                </div>

                {/* Next actions */}
                <div className="d-flex gap-2">
                  <button
                    onClick={() => { setSubmissionResult(null); setUserAnswer(''); }}
                    className="cf-btn-secondary btn-sm"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    className="cf-btn-primary btn-sm ms-auto"
                  >
                    Next Challenge <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

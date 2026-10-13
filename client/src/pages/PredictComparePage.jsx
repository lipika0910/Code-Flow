import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PREDICT_PROGRAMS } from '../services/predictPrograms';
import { runJavaScriptInWorker } from '../services/workerRunner';
import { storage } from '../services/storage';

export default function PredictComparePage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [predictionText, setPredictionText] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState(null); // { isExactMatch, predictedLines, actualLines, misconceptionNote }

  const activeProgram = PREDICT_PROGRAMS[selectedIdx];

  const handleSelectProgram = (idx) => {
    setSelectedIdx(idx);
    setPredictionText('');
    setResult(null);
  };

  const handleRunAndCompare = async (e) => {
    e.preventDefault();
    if (!predictionText.trim()) return;

    setIsExecuting(true);
    const workerResult = await runJavaScriptInWorker(activeProgram.code, 2500);

    const actualLines = workerResult.logs.map(l => l.message);
    const predictedLines = predictionText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Normalize comparison
    const isExactMatch =
      predictedLines.length === actualLines.length &&
      predictedLines.every((line, i) => line === actualLines[i]);

    const compResult = {
      isExactMatch,
      predictedLines,
      actualLines,
      misconceptionNote: activeProgram.misconceptionNote,
      recommendedLesson: activeProgram.recommendedLesson,
      recommendedLessonSlug: activeProgram.recommendedLessonSlug
    };

    setResult(compResult);
    setIsExecuting(false);

    // Record activity and award XP if correct
    storage.recordActivity('predict_compare');
    if (isExactMatch) {
      storage.addXP(20);
    }
  };

  const handleNext = () => {
    if (selectedIdx < PREDICT_PROGRAMS.length - 1) {
      handleSelectProgram(selectedIdx + 1);
    }
  };

  return (
    <div className="container py-4">
      {/* Title & Introduction */}
      <div className="cf-card-elevated mb-4">
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="badge" style={{ background: 'var(--accent-violet)' }}>Mental Model Training</span>
          <span className="cf-badge cf-badge-interactive">Predict → Execute → Compare</span>
        </div>
        <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Predict, Execute, and Understand the Runtime
        </h1>
        <p className="mb-0 text-secondary" style={{ fontSize: '0.9rem' }}>
          Test your mental model against classic JavaScript misconceptions: type coercion, hoisting, closures, and reference mutations.
        </p>
      </div>

      <div className="row g-4">
        {/* Left Column: Program Navigation */}
        <div className="col-12 col-md-4">
          <div className="cf-card p-3 h-100">
            <h2 className="h6 fw-bold mb-3 text-uppercase text-muted" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
              10 Classic Misconceptions ({selectedIdx + 1}/{PREDICT_PROGRAMS.length})
            </h2>

            <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '550px' }}>
              {PREDICT_PROGRAMS.map((prog, idx) => (
                <button
                  key={prog.id}
                  onClick={() => handleSelectProgram(idx)}
                  className={`btn btn-sm text-start p-2 rounded d-flex flex-column transition-all ${
                    selectedIdx === idx ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                  style={{
                    background: selectedIdx === idx ? 'var(--bg-surface-elevated)' : 'transparent',
                    borderColor: selectedIdx === idx ? 'var(--accent-violet)' : 'var(--border-subtle)',
                    color: selectedIdx === idx ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center w-100 mb-1">
                    <span className="fw-semibold" style={{ fontSize: '0.82rem' }}>
                      {idx + 1}. {prog.title}
                    </span>
                  </div>
                  <span className="badge w-fit" style={{ background: 'var(--bg-app)', color: 'var(--accent-teal)', fontSize: '0.68rem', width: 'fit-content' }}>
                    {prog.topic}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Code & Prediction Workspace */}
        <div className="col-12 col-md-8">
          <div className="cf-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span className="badge" style={{ background: 'var(--accent-violet)' }}>{activeProgram.topic}</span>
                <h2 className="h5 fw-bold mb-0 mt-1" style={{ color: 'var(--text-primary)' }}>{activeProgram.title}</h2>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Program {selectedIdx + 1} of {PREDICT_PROGRAMS.length}
              </span>
            </div>

            {/* Code Box */}
            <div className="p-3 rounded-3 font-mono mb-4" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
              <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {activeProgram.code}
              </pre>
            </div>

            {/* Prediction Input Form */}
            {!result ? (
              <form onSubmit={handleRunAndCompare}>
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <i className="bi bi-pencil-square me-1" style={{ color: 'var(--accent-teal)' }}></i>
                  What will this program log to the console? (One line per output)
                </label>
                <textarea
                  className="form-control font-mono mb-3 p-3"
                  rows="4"
                  placeholder={"Type your predicted console output here...\ne.g.\n52\n3"}
                  value={predictionText}
                  onChange={(e) => setPredictionText(e.target.value)}
                  style={{
                    background: 'var(--bg-app)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                  required
                />
                <button
                  type="submit"
                  disabled={isExecuting || !predictionText.trim()}
                  className="cf-btn-primary w-100 justify-content-center"
                >
                  <i className={`bi bi-${isExecuting ? 'hourglass-split' : 'play-circle-fill'}`}></i>
                  <span>{isExecuting ? 'Executing in Web Worker...' : 'Submit Prediction & Verify Runtime'}</span>
                </button>
              </form>
            ) : (
              /* Results Comparison View */
              <div className="d-flex flex-column gap-3">
                {/* Result Alert */}
                <div className={`alert ${result.isExactMatch ? 'alert-success' : 'alert-warning'} d-flex align-items-center gap-2 mb-0`}>
                  <i className={`bi bi-${result.isExactMatch ? 'check-circle-fill' : 'exclamation-triangle-fill'} fs-4`}></i>
                  <div>
                    <strong>{result.isExactMatch ? 'Prediction Correct! (+20 XP)' : 'Prediction Discrepancy Found!'}</strong>
                    <div style={{ fontSize: '0.85rem' }}>
                      {result.isExactMatch
                        ? 'Your mental model accurately matched the browser JavaScript engine.'
                        : 'Your predicted output differed from actual runtime execution.'}
                    </div>
                  </div>
                </div>

                {/* Line by Line Comparison */}
                <div className="row g-3 font-mono" style={{ fontSize: '0.82rem' }}>
                  <div className="col-6">
                    <div className="p-3 rounded-3 h-100" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
                      <span className="fw-semibold text-muted d-block mb-2">Your Predicted Output:</span>
                      {result.predictedLines.length === 0 ? (
                        <span className="text-muted fst-italic">Empty</span>
                      ) : (
                        result.predictedLines.map((line, i) => (
                          <div key={i} style={{ color: 'var(--text-primary)' }}>&gt; {line}</div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="p-3 rounded-3 h-100" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
                      <span className="fw-semibold text-muted d-block mb-2">Actual Runtime Output:</span>
                      {result.actualLines.length === 0 ? (
                        <span className="text-muted fst-italic">None</span>
                      ) : (
                        result.actualLines.map((line, i) => (
                          <div key={i} style={{ color: 'var(--accent-teal)' }}>&gt; {line}</div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Misconception Explanation Box */}
                <div className="p-3 rounded-3" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <i className="bi bi-lightbulb-fill text-warning"></i>
                    <span className="fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      Why This Happens (Pedagogical Breakdown)
                    </span>
                  </div>
                  <p className="mb-2" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                    {result.misconceptionNote}
                  </p>
                  <div className="d-flex align-items-center gap-2 pt-2 border-top" style={{ borderColor: 'rgba(139, 92, 246, 0.2)', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Recommended Concept Review:</span>
                    <Link to={`/learn/${result.recommendedLessonSlug}`} style={{ color: 'var(--accent-violet)', fontWeight: 600 }}>
                      {result.recommendedLesson} →
                    </Link>
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex gap-2">
                  <button
                    onClick={() => { setResult(null); setPredictionText(''); }}
                    className="cf-btn-secondary btn-sm"
                  >
                    Try Again
                  </button>
                  {selectedIdx < PREDICT_PROGRAMS.length - 1 && (
                    <button
                      onClick={handleNext}
                      className="cf-btn-primary btn-sm ms-auto"
                    >
                      Next Program <i className="bi bi-arrow-right"></i>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

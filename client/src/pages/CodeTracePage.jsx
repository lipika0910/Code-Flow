import React, { useState, useEffect, useRef } from 'react';
import CodeMirrorEditor from '../components/editor/CodeMirrorEditor';
import { generateCodeTrace, PREPARED_DOM_TRACES } from '../services/codeTraceInterpreter';
import { runJavaScriptInWorker } from '../services/workerRunner';
import { storage } from '../services/storage';

const TRACE_PRESETS = [
  {
    name: 'Loop Off-by-One & Sum',
    code: `let numbers = [10, 20, 30];
let sum = 0;

for (let i = 0; i < numbers.length; i++) {
  sum += numbers[i];
  console.log("Adding index " + i + ": sum is " + sum);
}

console.log("Final Sum: " + sum);`
  },
  {
    name: 'Function Call & Call Stack',
    code: `function double(n) {
  let result = n * 2;
  return result;
}

function processValues(a, b) {
  let first = double(a);
  let second = double(b);
  return first + second;
}

let answer = processValues(3, 7);
console.log("Total: " + answer);`
  },
  {
    name: 'Conditional Branching',
    code: `let score = 85;
let grade = 'F';

if (score >= 90) {
  grade = 'A';
} else if (score >= 80) {
  grade = 'B';
} else {
  grade = 'C';
}

console.log("Assigned Grade: " + grade);`
  }
];

export default function CodeTracePage() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [code, setCode] = useState(TRACE_PRESETS[0].code);

  // Trace State
  const [snapshots, setSnapshots] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeedMs, setPlaySpeedMs] = useState(800);
  const [traceError, setTraceError] = useState(null);

  // Real Run Comparison State
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  // Prepared DOM Trace view (if active)
  const [preparedDomTrace, setPreparedDomTrace] = useState(null);

  const playTimerRef = useRef(null);

  // Initialize trace
  const handleGenerateTrace = () => {
    setIsPlaying(false);
    clearTimeout(playTimerRef.current);
    setPreparedDomTrace(null);

    const result = generateCodeTrace(code);
    if (!result.success) {
      setTraceError(result.error);
      setSnapshots(result.snapshots || []);
      setCurrentStepIdx(0);
    } else {
      setTraceError(null);
      setSnapshots(result.snapshots);
      setCurrentStepIdx(0);
    }
    storage.recordActivity('codetrace_run');
  };

  useEffect(() => {
    handleGenerateTrace();
  }, [code]);

  // Play / Pause auto step timer
  useEffect(() => {
    if (isPlaying && snapshots.length > 0) {
      playTimerRef.current = setTimeout(() => {
        if (currentStepIdx < snapshots.length - 1) {
          setCurrentStepIdx(idx => idx + 1);
        } else {
          setIsPlaying(false);
        }
      }, playSpeedMs);
    }
    return () => clearTimeout(playTimerRef.current);
  }, [isPlaying, currentStepIdx, snapshots.length, playSpeedMs]);

  const handleNext = () => {
    if (currentStepIdx < snapshots.length - 1) {
      setCurrentStepIdx(idx => idx + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(idx => idx - 1);
    }
  };

  const handleStart = () => {
    setCurrentStepIdx(0);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  // Compare with Real Run
  const handleCompareWithRealRun = async () => {
    setIsComparing(true);
    setComparisonModalOpen(true);

    const workerResult = await runJavaScriptInWorker(code, 3000);
    const traceOutput = snapshots[snapshots.length - 1]?.output || [];
    const realLogs = workerResult.logs.map(l => l.message);

    const isMatch = JSON.stringify(traceOutput) === JSON.stringify(realLogs);

    setComparisonResult({
      isMatch,
      traceOutput,
      realLogs,
      workerError: workerResult.error,
      executionTime: workerResult.executionTime
    });
    setIsComparing(false);
  };

  // Load Prepared DOM Trace
  const handleLoadPreparedDom = (domTrace) => {
    setIsPlaying(false);
    clearTimeout(playTimerRef.current);
    setPreparedDomTrace(domTrace);
    setCode(domTrace.code);
    setTraceError(null);
    setSnapshots([]);
  };

  const activeSnapshot = snapshots[currentStepIdx] || null;

  return (
    <div className="container-fluid px-3 px-lg-4 py-3" style={{ background: 'var(--bg-app)', minHeight: 'calc(100vh - 120px)' }}>
      {/* Prominent Disclaimer & Title Bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between p-3 rounded-3 mb-3 border gap-2" style={{ background: 'var(--bg-surface-elevated)', borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge" style={{ background: 'var(--accent-violet)' }}>AST Educational Engine</span>
            <span className="cf-badge cf-badge-interactive" style={{ fontSize: '0.7rem' }}>
              <i className="bi bi-shield-check me-1"></i> Guided educational trace — not the browser's real runtime
            </span>
          </div>
          <h1 className="h4 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
            CodeTrace AST Step-by-Step Visualizer
          </h1>
        </div>

        {/* Preset & DOM trace buttons */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="dropdown">
            <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" style={{ fontSize: '0.8rem', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
              <i className="bi bi-code-square me-1"></i> AST Examples
            </button>
            <ul className="dropdown-menu dropdown-menu-dark shadow" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
              {TRACE_PRESETS.map((p, idx) => (
                <li key={p.name}>
                  <button className="dropdown-item" onClick={() => { setSelectedPreset(idx); setCode(p.code); setPreparedDomTrace(null); }}>
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="dropdown">
            <button className="btn btn-sm btn-outline-info dropdown-toggle" type="button" data-bs-toggle="dropdown" style={{ fontSize: '0.8rem' }}>
              <i className="bi bi-window-sidebar me-1"></i> Prepared DOM Traces
            </button>
            <ul className="dropdown-menu dropdown-menu-dark shadow" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
              {PREPARED_DOM_TRACES.map(dt => (
                <li key={dt.id}>
                  <button className="dropdown-item" onClick={() => handleLoadPreparedDom(dt)}>
                    {dt.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleCompareWithRealRun}
            className="cf-btn-primary btn-sm py-1 px-3"
            style={{ fontSize: '0.8rem' }}
            title="Execute identical code in browser Web Worker and compare output"
          >
            <i className="bi bi-arrows-angle-contract"></i> Compare with real run
          </button>
        </div>
      </div>

      {/* Control Bar */}
      {!preparedDomTrace && (
        <div className="d-flex flex-wrap align-items-center justify-content-between px-3 py-2 rounded-3 mb-3 border gap-2" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          {/* Stepping controls */}
          <div className="d-flex align-items-center gap-1">
            <button
              onClick={handleStart}
              disabled={snapshots.length === 0 || currentStepIdx === 0}
              className="btn btn-sm btn-outline-secondary px-2"
              title="First step"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              <i className="bi bi-chevron-bar-left"></i>
            </button>
            <button
              onClick={handlePrev}
              disabled={snapshots.length === 0 || currentStepIdx === 0}
              className="btn btn-sm btn-outline-secondary px-2"
              title="Previous step"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={snapshots.length === 0}
              className="cf-btn-teal btn-sm py-1 px-3 d-flex align-items-center gap-1"
              style={{ fontSize: '0.8rem' }}
            >
              <i className={`bi bi-${isPlaying ? 'pause-fill' : 'play-fill'}`}></i>
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={handleNext}
              disabled={snapshots.length === 0 || currentStepIdx >= snapshots.length - 1}
              className="btn btn-sm btn-outline-secondary px-2"
              title="Next step"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
            <button
              onClick={handleReset}
              className="btn btn-sm btn-outline-secondary px-2"
              title="Reset trace"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>

          {/* Step Indicator */}
          <div className="d-flex align-items-center gap-2">
            <span className="badge px-3 py-2" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              Step {snapshots.length > 0 ? currentStepIdx + 1 : 0} of {snapshots.length}
            </span>
          </div>

          {/* Speed slider */}
          <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Speed:</span>
            <input
              type="range"
              min="200"
              max="2000"
              step="200"
              value={playSpeedMs}
              onChange={(e) => setPlaySpeedMs(Number(e.target.value))}
              style={{ width: '90px' }}
            />
            <span>{playSpeedMs}ms</span>
          </div>
        </div>
      )}

      {/* Error alert if syntax or step limit failed */}
      {traceError && (
        <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
          <i className="bi bi-exclamation-octagon-fill"></i>
          <span>{traceError}</span>
        </div>
      )}

      {/* Main Split Layout: Code & Visualizer State */}
      <div className="row g-3">
        {/* Left Column: Code Editor */}
        <div className="col-12 col-lg-6">
          <div className="cf-card p-0 h-100 d-flex flex-column overflow-hidden">
            <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center" style={{ background: 'var(--bg-surface-elevated)', borderColor: 'var(--border-subtle)' }}>
              <span className="fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                <i className="bi bi-code-slash me-1"></i> JavaScript Code
              </span>
              {activeSnapshot && (
                <span className="badge bg-primary-subtle text-primary-emphasis" style={{ fontSize: '0.75rem' }}>
                  Current Line: {activeSnapshot.line}
                </span>
              )}
            </div>
            <div className="flex-grow-1" style={{ minHeight: '380px' }}>
              <CodeMirrorEditor
                value={code}
                onChange={setCode}
                language="javascript"
                fontSize={14}
              />
            </div>
          </div>
        </div>

        {/* Right Column: AST Inspection State OR Prepared DOM steps */}
        <div className="col-12 col-lg-6">
          {preparedDomTrace ? (
            /* Prepared DOM Simulation View */
            <div className="cf-card p-4 h-100 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <span className="badge bg-info-subtle text-info-emphasis mb-1">{preparedDomTrace.label}</span>
                  <h2 className="h5 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>{preparedDomTrace.title}</h2>
                </div>
                <button onClick={() => setPreparedDomTrace(null)} className="btn btn-sm btn-outline-secondary">
                  Back to AST Trace
                </button>
              </div>

              <div className="flex-grow-1 overflow-auto">
                <div className="d-flex flex-column gap-2">
                  {preparedDomTrace.steps.map(s => (
                    <div key={s.step} className="p-3 rounded-3" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="badge" style={{ background: 'var(--accent-violet)' }}>Step {s.step}: {s.action}</span>
                        {s.target && <code className="text-teal" style={{ color: 'var(--accent-teal)' }}>{s.target}</code>}
                      </div>
                      <p className="mb-0 text-secondary" style={{ fontSize: '0.85rem' }}>{s.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Standard Step Snapshot Inspection Panels */
            <div className="d-flex flex-column gap-3 h-100">
              {/* Step Explanation Banner */}
              <div className="p-3 rounded-3" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className="bi bi-info-circle-fill" style={{ color: 'var(--accent-violet)' }}></i>
                  <span className="fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Step Explanation</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {activeSnapshot ? activeSnapshot.explanation : 'No active step. Click "Play" or "Next" to begin.'}
                </div>
              </div>

              {/* Variable Scope Watch Panel */}
              <div className="cf-card p-3 flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    <i className="bi bi-eye me-1" style={{ color: 'var(--accent-teal)' }}></i> Variable Scope Watch
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {activeSnapshot ? Object.keys(activeSnapshot.scope).length : 0} variables
                  </span>
                </div>

                <div className="font-mono overflow-auto" style={{ maxHeight: '180px', fontSize: '0.82rem' }}>
                  {activeSnapshot && Object.keys(activeSnapshot.scope).length > 0 ? (
                    <table className="table table-sm table-dark mb-0" style={{ background: 'transparent' }}>
                      <thead>
                        <tr style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          <th style={{ background: 'transparent', borderBottom: '1px solid var(--border-subtle)' }}>Variable</th>
                          <th style={{ background: 'transparent', borderBottom: '1px solid var(--border-subtle)' }}>Current Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(activeSnapshot.scope).map(([varName, val]) => (
                          <tr key={varName}>
                            <td className="fw-semibold" style={{ background: 'transparent', color: 'var(--accent-teal)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              {varName}
                            </td>
                            <td style={{ background: 'transparent', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              {val}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-muted fst-italic py-3 text-center" style={{ fontSize: '0.8rem' }}>
                      No variables in scope at this step.
                    </div>
                  )}
                </div>
              </div>

              {/* Call Stack & Output Row */}
              <div className="row g-2">
                {/* Call Stack */}
                <div className="col-6">
                  <div className="cf-card p-2 h-100">
                    <span className="fw-semibold d-block mb-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <i className="bi bi-layers me-1"></i> Call Stack
                    </span>
                    <div className="font-mono" style={{ fontSize: '0.75rem' }}>
                      {activeSnapshot && activeSnapshot.stack.length > 0 ? (
                        activeSnapshot.stack.map((frame, i) => (
                          <div key={i} className="py-1 px-2 rounded mb-1 text-truncate" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--accent-violet)' }}>
                            {frame}
                          </div>
                        ))
                      ) : (
                        <span className="text-muted fst-italic">global</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Console Output */}
                <div className="col-6">
                  <div className="cf-card p-2 h-100">
                    <span className="fw-semibold d-block mb-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <i className="bi bi-terminal me-1"></i> Output so far
                    </span>
                    <div className="font-mono overflow-auto" style={{ maxHeight: '90px', fontSize: '0.75rem' }}>
                      {activeSnapshot && activeSnapshot.output.length > 0 ? (
                        activeSnapshot.output.map((out, idx) => (
                          <div key={idx} className="text-truncate" style={{ color: 'var(--accent-teal)' }}>
                            &gt; {out}
                          </div>
                        ))
                      ) : (
                        <span className="text-muted fst-italic">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compare with Real Run Modal */}
      {comparisonModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content text-start" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
              <div className="modal-header border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-arrows-angle-contract me-2" style={{ color: 'var(--accent-violet)' }}></i>
                  Compare Trace vs. Browser Real Runtime
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setComparisonModalOpen(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body py-4">
                {isComparing ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-info mb-2" role="status"></div>
                    <p className="mb-0 text-secondary">Spawning Web Worker and executing script...</p>
                  </div>
                ) : comparisonResult ? (
                  <div>
                    {/* Status Alert */}
                    <div className={`alert ${comparisonResult.isMatch ? 'alert-success' : 'alert-warning'} d-flex align-items-center gap-2 mb-4`}>
                      <i className={`bi bi-${comparisonResult.isMatch ? 'check-circle-fill' : 'exclamation-triangle-fill'} fs-5`}></i>
                      <div>
                        <strong>{comparisonResult.isMatch ? 'Trace Matches Real Runtime Output!' : 'Output Mismatch Detected!'}</strong>
                        <div style={{ fontSize: '0.85rem' }}>
                          {comparisonResult.isMatch
                            ? 'Both the educational AST interpreter and the real Web Worker produced identical console output.'
                            : 'The educational interpreter produced a different sequence than the browser JavaScript engine.'}
                        </div>
                      </div>
                    </div>

                    {/* Output Comparison Table */}
                    <div className="row g-3 font-mono" style={{ fontSize: '0.8rem' }}>
                      <div className="col-6">
                        <div className="p-3 rounded-3 h-100" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
                          <span className="fw-semibold text-muted d-block mb-2">CodeTrace Output:</span>
                          {comparisonResult.traceOutput.length === 0 ? (
                            <span className="text-muted fst-italic">No console output recorded</span>
                          ) : (
                            comparisonResult.traceOutput.map((line, i) => (
                              <div key={i} style={{ color: 'var(--accent-teal)' }}>&gt; {line}</div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="col-6">
                        <div className="p-3 rounded-3 h-100" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
                          <span className="fw-semibold text-muted d-block mb-2">Web Worker Real Output:</span>
                          {comparisonResult.realLogs.length === 0 ? (
                            <span className="text-muted fst-italic">No console output recorded</span>
                          ) : (
                            comparisonResult.realLogs.map((line, i) => (
                              <div key={i} style={{ color: 'var(--accent-violet)' }}>&gt; {line}</div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="modal-footer border-top" style={{ borderColor: 'var(--border-subtle)' }}>
                <button type="button" className="cf-btn-secondary btn-sm" onClick={() => setComparisonModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

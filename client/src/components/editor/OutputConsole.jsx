import React, { useState } from 'react';

export default function OutputConsole({
  logs = [],
  error = null,
  onClearLogs,
  onClearError,
  executionTime = null
}) {
  const [activeTab, setActiveTab] = useState('console'); // 'console' | 'error'
  const [filterLevel, setFilterLevel] = useState('all');

  const filteredLogs = logs.filter(log => {
    if (filterLevel === 'all') return true;
    return log.level === filterLevel;
  });

  const errorCount = (error ? 1 : 0) + logs.filter(l => l.level === 'error').length;

  return (
    <div className="d-flex flex-column h-100 font-mono" style={{ background: 'var(--bg-app)', borderTop: '1px solid var(--border-subtle)' }}>
      {/* Tab & Filter Bar */}
      <div className="d-flex align-items-center justify-content-between px-3 py-1 border-bottom flex-wrap gap-2" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div className="d-flex align-items-center gap-2">
          {/* Tabs */}
          <button
            onClick={() => setActiveTab('console')}
            className={`btn btn-sm py-1 px-2 border-0 ${activeTab === 'console' ? 'fw-bold' : ''}`}
            style={{
              background: activeTab === 'console' ? 'var(--bg-surface-elevated)' : 'transparent',
              color: activeTab === 'console' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.8rem'
            }}
          >
            <i className="bi bi-terminal me-1"></i> Console ({logs.length})
          </button>

          <button
            onClick={() => setActiveTab('error')}
            className={`btn btn-sm py-1 px-2 border-0 position-relative ${activeTab === 'error' ? 'fw-bold' : ''}`}
            style={{
              background: activeTab === 'error' ? 'var(--bg-surface-elevated)' : 'transparent',
              color: errorCount > 0 ? 'var(--status-error)' : (activeTab === 'error' ? 'var(--text-primary)' : 'var(--text-secondary)'),
              fontSize: '0.8rem'
            }}
          >
            <i className="bi bi-exclamation-triangle me-1"></i> Diagnostic ({errorCount})
          </button>
        </div>

        <div className="d-flex align-items-center gap-2">
          {executionTime !== null && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <i className="bi bi-stopwatch me-1"></i>{executionTime}ms
            </span>
          )}

          {activeTab === 'console' && (
            <div className="btn-group btn-group-sm">
              {['all', 'log', 'warn', 'error'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`btn btn-sm py-0 px-2 text-capitalize ${filterLevel === lvl ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '0.7rem' }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              if (activeTab === 'console') onClearLogs?.();
              if (activeTab === 'error') onClearError?.();
            }}
            className="btn btn-sm btn-outline-secondary py-0 px-2"
            style={{ fontSize: '0.7rem', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            title="Clear output"
          >
            <i className="bi bi-trash3 me-1"></i> Clear
          </button>
        </div>
      </div>

      {/* Output Content Area */}
      <div className="flex-grow-1 p-3 overflow-auto" style={{ minHeight: '120px', maxHeight: '250px', fontSize: '0.82rem', lineHeight: '1.6' }}>
        {activeTab === 'console' && (
          <div>
            {filteredLogs.length === 0 ? (
              <div className="text-muted fst-italic py-3 text-center" style={{ fontSize: '0.8rem' }}>
                Console is ready. Output from console.log/warn/error will appear here.
              </div>
            ) : (
              filteredLogs.map((log, index) => {
                const isErr = log.level === 'error';
                const isWarn = log.level === 'warn';
                return (
                  <div
                    key={index}
                    className="d-flex align-items-start gap-2 py-1 border-bottom"
                    style={{
                      borderColor: 'rgba(255,255,255,0.04)',
                      color: isErr ? 'var(--status-error)' : isWarn ? 'var(--status-warning)' : 'var(--text-primary)'
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', userSelect: 'none' }}>&gt;</span>
                    <span className="flex-grow-1 text-break">{log.message}</span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'error' && (
          <div>
            {!error && logs.filter(l => l.level === 'error').length === 0 ? (
              <div className="text-muted fst-italic py-3 text-center" style={{ fontSize: '0.8rem' }}>
                <i className="bi bi-check2-circle text-success me-1"></i> No runtime exceptions detected.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {error && (
                  <div className="p-3 rounded-3" style={{ background: 'var(--status-error-bg)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="badge bg-danger text-white">
                        <i className="bi bi-x-circle me-1"></i> {error.type || 'Runtime Exception'}
                      </span>
                      {error.line && (
                        <span className="badge bg-dark text-danger border border-danger">
                          Line {error.line}
                        </span>
                      )}
                    </div>
                    <div className="fw-semibold text-danger mb-2" style={{ fontSize: '0.85rem' }}>
                      {error.message}
                    </div>

                    {error.likelyCause && (
                      <div className="mb-2" style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        <strong>Likely Cause: </strong>
                        <span style={{ color: 'var(--text-secondary)' }}>{error.likelyCause}</span>
                      </div>
                    )}

                    {error.suggestedFix && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-teal)' }}>
                        <strong>Suggested Fix: </strong>
                        <span>{error.suggestedFix}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional runtime error logs */}
                {logs.filter(l => l.level === 'error').map((l, i) => (
                  <div key={i} className="p-2 rounded text-danger" style={{ background: 'rgba(239, 68, 68, 0.08)', fontSize: '0.8rem' }}>
                    <i className="bi bi-exclamation-octagon me-1"></i> {l.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';

const DEMO_PRESETS = [
  {
    name: 'Interactive Counter',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; background: #0e162b; color: #f8fafc; padding: 20px; text-align: center; }
    button { background: #8b5cf6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; margin: 5px; }
    button:hover { background: #7c3aed; }
    #count { font-size: 28px; font-weight: bold; color: #14b8a6; margin: 10px 0; }
  </style>
</head>
<body>
  <h3>DOM Counter</h3>
  <div id="count">0</div>
  <button id="incBtn">+ Increment</button>
  <button id="resetBtn">Reset</button>

  <script>
    let n = 0;
    const countEl = document.getElementById('count');
    document.getElementById('incBtn').onclick = () => {
      n++;
      countEl.textContent = n;
      console.log('Count updated to: ' + n);
    };
    document.getElementById('resetBtn').onclick = () => {
      n = 0;
      countEl.textContent = n;
      console.log('Count reset');
    };
  </script>
</body>
</html>`
  },
  {
    name: 'JavaScript Filter & Map',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: monospace; background: #0e162b; color: #14b8a6; padding: 15px; }
    .item { padding: 4px; border-bottom: 1px solid #1e2a4a; }
  </style>
</head>
<body>
  <h4>Active Student Scores (&gt; 75)</h4>
  <div id="results"></div>
  <script>
    const scores = [
      { name: 'Alex', score: 88 },
      { name: 'Priya', score: 94 },
      { name: 'Sam', score: 62 },
      { name: 'Taylor', score: 81 }
    ];

    const highScorers = scores.filter(s => s.score >= 75);
    const container = document.getElementById('results');
    
    highScorers.forEach(s => {
      const div = document.createElement('div');
      div.className = 'item';
      div.textContent = '⭐ ' + s.name + ': ' + s.score + '% (PASS)';
      container.appendChild(div);
      console.log('Filtered:', s.name, s.score);
    });
  </script>
</body>
</html>`
  }
];

export default function LiveMiniEditor() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [code, setCode] = useState(DEMO_PRESETS[0].code);
  const [logs, setLogs] = useState([]);
  const [runKey, setRunKey] = useState(1);
  const iframeRef = useRef(null);

  // Generate safe srcdoc with console intercept shim
  const srcdocContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <script>
          (function() {
            const originalLog = console.log;
            console.log = function(...args) {
              window.parent.postMessage({
                type: 'MINI_DEMO_LOG',
                payload: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
              }, '*');
              originalLog.apply(console, args);
            };
            window.onerror = function(msg, url, line) {
              window.parent.postMessage({
                type: 'MINI_DEMO_LOG',
                payload: '⚠️ Error (line ' + line + '): ' + msg
              }, '*');
            };
          })();
        </script>
      </head>
      <body>
        ${code}
      </body>
    </html>
  `;

  useEffect(() => {
    function handleMessage(e) {
      if (e.data && e.data.type === 'MINI_DEMO_LOG') {
        setLogs(prev => [...prev.slice(-10), e.data.payload]);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRun = () => {
    setLogs([]);
    setRunKey(k => k + 1);
  };

  const handlePresetChange = (idx) => {
    setSelectedPreset(idx);
    setCode(DEMO_PRESETS[idx].code);
    setLogs([]);
    setRunKey(k => k + 1);
  };

  return (
    <div className="cf-card p-0 overflow-hidden text-start shadow-lg" style={{ border: '1px solid var(--border-subtle)' }}>
      {/* Editor Header Bar */}
      <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom flex-wrap gap-2" style={{ background: 'var(--bg-surface-elevated)', borderColor: 'var(--border-subtle)' }}>
        <div className="d-flex align-items-center gap-2">
          <div className="d-flex gap-1 me-2">
            <span className="rounded-circle d-inline-block" style={{ width: '10px', height: '10px', background: '#EF4444' }}></span>
            <span className="rounded-circle d-inline-block" style={{ width: '10px', height: '10px', background: '#F59E0B' }}></span>
            <span className="rounded-circle d-inline-block" style={{ width: '10px', height: '10px', background: '#10B981' }}></span>
          </div>
          <span className="fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Live Sandbox Demo</span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="btn-group btn-group-sm">
            {DEMO_PRESETS.map((p, idx) => (
              <button
                key={p.name}
                type="button"
                className={`btn btn-sm ${selectedPreset === idx ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={{
                  fontSize: '0.75rem',
                  background: selectedPreset === idx ? 'var(--accent-violet)' : 'transparent',
                  borderColor: 'var(--border-subtle)',
                  color: selectedPreset === idx ? '#fff' : 'var(--text-secondary)'
                }}
                onClick={() => handlePresetChange(idx)}
              >
                {p.name}
              </button>
            ))}
          </div>

          <button
            onClick={handleRun}
            className="cf-btn-teal btn-sm py-1 px-3"
            style={{ fontSize: '0.8rem' }}
            title="Execute code in sandboxed iframe"
          >
            <i className="bi bi-play-fill"></i> Run
          </button>
        </div>
      </div>

      {/* Code Editor & Live Preview split */}
      <div className="row g-0">
        <div className="col-12 col-lg-6 border-end" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="px-3 py-1 border-bottom" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <i className="bi bi-code me-1"></i> Editable Code (HTML/CSS/JS)
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="form-control font-mono p-3 border-0 rounded-0"
            style={{
              background: 'var(--bg-app)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              height: '240px',
              resize: 'none',
              lineHeight: 1.5
            }}
            spellCheck="false"
          />
        </div>

        <div className="col-12 col-lg-6 d-flex flex-column">
          <div className="px-3 py-1 border-bottom d-flex justify-content-between align-items-center" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span><i className="bi bi-window-sidebar me-1"></i> Sandboxed Preview</span>
            <span className="cf-badge cf-badge-interactive" style={{ fontSize: '0.65rem' }}>sandbox="allow-scripts"</span>
          </div>
          <div className="flex-grow-1" style={{ height: '170px', background: '#0e162b' }}>
            <iframe
              key={runKey}
              ref={iframeRef}
              srcDoc={srcdocContent}
              sandbox="allow-scripts"
              title="Mini Sandboxed Preview"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>

          {/* Console snippet */}
          <div className="border-top px-3 py-2 font-mono" style={{ background: 'var(--bg-surface-elevated)', borderColor: 'var(--border-subtle)', height: '70px', overflowY: 'auto', fontSize: '0.75rem' }}>
            <div className="d-flex align-items-center justify-content-between text-muted mb-1" style={{ fontSize: '0.65rem' }}>
              <span><i className="bi bi-terminal me-1"></i> Console Output</span>
              <span>{logs.length} messages</span>
            </div>
            {logs.length === 0 ? (
              <span className="text-muted fst-italic">Console is ready. Click elements in preview or edit code.</span>
            ) : (
              logs.map((log, i) => (
                <div key={i} style={{ color: log.startsWith('⚠️') ? 'var(--status-error)' : 'var(--accent-teal)' }}>
                  &gt; {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

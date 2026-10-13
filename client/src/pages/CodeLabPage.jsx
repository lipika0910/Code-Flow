import React, { useState, useEffect } from 'react';
import CodeMirrorEditor from '../components/editor/CodeMirrorEditor';
import IframePreview from '../components/editor/IframePreview';
import OutputConsole from '../components/editor/OutputConsole';
import { runJavaScriptInWorker } from '../services/workerRunner';
import { explainError } from '../services/errorExplainer';
import { TEMPLATES, CHALLENGES } from '../services/templates';
import { storage } from '../services/storage';

export default function CodeLabPage() {
  // Runtime Mode: 'web' (HTML/CSS/JS preview) or 'js' (Standalone JS Web Worker)
  const [runtimeMode, setRuntimeMode] = useState('web');

  // Web mode tab: 'html' | 'css' | 'js'
  const [activeTab, setActiveTab] = useState('html');

  // Code state
  const [htmlCode, setHtmlCode] = useState(TEMPLATES.web[0].html);
  const [cssCode, setCssCode] = useState(TEMPLATES.web[0].css);
  const [jsCode, setJsCode] = useState(TEMPLATES.web[0].js);
  const [standaloneJs, setStandaloneJs] = useState(TEMPLATES.js[0].code);

  // Layout mode: 'split' | 'stacked' | 'preview-only'
  const [layoutMode, setLayoutMode] = useState('split');

  // Settings
  const [fontSize, setFontSize] = useState(14);
  const [isRunning, setIsRunning] = useState(false);
  const [runTrigger, setRunTrigger] = useState(1);

  // Console & diagnostics
  const [logs, setLogs] = useState([]);
  const [errorDiagnostic, setErrorDiagnostic] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);

  // Active Challenge (optional)
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [hintStage, setHintStage] = useState(0);

  // Notification toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Run Execution Handler
  const handleRun = async () => {
    setLogs([]);
    setErrorDiagnostic(null);
    setExecutionTime(null);
    setIsRunning(true);
    storage.recordActivity('code_executed');

    if (runtimeMode === 'web') {
      // Trigger iframe reload
      setRunTrigger(prev => prev + 1);
      setIsRunning(false);
    } else {
      // Execute in Web Worker with hard timeout
      const result = await runJavaScriptInWorker(standaloneJs, 2500);
      setLogs(result.logs);
      setExecutionTime(result.executionTime);
      if (result.error) {
        setErrorDiagnostic(result.error);
      }
      setIsRunning(false);
    }
  };

  // Handle console messages coming from iframe
  const handleIframeConsole = (data) => {
    setLogs(prev => [...prev.slice(-199), data]);
  };

  // Handle runtime errors coming from iframe
  const handleIframeError = (err) => {
    const diagnostic = explainError(err);
    setErrorDiagnostic(diagnostic);
    setLogs(prev => [...prev.slice(-199), { level: 'error', message: err.message }]);
  };

  // Reset current template
  const handleReset = () => {
    if (window.confirm('Reset code to original starter template? Unsaved changes will be discarded.')) {
      setLogs([]);
      setErrorDiagnostic(null);
      if (runtimeMode === 'web') {
        const t = TEMPLATES.web[0];
        setHtmlCode(t.html);
        setCssCode(t.css);
        setJsCode(t.js);
        setRunTrigger(prev => prev + 1);
      } else {
        setStandaloneJs(TEMPLATES.js[0].code);
      }
      showToast('Template reset successfully');
    }
  };

  // Copy active code to clipboard
  const handleCopy = async () => {
    let textToCopy = '';
    if (runtimeMode === 'web') {
      if (activeTab === 'html') textToCopy = htmlCode;
      else if (activeTab === 'css') textToCopy = cssCode;
      else textToCopy = jsCode;
    } else {
      textToCopy = standaloneJs;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('Code copied to clipboard!');
    } catch {
      showToast('Clipboard copy failed');
    }
  };

  // Download project as source file
  const handleDownload = () => {
    let filename = 'index.html';
    let content = '';

    if (runtimeMode === 'web') {
      filename = 'codeflow-project.html';
      content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CodeFlow Export</title>
  <style>
${cssCode}
  </style>
</head>
<body>
${htmlCode}
  <script>
${jsCode}
  </script>
</body>
</html>`;
    } else {
      filename = 'script.js';
      content = standaloneJs;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
  };

  // Select Preset Template
  const handleSelectTemplate = (template, mode) => {
    setLogs([]);
    setErrorDiagnostic(null);
    setActiveChallenge(null);
    setHintStage(0);

    if (mode === 'web') {
      setRuntimeMode('web');
      setHtmlCode(template.html);
      setCssCode(template.css);
      setJsCode(template.js);
      setRunTrigger(prev => prev + 1);
    } else {
      setRuntimeMode('js');
      setStandaloneJs(template.code);
    }
    showToast(`Loaded: ${template.name}`);
  };

  // Select Challenge
  const handleSelectChallenge = (ch) => {
    setActiveChallenge(ch);
    setHintStage(0);
    setLogs([]);
    setErrorDiagnostic(null);

    if (ch.mode === 'web') {
      setRuntimeMode('web');
      setHtmlCode(ch.html);
      setCssCode(ch.css);
      setJsCode(ch.js);
      setRunTrigger(prev => prev + 1);
    } else {
      setRuntimeMode('js');
      setStandaloneJs(ch.starter);
    }
    showToast(`Loaded challenge: ${ch.title}`);
  };

  return (
    <div className="d-flex flex-column" style={{ minHeight: 'calc(100vh - 120px)', background: 'var(--bg-app)' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
          <div className="toast show align-items-center text-white border-0 px-3 py-2" style={{ background: 'var(--accent-violet)' }}>
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-info-circle-fill"></i>
              <span>{toastMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* CodeLab Action Toolbar */}
      <div className="border-bottom px-3 py-2 d-flex flex-wrap align-items-center justify-content-between gap-2" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        {/* Left: Mode selector & Presets */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Runtime Mode Switch */}
          <div className="btn-group btn-group-sm">
            <button
              onClick={() => { setRuntimeMode('web'); setLogs([]); setErrorDiagnostic(null); }}
              className={`btn btn-sm ${runtimeMode === 'web' ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{
                fontSize: '0.8rem',
                background: runtimeMode === 'web' ? 'var(--accent-violet)' : 'transparent',
                borderColor: 'var(--border-subtle)',
                color: runtimeMode === 'web' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              <i className="bi bi-window-sidebar me-1"></i> Web (HTML/CSS/JS)
            </button>
            <button
              onClick={() => { setRuntimeMode('js'); setLogs([]); setErrorDiagnostic(null); }}
              className={`btn btn-sm ${runtimeMode === 'js' ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{
                fontSize: '0.8rem',
                background: runtimeMode === 'js' ? 'var(--accent-violet)' : 'transparent',
                borderColor: 'var(--border-subtle)',
                color: runtimeMode === 'js' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              <i className="bi bi-cpu me-1"></i> JS Worker
            </button>
          </div>

          {/* Template Dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ fontSize: '0.8rem', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              <i className="bi bi-collection me-1"></i> Templates
            </button>
            <ul className="dropdown-menu dropdown-menu-dark shadow" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
              <li className="dropdown-header text-uppercase" style={{ fontSize: '0.7rem', color: 'var(--accent-teal)' }}>Web Page Templates</li>
              {TEMPLATES.web.map(t => (
                <li key={t.id}>
                  <button className="dropdown-item" onClick={() => handleSelectTemplate(t, 'web')}>
                    {t.name}
                  </button>
                </li>
              ))}
              <li><hr className="dropdown-divider" style={{ borderColor: 'var(--border-subtle)' }} /></li>
              <li className="dropdown-header text-uppercase" style={{ fontSize: '0.7rem', color: 'var(--accent-violet)' }}>JavaScript Worker Presets</li>
              {TEMPLATES.js.map(t => (
                <li key={t.id}>
                  <button className="dropdown-item" onClick={() => handleSelectTemplate(t, 'js')}>
                    {t.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Challenges Dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ fontSize: '0.8rem', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              <i className="bi bi-flag me-1"></i> Challenges
            </button>
            <ul className="dropdown-menu dropdown-menu-dark shadow" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
              {CHALLENGES.map(ch => (
                <li key={ch.id}>
                  <button className="dropdown-item" onClick={() => handleSelectChallenge(ch)}>
                    {ch.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Center: Run & Reset Controls */}
        <div className="d-flex align-items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="cf-btn-teal btn-sm py-1 px-3 d-flex align-items-center gap-1"
            title="Execute Code"
            style={{ fontSize: '0.85rem' }}
          >
            <i className={`bi bi-${isRunning ? 'hourglass-split' : 'play-fill'} fs-6`}></i>
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>

          <button
            onClick={handleReset}
            className="btn btn-sm btn-outline-secondary py-1 px-2"
            title="Reset to Template"
            style={{ fontSize: '0.8rem', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
          </button>
        </div>

        {/* Right: Layout & Utilities */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Font Size Adjuster */}
          <div className="d-flex align-items-center gap-1" title="Adjust Editor Font Size">
            <button
              onClick={() => setFontSize(s => Math.max(11, s - 1))}
              className="btn btn-sm btn-outline-secondary px-2 py-0"
              style={{ fontSize: '0.75rem', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              A-
            </button>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fontSize}px</span>
            <button
              onClick={() => setFontSize(s => Math.min(22, s + 1))}
              className="btn btn-sm btn-outline-secondary px-2 py-0"
              style={{ fontSize: '0.75rem', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              A+
            </button>
          </div>

          {/* Layout Mode buttons */}
          <div className="btn-group btn-group-sm">
            <button
              onClick={() => setLayoutMode('split')}
              className={`btn btn-sm py-1 px-2 ${layoutMode === 'split' ? 'btn-secondary' : 'btn-outline-secondary'}`}
              title="Side by Side Layout"
              style={{ fontSize: '0.75rem' }}
            >
              <i className="bi bi-layout-split"></i>
            </button>
            <button
              onClick={() => setLayoutMode('stacked')}
              className={`btn btn-sm py-1 px-2 ${layoutMode === 'stacked' ? 'btn-secondary' : 'btn-outline-secondary'}`}
              title="Stacked Layout"
              style={{ fontSize: '0.75rem' }}
            >
              <i className="bi bi-layout-three-columns" style={{ transform: 'rotate(90deg)', display: 'inline-block' }}></i>
            </button>
            <button
              onClick={() => setLayoutMode('preview-only')}
              className={`btn btn-sm py-1 px-2 ${layoutMode === 'preview-only' ? 'btn-secondary' : 'btn-outline-secondary'}`}
              title="Preview Only"
              style={{ fontSize: '0.75rem' }}
            >
              <i className="bi bi-fullscreen"></i>
            </button>
          </div>

          {/* Copy & Download */}
          <button
            onClick={handleCopy}
            className="btn btn-sm btn-outline-secondary py-1 px-2"
            title="Copy Code"
            style={{ fontSize: '0.75rem', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <i className="bi bi-clipboard"></i>
          </button>
          <button
            onClick={handleDownload}
            className="btn btn-sm btn-outline-secondary py-1 px-2"
            title="Download Source"
            style={{ fontSize: '0.75rem', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <i className="bi bi-download"></i>
          </button>
        </div>
      </div>

      {/* Challenge Drawer (if active) */}
      {activeChallenge && (
        <div className="px-3 py-2 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2" style={{ background: 'rgba(20, 184, 166, 0.08)', borderColor: 'rgba(20, 184, 166, 0.25)' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="badge" style={{ background: 'var(--accent-teal)', color: '#070b19' }}>Active Challenge</span>
            <span className="fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{activeChallenge.title}</span>
            <span className="d-none d-md-inline" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>• {activeChallenge.expectedOutcome}</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            {hintStage < activeChallenge.hints.length && (
              <button
                onClick={() => setHintStage(s => s + 1)}
                className="btn btn-sm btn-outline-warning py-0 px-2"
                style={{ fontSize: '0.75rem' }}
              >
                <i className="bi bi-lightbulb me-1"></i> Reveal Hint ({hintStage + 1}/{activeChallenge.hints.length})
              </button>
            )}
            <button
              onClick={() => setActiveChallenge(null)}
              className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
              style={{ fontSize: '0.8rem' }}
            >
              Exit Challenge
            </button>
          </div>

          {hintStage > 0 && (
            <div className="w-100 mt-1 p-2 rounded" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', fontSize: '0.8rem', color: 'var(--status-warning)' }}>
              <strong>Hint {hintStage}:</strong> {activeChallenge.hints[hintStage - 1]}
            </div>
          )}
        </div>
      )}

      {/* Workspace Body */}
      <div className={`row g-0 flex-grow-1 ${layoutMode === 'stacked' ? 'flex-column' : ''}`}>
        {/* Editor Pane */}
        {layoutMode !== 'preview-only' && (
          <div className={`${layoutMode === 'split' ? 'col-12 col-lg-6' : 'col-12'} d-flex flex-column border-end`} style={{ borderColor: 'var(--border-subtle)', minHeight: layoutMode === 'stacked' ? '380px' : '450px' }}>
            {/* Editor File Tabs */}
            {runtimeMode === 'web' ? (
              <div className="d-flex align-items-center px-2 border-bottom" style={{ background: 'var(--bg-surface-elevated)', borderColor: 'var(--border-subtle)' }}>
                {[
                  { id: 'html', label: 'index.html', icon: 'bi-filetype-html', color: 'text-danger' },
                  { id: 'css', label: 'style.css', icon: 'bi-filetype-css', color: 'text-info' },
                  { id: 'js', label: 'script.js', icon: 'bi-filetype-js', color: 'text-warning' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`btn btn-sm py-2 px-3 border-0 rounded-0 d-flex align-items-center gap-1 ${activeTab === tab.id ? 'fw-bold' : ''}`}
                    style={{
                      background: activeTab === tab.id ? 'var(--bg-app)' : 'transparent',
                      color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                      borderTop: activeTab === tab.id ? '2px solid var(--accent-violet)' : '2px solid transparent',
                      fontSize: '0.8rem'
                    }}
                  >
                    <i className={`bi ${tab.icon} ${tab.color}`}></i>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 border-bottom d-flex align-items-center gap-2" style={{ background: 'var(--bg-surface-elevated)', borderColor: 'var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <i className="bi bi-filetype-js text-warning"></i>
                <span className="fw-semibold text-light">main.js</span>
                <span className="ms-auto cf-badge cf-badge-interactive" style={{ fontSize: '0.65rem' }}>Web Worker Thread</span>
              </div>
            )}

            {/* CodeMirror Editor */}
            <div className="flex-grow-1 position-relative" style={{ minHeight: '300px' }}>
              {runtimeMode === 'web' && activeTab === 'html' && (
                <CodeMirrorEditor
                  value={htmlCode}
                  onChange={setHtmlCode}
                  language="html"
                  fontSize={fontSize}
                />
              )}
              {runtimeMode === 'web' && activeTab === 'css' && (
                <CodeMirrorEditor
                  value={cssCode}
                  onChange={setCssCode}
                  language="css"
                  fontSize={fontSize}
                />
              )}
              {runtimeMode === 'web' && activeTab === 'js' && (
                <CodeMirrorEditor
                  value={jsCode}
                  onChange={setJsCode}
                  language="javascript"
                  fontSize={fontSize}
                />
              )}
              {runtimeMode === 'js' && (
                <CodeMirrorEditor
                  value={standaloneJs}
                  onChange={setStandaloneJs}
                  language="javascript"
                  fontSize={fontSize}
                />
              )}
            </div>
          </div>
        )}

        {/* Preview & Console Output Pane */}
        <div className={`${layoutMode === 'split' ? 'col-12 col-lg-6' : 'col-12'} d-flex flex-column`} style={{ minHeight: '450px' }}>
          {runtimeMode === 'web' ? (
            <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: '300px' }}>
              <div className="px-3 py-1 border-bottom d-flex justify-content-between align-items-center" style={{ background: 'var(--bg-surface-elevated)', borderColor: 'var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-display me-1"></i>
                  <span>Live Preview</span>
                  <span className="cf-badge cf-badge-interactive" style={{ fontSize: '0.65rem' }}>sandbox="allow-scripts"</span>
                </div>
                <button
                  onClick={() => setRunTrigger(r => r + 1)}
                  className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
                  title="Reload Preview"
                >
                  <i className="bi bi-arrow-repeat"></i>
                </button>
              </div>

              {/* Iframe */}
              <div className="flex-grow-1" style={{ minHeight: '260px' }}>
                <IframePreview
                  html={htmlCode}
                  css={cssCode}
                  js={jsCode}
                  onConsoleMessage={handleIframeConsole}
                  onRuntimeError={handleIframeError}
                  runTrigger={runTrigger}
                />
              </div>

              {/* Console & Error Panel */}
              <div style={{ height: '220px' }}>
                <OutputConsole
                  logs={logs}
                  error={errorDiagnostic}
                  onClearLogs={() => setLogs([])}
                  onClearError={() => setErrorDiagnostic(null)}
                  executionTime={executionTime}
                />
              </div>
            </div>
          ) : (
            /* Standalone JS Worker Output View */
            <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: '350px' }}>
              <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center" style={{ background: 'var(--bg-surface-elevated)', borderColor: 'var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-terminal-split text-info"></i>
                  <span className="fw-semibold text-light">Worker Execution Terminal</span>
                </div>
                <span className="badge bg-secondary-subtle text-secondary-emphasis" style={{ fontSize: '0.7rem' }}>Timeout: 2500ms</span>
              </div>

              <div className="flex-grow-1">
                <OutputConsole
                  logs={logs}
                  error={errorDiagnostic}
                  onClearLogs={() => setLogs([])}
                  onClearError={() => setErrorDiagnostic(null)}
                  executionTime={executionTime}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

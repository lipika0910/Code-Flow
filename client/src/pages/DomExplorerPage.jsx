import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const DOM_PRESETS = [
  {
    id: 'counter-card',
    name: 'Counter & Dynamic Badge',
    html: `<div id="counter-card" class="card p-3 shadow-sm" style="max-width: 320px; font-family: sans-serif; background: #ffffff; color: #212529; border-radius: 8px; border: 1px solid #dee2e6;">
  <h3 id="card-heading" class="title" style="margin-top: 0; font-size: 1.25rem;">Interactive Counter</h3>
  <p id="card-desc" style="color: #6c757d; font-size: 0.9rem;">Click the button below to update the live state count.</p>
  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
    <button id="increment-btn" style="background: #0d6efd; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-weight: bold;">
      Increment Count
    </button>
    <span id="counter-badge" class="badge" style="background: #198754; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold;">
      0
    </span>
  </div>
  <small id="status-note" style="color: #0dcaf0; font-style: italic;">Ready for events</small>
</div>`,
    css: `button:hover { opacity: 0.9; }`,
    js: `const btn = document.getElementById('increment-btn');
const badge = document.getElementById('counter-badge');
const note = document.getElementById('status-note');
let count = 0;

btn.addEventListener('click', () => {
  count++;
  badge.textContent = count;
  note.textContent = 'Updated via click at ' + new Date().toLocaleTimeString();
  console.log('Button clicked! New count:', count);
});`
  },
  {
    id: 'todo-item',
    name: 'Todo Item with State Toggle',
    html: `<div id="todo-box" class="todo-item" style="font-family: sans-serif; padding: 12px; background: #ffffff; border-radius: 6px; border: 1px solid #ced4da; max-width: 350px;">
  <div style="display: flex; align-items: center; justify-content: space-between;">
    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
      <input type="checkbox" id="todo-check" style="width: 18px; height: 18px; cursor: pointer;" />
      <span id="todo-text" style="font-size: 1rem; color: #212529;">Review DOM Event Bubbling</span>
    </label>
    <span id="priority-tag" style="background: #ffc107; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">
      High
    </span>
  </div>
  <p id="todo-status" style="margin: 8px 0 0 0; font-size: 0.8rem; color: #6c757d;">Status: Incomplete</p>
</div>`,
    css: ``,
    js: `const check = document.getElementById('todo-check');
const text = document.getElementById('todo-text');
const status = document.getElementById('todo-status');

check.addEventListener('change', (e) => {
  if (e.target.checked) {
    text.style.textDecoration = 'line-through';
    text.style.color = '#6c757d';
    status.textContent = 'Status: Completed!';
    console.log('Todo marked complete');
  } else {
    text.style.textDecoration = 'none';
    text.style.color = '#212529';
    status.textContent = 'Status: Incomplete';
    console.log('Todo marked incomplete');
  }
});`
  },
  {
    id: 'alert-modal',
    name: 'Modal Alert Box with Dismiss',
    html: `<div id="alert-banner" class="alert-box" style="font-family: sans-serif; background: #d1e7dd; border: 1px solid #a3cfbb; color: #0f5132; padding: 12px 16px; border-radius: 6px; max-width: 400px; display: flex; align-items: center; justify-content: space-between;">
  <div>
    <strong id="alert-title">Submission Success!</strong>
    <p id="alert-message" style="margin: 4px 0 0 0; font-size: 0.85rem;">Your code passed all unit and DOM tests.</p>
  </div>
  <button id="dismiss-btn" style="background: transparent; border: none; font-size: 1.2rem; cursor: pointer; color: #0f5132; font-weight: bold; line-height: 1;">
    &times;
  </button>
</div>`,
    css: ``,
    js: `const dismissBtn = document.getElementById('dismiss-btn');
const banner = document.getElementById('alert-banner');

dismissBtn.addEventListener('click', () => {
  banner.style.display = 'none';
  console.log('Alert banner dismissed');
});`
  }
];

// Helper to parse HTML string into a hierarchical Node tree
function parseHtmlTree(htmlStr) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlStr, 'text/html');
  const body = doc.body;

  let idCounter = 1;

  function walk(element) {
    if (element.nodeType !== Node.ELEMENT_NODE) return null;

    const nodeId = element.getAttribute('id') || `node_${idCounter++}`;
    const attributes = {};
    for (const attr of element.attributes) {
      attributes[attr.name] = attr.value;
    }

    const children = [];
    for (const child of element.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const parsedChild = walk(child);
        if (parsedChild) children.push(parsedChild);
      }
    }

    return {
      id: nodeId,
      tagName: element.tagName.toLowerCase(),
      className: element.className || '',
      attributes,
      textContent: element.childNodes.length === 1 && element.firstChild.nodeType === Node.TEXT_NODE ? element.firstChild.textContent.trim() : '',
      children
    };
  }

  const rootNodes = [];
  for (const child of body.childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const parsed = walk(child);
      if (parsed) rootNodes.push(parsed);
    }
  }

  return rootNodes;
}

export default function DomExplorerPage() {
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState(DOM_PRESETS[0]);
  const [currentHtml, setCurrentHtml] = useState(DOM_PRESETS[0].html);
  const [currentCss, setCurrentCss] = useState(DOM_PRESETS[0].css);
  const [currentJs, setCurrentJs] = useState(DOM_PRESETS[0].js);

  const [treeData, setTreeData] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Inspector edit fields
  const [editClasses, setEditClasses] = useState('');
  const [editStyles, setEditStyles] = useState('');
  const [editText, setEditText] = useState('');

  // Event dispatch simulator
  const [eventTypeToDispatch, setEventTypeToDispatch] = useState('click');
  const [eventLog, setEventLog] = useState([]);

  const iframeRef = useRef(null);

  // Parse tree when HTML changes
  useEffect(() => {
    try {
      const parsed = parseHtmlTree(currentHtml);
      setTreeData(parsed);
      if (parsed.length > 0 && !selectedNodeId) {
        setSelectedNodeId(parsed[0].id);
        setSelectedNode(parsed[0]);
        setEditClasses(parsed[0].className);
        setEditStyles(parsed[0].attributes.style || '');
        setEditText(parsed[0].textContent);
      }
    } catch {
      // ignore
    }
  }, [currentHtml]);

  // Load preset
  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setCurrentHtml(preset.html);
    setCurrentCss(preset.css);
    setCurrentJs(preset.js);
    setSelectedNodeId(null);
    setSelectedNode(null);
    setEventLog([]);
  };

  // Node selection in tree
  const handleSelectNode = (node) => {
    setSelectedNodeId(node.id);
    setSelectedNode(node);
    setEditClasses(node.className);
    setEditStyles(node.attributes.style || '');
    setEditText(node.textContent);

    // Send highlight message to iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'CF_HIGHLIGHT_NODE',
        targetId: node.id
      }, '*');
    }
  };

  // Apply edits to currentHtml
  const handleApplyInspectorEdits = () => {
    if (!selectedNode) return;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(currentHtml, 'text/html');
      const targetEl = doc.getElementById(selectedNode.id) || doc.querySelector(selectedNode.tagName);

      if (targetEl) {
        if (editClasses) {
          targetEl.className = editClasses;
        } else {
          targetEl.removeAttribute('class');
        }

        if (editStyles) {
          targetEl.setAttribute('style', editStyles);
        } else {
          targetEl.removeAttribute('style');
        }

        if (editText !== undefined && editText !== '') {
          targetEl.textContent = editText;
        }

        const updatedHtml = doc.body.innerHTML;
        setCurrentHtml(updatedHtml);

        setEventLog(prev => [
          {
            type: 'DOM Mutation',
            details: `Updated <${selectedNode.tagName}#${selectedNode.id}>`,
            time: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Failed to update DOM node:', err);
    }
  };

  // Dispatch simulated event
  const handleDispatchEvent = () => {
    if (!selectedNode) return;

    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'CF_DISPATCH_EVENT',
        targetId: selectedNode.id,
        eventType: eventTypeToDispatch
      }, '*');

      setEventLog(prev => [
        {
          type: eventTypeToDispatch.toUpperCase(),
          details: `Dispatched to <${selectedNode.tagName}#${selectedNode.id}>`,
          time: new Date().toLocaleTimeString()
        },
        ...prev
      ]);
    }
  };

  // Handle messages received from iframe
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'CF_EVENT_FIRED') {
        setEventLog(prev => [
          {
            type: e.data.eventType,
            details: `Target: <${e.data.targetTag}#${e.data.targetId}>`,
            time: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Generate srcDoc for iframe
  const srcDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 16px;
      background: #f8f9fa;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .cf-active-target {
      outline: 2px dashed #0dcaf0 !important;
      outline-offset: 3px !important;
    }
    ${currentCss}
  </style>
</head>
<body>
  ${currentHtml}

  <script>
    // Console proxy
    const originalLog = console.log;
    console.log = function(...args) {
      window.parent.postMessage({
        type: 'CF_CONSOLE_LOG',
        args: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a))
      }, '*');
      originalLog.apply(console, args);
    };

    // Listen for highlight and dispatch commands
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'CF_HIGHLIGHT_NODE') {
        document.querySelectorAll('.cf-active-target').forEach(el => el.classList.remove('cf-active-target'));
        const el = document.getElementById(data.targetId);
        if (el) el.classList.add('cf-active-target');
      }

      if (data.type === 'CF_DISPATCH_EVENT') {
        const el = document.getElementById(data.targetId);
        if (el) {
          const evt = new MouseEvent(data.eventType, { bubbles: true, cancelable: true, view: window });
          el.dispatchEvent(evt);
        }
      }
    });

    // Capture all click events for activity logging
    document.addEventListener('click', (e) => {
      window.parent.postMessage({
        type: 'CF_EVENT_FIRED',
        eventType: 'CLICK (Captured)',
        targetId: e.target.id || 'anonymous',
        targetTag: e.target.tagName.toLowerCase()
      }, '*');
    }, true);

    // Run user JS
    try {
      ${currentJs}
    } catch(err) {
      console.log('Script Error:', err.message);
    }
  </script>
</body>
</html>`;

  // Render tree recursive component
  const renderTreeNodes = (nodes) => {
    return (
      <ul className="list-unstyled ms-2 mb-0" style={{ borderLeft: '1px dashed var(--border-subtle)', paddingLeft: '8px' }}>
        {nodes.map(node => {
          const isSelected = selectedNodeId === node.id;
          return (
            <li key={node.id} className="my-1">
              <button
                onClick={() => handleSelectNode(node)}
                className={`btn btn-sm text-start py-1 px-2 rounded border-0 ${
                  isSelected ? 'fw-bold' : ''
                }`}
                style={{
                  background: isSelected ? 'var(--accent-violet)' : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              >
                <i className="bi bi-tag-fill me-1" style={{ color: isSelected ? '#ffffff' : 'var(--accent-teal)' }}></i>
                <span>&lt;{node.tagName}</span>
                {node.id && <span style={{ color: isSelected ? '#fff' : 'var(--accent-amber)' }}>#{node.id}</span>}
                {node.className && <span style={{ color: isSelected ? '#fff' : 'var(--text-muted)' }}>.{node.className.split(' ')[0]}</span>}
                <span>&gt;</span>
              </button>
              {node.children && node.children.length > 0 && renderTreeNodes(node.children)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="container-fluid py-4 px-3 px-lg-4">
      {/* Header */}
      <div className="row mb-3 align-items-center">
        <div className="col-12 col-md-8">
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge rounded-pill" style={{ background: 'var(--accent-teal)', color: '#000', fontWeight: 'bold' }}>
              <i className="bi bi-diagram-2 me-1"></i> Live DOM Inspector
            </span>
            <span className="badge bg-secondary">DOM Tree & Events</span>
          </div>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            DOM Explorer & Event Mutator
          </h1>
          <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
            Inspect document tree nodes, mutate attributes and inline styles in real-time, and dispatch simulated DOM events across listeners.
          </p>
        </div>
        <div className="col-12 col-md-4 text-md-end mt-2 mt-md-0">
          <button
            onClick={() => {
              localStorage.setItem('cf_codelab_starter', JSON.stringify({
                html: currentHtml,
                css: currentCss,
                js: currentJs
              }));
              navigate('/codelab');
            }}
            className="btn btn-sm btn-outline-primary"
            style={{ borderColor: 'var(--accent-violet)', color: 'var(--accent-violet)' }}
          >
            <i className="bi bi-box-arrow-up-right me-1"></i> Open in CodeLab
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {DOM_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            className={`btn btn-sm ${
              selectedPreset.id === preset.id ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            style={{
              background: selectedPreset.id === preset.id ? 'var(--accent-violet)' : 'transparent',
              borderColor: selectedPreset.id === preset.id ? 'var(--accent-violet)' : 'var(--border-subtle)',
              color: selectedPreset.id === preset.id ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <i className="bi bi-window-stack me-1"></i>
            {preset.name}
          </button>
        ))}
      </div>

      <div className="row g-3">
        {/* Left: DOM Tree Visualizer */}
        <div className="col-12 col-lg-3">
          <div className="cf-card p-3 h-100">
            <h2 className="h6 fw-bold mb-3 d-flex align-items-center justify-content-between" style={{ color: 'var(--text-primary)' }}>
              <span>DOM Tree Hierarchy</span>
              <span className="badge bg-dark border" style={{ borderColor: 'var(--border-subtle)' }}>
                Live
              </span>
            </h2>
            <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
              {treeData.length > 0 ? (
                renderTreeNodes(treeData)
              ) : (
                <div className="text-muted p-2" style={{ fontSize: '0.85rem' }}>
                  No elements parsed.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Live Preview Iframe */}
        <div className="col-12 col-lg-5">
          <div className="cf-card p-3 h-100 d-flex flex-column">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="fw-semibold d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                <i className="bi bi-display" style={{ color: 'var(--accent-teal)' }}></i>
                Sandboxed Preview (`allow-scripts`)
              </span>
              <span className="badge bg-secondary" style={{ fontSize: '0.75rem' }}>
                Target Highlighted
              </span>
            </div>
            <div className="flex-grow-1 rounded overflow-hidden" style={{ minHeight: '360px', border: '1px solid var(--border-subtle)', background: '#fff' }}>
              <iframe
                ref={iframeRef}
                title="DOM Explorer Preview"
                srcDoc={srcDoc}
                sandbox="allow-scripts"
                style={{ width: '100%', height: '100%', minHeight: '360px', border: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Right: Node Inspector & Event Dispatcher */}
        <div className="col-12 col-lg-4">
          {/* Node Inspector */}
          <div className="cf-card p-3 mb-3">
            <h2 className="h6 fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <i className="bi bi-sliders" style={{ color: 'var(--accent-violet)' }}></i>
              <span>Node Inspector & Live Mutator</span>
            </h2>

            {selectedNode ? (
              <div>
                <div className="d-flex align-items-center gap-2 mb-2 p-2 rounded" style={{ background: 'var(--bg-surface-elevated)' }}>
                  <span className="badge bg-primary text-uppercase">{selectedNode.tagName}</span>
                  <span className="fw-semibold text-truncate" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    ID: {selectedNode.id}
                  </span>
                </div>

                <div className="mb-2">
                  <label className="form-label mb-1" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Classes:
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editClasses}
                    onChange={(e) => setEditClasses(e.target.value)}
                    style={{ background: 'var(--bg-app)', color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label mb-1" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Inline Style (`style` attribute):
                  </label>
                  <textarea
                    rows={2}
                    className="form-control form-control-sm"
                    value={editStyles}
                    onChange={(e) => setEditStyles(e.target.value)}
                    style={{ background: 'var(--bg-app)', color: 'var(--text-primary)', borderColor: 'var(--border-subtle)', fontSize: '0.8rem', fontFamily: 'monospace' }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label mb-1" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Text Content:
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    style={{ background: 'var(--bg-app)', color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }}
                  />
                </div>

                <button
                  onClick={handleApplyInspectorEdits}
                  className="cf-btn-primary w-100 py-1"
                  style={{ fontSize: '0.85rem' }}
                >
                  <i className="bi bi-check2-circle me-1"></i> Apply Changes to Preview
                </button>
              </div>
            ) : (
              <div className="text-muted p-2" style={{ fontSize: '0.85rem' }}>
                Select a node from the tree hierarchy to inspect and modify.
              </div>
            )}
          </div>

          {/* Event Dispatcher & Activity Log */}
          <div className="cf-card p-3">
            <h2 className="h6 fw-bold mb-2 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <i className="bi bi-lightning-charge" style={{ color: 'var(--accent-amber)' }}></i>
              <span>Simulate Event Dispatch</span>
            </h2>

            <div className="d-flex gap-2 mb-3">
              <select
                className="form-select form-select-sm"
                value={eventTypeToDispatch}
                onChange={(e) => setEventTypeToDispatch(e.target.value)}
                style={{ background: 'var(--bg-app)', color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }}
              >
                <option value="click">click</option>
                <option value="mouseover">mouseover</option>
                <option value="mouseout">mouseout</option>
                <option value="change">change</option>
              </select>
              <button
                onClick={handleDispatchEvent}
                disabled={!selectedNode}
                className="btn btn-sm btn-outline-warning text-nowrap"
                style={{ borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }}
              >
                Trigger Event
              </button>
            </div>

            {/* Event Activity Log */}
            <div>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="fw-semibold" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Event Activity Log
                </span>
                {eventLog.length > 0 && (
                  <button
                    onClick={() => setEventLog([])}
                    className="btn btn-link p-0 text-muted"
                    style={{ fontSize: '0.75rem', textDecoration: 'none' }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '140px', overflowY: 'auto' }}>
                {eventLog.length > 0 ? (
                  eventLog.map((log, idx) => (
                    <div
                      key={idx}
                      className="d-flex align-items-center justify-content-between py-1 border-bottom"
                      style={{ borderColor: 'var(--border-subtle)', fontSize: '0.75rem' }}
                    >
                      <span className="badge bg-secondary">{log.type}</span>
                      <span className="text-truncate px-1" style={{ color: 'var(--text-secondary)' }}>
                        {log.details}
                      </span>
                      <span className="text-muted">{log.time}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-muted p-1" style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                    No events captured yet. Click or dispatch an event above.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

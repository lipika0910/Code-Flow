import React, { useEffect, useRef, useState } from 'react';

export default function IframePreview({
  html = '',
  css = '',
  js = '',
  onConsoleMessage,
  onRuntimeError,
  runTrigger = 0
}) {
  const iframeRef = useRef(null);
  const [iframeKey, setIframeKey] = useState(0);

  // Re-render iframe when trigger changes
  useEffect(() => {
    setIframeKey(k => k + 1);
  }, [runTrigger]);

  // Construct srcdoc with safe postMessage console and error interceptor
  const buildSrcDoc = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    /* User Styles */
    ${css}
  </style>
  <script>
    (function() {
      const MAX_LOGS = 200;
      let logCount = 0;

      function serialize(val) {
        try {
          if (val === undefined) return 'undefined';
          if (val === null) return 'null';
          if (typeof val === 'function') return val.toString();
          if (typeof val === 'symbol') return val.toString();
          if (typeof val === 'bigint') return val.toString() + 'n';
          if (typeof val === 'object') return JSON.stringify(val);
          return String(val);
        } catch(e) {
          return String(val);
        }
      }

      function sendToParent(type, level, message, details) {
        if (logCount >= MAX_LOGS) return;
        logCount++;
        window.parent.postMessage({
          source: 'CODEFLOW_IFRAME_PREVIEW',
          type,
          level,
          message,
          details
        }, '*');
      }

      const origLog = console.log;
      const origWarn = console.warn;
      const origError = console.error;
      const origInfo = console.info;

      console.log = function(...args) {
        sendToParent('console', 'log', args.map(serialize).join(' '));
        origLog.apply(console, args);
      };
      console.info = function(...args) {
        sendToParent('console', 'info', args.map(serialize).join(' '));
        origInfo.apply(console, args);
      };
      console.warn = function(...args) {
        sendToParent('console', 'warn', args.map(serialize).join(' '));
        origWarn.apply(console, args);
      };
      console.error = function(...args) {
        sendToParent('console', 'error', args.map(serialize).join(' '));
        origError.apply(console, args);
      };

      window.onerror = function(message, source, lineno, colno, error) {
        sendToParent('error', 'error', message, {
          line: lineno,
          col: colno,
          stack: error ? error.stack : null
        });
        return false;
      };

      window.addEventListener('unhandledrejection', function(event) {
        sendToParent('error', 'error', 'Unhandled Promise Rejection: ' + (event.reason ? event.reason.message || event.reason : 'Unknown reason'));
      });

      document.addEventListener('DOMContentLoaded', function() {
        sendToParent('ready', 'info', 'DOM Content Loaded');
      });
    })();
  </script>
</head>
<body>
  ${html}
  <script>
    try {
      ${js}
    } catch(err) {
      console.error(err.name + ': ' + err.message);
    }
  </script>
</body>
</html>`;
  };

  useEffect(() => {
    function handleWindowMessage(event) {
      // Validate event shape and source
      if (!event.data || event.data.source !== 'CODEFLOW_IFRAME_PREVIEW') {
        return;
      }

      const { type, level, message, details } = event.data;

      if (type === 'console' && onConsoleMessage) {
        onConsoleMessage({ level, message });
      } else if (type === 'error' && onRuntimeError) {
        onRuntimeError({
          message,
          line: details?.line,
          stack: details?.stack
        });
      }
    }

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [onConsoleMessage, onRuntimeError]);

  return (
    <div className="w-100 h-100 position-relative d-flex flex-column" style={{ background: '#ffffff', minHeight: '300px' }}>
      <iframe
        key={iframeKey}
        ref={iframeRef}
        srcDoc={buildSrcDoc()}
        sandbox="allow-scripts"
        title="CodeFlow Sandboxed Preview"
        className="w-100 h-100 flex-grow-1 border-0"
        style={{ minHeight: '280px' }}
      />
    </div>
  );
}

import { explainError } from './errorExplainer';

/**
 * Executes standalone JavaScript inside an isolated Web Worker spawned from a Blob.
 * Features:
 * - Hard timeout watchdog (terminates infinite loops)
 * - Intercepts console.log, info, warn, error
 * - Enforces max message count and payload size limits
 * - Diagnoses runtime errors into plain-English explanations
 */
export function runJavaScriptInWorker(userCode, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const logs = [];
    const MAX_LOGS = 200;
    const MAX_OUTPUT_BYTES = 50 * 1024; // 50 KB
    let totalOutputBytes = 0;
    let isTerminated = false;

    // Worker code string
    const workerScript = `
      self.onmessage = function(event) {
        const userCode = event.data;
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;
        const originalInfo = console.info;

        function serialize(val) {
          try {
            if (val === undefined) return 'undefined';
            if (val === null) return 'null';
            if (typeof val === 'function') return val.toString();
            if (typeof val === 'symbol') return val.toString();
            if (typeof val === 'bigint') return val.toString() + 'n';
            if (typeof val === 'object') return JSON.stringify(val);
            return String(val);
          } catch (e) {
            return String(val);
          }
        }

        console.log = function(...args) {
          self.postMessage({ type: 'CONSOLE', level: 'log', message: args.map(serialize).join(' ') });
        };
        console.info = function(...args) {
          self.postMessage({ type: 'CONSOLE', level: 'info', message: args.map(serialize).join(' ') });
        };
        console.warn = function(...args) {
          self.postMessage({ type: 'CONSOLE', level: 'warn', message: args.map(serialize).join(' ') });
        };
        console.error = function(...args) {
          self.postMessage({ type: 'CONSOLE', level: 'error', message: args.map(serialize).join(' ') });
        };

        try {
          // Execute student code inside worker scope
          const result = (new Function(userCode))();
          self.postMessage({ type: 'DONE', result: serialize(result) });
        } catch (err) {
          self.postMessage({
            type: 'RUNTIME_ERROR',
            name: err.name,
            message: err.message,
            stack: err.stack
          });
        }
      };
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    let worker;

    try {
      worker = new Worker(workerUrl);
    } catch (e) {
      URL.revokeObjectURL(workerUrl);
      resolve({
        logs: [],
        executionTime: 0,
        error: explainError(new Error('Unable to spawn Web Worker in this environment: ' + e.message))
      });
      return;
    }

    const cleanup = () => {
      isTerminated = true;
      clearTimeout(timer);
      if (worker) {
        worker.terminate();
      }
      URL.revokeObjectURL(workerUrl);
    };

    // Hard timeout watchdog
    const timer = setTimeout(() => {
      if (!isTerminated) {
        cleanup();
        const duration = Math.round(performance.now() - startTime);
        resolve({
          logs,
          executionTime: duration,
          error: explainError(new Error(`Execution timed out (${timeoutMs}ms). Infinite loop detected.`))
        });
      }
    }, timeoutMs);

    worker.onmessage = (e) => {
      if (isTerminated) return;
      const data = e.data;

      if (data.type === 'CONSOLE') {
        if (logs.length < MAX_LOGS && totalOutputBytes < MAX_OUTPUT_BYTES) {
          const msg = data.message;
          totalOutputBytes += msg.length;
          logs.push({ level: data.level, message: msg });
        } else if (logs.length === MAX_LOGS) {
          logs.push({ level: 'warn', message: '⚠️ Output limit reached (200 messages capped).' });
        }
      } else if (data.type === 'RUNTIME_ERROR') {
        cleanup();
        const duration = Math.round(performance.now() - startTime);
        resolve({
          logs,
          executionTime: duration,
          error: explainError({ name: data.name, message: data.message, stack: data.stack })
        });
      } else if (data.type === 'DONE') {
        cleanup();
        const duration = Math.round(performance.now() - startTime);
        resolve({
          logs,
          executionTime: duration,
          error: null,
          result: data.result
        });
      }
    };

    worker.onerror = (e) => {
      if (isTerminated) return;
      cleanup();
      const duration = Math.round(performance.now() - startTime);
      resolve({
        logs,
        executionTime: duration,
        error: explainError({
          name: 'WorkerError',
          message: e.message || 'Error occurred in worker thread',
          line: e.lineno
        })
      });
    };

    // Send code to worker
    worker.postMessage(userCode);
  });
}

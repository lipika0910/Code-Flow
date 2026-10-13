import { describe, it, expect } from 'vitest';
import { generateCodeTrace } from '../services/codeTraceInterpreter';

describe('CodeTrace AST Interpreter', () => {
  it('correctly traces variable declarations and arithmetic', () => {
    const code = `
      let a = 10;
      let b = 25;
      let sum = a + b;
    `;
    const result = generateCodeTrace(code);
    expect(result.success).toBe(true);
    expect(result.snapshots.length).toBeGreaterThanOrEqual(3);

    const last = result.snapshots[result.snapshots.length - 1];
    expect(last.scope.a).toBe('10');
    expect(last.scope.b).toBe('25');
    expect(last.scope.sum).toBe('35');
  });

  it('correctly steps through for-loops and records iteration counts', () => {
    const code = `
      let total = 0;
      for (let i = 1; i <= 3; i++) {
        total += i;
      }
    `;
    const result = generateCodeTrace(code);
    expect(result.success).toBe(true);

    const finalSnapshot = result.snapshots[result.snapshots.length - 1];
    expect(finalSnapshot.scope.total).toBe('6');
  });

  it('correctly tracks function calls, parameters, and call stack', () => {
    const code = `
      function multiply(x, y) {
        return x * y;
      }
      let product = multiply(4, 5);
    `;
    const result = generateCodeTrace(code);
    expect(result.success).toBe(true);

    // Look for function entry snapshot
    const funcEntry = result.snapshots.find(s => s.explanation.includes('Entering function'));
    expect(funcEntry).toBeDefined();
    expect(funcEntry.stack).toContain('multiply()');

    const last = result.snapshots[result.snapshots.length - 1];
    expect(last.scope.product).toBe('20');
  });

  it('honestly rejects unsupported syntax with descriptive error message', () => {
    const classCode = `
      class Animal {
        speak() { return 'hello'; }
      }
    `;
    const result = generateCodeTrace(classCode);
    expect(result.success).toBe(false);
    expect(result.isUnsupported).toBe(true);
    expect(result.error).toContain('Unsupported Syntax: \'ClassDeclaration\'');
  });

  it('enforces maximum step count to prevent infinite loop locking', () => {
    const infiniteLoop = `
      let x = 0;
      while (true) {
        x++;
      }
    `;
    const result = generateCodeTrace(infiniteLoop, 50);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Execution step limit exceeded');
    expect(result.snapshots.length).toBeLessThanOrEqual(50);
  });
});

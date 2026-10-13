import * as acorn from 'acorn';

/**
 * CodeFlow Educational AST Interpreter & Trace Generator
 *
 * Designed to provide step-by-step visibility into JavaScript execution for students.
 * Supports a bounded educational subset of JavaScript:
 * - Variable declarations (let, const, var)
 * - Assignments (=, +=, -=, *=, /=)
 * - Binary & Unary operators (+, -, *, /, %, ==, ===, !=, !==, <, <=, >, >=, !)
 * - Logical operators (&&, ||)
 * - Control flow: IfStatement, ForStatement, WhileStatement
 * - Functions: FunctionDeclaration, CallExpression, ReturnStatement
 * - Arrays: ArrayExpression, index indexing
 * - Objects: ObjectExpression, property reading
 * - console.log statements
 *
 * Enforces a strict step count limit (max 500 steps).
 * Rejects unsupported syntax (classes, generators, async/await, eval, with, imports/exports) honestly.
 */

const UNSUPPORTED_NODE_TYPES = new Set([
  'ClassDeclaration',
  'ClassExpression',
  'AwaitExpression',
  'YieldExpression',
  'ImportDeclaration',
  'ExportNamedDeclaration',
  'ExportDefaultDeclaration',
  'ExportAllDeclaration',
  'WithStatement',
  'TaggedTemplateExpression'
]);

export function generateCodeTrace(code, maxSteps = 500) {
  let ast;
  try {
    ast = acorn.parse(code, {
      ecmaVersion: 2020,
      locations: true,
      sourceType: 'script'
    });
  } catch (err) {
    return {
      success: false,
      isUnsupported: true,
      error: `Syntax Error: ${err.message}`,
      snapshots: []
    };
  }

  // Check for unsupported syntax in AST
  const unsupportedFound = findUnsupportedSyntax(ast);
  if (unsupportedFound) {
    return {
      success: false,
      isUnsupported: true,
      error: `Unsupported Syntax: '${unsupportedFound}' is outside the educational subset. CodeTrace supports standard variables, loops, conditionals, functions, arrays, and objects.`,
      snapshots: []
    };
  }

  const snapshots = [];
  const globalScope = Object.create(null);
  const callStack = ['global'];
  const output = [];
  let stepCount = 0;

  function recordSnapshot(node, explanation, localScope = {}) {
    if (stepCount >= maxSteps) return;
    stepCount++;

    const mergedScope = { ...globalScope, ...localScope };
    // Create clean serializable snapshot
    const serializableScope = {};
    for (const [k, v] of Object.entries(mergedScope)) {
      if (typeof v === 'function') {
        serializableScope[k] = `[Function: ${k}]`;
      } else if (Array.isArray(v)) {
        serializableScope[k] = `[${v.join(', ')}]`;
      } else if (typeof v === 'object' && v !== null) {
        serializableScope[k] = JSON.stringify(v);
      } else {
        serializableScope[k] = String(v);
      }
    }

    snapshots.push({
      stepIndex: stepCount,
      line: node.loc ? node.loc.start.line : 1,
      column: node.loc ? node.loc.start.column : 0,
      nodeType: node.type,
      scope: serializableScope,
      stack: [...callStack],
      output: [...output],
      explanation
    });
  }

  try {
    executeProgram(ast, globalScope);
  } catch (err) {
    if (err.message.includes('Maximum step limit')) {
      return {
        success: false,
        error: `Execution step limit exceeded (${maxSteps} steps). Possible infinite loop in trace.`,
        snapshots
      };
    }
    return {
      success: false,
      error: `Runtime Error in Trace: ${err.message}`,
      snapshots
    };
  }

  return {
    success: true,
    snapshots,
    totalSteps: snapshots.length,
    finalOutput: output
  };

  // --- Recursive AST Interpreter Functions ---

  function checkStepLimit() {
    if (stepCount >= maxSteps) {
      throw new Error(`Maximum step limit (${maxSteps}) reached.`);
    }
  }

  function executeProgram(programNode, scope) {
    for (const node of programNode.body) {
      executeStatement(node, scope);
    }
  }

  function executeStatement(node, scope) {
    checkStepLimit();
    if (!node) return;

    switch (node.type) {
      case 'VariableDeclaration': {
        for (const decl of node.declarations) {
          const varName = decl.id.name;
          let val = undefined;
          if (decl.init) {
            val = evaluateExpression(decl.init, scope);
          }
          scope[varName] = val;
          recordSnapshot(decl, `Declared variable '${varName}' with value: ${formatVal(val)}`, scope);
        }
        break;
      }

      case 'ExpressionStatement': {
        evaluateExpression(node.expression, scope);
        break;
      }

      case 'IfStatement': {
        const testVal = evaluateExpression(node.test, scope);
        recordSnapshot(node.test, `Evaluated if condition: ${formatVal(testVal)} (${Boolean(testVal) ? 'TRUE branch taken' : 'FALSE branch'})`, scope);
        if (Boolean(testVal)) {
          executeStatement(node.consequent, scope);
        } else if (node.alternate) {
          executeStatement(node.alternate, scope);
        }
        break;
      }

      case 'WhileStatement': {
        while (Boolean(evaluateExpression(node.test, scope))) {
          checkStepLimit();
          recordSnapshot(node.test, `While condition is TRUE; executing loop body`, scope);
          const ret = executeStatement(node.body, scope);
          if (ret && ret.isReturn) return ret;
        }
        recordSnapshot(node.test, `While condition is FALSE; exiting loop`, scope);
        break;
      }

      case 'ForStatement': {
        const loopScope = Object.create(scope);
        if (node.init) {
          if (node.init.type === 'VariableDeclaration') {
            executeStatement(node.init, loopScope);
          } else {
            evaluateExpression(node.init, loopScope);
          }
        }

        while (true) {
          checkStepLimit();
          if (node.test) {
            const testVal = evaluateExpression(node.test, loopScope);
            recordSnapshot(node.test, `For-loop test condition: ${formatVal(testVal)}`, loopScope);
            if (!Boolean(testVal)) break;
          }

          const ret = executeStatement(node.body, loopScope);
          if (ret && ret.isReturn) return ret;

          if (node.update) {
            evaluateExpression(node.update, loopScope);
            recordSnapshot(node.update, `Executed for-loop increment/update step`, loopScope);
          }
        }
        break;
      }

      case 'BlockStatement': {
        for (const stmt of node.body) {
          const ret = executeStatement(stmt, scope);
          if (ret && ret.isReturn) return ret;
        }
        break;
      }

      case 'FunctionDeclaration': {
        const funcName = node.id.name;
        scope[funcName] = function (...args) {
          const funcScope = Object.create(scope);
          node.params.forEach((param, idx) => {
            funcScope[param.name] = args[idx];
          });
          callStack.push(`${funcName}()`);
          recordSnapshot(node, `Entering function '${funcName}' with args: [${args.map(formatVal).join(', ')}]`, funcScope);

          const ret = executeStatement(node.body, funcScope);
          callStack.pop();
          const returnVal = (ret && ret.isReturn) ? ret.value : undefined;
          recordSnapshot(node, `Exiting '${funcName}', returning: ${formatVal(returnVal)}`, scope);
          return returnVal;
        };
        recordSnapshot(node, `Declared function '${funcName}'`, scope);
        break;
      }

      case 'ReturnStatement': {
        let returnVal = undefined;
        if (node.argument) {
          returnVal = evaluateExpression(node.argument, scope);
        }
        recordSnapshot(node, `Return statement encountered with value: ${formatVal(returnVal)}`, scope);
        return { isReturn: true, value: returnVal };
      }

      default:
        // Other statements
        break;
    }
  }

  function evaluateExpression(node, scope) {
    checkStepLimit();
    if (!node) return undefined;

    switch (node.type) {
      case 'Literal':
        return node.value;

      case 'Identifier':
        if (!(node.name in scope)) {
          throw new Error(`ReferenceError: '${node.name}' is not defined`);
        }
        return scope[node.name];

      case 'BinaryExpression': {
        const left = evaluateExpression(node.left, scope);
        const right = evaluateExpression(node.right, scope);
        let res;
        switch (node.operator) {
          case '+': res = left + right; break;
          case '-': res = left - right; break;
          case '*': res = left * right; break;
          case '/': res = left / right; break;
          case '%': res = left % right; break;
          case '==': res = left == right; break;
          case '===': res = left === right; break;
          case '!=': res = left != right; break;
          case '!==': res = left !== right; break;
          case '<': res = left < right; break;
          case '<=': res = left <= right; break;
          case '>': res = left > right; break;
          case '>=': res = left >= right; break;
          default: res = undefined;
        }
        return res;
      }

      case 'LogicalExpression': {
        const left = evaluateExpression(node.left, scope);
        if (node.operator === '&&') {
          return left ? evaluateExpression(node.right, scope) : left;
        } else if (node.operator === '||') {
          return left ? left : evaluateExpression(node.right, scope);
        }
        return left;
      }

      case 'UnaryExpression': {
        const arg = evaluateExpression(node.argument, scope);
        switch (node.operator) {
          case '!': return !arg;
          case '-': return -arg;
          case '+': return +arg;
          case 'typeof': return typeof arg;
          default: return arg;
        }
      }

      case 'UpdateExpression': {
        const varName = node.argument.name;
        if (!(varName in scope)) {
          throw new Error(`ReferenceError: '${varName}' is not defined`);
        }
        const oldVal = scope[varName];
        const newVal = node.operator === '++' ? oldVal + 1 : oldVal - 1;
        scope[varName] = newVal;
        return node.prefix ? newVal : oldVal;
      }

      case 'AssignmentExpression': {
        const rightVal = evaluateExpression(node.right, scope);
        if (node.left.type === 'Identifier') {
          const varName = node.left.name;
          let finalVal = rightVal;
          if (node.operator === '+=') finalVal = scope[varName] + rightVal;
          else if (node.operator === '-=') finalVal = scope[varName] - rightVal;
          else if (node.operator === '*=') finalVal = scope[varName] * rightVal;
          else if (node.operator === '/=') finalVal = scope[varName] / rightVal;

          scope[varName] = finalVal;
          recordSnapshot(node, `Assigned '${varName}' = ${formatVal(finalVal)}`, scope);
          return finalVal;
        } else if (node.left.type === 'MemberExpression') {
          const obj = evaluateExpression(node.left.object, scope);
          const prop = node.left.computed
            ? evaluateExpression(node.left.property, scope)
            : node.left.property.name;
          obj[prop] = rightVal;
          recordSnapshot(node, `Updated property [${prop}] to ${formatVal(rightVal)}`, scope);
          return rightVal;
        }
        return rightVal;
      }

      case 'CallExpression': {
        // Check for console.log
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'console' &&
          node.callee.property.name === 'log'
        ) {
          const evaluatedArgs = node.arguments.map(arg => evaluateExpression(arg, scope));
          const lineOutput = evaluatedArgs.map(formatVal).join(' ');
          output.push(lineOutput);
          recordSnapshot(node, `console.log output: "${lineOutput}"`, scope);
          return undefined;
        }

        // User-defined function call
        const fn = evaluateExpression(node.callee, scope);
        if (typeof fn !== 'function') {
          throw new Error(`TypeError: '${node.callee.name || 'expression'}' is not a function`);
        }
        const evaluatedArgs = node.arguments.map(arg => evaluateExpression(arg, scope));
        return fn(...evaluatedArgs);
      }

      case 'ArrayExpression': {
        return node.elements.map(el => evaluateExpression(el, scope));
      }

      case 'ObjectExpression': {
        const obj = {};
        for (const prop of node.properties) {
          const key = prop.key.name || prop.key.value;
          obj[key] = evaluateExpression(prop.value, scope);
        }
        return obj;
      }

      case 'MemberExpression': {
        const obj = evaluateExpression(node.object, scope);
        if (obj === undefined || obj === null) {
          throw new Error(`TypeError: Cannot read property of ${obj}`);
        }
        const prop = node.computed
          ? evaluateExpression(node.property, scope)
          : node.property.name;
        return obj[prop];
      }

      default:
        return undefined;
    }
  }

  function formatVal(v) {
    if (v === undefined) return 'undefined';
    if (v === null) return 'null';
    if (typeof v === 'string') return `"${v}"`;
    if (Array.isArray(v)) return `[${v.join(', ')}]`;
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }
}

function findUnsupportedSyntax(node) {
  if (!node || typeof node !== 'object') return null;

  if (UNSUPPORTED_NODE_TYPES.has(node.type)) {
    return node.type;
  }

  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'range') continue;
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        const found = findUnsupportedSyntax(item);
        if (found) return found;
      }
    } else if (typeof child === 'object' && child !== null) {
      const found = findUnsupportedSyntax(child);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Curated list of Prepared DOM Simulation Traces
 * Clearly labelled as pre-authored educational traces.
 */
export const PREPARED_DOM_TRACES = [
  {
    id: 'dom-trace-button-click',
    title: 'Button Click & Text Content Update',
    label: 'Prepared DOM Simulation Trace',
    code: `// Initial HTML: <button id="btn">Click me</button><p id="msg">Hello</p>
const btn = document.querySelector('#btn');
const msg = document.querySelector('#msg');

btn.addEventListener('click', () => {
  msg.textContent = 'Welcome to CodeFlow!';
  msg.style.color = '#14b8a6';
});`,
    steps: [
      { step: 1, action: 'Query Selector', target: '#btn', detail: 'Found HTMLButtonElement in DOM tree' },
      { step: 2, action: 'Query Selector', target: '#msg', detail: 'Found HTMLParagraphElement (textContent: "Hello")' },
      { step: 3, action: 'Event Registration', event: 'click', detail: 'Attached listener function to button' },
      { step: 4, action: 'Event Triggered', event: 'click', detail: 'User clicked button; callback entered call stack' },
      { step: 5, action: 'DOM Mutation', property: 'textContent', detail: 'Changed p#msg text from "Hello" to "Welcome to CodeFlow!"' },
      { step: 6, action: 'Style Mutation', property: 'style.color', detail: 'Applied CSS color #14b8a6; triggers browser repaint' }
    ]
  },
  {
    id: 'dom-trace-append-child',
    title: 'Dynamic List Item Creation (createElement & appendChild)',
    label: 'Prepared DOM Simulation Trace',
    code: `// Initial HTML: <ul id="list"><li>Item 1</li></ul>
const list = document.getElementById('list');
const newLi = document.createElement('li');
newLi.textContent = 'Item 2';
newLi.className = 'highlight';
list.appendChild(newLi);`,
    steps: [
      { step: 1, action: 'Get Element By ID', target: '#list', detail: 'Reference to HTMLUListElement (children count: 1)' },
      { step: 2, action: 'Create Element', target: 'li', detail: 'Allocated detached HTMLLIElement node in memory' },
      { step: 3, action: 'Set Text Content', target: 'newLi', detail: 'Assigned text: "Item 2"' },
      { step: 4, action: 'Set Class Name', target: 'newLi', detail: 'Added class "highlight"' },
      { step: 5, action: 'Append Child', target: '#list', detail: 'Inserted newLi as last child of #list; triggers DOM reflow' }
    ]
  }
];

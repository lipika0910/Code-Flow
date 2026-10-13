import React, { useState } from 'react';
import CodeMirrorEditor from '../components/editor/CodeMirrorEditor';
import OutputConsole from '../components/editor/OutputConsole';
import { runJavaScriptInWorker } from '../services/workerRunner';
import { storage } from '../services/storage';

const DEBUG_CHALLENGES = [
  {
    id: 'dbg-syntax-1',
    title: 'Unclosed String & Missing Parenthesis',
    category: 'syntax',
    difficulty: 'beginner',
    description: 'A student wrote a utility to format a greeting message, but the code fails with a SyntaxError when parsed.',
    buggyCode: `function formatGreeting(name) {
  const prefix = "Hello, ;
  console.log(prefix + name;
  return prefix + name;
}

formatGreeting("Alice");`,
    hints: [
      'Check the string literal delimiter on line 2.',
      'Check line 3: does the console.log call have a matching closing parenthesis?',
      'Fix: Close the quote with "Hello, "; and close the parenthesis: console.log(prefix + name);'
    ],
    validate: (logs, result) => {
      const allText = logs.map(l => l.text).join(' ');
      return allText.includes('Hello, Alice');
    },
    expectedBehavior: 'Logs "Hello, Alice" to the console without syntax errors.'
  },
  {
    id: 'dbg-syntax-2',
    title: 'Invalid Object Literal Syntax',
    category: 'syntax',
    difficulty: 'beginner',
    description: 'Creating a student profile object fails due to semicolon separators instead of commas.',
    buggyCode: `function createStudent(name, score) {
  const student = {
    name: name;
    score: score;
    passed: score >= 60;
  };
  console.log("Student:", student.name, "Passed:", student.passed);
  return student;
}

createStudent("Elena", 85);`,
    hints: [
      'Look closely at how properties are separated inside object literals { ... }.',
      'In JavaScript object literals, properties are separated by commas (,), not semicolons (;).',
      'Replace the semicolons after name, score, and passed with commas.'
    ],
    validate: (logs) => {
      const allText = logs.map(l => l.text).join(' ');
      return allText.includes('Student: Elena Passed: true');
    },
    expectedBehavior: 'Logs "Student: Elena Passed: true" with a valid object literal.'
  },
  {
    id: 'dbg-syntax-3',
    title: 'Unexpected Token in Arrow Function',
    category: 'syntax',
    difficulty: 'intermediate',
    description: 'An arrow function returning an object shorthand fails to parse because braces are interpreted as a block.',
    buggyCode: `const getStats = (scores) => {
  total: scores.length,
  average: scores.reduce((a, b) => a + b, 0) / scores.length
};

const res = getStats([10, 20, 30]);
console.log("Average:", res.average);`,
    hints: [
      'When an arrow function directly returns an object literal without an explicit return statement, what syntax is required around the braces?',
      'JavaScript treats curly braces as a function body block unless wrapped in parentheses ({ ... }).',
      'Wrap the returned object in parentheses: ({ total: ..., average: ... }) or use an explicit { return { ... }; } block.'
    ],
    validate: (logs) => {
      const allText = logs.map(l => l.text).join(' ');
      return allText.includes('Average: 20');
    },
    expectedBehavior: 'Logs "Average: 20" by correctly returning the object from the arrow function.'
  },
  {
    id: 'dbg-runtime-1',
    title: 'Cannot Read Property of Undefined',
    category: 'runtime',
    difficulty: 'beginner',
    description: 'This function attempts to print the length of each user’s tags, but crashes when a user lacks a tags array.',
    buggyCode: `function printTagCounts(users) {
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    // Bug: Crashes with TypeError when user.tags is undefined
    console.log(user.name + " has " + user.tags.length + " tags");
  }
}

const users = [
  { name: "Sam", tags: ["html", "css"] },
  { name: "Jordan" }, // missing tags!
  { name: "Taylor", tags: ["js"] }
];

printTagCounts(users);`,
    hints: [
      'Check what user.tags evaluates to for Jordan on the second iteration.',
      'Accessing .length on undefined causes a runtime TypeError.',
      'Use optional chaining (user.tags?.length || 0) or check (user.tags ? user.tags.length : 0).'
    ],
    validate: (logs) => {
      const allText = logs.map(l => l.text).join(' ');
      return allText.includes('Sam has 2 tags') && (allText.includes('Jordan has 0 tags') || allText.includes('Jordan has undefined tags') || allText.includes('Jordan has 0'));
    },
    expectedBehavior: 'Safely logs tag counts for all three users without throwing a TypeError.'
  },
  {
    id: 'dbg-runtime-2',
    title: 'ReferenceError: Variable Not in Scope',
    category: 'runtime',
    difficulty: 'beginner',
    description: 'A discount calculation function attempts to return a variable declared with let inside an if block.',
    buggyCode: `function calculateTotal(price, isVip) {
  if (isVip) {
    let discount = price * 0.2;
    let finalPrice = price - discount;
  } else {
    let finalPrice = price;
  }
  // Bug: finalPrice is block-scoped and cannot be reached here!
  console.log("Final price:", finalPrice);
  return finalPrice;
}

calculateTotal(100, true);`,
    hints: [
      'Where is finalPrice declared? Does let create function scope or block scope?',
      'Variables declared with let inside an { ... } block only exist within that block.',
      'Declare let finalPrice; outside the if/else block before assigning to it.'
    ],
    validate: (logs) => {
      const allText = logs.map(l => l.text).join(' ');
      return allText.includes('Final price: 80');
    },
    expectedBehavior: 'Logs "Final price: 80" without a ReferenceError.'
  },
  {
    id: 'dbg-runtime-3',
    title: 'Unbounded Recursion Stack Overflow',
    category: 'runtime',
    difficulty: 'intermediate',
    description: 'A recursive countdown function fails with RangeError: Maximum call stack size exceeded due to a missing base case.',
    buggyCode: `function countdown(n) {
  console.log(n);
  // Bug: Missing base case stop condition when n <= 0!
  return countdown(n - 1);
}

countdown(3);`,
    hints: [
      'When should a countdown stop executing?',
      'Check if there is an if (n <= 0) base case before calling countdown again.',
      'Add: if (n <= 0) { console.log("Done!"); return; } at the top of the function.'
    ],
    validate: (logs) => {
      const allText = logs.map(l => l.text).join(' ');
      return allText.includes('3') && allText.includes('2') && allText.includes('1');
    },
    expectedBehavior: 'Recursively counts down to 0 and halts safely without exceeding stack size.'
  },
  {
    id: 'dbg-logic-1',
    title: 'Off-by-One Loop Index Boundary',
    category: 'logic',
    difficulty: 'beginner',
    description: 'A loop that sums numbers in an array attempts to access an out-of-bounds index, producing NaN.',
    buggyCode: `function sumArray(numbers) {
  let total = 0;
  // Bug: i <= numbers.length causes numbers[numbers.length] which is undefined!
  for (let i = 0; i <= numbers.length; i++) {
    total += numbers[i];
  }
  console.log("Total:", total);
  return total;
}

sumArray([10, 20, 30, 40]);`,
    hints: [
      'What is the last valid index of an array of length 4?',
      'The indices are 0, 1, 2, 3. When i === 4, numbers[4] is undefined, and 60 + undefined = NaN.',
      'Change the loop condition from i <= numbers.length to i < numbers.length.'
    ],
    validate: (logs) => {
      const allText = logs.map(l => l.text).join(' ');
      return allText.includes('Total: 100') && !allText.includes('NaN');
    },
    expectedBehavior: 'Logs "Total: 100" without adding undefined to the accumulator.'
  },
  {
    id: 'dbg-logic-2',
    title: 'Type Coercion Equality Trap',
    category: 'logic',
    difficulty: 'beginner',
    description: 'A form submission validator accepts invalid empty strings or zeroes because of loose equality.',
    buggyCode: `function validateScoreInput(input) {
  // Bug: "0" == false is true, and "" == false is true in loose equality!
  if (input == false) {
    console.log("Invalid submission: empty or false");
    return false;
  }
  console.log("Valid score:", input);
  return true;
}

// Student legitimately entered score of 0, but it gets rejected!
validateScoreInput(0);`,
    hints: [
      'In JavaScript, loose equality (==) coerces 0 to false.',
      'To verify if an input is strictly boolean false vs numeric 0, strict equality (===) or specific type checking is needed.',
      'Change the condition to check input === false || input === "" or check typeof input === "number".'
    ],
    validate: (logs) => {
      const allText = logs.map(l => l.text).join(' ');
      return allText.includes('Valid score: 0');
    },
    expectedBehavior: 'Correctly accepts numeric 0 as a valid score, logging "Valid score: 0".'
  },
  {
    id: 'dbg-logic-3',
    title: 'Array Mutation During Iteration',
    category: 'logic',
    difficulty: 'intermediate',
    description: 'A function removing odd numbers mutates the array in-place, skipping adjacent items due to index shift.',
    buggyCode: `function removeOdds(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] % 2 !== 0) {
      // Bug: Splice changes indices, so the next element moves to i and is skipped!
      arr.splice(i, 1);
    }
  }
  console.log("Evens:", arr);
  return arr;
}

// Notice [1, 3, 4] has consecutive odds; 3 will be skipped!
removeOdds([1, 3, 4, 6, 7, 9, 10]);`,
    hints: [
      'What happens to the array indices when arr.splice(i, 1) removes an element at index i?',
      'When an element is removed, the remaining items shift left. When i increments next, the item that moved into index i is never evaluated.',
      'Either iterate backwards (for (let i = arr.length - 1; i >= 0; i--)), decrement i (i--), or return arr.filter(n => n % 2 === 0).'
    ],
    validate: (logs) => {
      const allText = logs.map(l => l.text).join(' ');
      return allText.includes('4, 6, 10') || allText.includes('[4, 6, 10]') || (allText.includes('4') && allText.includes('6') && allText.includes('10') && !allText.includes('3') && !allText.includes('7') && !allText.includes('9'));
    },
    expectedBehavior: 'Correctly filters out all odd numbers, leaving [4, 6, 10].'
  },
  {
    id: 'dbg-logic-4',
    title: 'Asynchronous State Timing Race',
    category: 'logic',
    difficulty: 'intermediate',
    description: 'A mock fetch function logs data before the simulated async timer finishes.',
    buggyCode: `function fetchUserData(userId) {
  let user = null;

  // Simulate network request
  setTimeout(() => {
    user = { id: userId, name: "Maria Garcia", role: "Student" };
    console.log("Network response received for:", user.name);
  }, 50);

  // Bug: console.log executes synchronously BEFORE the setTimeout callback!
  console.log("Current user:", user);
  return user;
}

fetchUserData(42);`,
    hints: [
      'JavaScript setTimeout runs asynchronously. When does the code immediately after setTimeout execute?',
      'The console.log("Current user:", user) runs before the timer fires, so user is still null.',
      'Move the console.log into the callback or wrap in a Promise with async/await.'
    ],
    validate: (logs) => {
      const allText = logs.map(l => l.text).join(' ');
      return allText.includes('Maria Garcia');
    },
    expectedBehavior: 'Accurately accesses the user object after the asynchronous operation resolves.'
  }
];

export default function DebuggingLabPage() {
  const [selectedChallenge, setSelectedChallenge] = useState(DEBUG_CHALLENGES[0]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [code, setCode] = useState(DEBUG_CHALLENGES[0].buggyCode);
  const [revealedHints, setRevealedHints] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showDiff, setShowDiff] = useState(false);
  const [solvedChallenges, setSolvedChallenges] = useState({});

  const filteredChallenges = activeCategory === 'all'
    ? DEBUG_CHALLENGES
    : DEBUG_CHALLENGES.filter(c => c.category === activeCategory);

  const handleSelectChallenge = (ch) => {
    setSelectedChallenge(ch);
    setCode(ch.buggyCode);
    setRevealedHints(0);
    setLogs([]);
    setTestResult(null);
    setShowDiff(false);
  };

  const handleRevealNextHint = () => {
    if (revealedHints < selectedChallenge.hints.length) {
      setRevealedHints(prev => prev + 1);
    }
  };

  const handleResetCode = () => {
    setCode(selectedChallenge.buggyCode);
    setTestResult(null);
    setLogs([]);
  };

  const handleRunAndTest = async () => {
    setIsRunning(true);
    setLogs([]);
    setTestResult(null);

    try {
      const output = await runJavaScriptInWorker(code, 3000);
      setLogs(output.logs || []);

      if (output.error) {
        setTestResult({
          passed: false,
          message: `Runtime Error: ${output.error.message}`,
          details: 'Your code threw an unhandled error during execution. Review the error details below.'
        });
      } else {
        const isPassed = selectedChallenge.validate(output.logs, output.result);
        if (isPassed) {
          // Calculate XP: 25 base minus 5 per hint used (minimum 10)
          const xpEarned = Math.max(10, 25 - revealedHints * 5);
          if (!solvedChallenges[selectedChallenge.id]) {
            setSolvedChallenges(prev => ({ ...prev, [selectedChallenge.id]: true }));
            storage.addXP(xpEarned);
            storage.recordActivity('debugging_challenge_solved');
          }

          setTestResult({
            passed: true,
            xpEarned,
            message: 'Bug successfully diagnosed and resolved!',
            details: selectedChallenge.expectedBehavior
          });
        } else {
          setTestResult({
            passed: false,
            message: 'The bug is not fully resolved yet.',
            details: `Expected: ${selectedChallenge.expectedBehavior}`
          });
        }
      }
    } catch (err) {
      setTestResult({
        passed: false,
        message: `Execution failed: ${err.message}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-lg-4">
      {/* Header */}
      <div className="row mb-3 align-items-center">
        <div className="col-12 col-md-8">
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge rounded-pill" style={{ background: 'var(--accent-amber)', color: '#000', fontWeight: 'bold' }}>
              <i className="bi bi-bug me-1"></i> Interactive Debugging Lab
            </span>
            <span className="badge bg-secondary">Diagnose & Fix</span>
          </div>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Debugging Lab
          </h1>
          <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
            Practice real-world error diagnosis across syntax, runtime, and subtle logic bugs. Use staged hints only when necessary to earn maximum XP.
          </p>
        </div>
        <div className="col-12 col-md-4 text-md-end mt-2 mt-md-0">
          <div className="d-inline-flex align-items-center gap-3 p-2 rounded" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Solved</div>
              <div className="fw-bold" style={{ color: 'var(--accent-teal)' }}>
                {Object.keys(solvedChallenges).length} / {DEBUG_CHALLENGES.length}
              </div>
            </div>
            <div className="vr" style={{ borderColor: 'var(--border-subtle)' }}></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hints Remaining</div>
              <div className="fw-bold" style={{ color: 'var(--accent-amber)' }}>
                {selectedChallenge.hints.length - revealedHints}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {[
          { key: 'all', label: 'All Bugs', icon: 'bi-grid' },
          { key: 'syntax', label: 'Syntax Errors', icon: 'bi-file-earmark-code' },
          { key: 'runtime', label: 'Runtime Exceptions', icon: 'bi-exclamation-octagon' },
          { key: 'logic', label: 'Logic & Subtle Bugs', icon: 'bi-puzzle' }
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`btn btn-sm d-flex align-items-center gap-1 ${
              activeCategory === cat.key ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            style={{
              background: activeCategory === cat.key ? 'var(--accent-violet)' : 'transparent',
              borderColor: activeCategory === cat.key ? 'var(--accent-violet)' : 'var(--border-subtle)',
              color: activeCategory === cat.key ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <i className={`bi ${cat.icon}`}></i>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="row g-3">
        {/* Sidebar: Challenge List */}
        <div className="col-12 col-lg-3">
          <div className="cf-card p-3 h-100">
            <h2 className="h6 fw-bold mb-3 d-flex align-items-center justify-content-between" style={{ color: 'var(--text-primary)' }}>
              <span>Bug Catalog ({filteredChallenges.length})</span>
              <span className="badge bg-dark border" style={{ borderColor: 'var(--border-subtle)' }}>
                {activeCategory}
              </span>
            </h2>
            <div className="list-group list-group-flush gap-1">
              {filteredChallenges.map(ch => {
                const isSelected = ch.id === selectedChallenge.id;
                const isSolved = Boolean(solvedChallenges[ch.id]);

                return (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChallenge(ch)}
                    className={`list-group-item list-group-item-action rounded p-2 text-start border-0 ${
                      isSelected ? 'active-challenge' : ''
                    }`}
                    style={{
                      background: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--accent-violet)' : '3px solid transparent',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-semibold text-truncate" style={{ fontSize: '0.85rem' }}>
                        {ch.title}
                      </span>
                      {isSolved && (
                        <i className="bi bi-check-circle-fill text-success" title="Solved"></i>
                      )}
                    </div>
                    <div className="d-flex gap-1 align-items-center">
                      <span
                        className="badge text-uppercase"
                        style={{
                          fontSize: '0.65rem',
                          background: ch.category === 'syntax' ? '#dc354522' : ch.category === 'runtime' ? '#fd7e1422' : '#0dcaf022',
                          color: ch.category === 'syntax' ? '#dc3545' : ch.category === 'runtime' ? '#fd7e14' : '#0dcaf0'
                        }}
                      >
                        {ch.category}
                      </span>
                      <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>
                        {ch.difficulty}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Editor and Bug Description */}
        <div className="col-12 col-lg-6">
          <div className="cf-card p-3 mb-3">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
              <h2 className="h5 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
                {selectedChallenge.title}
              </h2>
              <div className="d-flex align-items-center gap-2">
                <button
                  onClick={() => setShowDiff(!showDiff)}
                  className="btn btn-sm btn-outline-secondary"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  <i className="bi bi-arrows-collapse me-1"></i>
                  {showDiff ? 'Hide Original Code' : 'Compare Original Code'}
                </button>
                <button
                  onClick={handleResetCode}
                  className="btn btn-sm btn-outline-secondary"
                  title="Reset to buggy state"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
                </button>
              </div>
            </div>

            <p className="mb-3" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {selectedChallenge.description}
            </p>

            {/* Original code comparison accordion/box */}
            {showDiff && (
              <div className="p-3 mb-3 rounded" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-semibold" style={{ fontSize: '0.8rem', color: 'var(--accent-amber)' }}>
                    Original Buggy Code
                  </span>
                  <span className="badge bg-danger">Faulty</span>
                </div>
                <pre className="mb-0" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflowX: 'auto' }}>
                  {selectedChallenge.buggyCode}
                </pre>
              </div>
            )}

            {/* CodeMirror Editor */}
            <div style={{ height: '320px', border: '1px solid var(--border-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
              <CodeMirrorEditor
                value={code}
                onChange={setCode}
                language="javascript"
                fontSize={14}
              />
            </div>


            {/* Action Bar */}
            <div className="d-flex align-items-center justify-content-between mt-3">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Runs client-side in an isolated Web Worker (3s timeout limit).
              </div>
              <button
                onClick={handleRunAndTest}
                disabled={isRunning}
                className="cf-btn-primary d-flex align-items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Testing Fix...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-play-fill fs-5"></i>
                    <span>Run & Verify Fix</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Test Result Feedback Box */}
          {testResult && (
            <div
              className={`cf-card p-3 mb-3 border-start border-4 ${
                testResult.passed ? 'border-success' : 'border-danger'
              }`}
              style={{ background: 'var(--bg-surface-elevated)' }}
            >
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className={`fw-bold d-flex align-items-center gap-1 ${testResult.passed ? 'text-success' : 'text-danger'}`}>
                  <i className={`bi bi-${testResult.passed ? 'check-circle-fill' : 'x-circle-fill'}`}></i>
                  {testResult.message}
                </span>
                {testResult.passed && testResult.xpEarned && (
                  <span className="cf-badge cf-badge-xp">
                    +{testResult.xpEarned} XP Awarded
                  </span>
                )}
              </div>
              <p className="mb-0" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {testResult.details}
              </p>
            </div>
          )}

          {/* Console Output */}
          <OutputConsole logs={logs} onClear={() => setLogs([])} />
        </div>

        {/* Right Sidebar: Staged Hints & Expected Behavior */}
        <div className="col-12 col-lg-3">
          {/* Expected Outcome */}
          <div className="cf-card p-3 mb-3">
            <h3 className="h6 fw-bold mb-2 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <i className="bi bi-bullseye" style={{ color: 'var(--accent-teal)' }}></i>
              <span>Target Behavior</span>
            </h3>
            <p className="mb-0" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {selectedChallenge.expectedBehavior}
            </p>
          </div>

          {/* Staged Hints */}
          <div className="cf-card p-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h3 className="h6 fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <i className="bi bi-lightbulb" style={{ color: 'var(--accent-amber)' }}></i>
                <span>Staged Hints</span>
              </h3>
              <span className="badge bg-secondary" style={{ fontSize: '0.75rem' }}>
                {revealedHints} / {selectedChallenge.hints.length}
              </span>
            </div>
            <p className="mb-3" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Revealing hints reduces XP rewards from 25 XP down to 10 XP. Try diagnosing the issue on your own first!
            </p>

            <div className="d-flex flex-column gap-2 mb-3">
              {selectedChallenge.hints.map((hintText, idx) => {
                const isRevealed = idx < revealedHints;
                return (
                  <div
                    key={idx}
                    className="p-2 rounded"
                    style={{
                      background: isRevealed ? 'var(--bg-surface-elevated)' : 'var(--bg-app)',
                      border: isRevealed ? '1px solid var(--accent-amber)' : '1px dashed var(--border-subtle)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-semibold" style={{ color: isRevealed ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                        Hint {idx + 1}
                      </span>
                      {!isRevealed && (
                        <i className="bi bi-lock text-muted" style={{ fontSize: '0.8rem' }}></i>
                      )}
                    </div>
                    {isRevealed ? (
                      <span style={{ color: 'var(--text-primary)' }}>{hintText}</span>
                    ) : (
                      <span className="text-muted" style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>
                        Locked (click below to reveal)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {revealedHints < selectedChallenge.hints.length && (
              <button
                onClick={handleRevealNextHint}
                className="btn btn-sm btn-outline-warning w-100 d-flex align-items-center justify-content-center gap-1"
                style={{ borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }}
              >
                <i className="bi bi-unlock"></i>
                <span>Reveal Hint {revealedHints + 1} (-5 XP)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

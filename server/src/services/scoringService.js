// CodeFlow Server-Side Assessment Scoring Service

/**
 * Normalizes values for deep comparison (handles strings, numbers, objects, arrays, booleans)
 */
export function normalizeValue(val) {
  if (val === undefined || val === null) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    // Try parsing as JSON if it looks like an array or object or number
    try {
      return JSON.stringify(JSON.parse(trimmed));
    } catch {
      return trimmed;
    }
  }
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val).trim();
}

/**
 * 2 Fully Seeded Server Assessments with Hidden Tests and Answer Keys
 * These expected outputs and answer keys live STRICTLY on the server.
 */
export const ASSESSMENTS_DATABASE = [
  {
    id: 'assessment-web-core',
    title: 'Web Foundations & JavaScript Core Exam',
    topic: 'Web Programming',
    difficulty: 'Intermediate',
    timeLimitSeconds: 1800, // 30 minutes
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        points: 10,
        title: 'HTML Semantic Meaning',
        prompt: 'Which HTML element should wrap content that is only tangentially related to the main content (e.g. sidebars, callout boxes)?',
        options: ['<aside>', '<section>', '<article>', '<nav>'],
        serverAnswer: '<aside>',
        explanation: '<aside> represents a portion of a document whose content is only indirectly related to the document\'s main content.'
      },
      {
        id: 'q2',
        type: 'mcq',
        points: 10,
        title: 'CSS Box-Sizing Behavior',
        prompt: 'With box-sizing: border-box, what happens when you add 20px padding to an element with width: 300px?',
        options: [
          'The total element width remains 300px, and content area shrinks to 260px',
          'The total width becomes 340px',
          'Padding is ignored',
          'An overflow error is thrown'
        ],
        serverAnswer: 'The total element width remains 300px, and content area shrinks to 260px',
        explanation: 'In border-box sizing, padding and border are contained within the declared width, reducing the inner content area.'
      },
      {
        id: 'q3',
        type: 'predict',
        points: 10,
        title: 'Predict Variable Scoping',
        prompt: 'What will be output by this code snippet?',
        code: `let x = 10;\nfunction check() {\n  let x = 20;\n  return x;\n}\nconsole.log(check() + x);`,
        options: ['30', '20', '40', 'NaN'],
        serverAnswer: '30',
        explanation: 'Inside check(), local x shadows outer x and returns 20. In console.log, outer x is 10. 20 + 10 = 30.'
      },
      {
        id: 'q4',
        type: 'fill_blank',
        points: 10,
        title: 'Strict Equality Keyword',
        prompt: 'What operator checks both value AND data type equality without coercion?',
        serverAnswer: '===',
        explanation: '=== is the strict equality operator in JavaScript.'
      },
      {
        id: 'q5',
        type: 'coding',
        points: 30,
        title: 'Coding Task: Sum Evens Function',
        prompt: 'Write a JavaScript function named sumEvens(arr) that accepts an array of numbers and returns the sum of all even numbers. If no even numbers exist, return 0.',
        starterCode: `function sumEvens(arr) {\n  // Return the sum of all even numbers in arr\n}`,
        visibleTests: [
          { id: 'v1', input: '[1, 2, 3, 4, 5, 6]', expectedOutput: '12' },
          { id: 'v2', input: '[1, 3, 5]', expectedOutput: '0' }
        ],
        // Hidden tests live ONLY on the server
        hiddenTests: [
          { id: 'h1', input: '[2, 4, 6, 8, 10]', expectedOutput: '30' },
          { id: 'h2', input: '[]', expectedOutput: '0' },
          { id: 'h3', input: '[-2, 4, -6, 8]', expectedOutput: '4' }
        ],
        explanation: 'Filter array items with n % 2 === 0 and sum with reduce, or loop with a conditional check.'
      },
      {
        id: 'q6',
        type: 'coding',
        points: 30,
        title: 'Coding Task: Title Case Transformer',
        prompt: 'Write a function capitalizeWords(str) that accepts a space-separated string and capitalizes the first letter of every word (e.g. "hello world" -> "Hello World").',
        starterCode: `function capitalizeWords(str) {\n  // Return string with each word capitalized\n}`,
        visibleTests: [
          { id: 'v1', input: '"hello world"', expectedOutput: '"Hello World"' }
        ],
        hiddenTests: [
          { id: 'h1', input: '"web programming in codeflow"', expectedOutput: '"Web Programming In Codeflow"' },
          { id: 'h2', input: '"javascript"', expectedOutput: '"Javascript"' }
        ],
        explanation: 'Split str by space, map each word with word[0].toUpperCase() + word.slice(1), and join with spaces.'
      }
    ]
  },
  {
    id: 'assessment-dom-async',
    title: 'DOM, Events & Async Practical Assessment',
    topic: 'DOM & Async',
    difficulty: 'Advanced',
    timeLimitSeconds: 2400, // 40 minutes
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        points: 20,
        title: 'Event Bubbling Phase',
        prompt: 'Which method stops an event from bubbling further up the DOM tree?',
        options: [
          'event.stopPropagation()',
          'event.preventDefault()',
          'event.cancelBubble = false',
          'document.stopEvent()'
        ],
        serverAnswer: 'event.stopPropagation()',
        explanation: 'stopPropagation() halts further propagation of the current event in the capturing and bubbling phases.'
      },
      {
        id: 'q2',
        type: 'coding',
        points: 40,
        title: 'Coding Task: Flatten Nested Array',
        prompt: 'Write a function flattenArray(arr) that flattens an array with nested arrays one level deep without using Array.prototype.flat().',
        starterCode: `function flattenArray(arr) {\n  // Flatten arr one level deep\n}`,
        visibleTests: [
          { id: 'v1', input: '[[1, 2], [3, 4]]', expectedOutput: '[1,2,3,4]' }
        ],
        hiddenTests: [
          { id: 'h1', input: '[1, [2, 3], 4, [5]]', expectedOutput: '[1,2,3,4,5]' },
          { id: 'h2', input: '[]', expectedOutput: '[]' }
        ],
        explanation: 'Iterate through arr and concatenate elements, checking Array.isArray(el).'
      },
      {
        id: 'q3',
        type: 'coding',
        points: 40,
        title: 'Coding Task: Count Word Frequencies',
        prompt: 'Write a function countWords(words) that takes an array of word strings and returns an object mapping each unique word to its frequency count.',
        starterCode: `function countWords(words) {\n  // Return object with word frequencies\n}`,
        visibleTests: [
          { id: 'v1', input: '["apple", "banana", "apple"]', expectedOutput: '{"apple":2,"banana":1}' }
        ],
        hiddenTests: [
          { id: 'h1', input: '["a", "b", "c", "b", "a", "a"]', expectedOutput: '{"a":3,"b":2,"c":1}' },
          { id: 'h2', input: '[]', expectedOutput: '{}' }
        ],
        explanation: 'Reduce array into an object accumulator incrementing count for each word.'
      }
    ]
  }
];

export const scoringService = {
  /**
   * Retrieves public assessment metadata for student view (NO answers or hidden tests!)
   */
  getPublicAssessments() {
    return ASSESSMENTS_DATABASE.map(a => ({
      id: a.id,
      title: a.title,
      topic: a.topic,
      difficulty: a.difficulty,
      timeLimitSeconds: a.timeLimitSeconds,
      passingScore: a.passingScore,
      questionCount: a.questions.length,
      totalPoints: a.questions.reduce((sum, q) => sum + q.points, 0)
    }));
  },

  /**
   * Retrieves an assessment for taking (includes visible tests, EXCLUDES server answers and hidden tests)
   */
  getAssessmentForTaking(assessmentId) {
    const assessment = ASSESSMENTS_DATABASE.find(a => a.id === assessmentId);
    if (!assessment) return null;

    return {
      id: assessment.id,
      title: assessment.title,
      topic: assessment.topic,
      difficulty: assessment.difficulty,
      timeLimitSeconds: assessment.timeLimitSeconds,
      passingScore: assessment.passingScore,
      questions: assessment.questions.map(q => ({
        id: q.id,
        type: q.type,
        points: q.points,
        title: q.title,
        prompt: q.prompt,
        code: q.code,
        options: q.options,
        starterCode: q.starterCode,
        visibleTests: q.visibleTests || []
        // Note: serverAnswer and hiddenTests are strictly omitted!
      }))
    };
  },

  /**
   * Returns hidden test inputs only for a coding question (NO expected outputs!)
   */
  getHiddenTestInputs(assessmentId) {
    const assessment = ASSESSMENTS_DATABASE.find(a => a.id === assessmentId);
    if (!assessment) return null;

    const hiddenInputs = {};
    for (const q of assessment.questions) {
      if (q.type === 'coding' && q.hiddenTests) {
        hiddenInputs[q.id] = q.hiddenTests.map(t => ({
          id: t.id,
          input: t.input
        }));
      }
    }
    return hiddenInputs;
  },

  /**
   * Evaluates student submission completely on server with partial credit calculation
   */
  gradeSubmission(assessmentId, answers = {}, reportedHiddenOutputs = {}) {
    const assessment = ASSESSMENTS_DATABASE.find(a => a.id === assessmentId);
    if (!assessment) {
      throw new Error(`Assessment '${assessmentId}' not found`);
    }

    let earnedPoints = 0;
    const totalPoints = assessment.questions.reduce((sum, q) => sum + q.points, 0);
    const questionsFeedback = [];

    for (const q of assessment.questions) {
      const studentAns = answers[q.id];
      let questionEarned = 0;
      let isCorrect = false;
      const testResults = [];

      if (q.type === 'coding') {
        const totalTests = (q.visibleTests?.length || 0) + (q.hiddenTests?.length || 0);
        let passedTestsCount = 0;

        // Check reported hidden outputs against server expected outputs
        const questionHiddenReports = reportedHiddenOutputs[q.id] || {};

        if (q.hiddenTests) {
          for (const hiddenTest of q.hiddenTests) {
            const reportedOutput = questionHiddenReports[hiddenTest.id];
            const normActual = normalizeValue(reportedOutput);
            const normExpected = normalizeValue(hiddenTest.expectedOutput);
            const passed = normActual === normExpected;
            if (passed) passedTestsCount++;

            testResults.push({
              testId: hiddenTest.id,
              type: 'hidden',
              passed
            });
          }
        }

        // Visible tests check (if student included visible results)
        if (q.visibleTests) {
          for (const visTest of q.visibleTests) {
            const reportedVis = questionHiddenReports[visTest.id];
            const normActual = normalizeValue(reportedVis);
            const normExpected = normalizeValue(visTest.expectedOutput);
            const passed = normActual === normExpected;
            if (passed) passedTestsCount++;

            testResults.push({
              testId: visTest.id,
              type: 'visible',
              passed
            });
          }
        }

        // Partial credit: proportional to passed tests
        if (totalTests > 0) {
          questionEarned = Math.round((passedTestsCount / totalTests) * q.points);
          isCorrect = passedTestsCount === totalTests;
        }
      } else {
        // Standard question types (MCQ, predict, fill_blank)
        const normStudent = normalizeValue(studentAns);
        const normExpected = normalizeValue(q.serverAnswer);
        isCorrect = normStudent.toLowerCase() === normExpected.toLowerCase();
        if (isCorrect) {
          questionEarned = q.points;
        }
      }

      earnedPoints += questionEarned;

      questionsFeedback.push({
        questionId: q.id,
        title: q.title,
        type: q.type,
        pointsPossible: q.points,
        pointsEarned: questionEarned,
        isCorrect,
        correctAnswer: q.serverAnswer || 'See test outcomes',
        explanation: q.explanation,
        testResults: testResults.length > 0 ? testResults : undefined
      });
    }

    const percentage = Math.round((earnedPoints / totalPoints) * 100);
    const passed = percentage >= assessment.passingScore;

    return {
      assessmentId,
      title: assessment.title,
      totalPoints,
      earnedPoints,
      percentage,
      passingScore: assessment.passingScore,
      passed,
      questionsFeedback
    };
  }
};

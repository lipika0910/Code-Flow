import bcrypt from 'bcryptjs';

export async function seed(knex) {
  // Clear existing records
  await knex('xp_events').del();
  await knex('snippets').del();
  await knex('project_versions').del();
  await knex('projects').del();
  await knex('quiz_attempts').del();
  await knex('lesson_progress').del();
  await knex('assessment_attempts').del();
  await knex('test_cases').del();
  await knex('assessment_questions').del();
  await knex('assessments').del();
  await knex('practice_questions').del();
  await knex('lessons').del();
  await knex('topics').del();
  await knex('users').del();

  // 1. Seed Users (Admin & Sample Student)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@codeflow.edu';
  const adminPass = process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!';
  const adminHash = await bcrypt.hash(adminPass, 10);
  const studentHash = await bcrypt.hash('Student123!', 10);

  await knex('users').insert([
    {
      id: 'usr_admin',
      username: 'admin',
      email: adminEmail,
      password_hash: adminHash,
      role: 'admin',
      xp: 500,
      level: 4,
      display_name: 'CodeFlow Admin'
    },
    {
      id: 'usr_student',
      username: 'student',
      email: 'student@codeflow.edu',
      password_hash: studentHash,
      role: 'student',
      xp: 150,
      level: 2,
      display_name: 'Alex Student'
    }
  ]);

  // 2. Seed Topics
  const topicsData = [
    { id: 'top_html', slug: 'html', title: 'HTML5 Fundamentals', description: 'Document structure, semantic elements, forms, and accessibility.', category: 'interactive', order_index: 1, icon: 'bi-filetype-html' },
    { id: 'top_css', slug: 'css', title: 'CSS3 & Modern Layouts', description: 'The box model, Flexbox, Grid, selectors, and responsive styling.', category: 'interactive', order_index: 2, icon: 'bi-filetype-css' },
    { id: 'top_js', slug: 'javascript', title: 'JavaScript Core', description: 'Variables, types, control flow, functions, scope, and closures.', category: 'interactive', order_index: 3, icon: 'bi-filetype-js' },
    { id: 'top_dom', slug: 'dom-events', title: 'DOM and Events', description: 'Document queries, node manipulation, event listeners, and bubbling.', category: 'interactive', order_index: 4, icon: 'bi-cursor-fill' },
    { id: 'top_async', slug: 'async-apis', title: 'Error Handling & Async APIs', description: 'Exceptions, Promises, async/await, fetch API, and web storage.', category: 'interactive', order_index: 5, icon: 'bi-clock-history' },
    { id: 'top_canvas', slug: 'canvas', title: 'HTML5 Canvas', description: '2D context rendering, shapes, animations, and particle physics.', category: 'interactive', order_index: 6, icon: 'bi-palette' },
    { id: 'top_bootstrap', slug: 'bootstrap', title: 'Bootstrap Framework', description: 'Responsive grid, utility classes, and component library.', category: 'readonly', order_index: 7, icon: 'bi-bootstrap' },
    { id: 'top_react', slug: 'react', title: 'React Essentials', description: 'Component architecture, JSX, props, state, and unidirectional data flow.', category: 'readonly', order_index: 8, icon: 'bi-atom' },
    { id: 'top_rest', slug: 'client-server-rest', title: 'Client-Server & REST APIs', description: 'HTTP verbs, status codes, request headers, and JSON payloads.', category: 'readonly', order_index: 9, icon: 'bi-hdd-network' },
    { id: 'top_php_mysql', slug: 'php-mysql', title: 'PHP & MySQL Backends', description: 'Server-side scripting, relational databases, and SQL queries.', category: 'readonly', order_index: 10, icon: 'bi-database' }
  ];
  await knex('topics').insert(topicsData);

  // 3. Seed Lessons (14 core interactive + 4 catalogue overviews)
  const lessonsData = [
    // HTML
    {
      id: 'les_html_01',
      topic_id: 'top_html',
      slug: 'html-intro',
      title: 'HTML5 Semantic Document Structure',
      order_index: 1,
      estimated_time: '12 min',
      difficulty: 'Beginner',
      objectives: JSON.stringify(['Understand doctype and html element', 'Use header, main, footer tags', 'Recognize accessibility benefits']),
      content_markdown: `### HTML5 Semantic Structure\nHTML5 introduced semantic tags that clearly describe their meaning to both the browser and developer.\n\nRather than nesting generic \`<div>\` containers, modern web pages use semantic tags:\n- \`<header>\`: Introductory content or navigational aids.\n- \`<nav>\`: Navigation links.\n- \`<main>\`: The dominant content of the body.\n- \`<footer>\`: Author, copyright, or footer links.\n\nSemantic elements improve search engine indexing and assistive screen reader navigation.`,
      runnable_code: `<!DOCTYPE html>\n<html>\n<head><style>body { font-family: sans-serif; padding: 15px; color: #333; } header, footer { background: #eee; padding: 8px; } main { padding: 12px 0; }</style></head>\n<body>\n  <header><h3>Semantic Header</h3></header>\n  <main><p>This is the primary content inside the main tag.</p></main>\n  <footer><small>&copy; 2026 CodeFlow Academy</small></footer>\n</body>\n</html>`,
      expected_output: 'Renders semantic header, main body paragraph, and small copyright footer.',
      common_mistakes: JSON.stringify(['Using multiple <main> elements on a single page', 'Confusing <section> with <div>']),
      is_interactive: true
    },
    {
      id: 'les_html_02',
      topic_id: 'top_html',
      slug: 'html-forms',
      title: 'HTML5 Forms & Input Validation',
      order_index: 2,
      estimated_time: '15 min',
      difficulty: 'Beginner',
      objectives: JSON.stringify(['Construct accessible form controls', 'Use label and for bindings', 'Apply required and type constraints']),
      content_markdown: `### Forms and Input Controls\nForms allow users to submit data to web applications. Each input control must have an associated \`<label for="id">\` to ensure accessibility and touch targets.`,
      runnable_code: `<!DOCTYPE html>\n<html>\n<head><style>body { font-family: sans-serif; padding: 15px; } .row { margin-bottom: 10px; } label { display: block; font-weight: bold; margin-bottom: 3px; }</style></head>\n<body>\n  <form onsubmit="event.preventDefault(); alert('Form submitted!');">\n    <div class="row">\n      <label for="name">Student Name:</label>\n      <input type="text" id="name" required placeholder="e.g. Alex" />\n    </div>\n    <div class="row">\n      <label for="email">Student Email:</label>\n      <input type="email" id="email" required placeholder="name@college.edu" />\n    </div>\n    <button type="submit">Submit Form</button>\n  </form>\n</body>\n</html>`,
      expected_output: 'An interactive form with bound labels and required browser constraint validation.',
      common_mistakes: JSON.stringify(['Omitting matching id on input matching label for attribute', 'Using div instead of form element']),
      is_interactive: true
    },
    // CSS
    {
      id: 'les_css_01',
      topic_id: 'top_css',
      slug: 'css-box-model',
      title: 'The CSS Box Model: Margin, Border & Padding',
      order_index: 1,
      estimated_time: '15 min',
      difficulty: 'Beginner',
      objectives: JSON.stringify(['Master content, padding, border, margin', 'Understand box-sizing: border-box', 'Calculate total rendered dimensions']),
      content_markdown: `### The CSS Box Model\nEvery HTML element rendered in the browser is considered a rectangular box.\n\nFrom inside out:\n1. **Content**: Where text and media appear.\n2. **Padding**: Transparent space between content and border.\n3. **Border**: The stroke surrounding the padding.\n4. **Margin**: Space outside the border separating neighboring elements.`,
      runnable_code: `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .box {\n      width: 220px;\n      padding: 20px;\n      border: 4px solid #8b5cf6;\n      margin: 20px;\n      background: #14b8a6;\n      color: #fff;\n      box-sizing: border-box;\n      font-family: sans-serif;\n      text-align: center;\n    }\n  </style>\n</head>\n<body>\n  <div class="box">box-sizing: border-box (220px total)</div>\n</body>\n</html>`,
      expected_output: 'A centered box demonstrating contained padding and border dimensions.',
      common_mistakes: JSON.stringify(['Assuming margin contributes to inner background color', 'Forgetting box-sizing defaults to content-box']),
      is_interactive: true
    },
    {
      id: 'les_css_02',
      topic_id: 'top_css',
      slug: 'css-flexbox',
      title: 'Flexbox Layouts & Alignment',
      order_index: 2,
      estimated_time: '18 min',
      difficulty: 'Intermediate',
      objectives: JSON.stringify(['Configure flex containers and items', 'Differentiate justify-content and align-items', 'Implement responsive card grids']),
      content_markdown: `### Flexbox (Flexible Box Layout)\nFlexbox provides a 1-dimensional layout model to distribute space and align items efficiently along a main and cross axis.`,
      runnable_code: `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .flex-row {\n      display: flex;\n      justify-content: space-between;\n      align-items: center;\n      background: #0f172a;\n      padding: 15px;\n      border-radius: 8px;\n    }\n    .card { background: #1e293b; color: #fff; padding: 15px 25px; border-radius: 6px; font-family: sans-serif; }\n  </style>\n</head>\n<body>\n  <div class="flex-row">\n    <div class="card">Item 1</div>\n    <div class="card">Item 2</div>\n    <div class="card">Item 3</div>\n  </div>\n</body>\n</html>`,
      expected_output: 'Three evenly spaced cards aligned horizontally across the flex container.',
      common_mistakes: JSON.stringify(['Applying justify-content to children instead of the parent container', 'Confusing main axis with cross axis']),
      is_interactive: true
    },
    // JavaScript Core
    {
      id: 'les_js_01',
      topic_id: 'top_js',
      slug: 'js-variables',
      title: 'JavaScript Variables: let, const & Types',
      order_index: 1,
      estimated_time: '12 min',
      difficulty: 'Beginner',
      objectives: JSON.stringify(['Distinguish let vs const vs var', 'Identify primitive types', 'Avoid temporal dead zone bugs']),
      content_markdown: `### Variables and Scoping\nModern JavaScript uses \`let\` and \`const\` rather than \`var\`.\n- \`const\`: Block-scoped, cannot be reassigned.\n- \`let\`: Block-scoped, can be reassigned.\n- \`var\`: Function-scoped, hoisted to top of execution context.`,
      runnable_code: `// Run this standalone JavaScript in CodeFlow\nconst studentName = 'Priya';\nlet currentScore = 85;\n\ncurrentScore += 10; // Allowed with let\n\nconsole.log('Student:', studentName);\nconsole.log('Final Score:', currentScore);`,
      expected_output: 'Student: Priya\nFinal Score: 95',
      common_mistakes: JSON.stringify(['Reassigning a const variable', 'Relying on var hoisting']),
      is_interactive: true
    },
    {
      id: 'les_js_02',
      topic_id: 'top_js',
      slug: 'js-loops',
      title: 'Loops & Iteration: for, while & for..of',
      order_index: 2,
      estimated_time: '15 min',
      difficulty: 'Beginner',
      objectives: JSON.stringify(['Control loop bounds and counters', 'Prevent infinite loops', 'Iterate over collections']),
      content_markdown: `### Loops and Iteration\nLoops repeat execution until a condition evaluates to false. Be vigilant about boundary conditions (e.g. \`<\` vs \`<=\`) to avoid off-by-one errors.`,
      runnable_code: `const numbers = [2, 4, 6, 8];\nlet product = 1;\n\nfor (let i = 0; i < numbers.length; i++) {\n  product *= numbers[i];\n  console.log('Step ' + (i + 1) + ': product = ' + product);\n}\n\nconsole.log('Final Result:', product);`,
      expected_output: 'Step 1: product = 2\nStep 2: product = 8\nStep 3: product = 48\nStep 4: product = 384\nFinal Result: 384',
      common_mistakes: JSON.stringify(['Writing i <= array.length causing out of bounds undefined index', 'Forgetting increment condition leading to infinite loop']),
      is_interactive: true
    },
    {
      id: 'les_js_03',
      topic_id: 'top_js',
      slug: 'js-functions',
      title: 'Functions, Scopes & Closures',
      order_index: 3,
      estimated_time: '20 min',
      difficulty: 'Intermediate',
      objectives: JSON.stringify(['Understand lexical scoping', 'Implement higher-order functions', 'Encapsulate private state using closures']),
      content_markdown: `### Functions & Closures\nA closure is the combination of a function bundled together with references to its surrounding state (lexical environment).`,
      runnable_code: `function createMultiplier(factor) {\n  // The returned function retains access to 'factor'\n  return function(number) {\n    return number * factor;\n  };\n}\n\nconst triple = createMultiplier(3);\nconsole.log('Triple 5 is:', triple(5));\nconsole.log('Triple 10 is:', triple(10));`,
      expected_output: 'Triple 5 is: 15\nTriple 10 is: 30',
      common_mistakes: JSON.stringify(['Losing "this" context in callbacks', 'Creating unnecessary closures inside tight loops']),
      is_interactive: true
    },
    // DOM & Events
    {
      id: 'les_dom_01',
      topic_id: 'top_dom',
      slug: 'dom-queries',
      title: 'Querying & Manipulating the DOM Tree',
      order_index: 1,
      estimated_time: '18 min',
      difficulty: 'Intermediate',
      objectives: JSON.stringify(['Use querySelector and getElementById', 'Modify textContent and innerHTML safely', 'Manipulate element.classList']),
      content_markdown: `### DOM Manipulation\nThe Document Object Model (DOM) is the tree representation of an HTML document in browser memory. JavaScript interacts with this tree via methods like \`querySelector\` and property mutations.`,
      runnable_code: `<!DOCTYPE html>\n<html>\n<head><style>body { font-family: sans-serif; padding: 20px; } .highlight { color: #8b5cf6; font-weight: bold; }</style></head>\n<body>\n  <h2 id="title">Original Heading</h2>\n  <button id="btn">Update Heading</button>\n  <script>\n    const titleEl = document.getElementById('title');\n    const btn = document.getElementById('btn');\n    btn.onclick = () => {\n      titleEl.textContent = 'Heading Updated via DOM!';\n      titleEl.classList.add('highlight');\n      console.log('Updated DOM element');\n    };\n  </script>\n</body>\n</html>`,
      expected_output: 'Clicking button modifies heading text and adds highlight class.',
      common_mistakes: JSON.stringify(['Using innerHTML with untrusted strings creating XSS vulnerabilities', 'Accessing elements before DOM has loaded']),
      is_interactive: true
    },
    // Async
    {
      id: 'les_async_01',
      topic_id: 'top_async',
      slug: 'async-promises',
      title: 'Promises & Async/Await Mechanics',
      order_index: 1,
      estimated_time: '20 min',
      difficulty: 'Intermediate',
      objectives: JSON.stringify(['Understand Promise pending, fulfilled, rejected states', 'Write non-blocking async functions', 'Catch errors with try/catch']),
      content_markdown: `### Asynchronous JavaScript\nJavaScript is single-threaded. Long-running tasks like network requests or timers are handled asynchronously through the browser event loop using Promises.`,
      runnable_code: `function delay(ms) {\n  return new Promise(resolve => setTimeout(resolve, ms));\n}\n\nasync function performTasks() {\n  console.log('Task 1 started');\n  await delay(300);\n  console.log('Task 2 completed after delay');\n}\n\nperformTasks();`,
      expected_output: 'Task 1 started\nTask 2 completed after delay',
      common_mistakes: JSON.stringify(['Omitting await before Promise returning functions', 'Failing to handle Promise rejections']),
      is_interactive: true
    },
    // Canvas
    {
      id: 'les_canvas_01',
      topic_id: 'top_canvas',
      slug: 'canvas-intro',
      title: 'HTML5 Canvas 2D Rendering Context',
      order_index: 1,
      estimated_time: '22 min',
      difficulty: 'Intermediate',
      objectives: JSON.stringify(['Access 2D rendering context', 'Draw paths, rectangles and circles', 'Implement requestAnimationFrame loop']),
      content_markdown: `### HTML5 Canvas\nThe \`<canvas>\` element provides a bitmap drawing surface that scripts can render into using a 2D rendering context.`,
      runnable_code: `<!DOCTYPE html>\n<html>\n<body style="margin:0; background:#070b19; display:flex; justify-content:center; padding:20px;">\n  <canvas id="cv" width="300" height="150" style="border:1px solid #334155;"></canvas>\n  <script>\n    const cv = document.getElementById('cv');\n    const ctx = cv.getContext('2d');\n    ctx.fillStyle = '#8b5cf6';\n    ctx.fillRect(40, 30, 80, 80);\n    ctx.beginPath();\n    ctx.arc(200, 70, 40, 0, Math.PI * 2);\n    ctx.fillStyle = '#14b8a6';\n    ctx.fill();\n  </script>\n</body>\n</html>`,
      expected_output: 'Renders a violet square and teal circle on a dark canvas.',
      common_mistakes: JSON.stringify(['Setting canvas dimensions via CSS instead of width/height attributes leading to distorted scaling', 'Forgetting beginPath before new shape paths']),
      is_interactive: true
    },
    // Catalogue Topics (Read-Only)
    {
      id: 'les_cat_01',
      topic_id: 'top_bootstrap',
      slug: 'bootstrap-overview',
      title: 'Bootstrap 5 Grid System & Components',
      order_index: 1,
      estimated_time: '10 min',
      difficulty: 'Beginner',
      objectives: JSON.stringify(['Explore 12-column grid container', 'Review pre-built button and card utilities']),
      content_markdown: `> **Read-only — not executable in CodeFlow**\n\n### Bootstrap 5 Architecture\nBootstrap is a popular frontend CSS framework built around a 12-column responsive flexbox grid system. Classes like \`.col-md-6\` allow rapid creation of adaptive multi-column layouts across desktop and mobile breakpoints.`,
      runnable_code: null,
      expected_output: null,
      common_mistakes: JSON.stringify(['Overusing !important when overriding framework styles']),
      is_interactive: false
    },
    {
      id: 'les_cat_02',
      topic_id: 'top_react',
      slug: 'react-overview',
      title: 'React Component Model & Virtual DOM',
      order_index: 1,
      estimated_time: '15 min',
      difficulty: 'Intermediate',
      objectives: JSON.stringify(['Understand component tree concept', 'Explore unidirectional data flow']),
      content_markdown: `> **Read-only — not executable in CodeFlow**\n\n### React Component Architecture\nReact is a declarative library for building user interfaces. Instead of mutating DOM nodes directly, components declare what their UI should look like for a given state, and React reconciles updates via its Virtual DOM.`,
      runnable_code: null,
      expected_output: null,
      common_mistakes: JSON.stringify(['Directly mutating state variables instead of using setter functions']),
      is_interactive: false
    },
    {
      id: 'les_cat_03',
      topic_id: 'top_rest',
      slug: 'rest-overview',
      title: 'REST Architecture & HTTP Protocol',
      order_index: 1,
      estimated_time: '12 min',
      difficulty: 'Intermediate',
      objectives: JSON.stringify(['Understand HTTP methods (GET, POST, PUT, DELETE)', 'Review common status codes']),
      content_markdown: `> **Read-only — not executable in CodeFlow**\n\n### REST Principles\nRepresentational State Transfer (REST) is an architectural style for networked client-server applications. Resources are identified by standard URI paths and manipulated using HTTP methods.`,
      runnable_code: null,
      expected_output: null,
      common_mistakes: JSON.stringify(['Using GET for state-modifying actions']),
      is_interactive: false
    },
    {
      id: 'les_cat_04',
      topic_id: 'top_php_mysql',
      slug: 'php-mysql-overview',
      title: 'Server-Side Execution & Relational SQL',
      order_index: 1,
      estimated_time: '15 min',
      difficulty: 'Intermediate',
      objectives: JSON.stringify(['Contrast server vs browser runtime execution', 'Review SQL SELECT and JOIN queries']),
      content_markdown: `> **Read-only — not executable in CodeFlow**\n\n### Server-Side Processing & Databases\nUnlike client JavaScript which runs inside the user's browser, PHP executes on the remote server host, querying databases (like MySQL) to assemble HTML responses before transmission.`,
      runnable_code: null,
      expected_output: null,
      common_mistakes: JSON.stringify(['Concatenating raw user inputs into SQL strings creating SQL injection vulnerabilities']),
      is_interactive: false
    }
  ];
  await knex('lessons').insert(lessonsData);

  // 4. Seed Practice Questions
  const pqList = [
    {
      id: 'pq-html-01',
      topic_id: 'top_html',
      difficulty: 'Easy',
      type: 'mcq',
      title: 'Semantic Sectioning Tags',
      prompt: 'Which HTML5 element represents self-contained content that could theoretically be distributed independently (e.g. a blog post or news story)?',
      options: JSON.stringify(['<section>', '<article>', '<aside>', '<div>']),
      answer: '<article>',
      hints: JSON.stringify(['Think about syndicated content.', 'Distinct from <section>.', 'Tag name is synonymous with a journal story.']),
      explanation: '<article> is specifically designed for self-contained compositions intended to be independently reusable.'
    },
    {
      id: 'pq-css-01',
      topic_id: 'top_css',
      difficulty: 'Easy',
      type: 'predict',
      title: 'CSS Box Model Total Width',
      prompt: 'Given standard box-sizing: content-box, what is the total rendered element width?',
      code: `div {\n  width: 200px;\n  padding: 20px;\n  border: 5px solid black;\n  margin: 15px;\n}`,
      options: JSON.stringify(['200px', '250px', '280px', '240px']),
      answer: '250px',
      hints: JSON.stringify(['Total = width + 2*padding + 2*border', 'Margin is outside the element box', '200 + 40 + 10 = 250px']),
      explanation: 'In content-box, total width = 200 + 40 + 10 = 250px.'
    },
    {
      id: 'pq-js-01',
      topic_id: 'top_js',
      difficulty: 'Easy',
      type: 'predict',
      title: 'Predict Array Length Modification',
      prompt: 'What does this program log?',
      code: `let arr = [10, 20, 30, 40];\narr.length = 2;\nconsole.log(arr.join("-"));`,
      options: JSON.stringify(['10-20', '10-20-30-40', 'undefined-undefined', 'Error: length is read-only']),
      answer: '10-20',
      hints: JSON.stringify(['Array length is writable', 'Truncates array in place', 'Indices >= 2 are deleted']),
      explanation: 'Setting array length to a smaller number truncates it in-place.'
    }
  ];
  await knex('practice_questions').insert(pqList);

  // 5. Seed Assessments & Hidden Tests
  await knex('assessments').insert([
    {
      id: 'assessment-web-core',
      title: 'Web Foundations & JavaScript Core Exam',
      topic: 'Web Programming',
      difficulty: 'Intermediate',
      time_limit_seconds: 1800,
      passing_score: 70
    },
    {
      id: 'assessment-dom-async',
      title: 'DOM, Events & Async Practical Assessment',
      topic: 'DOM & Async',
      difficulty: 'Advanced',
      time_limit_seconds: 2400,
      passing_score: 70
    }
  ]);

  // Assessment Questions
  await knex('assessment_questions').insert([
    {
      id: 'q1',
      assessment_id: 'assessment-web-core',
      order_index: 1,
      type: 'mcq',
      points: 10,
      title: 'HTML Semantic Meaning',
      prompt: 'Which HTML element should wrap content that is only tangentially related to the main content?',
      options: JSON.stringify(['<aside>', '<section>', '<article>', '<nav>']),
      server_answer: '<aside>',
      explanation: '<aside> represents tangentially related content.'
    },
    {
      id: 'q5',
      assessment_id: 'assessment-web-core',
      order_index: 2,
      type: 'coding',
      points: 30,
      title: 'Coding Task: Sum Evens Function',
      prompt: 'Write a JavaScript function named sumEvens(arr) that accepts an array of numbers and returns the sum of all even numbers.',
      starter_code: `function sumEvens(arr) {\n  // Return the sum of all even numbers in arr\n}`,
      explanation: 'Filter array items with n % 2 === 0 and sum with reduce.'
    }
  ]);

  // Test Cases for q5 (visible and hidden)
  await knex('test_cases').insert([
    { id: 'v1', assessment_question_id: 'q5', input: '[1, 2, 3, 4, 5, 6]', expected_output: '12', is_hidden: false },
    { id: 'v2', assessment_question_id: 'q5', input: '[1, 3, 5]', expected_output: '0', is_hidden: false },
    { id: 'h1', assessment_question_id: 'q5', input: '[2, 4, 6, 8, 10]', expected_output: '30', is_hidden: true },
    { id: 'h2', assessment_question_id: 'q5', input: '[]', expected_output: '0', is_hidden: true },
    { id: 'h3', assessment_question_id: 'q5', input: '[-2, 4, -6, 8]', expected_output: '4', is_hidden: true }
  ]);
}

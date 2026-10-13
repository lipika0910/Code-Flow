// CodeFlow Practice Arena Questions (30+ questions spanning HTML, CSS, JavaScript, DOM & Events)

export const PRACTICE_QUESTIONS = [
  // --- HTML5 Questions ---
  {
    id: 'pq-html-01',
    topic: 'HTML',
    difficulty: 'Easy',
    type: 'mcq',
    title: 'Semantic Sectioning Tags',
    prompt: 'Which HTML5 element represents self-contained content that could theoretically be distributed independently (e.g. a blog post or news story)?',
    options: ['<section>', '<article>', '<aside>', '<div>'],
    answer: '<article>',
    hints: [
      'Clue 1: Think about syndicated content that can stand alone outside the page context.',
      'Clue 2: It is distinct from <section>, which is a thematic grouping of content.',
      'Near-Answer: The tag name is directly synonymous with a magazine or journal story.'
    ],
    explanation: '<article> is specifically designed for self-contained compositions intended to be independently reusable or distributable. <section> represents generic thematic groupings.'
  },
  {
    id: 'pq-html-02',
    topic: 'HTML',
    difficulty: 'Easy',
    type: 'find_bug',
    title: 'Fix the Form Input Label Relationship',
    prompt: 'In this form snippet, clicking the label text fails to focus the input field. Identify the bug.',
    code: `<label for="user_email">Email Address</label>\n<input type="email" name="user_email" />`,
    options: [
      'The input is missing an id="user_email" attribute',
      'The label "for" attribute must be renamed to "name"',
      'Input type should be "text" instead of "email"',
      'Labels cannot be used with email inputs'
    ],
    answer: 'The input is missing an id="user_email" attribute',
    hints: [
      'Clue 1: In HTML, label elements associate with inputs via an ID, not a name attribute.',
      'Clue 2: Look at the relationship between the "for" attribute on the label and the attributes on the input.',
      'Near-Answer: Add id="user_email" to the input so the browser links them.'
    ],
    explanation: 'The label\'s "for" attribute binds to an element whose "id" attribute matches. The "name" attribute is submitted in form data, but does not provide DOM label association.'
  },
  {
    id: 'pq-html-03',
    topic: 'HTML',
    difficulty: 'Medium',
    type: 'rearrange',
    title: 'Construct a Valid HTML Table Structure',
    prompt: 'Rearrange these tags in the correct hierarchical order for a valid HTML data table with headers:',
    statements: ['<table>', '<thead>', '<tr>', '<th>Student Name</th>', '</tr>', '</thead>', '</table>'],
    correctOrder: [0, 1, 2, 3, 4, 5, 6],
    hints: [
      'Clue 1: <table> is the outermost container.',
      'Clue 2: <thead> encapsulates header rows before <tbody>.',
      'Near-Answer: table -> thead -> tr -> th -> /tr -> /thead -> /table'
    ],
    explanation: 'Tables must follow the hierarchy: <table> -> <thead> -> <tr> -> <th>. Rows cannot directly contain <thead>.'
  },
  {
    id: 'pq-html-04',
    topic: 'HTML',
    difficulty: 'Medium',
    type: 'mcq',
    title: 'Accessible Image Fallbacks',
    prompt: 'When is it appropriate to leave an image\'s alt attribute empty (alt="")?',
    options: [
      'When the image is purely decorative and conveys no essential information',
      'Never, all images must have descriptive alt text',
      'Only when the image format is SVG',
      'When the image fails to load from the server'
    ],
    answer: 'When the image is purely decorative and conveys no essential information',
    hints: [
      'Clue 1: Consider how screen readers announced decorative icons or background borders.',
      'Clue 2: alt="" tells assistive technology to safely skip decorative graphics.',
      'Near-Answer: Purely decorative visuals should have empty alt attributes so screen readers ignore them.'
    ],
    explanation: 'WCAG specifies that decorative images must have alt="" so screen readers ignore them rather than reading out the raw file path.'
  },
  {
    id: 'pq-html-05',
    topic: 'HTML',
    difficulty: 'Hard',
    type: 'fill_blank',
    title: 'Form Validation Attributes',
    prompt: 'Which HTML attribute specifies a regular expression pattern that the input\'s value must match before form submission?',
    answer: 'pattern',
    hints: [
      'Clue 1: It is a 7-letter attribute supported on text, search, url, tel, email, and password inputs.',
      'Clue 2: It accepts a JavaScript regex string without the leading and trailing slashes.',
      'Near-Answer: Starts with "p" and ends with "n".'
    ],
    explanation: 'The "pattern" attribute specifies a regular expression against which the form control\'s value is checked during browser constraint validation.'
  },

  // --- CSS3 Questions ---
  {
    id: 'pq-css-01',
    topic: 'CSS',
    difficulty: 'Easy',
    type: 'predict',
    title: 'CSS Box Model Total Width',
    prompt: 'Given standard box-sizing: content-box, what is the total rendered element width?',
    code: `div {\n  width: 200px;\n  padding: 20px;\n  border: 5px solid black;\n  margin: 15px;\n}`,
    options: ['200px', '250px', '280px', '240px'],
    answer: '250px',
    hints: [
      'Clue 1: Total element width = width + left/right padding + left/right border.',
      'Clue 2: Margin affects space around the element, but is outside the element\'s rendered box width.',
      'Near-Answer: 200 + (20 * 2) + (5 * 2) = 250px.'
    ],
    explanation: 'In content-box mode, total width = width (200) + padding-left/right (40) + border-left/right (10) = 250px. Margin surrounds the element.'
  },
  {
    id: 'pq-css-02',
    topic: 'CSS',
    difficulty: 'Easy',
    type: 'mcq',
    title: 'Flexbox Main Axis Alignment',
    prompt: 'In a flex container with flex-direction: row, which property aligns items along the horizontal (main) axis?',
    options: ['justify-content', 'align-items', 'align-content', 'justify-items'],
    answer: 'justify-content',
    hints: [
      'Clue 1: "justify-*" controls the main axis; "align-*" controls the cross axis.',
      'Clue 2: For row direction, main axis is horizontal.',
      'Near-Answer: justify-content.'
    ],
    explanation: 'justify-content distributes space and aligns items along the main axis of a flex container (row = horizontal, column = vertical).'
  },
  {
    id: 'pq-css-03',
    topic: 'CSS',
    difficulty: 'Medium',
    type: 'find_bug',
    title: 'CSS Specificity Conflict',
    prompt: 'Why does the button remain blue despite the second rule having color: red?',
    code: `#nav .btn { color: blue; }\n.btn { color: red !important; } /* Wait, without !important */\n/* Actual code: */\n#nav .btn { color: blue; }\n.container .btn { color: red; }`,
    options: [
      '#nav .btn has higher specificity (1 ID + 1 Class = 0,1,1,0) than .container .btn (2 Classes = 0,0,2,0)',
      'The second rule comes second in the stylesheet so it wins',
      'ID selectors are invalid inside CSS',
      '.container is an illegal class name'
    ],
    answer: '#nav .btn has higher specificity (1 ID + 1 Class = 0,1,1,0) than .container .btn (2 Classes = 0,0,2,0)',
    hints: [
      'Clue 1: Compare the selector specificity weights: (Inline, IDs, Classes, Elements).',
      'Clue 2: One ID selector beats any number of class selectors.',
      'Near-Answer: 1 ID selector in #nav .btn gives it greater specificity than 2 classes.'
    ],
    explanation: 'ID selectors carry a weight of 0-1-0-0, which overrides any combination of class selectors (0-0-2-0) regardless of order of appearance in the CSS.'
  },
  {
    id: 'pq-css-04',
    topic: 'CSS',
    difficulty: 'Medium',
    type: 'rearrange',
    title: 'CSS Box-Sizing Universal Reset',
    prompt: 'Order the statements for modern predictable border-box inheritance:',
    statements: [
      'html { box-sizing: border-box; }',
      '*, *::before, *::after {',
      '  box-sizing: inherit;',
      '}'
    ],
    correctOrder: [0, 1, 2, 3],
    hints: [
      'Clue 1: Set box-sizing on the root html element first.',
      'Clue 2: Universal selector inherits box-sizing from html.',
      'Near-Answer: html -> universal selector -> inherit -> closing brace'
    ],
    explanation: 'Setting html { box-sizing: border-box } and inheriting via * allows third-party components to override their own box-sizing safely.'
  },
  {
    id: 'pq-css-05',
    topic: 'CSS',
    difficulty: 'Hard',
    type: 'fill_blank',
    title: 'CSS Grid Fractional Unit',
    prompt: 'What CSS unit represents a fraction of the available space inside a CSS Grid container?',
    answer: 'fr',
    hints: [
      'Clue 1: It is a 2-letter abbreviation for "fraction".',
      'Clue 2: Commonly used in grid-template-columns: 1___ 2___;',
      'Near-Answer: The letters f and r.'
    ],
    explanation: 'The "fr" unit represents a fraction of the leftover free space in the grid container after fixed tracks are allocated.'
  },

  // --- JavaScript Core Questions ---
  {
    id: 'pq-js-01',
    topic: 'JavaScript',
    difficulty: 'Easy',
    type: 'predict',
    title: 'Predict Array Length Modification',
    prompt: 'What does this program log?',
    code: `let arr = [10, 20, 30, 40];\narr.length = 2;\nconsole.log(arr.join("-"));`,
    options: ['10-20', '10-20-30-40', 'undefined-undefined', 'Error: length is read-only'],
    answer: '10-20',
    hints: [
      'Clue 1: In JavaScript, an array\'s length property is writable.',
      'Clue 2: Reducing the length property truncates the array in-place.',
      'Near-Answer: Elements at indices >= 2 are deleted.'
    ],
    explanation: 'Setting the array length to a smaller value truncates the array, discarding all elements with indices greater than or equal to the new length.'
  },
  {
    id: 'pq-js-02',
    topic: 'JavaScript',
    difficulty: 'Easy',
    type: 'mcq',
    title: 'const Variable Reassignment vs Mutation',
    prompt: 'Which of the following operations on a "const" variable is valid in JavaScript?',
    options: [
      'const list = []; list.push(1);',
      'const list = []; list = [1];',
      'const count = 0; count++;',
      'const name = "Alex"; name = "Sam";'
    ],
    answer: 'const list = []; list.push(1);',
    hints: [
      'Clue 1: "const" prevents variable reassignment, NOT object/array mutation.',
      'Clue 2: Reassigning list = ... or count++ reassigns the identifier binding.',
      'Near-Answer: Mutating an internal array property with .push() is fully valid.'
    ],
    explanation: '"const" creates an immutable binding to a value in memory. It prevents reassigning the variable identifier, but does not make arrays or objects frozen/immutable.'
  },
  {
    id: 'pq-js-03',
    topic: 'JavaScript',
    difficulty: 'Medium',
    type: 'find_bug',
    title: 'Find the Bug in the Filter Function',
    prompt: 'Why does this code fail to return only even numbers?',
    code: `function getEvens(nums) {\n  return nums.filter(n => {\n    n % 2 === 0;\n  });\n}`,
    options: [
      'The arrow function body uses curly braces {} without an explicit "return" statement',
      'n % 2 === 0 is not the right formula for evens',
      '.filter() cannot accept arrow functions',
      'nums must be an object, not an array'
    ],
    answer: 'The arrow function body uses curly braces {} without an explicit "return" statement',
    hints: [
      'Clue 1: In arrow functions with curly braces {}, a return keyword is required.',
      'Clue 2: Without return, the function implicitly returns undefined (which is falsy).',
      'Near-Answer: Either remove {} (concise body) or add "return n % 2 === 0;".'
    ],
    explanation: 'Arrow functions with a block body { ... } do not implicitly return values. Without "return", it returns undefined, so filter() drops every item.'
  },
  {
    id: 'pq-js-04',
    topic: 'JavaScript',
    difficulty: 'Medium',
    type: 'predict',
    title: 'Predict Function Default Parameters',
    prompt: 'What will be printed to the console?',
    code: `function greet(name = "Student", greeting = "Hello") {\n  console.log(greeting + ", " + name);\n}\n\ngreet(undefined, null);`,
    options: [
      'null, Student',
      'Hello, Student',
      'null, undefined',
      'Hello, null'
    ],
    answer: 'null, Student',
    hints: [
      'Clue 1: Default parameters trigger ONLY when an argument is undefined (or omitted).',
      'Clue 2: null is treated as an intentional, valid value, NOT undefined.',
      'Near-Answer: name gets default "Student", greeting gets passed null.'
    ],
    explanation: 'Default parameters only apply when an argument is undefined. Passing "null" explicitly passes the null value, which does not trigger the default.'
  },
  {
    id: 'pq-js-05',
    topic: 'JavaScript',
    difficulty: 'Hard',
    type: 'predict',
    title: 'Predict typeof on Primitive Values',
    prompt: 'What does this statement output?',
    code: `console.log(typeof null, typeof NaN);`,
    options: [
      'object number',
      'null number',
      'null NaN',
      'object NaN'
    ],
    answer: 'object number',
    hints: [
      'Clue 1: typeof null is a famous historic JavaScript bug from 1995.',
      'Clue 2: NaN stands for "Not-a-Number", but its data type is actually numeric.',
      'Near-Answer: typeof null is "object" and typeof NaN is "number".'
    ],
    explanation: 'typeof null is famously "object" due to historic legacy type tags. NaN represents an unrepresentable numeric result, so typeof NaN is "number".'
  },

  // --- DOM & Events Questions ---
  {
    id: 'pq-dom-01',
    topic: 'DOM',
    difficulty: 'Easy',
    type: 'mcq',
    title: 'querySelector vs querySelectorAll',
    prompt: 'What does document.querySelectorAll(".item") return when no elements match the class?',
    options: [
      'An empty NodeList (length 0)',
      'null',
      'undefined',
      'Throws a DOMException'
    ],
    answer: 'An empty NodeList (length 0)',
    hints: [
      'Clue 1: querySelector returns null on failure.',
      'Clue 2: querySelectorAll returns a collection.',
      'Near-Answer: It returns an empty NodeList object.'
    ],
    explanation: 'document.querySelectorAll always returns a NodeList. If no matching nodes are found in the DOM, it returns an empty NodeList with length 0.'
  },
  {
    id: 'pq-dom-02',
    topic: 'DOM',
    difficulty: 'Easy',
    type: 'find_bug',
    title: 'Prevent Default Form Refresh',
    prompt: 'A form submission causes the browser page to reload immediately. How do you prevent this in the submit event handler?',
    code: `form.addEventListener("submit", (e) => {\n  /* Missing prevention line */\n  console.log("Saving user data...");\n});`,
    options: [
      'e.preventDefault()',
      'e.stopPropagation()',
      'return false',
      'e.stopImmediatePropagation()'
    ],
    answer: 'e.preventDefault()',
    hints: [
      'Clue 1: It prevents the user agent\'s default action associated with the event.',
      'Clue 2: stopPropagation prevents bubbling to ancestors, but does not stop default form submission.',
      'Near-Answer: e.preventDefault()'
    ],
    explanation: 'e.preventDefault() tells the browser not to execute the default action (which for a form submit is reloading the page to send an HTTP GET/POST).'
  },
  {
    id: 'pq-dom-03',
    topic: 'DOM',
    difficulty: 'Medium',
    type: 'rearrange',
    title: 'Dynamic Element Insertion Workflow',
    prompt: 'Order the steps to create and insert a new paragraph into an existing container:',
    statements: [
      'const container = document.getElementById("main");',
      'const p = document.createElement("p");',
      'p.textContent = "Dynamic Content Added";',
      'container.appendChild(p);'
    ],
    correctOrder: [0, 1, 2, 3],
    hints: [
      'Clue 1: Reference container and allocate element node.',
      'Clue 2: Configure text before appending to DOM to avoid layout thrashing.',
      'Near-Answer: container -> createElement -> textContent -> appendChild'
    ],
    explanation: 'Best practice: query container, create node in memory, configure attributes/text, then insert into the document tree once.'
  },
  {
    id: 'pq-dom-04',
    topic: 'DOM',
    difficulty: 'Medium',
    type: 'mcq',
    title: 'Event Bubbling vs Event Capturing',
    prompt: 'During which phase of the DOM Event Dispatch flow do event listeners registered with addEventListener(type, fn, false) trigger?',
    options: [
      'Bubbling phase (from target element up to window)',
      'Capturing phase (from window down to target)',
      'Initialization phase',
      'Target phase only'
    ],
    answer: 'Bubbling phase (from target element up to window)',
    hints: [
      'Clue 1: The third argument "useCapture" defaults to false.',
      'Clue 2: False means listeners fire on the way back up the DOM tree.',
      'Near-Answer: The bubbling phase.'
    ],
    explanation: 'By default (useCapture: false), event handlers fire during the bubbling phase as the event bubbles up the DOM tree towards the document root.'
  },
  {
    id: 'pq-dom-05',
    topic: 'DOM',
    difficulty: 'Hard',
    type: 'match',
    title: 'Match DOM Methods to Behavior',
    prompt: 'Which DOM method safely adds or removes a CSS class depending on whether it currently exists?',
    options: [
      'element.classList.toggle("active")',
      'element.className += " active"',
      'element.setAttribute("class", "active")',
      'element.classList.replace("active")'
    ],
    answer: 'element.classList.toggle("active")',
    hints: [
      'Clue 1: Look at the classList API methods: add, remove, toggle, contains.',
      'Clue 2: "toggle" switches boolean states seamlessly.',
      'Near-Answer: element.classList.toggle'
    ],
    explanation: 'classList.toggle() checks if the class is present: if so, it removes it; if not, it adds it, returning a boolean indicating the new presence.'
  },

  // --- Async JS & Browser APIs ---
  {
    id: 'pq-async-01',
    topic: 'Async',
    difficulty: 'Easy',
    type: 'predict',
    title: 'Event Loop Order of Execution',
    prompt: 'What order will these statements be logged?',
    code: `console.log("1");\nsetTimeout(() => console.log("2"), 0);\nconsole.log("3");`,
    options: ['1, 3, 2', '1, 2, 3', '3, 1, 2', '2, 1, 3'],
    answer: '1, 3, 2',
    hints: [
      'Clue 1: Synchronous code on the call stack executes first.',
      'Clue 2: setTimeout callbacks are deferred to the Macrotask Queue even with a 0ms delay.',
      'Near-Answer: 1 and 3 execute synchronously; 2 executes after the call stack empties.'
    ],
    explanation: 'Synchronous statements (1 and 3) execute immediately on the call stack. The setTimeout callback is queued into the event loop task queue and runs only after the stack is clear.'
  },
  {
    id: 'pq-async-02',
    topic: 'Async',
    difficulty: 'Medium',
    type: 'find_bug',
    title: 'Missing Await on Fetch Response',
    prompt: 'Why does "data" log as a Promise rather than parsed JSON objects?',
    code: `async function fetchUsers() {\n  const res = await fetch("/api/users");\n  const data = res.json();\n  console.log(data);\n}`,
    options: [
      'res.json() is an asynchronous method that returns a Promise and must be preceded by "await"',
      'res.json() does not exist on Response objects',
      'fetch() can only be called from inside a Web Worker',
      'Variables declared with const cannot hold JSON data'
    ],
    answer: 'res.json() is an asynchronous method that returns a Promise and must be preceded by "await"',
    hints: [
      'Clue 1: Reading and parsing the HTTP response body stream is an asynchronous operation.',
      'Clue 2: res.json() returns a Promise<any>.',
      'Near-Answer: You must use "const data = await res.json();".'
    ],
    explanation: 'The Response.prototype.json() method reads the full response stream to completion asynchronously, returning a Promise that must be awaited.'
  },
  {
    id: 'pq-async-03',
    topic: 'Async',
    difficulty: 'Hard',
    type: 'predict',
    title: 'Microtask vs Macrotask Queue Priority',
    prompt: 'What is the exact logged sequence?',
    code: `console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nconsole.log("D");`,
    options: ['A, D, C, B', 'A, B, C, D', 'A, D, B, C', 'C, A, D, B'],
    answer: 'A, D, C, B',
    hints: [
      'Clue 1: Synchronous logs run first: A, then D.',
      'Clue 2: Promise .then callbacks are Microtasks; setTimeout callbacks are Macrotasks.',
      'Near-Answer: Microtasks are drained before the next Macrotask runs.'
    ],
    explanation: 'Execution order: (1) Synchronous statements "A" and "D" run. (2) Microtasks (Promise resolutions) run immediately after the current turn: "C". (3) Macrotasks (timers) run last: "B".'
  }
];

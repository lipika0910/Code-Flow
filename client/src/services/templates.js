// CodeLab Starter Templates and Practice Challenges

export const TEMPLATES = {
  web: [
    {
      id: 'web-counter',
      name: 'Interactive Counter',
      desc: 'Learn DOM manipulation, event listeners, and state tracking.',
      html: `<div class="container">
  <h1>DOM State Counter</h1>
  <div id="counter-val">0</div>
  <div class="actions">
    <button id="decBtn">- Decrement</button>
    <button id="resetBtn">Reset</button>
    <button id="incBtn">+ Increment</button>
  </div>
</div>`,
      css: `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #0b132b;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.container {
  text-align: center;
  background: #1c2541;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid #3a506b;
  box-shadow: 0 8px 16px rgba(0,0,0,0.4);
}

#counter-val {
  font-size: 48px;
  font-weight: bold;
  color: #14b8a6;
  margin: 20px 0;
  transition: transform 0.15s ease;
}

button {
  background: #8b5cf6;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  margin: 0 6px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

button:hover {
  background: #7c3aed;
  transform: translateY(-2px);
}

button:active {
  transform: translateY(0);
}`,
      js: `// State variable
let count = 0;

const valEl = document.getElementById('counter-val');
const incBtn = document.getElementById('incBtn');
const decBtn = document.getElementById('decBtn');
const resetBtn = document.getElementById('resetBtn');

function updateDisplay() {
  valEl.textContent = count;
  console.log('Count updated to: ' + count);
}

incBtn.addEventListener('click', () => {
  count++;
  updateDisplay();
});

decBtn.addEventListener('click', () => {
  count--;
  updateDisplay();
});

resetBtn.addEventListener('click', () => {
  count = 0;
  updateDisplay();
});`
    },
    {
      id: 'web-todo',
      name: 'Dynamic Task List',
      desc: 'Form submission, input reading, element creation, and item removal.',
      html: `<div class="todo-app">
  <h2>My Web Tasks</h2>
  <div class="input-row">
    <input type="text" id="taskInput" placeholder="Add a new task..." />
    <button id="addBtn">Add</button>
  </div>
  <ul id="taskList"></ul>
</div>`,
      css: `body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  padding-top: 40px;
  margin: 0;
}
.todo-app {
  width: 340px;
  background: #1e293b;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}
.input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
input {
  flex-grow: 1;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #475569;
  background: #0f172a;
  color: #fff;
}
button {
  background: #14b8a6;
  color: #0f172a;
  font-weight: bold;
  border: none;
  padding: 8px 14px;
  border-radius: 4px;
  cursor: pointer;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: #334155;
  border-radius: 4px;
  margin-bottom: 8px;
}
.delete-btn {
  background: #ef4444;
  color: #fff;
  border: none;
  padding: 2px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}`,
      js: `const input = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const list = document.getElementById('taskList');

function addTask() {
  const text = input.value.trim();
  if (!text) {
    console.warn('Cannot add an empty task');
    return;
  }

  const li = document.createElement('li');
  li.textContent = text;

  const delBtn = document.createElement('button');
  delBtn.textContent = '✕';
  delBtn.className = 'delete-btn';
  delBtn.onclick = () => {
    list.removeChild(li);
    console.log('Removed task: ' + text);
  };

  li.appendChild(delBtn);
  list.appendChild(li);
  console.log('Added task: ' + text);
  input.value = '';
}

addBtn.addEventListener('click', addTask);
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});`
    },
    {
      id: 'web-canvas',
      name: 'HTML5 Canvas Particle',
      desc: '2D context rendering and smooth requestAnimationFrame physics loop.',
      html: `<div style="text-align: center; padding: 20px;">
  <h3 style="color: #f8fafc; font-family: sans-serif;">Canvas Physics Sandbox</h3>
  <canvas id="myCanvas" width="400" height="260" style="background: #070b19; border: 1px solid #1e2a4a; border-radius: 8px;"></canvas>
</div>`,
      css: `body {
  background: #0e162b;
  margin: 0;
}`,
      js: `const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let x = 100;
let y = 100;
let vx = 3;
let vy = 2;
const radius = 15;

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ball
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#14b8a6';
  ctx.fill();
  ctx.closePath();

  // Move
  x += vx;
  y += vy;

  // Bounce walls
  if (x + radius > canvas.width || x - radius < 0) {
    vx = -vx;
    console.log('Bounced X wall at ' + x);
  }
  if (y + radius > canvas.height || y - radius < 0) {
    vy = -vy;
    console.log('Bounced Y wall at ' + y);
  }

  requestAnimationFrame(animate);
}

console.log('Starting canvas animation loop');
animate();`
    }
  ],

  js: [
    {
      id: 'js-array-methods',
      name: 'Array Methods (map, filter, reduce)',
      desc: 'Transform collections immutably using modern functional JavaScript.',
      code: `// Sample student dataset
const students = [
  { name: 'Aisha', score: 92, major: 'CS' },
  { name: 'Liam', score: 68, major: 'Math' },
  { name: 'Maya', score: 85, major: 'CS' },
  { name: 'Noah', score: 74, major: 'Physics' }
];

console.log('--- 1. FILTERING (Score >= 75) ---');
const honorRoll = students.filter(s => s.score >= 75);
console.log(honorRoll);

console.log('--- 2. MAPPING (Names only) ---');
const names = honorRoll.map(s => s.name.toUpperCase());
console.log('Honor Roll Names:', names.join(', '));

console.log('--- 3. REDUCING (Average Score) ---');
const total = students.reduce((sum, s) => sum + s.score, 0);
const avg = total / students.length;
console.log('Class Average Score:', avg);`
    },
    {
      id: 'js-closure',
      name: 'Closures & Factory Functions',
      desc: 'Encapsulating private state through function scopes.',
      code: `function createBankAccount(initialBalance) {
  // Private variable accessible only via closure
  let balance = initialBalance;

  return {
    deposit(amount) {
      if (amount <= 0) throw new Error('Deposit must be positive');
      balance += amount;
      console.log('Deposited $' + amount + ' | New Balance: $' + balance);
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) {
        console.warn('Insufficient funds: $' + balance + ' available');
        return false;
      }
      balance -= amount;
      console.log('Withdrew $' + amount + ' | Remaining: $' + balance);
      return balance;
    },
    getBalance() {
      return balance;
    }
  };
}

const myAccount = createBankAccount(100);
myAccount.deposit(50);
myAccount.withdraw(30);
myAccount.withdraw(200); // Triggers warning
console.log('Final check: $' + myAccount.getBalance());`
    },
    {
      id: 'js-async',
      name: 'Async / Await Simulation',
      desc: 'Simulating API responses with Promises and delayed resolution.',
      code: `function fetchUserData(userId) {
  console.log('Initiating network request for user ' + userId + '...');
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userId === 404) {
        reject(new Error('User not found'));
      } else {
        resolve({ id: userId, username: 'dev_student_' + userId, role: 'Learner' });
      }
    }, 400);
  });
}

async function loadProfile() {
  try {
    const user = await fetchUserData(42);
    console.log('Successfully received user payload:');
    console.log(user);
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
}

loadProfile();`
    }
  ]
};

export const CHALLENGES = [
  {
    id: 'ch-sum-even',
    title: 'Challenge: Sum of Even Numbers',
    mode: 'js',
    starter: `function sumEvens(numbers) {
  let total = 0;
  // TODO: Loop through numbers and add only even integers to total
  for (let i = 0; i <= numbers.length; i++) {
    // There is a bug and missing condition here!
    total += numbers[i];
  }
  return total;
}

console.log('Test [1, 2, 3, 4, 5, 6]:', sumEvens([1, 2, 3, 4, 5, 6])); // Expected: 12
console.log('Test [2, 4, 6]:', sumEvens([2, 4, 6])); // Expected: 12`,
    hints: [
      'Clue 1: Check your loop boundary. An array of length N has indexes from 0 to N-1.',
      'Clue 2: Use the modulo operator (num % 2 === 0) to verify if an integer is even.',
      'Near-Answer: Replace "i <= numbers.length" with "i < numbers.length", and wrap total += in if (numbers[i] % 2 === 0).'
    ],
    expectedOutcome: 'Returns 12 for [1, 2, 3, 4, 5, 6] without NaN or out-of-bounds index errors.'
  },
  {
    id: 'ch-dom-toggle',
    title: 'Challenge: Card Dark Mode Toggle',
    mode: 'web',
    html: `<div id="card" class="card light-theme">
  <h3>Profile Card</h3>
  <p>Status: Active Student</p>
  <button id="toggleBtn">Toggle Theme</button>
</div>`,
    css: `body { font-family: sans-serif; display: flex; justify-content: center; padding-top: 40px; }
.card { padding: 24px; border-radius: 8px; border: 1px solid #ccc; text-align: center; }
.light-theme { background: #ffffff; color: #111; }
.dark-theme { background: #0f172a; color: #f8fafc; border-color: #334155; }
button { padding: 8px 16px; border-radius: 4px; cursor: pointer; }`,
    js: `// Add click listener to toggle between light-theme and dark-theme
const btn = document.getElementById('toggleBtn');
const card = document.getElementById('card');

btn.addEventListener('click', () => {
  // TODO: Use card.classList.toggle(...)
  console.log('Theme button clicked');
});`,
    hints: [
      'Clue 1: Inspect the class attribute on #card. It begins with "light-theme".',
      'Clue 2: Use element.classList.toggle() or replace classes.',
      'Near-Answer: card.classList.toggle("dark-theme"); card.classList.toggle("light-theme");'
    ],
    expectedOutcome: 'Clicking the button seamlessly flips the card between white background and dark navy.'
  }
];

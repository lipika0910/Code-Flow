// 10 Classic JavaScript Misconception Programs for Predict → Execute → Compare

export const PREDICT_PROGRAMS = [
  {
    id: 'pred-coercion-add-sub',
    title: 'Type Coercion: Addition vs Subtraction',
    topic: 'Type Coercion',
    code: `console.log("5" + 2);
console.log("5" - 2);
console.log("5" + 2 - 1);`,
    expectedOutput: `52\n3\n51`,
    misconceptionNote: `In JavaScript, the '+' operator triggers string concatenation if either operand is a string ('5' + 2 becomes "52"). However, the '-' operator is purely arithmetic, so JavaScript forces conversion of the string to a number ('5' - 2 becomes 3). In the third line, ("5" + 2) evaluates first to "52", and then "52" - 1 coerces to the number 51!`,
    recommendedLesson: 'JavaScript Variables: let, const & Types',
    recommendedLessonSlug: 'js-variables'
  },
  {
    id: 'pred-loose-equality',
    title: 'Loose (==) vs Strict (===) Equality',
    topic: 'Equality',
    code: `console.log(0 == "0");
console.log(0 === "0");
console.log(false == "0");
console.log(null == undefined);
console.log(null === undefined);`,
    expectedOutput: `true\nfalse\ntrue\ntrue\nfalse`,
    misconceptionNote: `Loose equality (==) performs implicit type conversion according to the Abstract Equality Comparison Algorithm: 0 == "0" converts "0" to 0 (true); false == "0" converts false to 0 and "0" to 0 (true); and null == undefined is explicitly defined as true. Strict equality (===) checks both value and type without conversion, so all comparisons of differing types evaluate to false.`,
    recommendedLesson: 'Control Flow, Conditionals & Truthiness',
    recommendedLessonSlug: 'js-conditionals'
  },
  {
    id: 'pred-loop-var-closure',
    title: 'Loop Closures with var vs let',
    topic: 'Closures & Scopes',
    code: `var funcs = [];
for (var i = 0; i < 3; i++) {
  funcs.push(function() { return i; });
}

console.log(funcs[0]());
console.log(funcs[1]());
console.log(funcs[2]());`,
    expectedOutput: `3\n3\n3`,
    misconceptionNote: `Because 'var' is function-scoped (or globally scoped), there is only one shared variable 'i' across all iterations of the loop. When the closures execute after the loop has completed, 'i' has already reached 3. Replacing 'var' with block-scoped 'let' creates a fresh binding of 'i' per iteration, producing 0, 1, and 2.`,
    recommendedLesson: 'Functions, Scopes & Closures',
    recommendedLessonSlug: 'js-functions'
  },
  {
    id: 'pred-array-sort-default',
    title: 'Default Array.prototype.sort Behavior',
    topic: 'Array Methods',
    code: `let numbers = [10, 5, 20, 1, 100];
numbers.sort();
console.log(numbers.join(", "));`,
    expectedOutput: `1, 10, 100, 20, 5`,
    misconceptionNote: `By default, JavaScript's sort() method converts elements to strings and compares their UTF-16 code unit values lexicographically. Therefore, "100" comes before "20" and "5", just like words in a dictionary. To sort numerically, you must pass a comparator function: (a, b) => a - b.`,
    recommendedLesson: 'Arrays & Functional Iteration',
    recommendedLessonSlug: 'js-arrays'
  },
  {
    id: 'pred-float-precision',
    title: 'IEEE 754 Floating Point Arithmetic',
    topic: 'Numbers & Math',
    code: `console.log(0.1 + 0.2 === 0.3);
console.log(0.1 + 0.2);`,
    expectedOutput: `false\n0.30000000000000004`,
    misconceptionNote: `JavaScript represents numbers using the IEEE 754 standard 64-bit binary floating-point format. Decimal fractions like 0.1 and 0.2 cannot be represented precisely in finite binary digits, leading to tiny rounding discrepancies. To safely compare floats, check if Math.abs(a - b) < Number.EPSILON.`,
    recommendedLesson: 'JavaScript Variables: let, const & Types',
    recommendedLessonSlug: 'js-variables'
  },
  {
    id: 'pred-array-mutation-push',
    title: 'Array Mutation & Return Values',
    topic: 'Arrays',
    code: `let arr = [1, 2, 3];
let result = arr.push(4);

console.log(result);
console.log(arr.length);`,
    expectedOutput: `4\n4`,
    misconceptionNote: `Many developers mistakenly expect arr.push() to return the updated array [1, 2, 3, 4]. In reality, push() mutates the original array and returns the NEW LENGTH of the array (which is 4).`,
    recommendedLesson: 'Arrays & Functional Iteration',
    recommendedLessonSlug: 'js-arrays'
  },
  {
    id: 'pred-object-reference-mutation',
    title: 'Object References and Mutation',
    topic: 'Objects & Memory',
    code: `let user1 = { name: "Alex", score: 80 };
let user2 = user1;

user2.score = 95;

console.log(user1.score);
console.log(user2.score);`,
    expectedOutput: `95\n95`,
    misconceptionNote: `In JavaScript, objects are non-primitive types passed and assigned by reference, not by value. 'user2 = user1' copies the memory pointer, not the object. Therefore, mutating user2.score alters the single shared object in memory!`,
    recommendedLesson: 'Objects & Object-Oriented Patterns',
    recommendedLessonSlug: 'js-objects'
  },
  {
    id: 'pred-hoisting-temporal-dead-zone',
    title: 'Hoisting & Temporal Dead Zone (TDZ)',
    topic: 'Hoisting & Scope',
    code: `console.log(typeof notDeclared);
console.log(typeof declaredLater);
var declaredLater = 42;`,
    expectedOutput: `undefined\nundefined`,
    misconceptionNote: `'typeof notDeclared' returns "undefined" safely for undeclared identifiers. 'declaredLater' is declared with 'var', so its declaration is hoisted to the top of the scope initialized to undefined (before being assigned 42 on line 3). If declaredLater had used 'let' or 'const', accessing it before declaration would throw a ReferenceError due to the Temporal Dead Zone.`,
    recommendedLesson: 'JavaScript Variables: let, const & Types',
    recommendedLessonSlug: 'js-variables'
  },
  {
    id: 'pred-loop-off-by-one',
    title: 'Off-By-One Array Indexing',
    topic: 'Loops',
    code: `let letters = ["a", "b", "c"];
for (let i = 0; i <= letters.length; i++) {
  console.log(letters[i]);
}`,
    expectedOutput: `a\nb\nc\nundefined`,
    misconceptionNote: `Array indices in JavaScript are zero-based (0 to length - 1). Because the loop condition is 'i <= letters.length', on the fourth iteration i is 3. Accessing letters[3] on a 3-element array does not crash with an OutOfBounds exception—it cleanly returns 'undefined'!`,
    recommendedLesson: 'Loops & Iteration: for, while & for..of',
    recommendedLessonSlug: 'js-loops'
  },
  {
    id: 'pred-truthy-falsy-objects',
    title: 'Truthy vs Falsy: Empty Objects and Arrays',
    topic: 'Truthiness',
    code: `console.log(Boolean([]));
console.log(Boolean({}));
console.log(Boolean(""));
console.log(Boolean(0));`,
    expectedOutput: `true\ntrue\nfalse\nfalse`,
    misconceptionNote: `In JavaScript, ALL objects and arrays (even empty ones like [] and {}) are truthy values! Only 8 values in JavaScript are falsy: false, 0, -0, 0n, "", null, undefined, and NaN.`,
    recommendedLesson: 'Control Flow, Conditionals & Truthiness',
    recommendedLessonSlug: 'js-conditionals'
  }
];

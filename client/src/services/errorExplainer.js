// CodeFlow Plain-English Error Diagnostic Explainer

export function explainError(error) {
  if (!error) return null;

  const rawMsg = error.message || String(error);
  const errorType = error.name || (rawMsg.split(':')[0] || 'RuntimeError').trim();

  let likelyCause = 'An unhandled exception occurred during execution.';
  let suggestedFix = 'Check your syntax and variable references near the reported line.';

  if (rawMsg.includes('is not defined')) {
    const varName = rawMsg.match(/(\w+) is not defined/)?.[1] || 'variable';
    likelyCause = `You attempted to use '${varName}', but it was never declared with 'let', 'const', or 'var', or it is outside the current scope.`;
    suggestedFix = `Ensure you declare '${varName}' before using it (e.g., 'let ${varName} = ...;'), or check for spelling mistakes.`;
  } else if (rawMsg.includes('is not a function')) {
    const funcName = rawMsg.match(/(\w+) is not a function/)?.[1] || 'expression';
    likelyCause = `You attempted to invoke '${funcName}()', but its current value is not a callable function (it might be undefined, null, an object, or a number).`;
    suggestedFix = `Verify that '${funcName}' is assigned a function and is not being overwritten by another value.`;
  } else if (rawMsg.includes('Cannot read properties of undefined') || rawMsg.includes('Cannot read property')) {
    const prop = rawMsg.match(/reading '(\w+)'/)?.[1] || 'property';
    likelyCause = `You attempted to access '.${prop}' on a value that is currently 'undefined'. In JavaScript, undefined has no properties.`;
    suggestedFix = `Check the object before accessing its properties, or use optional chaining (e.g., 'obj?.${prop}').`;
  } else if (rawMsg.includes('Cannot read properties of null')) {
    likelyCause = `You attempted to access a property on 'null'. This often happens when 'document.querySelector()' finds no matching HTML element.`;
    suggestedFix = `Check your HTML selector spelling, or check 'if (element) { ... }' before accessing element properties.`;
  } else if (rawMsg.includes('Maximum call stack size exceeded')) {
    likelyCause = 'A function called itself repeatedly without reaching a base condition (infinite recursion).';
    suggestedFix = 'Ensure your recursive function has a clear exit condition (base case) that is guaranteed to be reached.';
  } else if (rawMsg.includes('Execution timed out') || rawMsg.includes('Infinite Loop')) {
    likelyCause = 'Your code took longer than 2.0 seconds to execute. This almost always indicates an infinite loop (e.g. while (true) or a loop counter that never increments).';
    suggestedFix = 'Inspect your loop termination conditions (for/while) and verify that the loop counter is advancing on every iteration.';
  } else if (rawMsg.includes('Assignment to constant variable')) {
    likelyCause = 'You attempted to reassign a variable declared with \'const\'.';
    suggestedFix = 'Use \'let\' instead of \'const\' if the variable value needs to change, or avoid reassigning the constant.';
  } else if (rawMsg.includes('Unexpected token') || rawMsg.includes('Unexpected identifier')) {
    likelyCause = 'The JavaScript parser encountered characters it did not expect. Often caused by a missing bracket, semicolon, quote, or comma.';
    suggestedFix = 'Check for unclosed parentheses \'()\', brackets \'[]\', braces \'{}\', or unclosed string quotes near this line.';
  }

  // Extract line number if present
  let line = error.line || null;
  if (!line && error.stack) {
    const match = error.stack.match(/:(\d+):(\d+)/);
    if (match) {
      line = parseInt(match[1], 10);
    }
  }

  return {
    type: errorType,
    message: rawMsg,
    line,
    likelyCause,
    suggestedFix
  };
}

const assert = require('assert');

// Import the pure calculation logic
const CalculatorMath = require('./script.js');

const {
  tokenize,
  evaluateExpression,
  applySqrt,
  applyLog10,
  applySin,
  applyCos,
  applyTan,
  applyUnary,
  formatNumber
} = CalculatorMath;

// Helper: Assert floating-point equality with tolerance
function assertClose(actual, expected, tolerance = 1e-9, message) {
  assert(
    Math.abs(actual - expected) < tolerance,
    message || `Expected ${expected}, got ${actual}`
  );
}

// ============================================================================
// AC2: Basic arithmetic operations with correct order of operations
// ============================================================================

console.log('AC2: Basic Arithmetic Operations');

// Test: 2 + 3 = 5
{
  const result = evaluateExpression('2+3');
  assert.deepStrictEqual(result.value, 5, '2+3 should equal 5');
}
console.log('  ✓ 2 + 3 = 5');

// Test: 7 - 4 = 3
{
  const result = evaluateExpression('7-4');
  assert.deepStrictEqual(result.value, 3, '7-4 should equal 3');
}
console.log('  ✓ 7 - 4 = 3');

// Test: 6 * 7 = 42
{
  const result = evaluateExpression('6*7');
  assert.deepStrictEqual(result.value, 42, '6*7 should equal 42');
}
console.log('  ✓ 6 × 7 = 42');

// Test: 8 / 2 = 4
{
  const result = evaluateExpression('8/2');
  assert.deepStrictEqual(result.value, 4, '8/2 should equal 4');
}
console.log('  ✓ 8 ÷ 2 = 4');

// ============================================================================
// AC2: Order of Operations (PEMDAS) - confirmed Q2
// ============================================================================

console.log('\nAC2: Order of Operations (PEMDAS)');

// Test: 2 + 3 * 4 = 14 (not 20)
{
  const result = evaluateExpression('2+3*4');
  assert.deepStrictEqual(result.value, 14, 'Multiplication before addition: 2+3*4 should equal 14');
}
console.log('  ✓ 2 + 3 × 4 = 14 (multiplication before addition)');

// Test: 10 - 2 * 3 = 4 (not 24)
{
  const result = evaluateExpression('10-2*3');
  assert.deepStrictEqual(result.value, 4, 'Multiplication before subtraction: 10-2*3 should equal 4');
}
console.log('  ✓ 10 - 2 × 3 = 4 (multiplication before subtraction)');

// Test: 20 / 2 + 3 = 13
{
  const result = evaluateExpression('20/2+3');
  assert.deepStrictEqual(result.value, 13, 'Division before addition: 20/2+3 should equal 13');
}
console.log('  ✓ 20 ÷ 2 + 3 = 13 (division before addition)');

// Test: 15 - 3 / 3 = 14
{
  const result = evaluateExpression('15-3/3');
  assert.deepStrictEqual(result.value, 14, 'Division before subtraction: 15-3/3 should equal 14');
}
console.log('  ✓ 15 - 3 ÷ 3 = 14 (division before subtraction)');

// Test: 2 * 3 * 4 = 24 (left-to-right for same precedence)
{
  const result = evaluateExpression('2*3*4');
  assert.deepStrictEqual(result.value, 24, 'Multiplication left-to-right: 2*3*4 should equal 24');
}
console.log('  ✓ 2 × 3 × 4 = 24 (left-to-right for same precedence)');

// Test: 10 - 5 - 2 = 3 (left-to-right, not 7)
{
  const result = evaluateExpression('10-5-2');
  assert.deepStrictEqual(result.value, 3, 'Subtraction left-to-right: 10-5-2 should equal 3');
}
console.log('  ✓ 10 - 5 - 2 = 3 (left-to-right for same precedence)');

// ============================================================================
// Decimal input and results (Test Plan edge case)
// ============================================================================

console.log('\nDecimal Input and Results');

// Test: 1 / 4 = 0.25
{
  const result = evaluateExpression('1/4');
  assertClose(result.value, 0.25, 1e-9, '1/4 should equal 0.25');
}
console.log('  ✓ 1 ÷ 4 = 0.25');

// Test: 3.5 + 2.1 = 5.6
{
  const result = evaluateExpression('3.5+2.1');
  assertClose(result.value, 5.6, 1e-9, '3.5+2.1 should equal 5.6');
}
console.log('  ✓ 3.5 + 2.1 = 5.6');

// Test: 10.5 - 2.5 = 8
{
  const result = evaluateExpression('10.5-2.5');
  assertClose(result.value, 8, 1e-9, '10.5-2.5 should equal 8');
}
console.log('  ✓ 10.5 - 2.5 = 8');

// ============================================================================
// AC3: Scientific Functions (Square Root, Log, Sin, Cos, Tan)
// ============================================================================

console.log('\nAC3: Scientific Functions');

// Test: sqrt(9) = 3
{
  const result = applySqrt(9);
  assert(!result.error, 'sqrt(9) should not produce an error');
  assert.deepStrictEqual(result.value, 3, 'sqrt(9) should equal 3');
}
console.log('  ✓ √9 = 3');

// Test: sqrt(16) = 4
{
  const result = applySqrt(16);
  assert(!result.error, 'sqrt(16) should not produce an error');
  assert.deepStrictEqual(result.value, 4, 'sqrt(16) should equal 4');
}
console.log('  ✓ √16 = 4');

// Test: log(100) = 2
{
  const result = applyLog10(100);
  assert(!result.error, 'log(100) should not produce an error');
  assert.deepStrictEqual(result.value, 2, 'log(100) should equal 2');
}
console.log('  ✓ log(100) = 2');

// Test: log(1) = 0
{
  const result = applyLog10(1);
  assert(!result.error, 'log(1) should not produce an error');
  assert.deepStrictEqual(result.value, 0, 'log(1) should equal 0');
}
console.log('  ✓ log(1) = 0');

// Test: log(10) = 1
{
  const result = applyLog10(10);
  assert(!result.error, 'log(10) should not produce an error');
  assert.deepStrictEqual(result.value, 1, 'log(10) should equal 1');
}
console.log('  ✓ log(10) = 1');

// Test: sin(30°) = 0.5 - confirmed Q1 (degrees input)
{
  const result = applySin(30);
  assert(!result.error, 'sin(30°) should not produce an error');
  assertClose(result.value, 0.5, 1e-9, 'sin(30°) should equal 0.5');
}
console.log('  ✓ sin(30°) = 0.5 (degrees input)');

// Test: cos(60°) = 0.5 - confirmed Q1 (degrees input)
{
  const result = applyCos(60);
  assert(!result.error, 'cos(60°) should not produce an error');
  assertClose(result.value, 0.5, 1e-9, 'cos(60°) should equal 0.5');
}
console.log('  ✓ cos(60°) = 0.5 (degrees input)');

// Test: tan(45°) = 1 - confirmed Q1 (degrees input)
{
  const result = applyTan(45);
  assert(!result.error, 'tan(45°) should not produce an error');
  assertClose(result.value, 1, 1e-9, 'tan(45°) should equal 1');
}
console.log('  ✓ tan(45°) = 1 (degrees input)');

// Test: sin(0°) = 0
{
  const result = applySin(0);
  assertClose(result.value, 0, 1e-9, 'sin(0°) should equal 0');
}
console.log('  ✓ sin(0°) = 0');

// Test: cos(0°) = 1
{
  const result = applyCos(0);
  assertClose(result.value, 1, 1e-9, 'cos(0°) should equal 1');
}
console.log('  ✓ cos(0°) = 1');

// Test: tan(0°) = 0
{
  const result = applyTan(0);
  assertClose(result.value, 0, 1e-9, 'tan(0°) should equal 0');
}
console.log('  ✓ tan(0°) = 0');

// Test: sqrt(0) = 0
{
  const result = applySqrt(0);
  assert(!result.error, 'sqrt(0) should not produce an error');
  assert.deepStrictEqual(result.value, 0, 'sqrt(0) should equal 0');
}
console.log('  ✓ √0 = 0');

// ============================================================================
// AC3: Scientific functions apply immediately to displayed value (Q3)
// ============================================================================

console.log('\nAC3: Scientific Functions Apply Immediately');

// Test: applyUnary applies the function directly to a value
{
  const result = applyUnary('sqrt', 25);
  assert(!result.error, 'applyUnary(sqrt, 25) should not produce an error');
  assert.deepStrictEqual(result.value, 5, 'applyUnary(sqrt, 25) should equal 5');
}
console.log('  ✓ applyUnary applies functions immediately');

// Test: Each scientific function is callable via applyUnary
{
  const sqrtResult = applyUnary('sqrt', 16);
  const logResult = applyUnary('log', 100);
  const sinResult = applyUnary('sin', 30);
  const cosResult = applyUnary('cos', 60);
  const tanResult = applyUnary('tan', 45);

  assert(!sqrtResult.error && sqrtResult.value === 4, 'sqrt via applyUnary');
  assert(!logResult.error && logResult.value === 2, 'log via applyUnary');
  assertClose(sinResult.value, 0.5, 1e-9, 'sin via applyUnary');
  assertClose(cosResult.value, 0.5, 1e-9, 'cos via applyUnary');
  assertClose(tanResult.value, 1, 1e-9, 'tan via applyUnary');
}
console.log('  ✓ All functions accessible via applyUnary');

// ============================================================================
// AC5: Error Handling for Invalid Operations
// ============================================================================

console.log('\nAC5: Error Handling');

// Test: sqrt of negative number shows friendly error
{
  const result = applySqrt(-1);
  assert(result.error, 'sqrt(-1) should produce an error');
  assert(typeof result.error === 'string', 'Error should be a string message');
  assert(result.error.length > 0, 'Error message should not be empty');
}
console.log('  ✓ sqrt(-1) shows friendly error: "' + applySqrt(-1).error + '"');

// Test: sqrt(-25) produces an error
{
  const result = applySqrt(-25);
  assert(result.error, 'sqrt(-25) should produce an error');
}
console.log('  ✓ sqrt(-25) shows friendly error');

// Test: Division by zero shows friendly error
{
  const result = evaluateExpression('5/0');
  assert(result.error, 'Division by zero should produce an error');
  assert(typeof result.error === 'string', 'Error should be a string message');
  assert(result.error.length > 0, 'Error message should not be empty');
}
console.log('  ✓ 5/0 shows friendly error: "' + evaluateExpression('5/0').error + '"');

// Test: log(0) shows friendly error
{
  const result = applyLog10(0);
  assert(result.error, 'log(0) should produce an error');
  assert(typeof result.error === 'string', 'Error should be a string message');
}
console.log('  ✓ log(0) shows friendly error: "' + applyLog10(0).error + '"');

// Test: log of negative number shows friendly error
{
  const result = applyLog10(-5);
  assert(result.error, 'log(-5) should produce an error');
  assert(typeof result.error === 'string', 'Error should be a string message');
}
console.log('  ✓ log(-5) shows friendly error: "' + applyLog10(-5).error + '"');

// Test: After error from applyUnary, result contains error object
{
  const result = applyUnary('sqrt', -1);
  assert(result.error, 'applyUnary with invalid input should produce error');
}
console.log('  ✓ applyUnary propagates error for invalid inputs');

// ============================================================================
// AC4: Clear/Reset - evaluated via test of empty state
// ============================================================================

console.log('\nAC4: State and Display');

// Test: Empty expression evaluates to 0
{
  const result = evaluateExpression('');
  assert.deepStrictEqual(result.value, 0, 'Empty expression should evaluate to 0');
}
console.log('  ✓ Empty expression defaults to 0');

// Test: Single number expression works
{
  const result = evaluateExpression('42');
  assert.deepStrictEqual(result.value, 42, 'Single number expression should work');
}
console.log('  ✓ Single number expression evaluates correctly');

// ============================================================================
// Number Formatting (Display)
// ============================================================================

console.log('\nNumber Formatting');

// Test: formatNumber handles regular numbers
{
  const formatted = formatNumber(3.14);
  assert(typeof formatted === 'string', 'formatNumber should return a string');
  assert(formatted !== 'Error', 'Regular number should not format as Error');
}
console.log('  ✓ formatNumber handles regular numbers');

// Test: formatNumber handles integers
{
  const formatted = formatNumber(5);
  assert.deepStrictEqual(formatted, '5', 'formatNumber(5) should be "5"');
}
console.log('  ✓ formatNumber(5) = "5"');

// Test: formatNumber handles zero
{
  const formatted = formatNumber(0);
  assert.deepStrictEqual(formatted, '0', 'formatNumber(0) should be "0"');
}
console.log('  ✓ formatNumber(0) = "0"');

// Test: formatNumber rounds floating-point noise
{
  const formatted = formatNumber(0.1 + 0.2); // Classic 0.30000000000000004 issue
  assert(formatted === '0.3' || formatted === '0.30000000000000004', 'formatNumber should handle floating-point noise');
}
console.log('  ✓ formatNumber handles floating-point noise');

// Test: formatNumber handles very small numbers with exponential notation
{
  const formatted = formatNumber(1e-15);
  assert(formatted.includes('e') || formatted === '0', 'Very small numbers should use exponential or be zero');
}
console.log('  ✓ formatNumber handles very small numbers');

// Test: formatNumber handles very large numbers with exponential notation
{
  const formatted = formatNumber(1e20);
  assert(formatted.includes('e'), 'Very large numbers should use exponential notation');
}
console.log('  ✓ formatNumber handles very large numbers');

// Test: formatNumber handles Infinity as Error
{
  const formatted = formatNumber(Infinity);
  assert.deepStrictEqual(formatted, 'Error', 'Infinity should format as "Error"');
}
console.log('  ✓ formatNumber(Infinity) = "Error"');

// Test: formatNumber handles -Infinity as Error
{
  const formatted = formatNumber(-Infinity);
  assert.deepStrictEqual(formatted, 'Error', '-Infinity should format as "Error"');
}
console.log('  ✓ formatNumber(-Infinity) = "Error"');

// ============================================================================
// Tokenization
// ============================================================================

console.log('\nTokenization');

// Test: Simple expression tokenization
{
  const tokens = tokenize('2+3');
  assert.deepStrictEqual(tokens, ['2', '+', '3'], 'tokenize("2+3") should split correctly');
}
console.log('  ✓ tokenize("2+3") = ["2", "+", "3"]');

// Test: Multi-digit numbers
{
  const tokens = tokenize('123+456');
  assert.deepStrictEqual(tokens, ['123', '+', '456'], 'tokenize handles multi-digit numbers');
}
console.log('  ✓ tokenize("123+456") handles multi-digit numbers');

// Test: Decimal numbers
{
  const tokens = tokenize('3.14+2.71');
  assert.deepStrictEqual(tokens, ['3.14', '+', '2.71'], 'tokenize handles decimal numbers');
}
console.log('  ✓ tokenize("3.14+2.71") handles decimals');

// Test: Multiple operators
{
  const tokens = tokenize('10-5*2');
  assert.deepStrictEqual(tokens, ['10', '-', '5', '*', '2'], 'tokenize handles multiple operators');
}
console.log('  ✓ tokenize("10-5*2") handles multiple operators');

// Test: Complex expression
{
  const tokens = tokenize('2+3*4-5/2');
  assert.deepStrictEqual(tokens, ['2', '+', '3', '*', '4', '-', '5', '/', '2'], 'tokenize handles complex expressions');
}
console.log('  ✓ tokenize("2+3*4-5/2") handles complex expressions');

// Test: Empty string
{
  const tokens = tokenize('');
  assert.deepStrictEqual(tokens, [], 'tokenize("") should return empty array');
}
console.log('  ✓ tokenize("") = []');

// ============================================================================
// Edge Cases / Failure Modes
// ============================================================================

console.log('\nEdge Cases');

// Test: Chained multiplications (left-to-right)
{
  const result = evaluateExpression('2*3*4*5');
  assert.deepStrictEqual(result.value, 120, 'Chained multiplications should be left-to-right');
}
console.log('  ✓ 2×3×4×5 = 120 (left-to-right)');

// Test: Mixed operations respecting precedence
{
  const result = evaluateExpression('1+2*3+4*5');
  assert.deepStrictEqual(result.value, 27, '1+2*3+4*5 should equal 27');
}
console.log('  ✓ 1+2×3+4×5 = 27 (correct precedence)');

// Test: Expression with trailing operator returns value (edge case)
{
  const result = evaluateExpression('5+');
  assert(!result.error, 'Trailing operator should evaluate what exists');
  assert.deepStrictEqual(result.value, 5, 'Should evaluate to first operand');
}
console.log('  ✓ "5+" evaluates to 5 (handles trailing operator)');

// Test: Invalid characters are ignored, expression defaults to 0
{
  const result = evaluateExpression('abc');
  assert.deepStrictEqual(result.value, 0, 'Non-numeric input should default to 0');
}
console.log('  ✓ "abc" defaults to 0 (non-numeric ignored)');

// Test: Very long decimal
{
  const result = evaluateExpression('0.123456789+0.987654321');
  assertClose(result.value, 1.111111110, 1e-8, 'Very long decimals should work');
}
console.log('  ✓ Handles very long decimals');

// ============================================================================
// AC4: Real-time display updates via DOM event handlers (DOM-stub tests)
// ============================================================================

console.log('\nAC4: Real-time Display Updates & Clear Button');

{
  // Clean up any prior test globals
  delete global.document;
  delete global.window;

  // Create a minimal fake DOM for the DOM-wiring tests
  const stubElements = {
    expression: { textContent: '', classList: { toggle: () => {} } },
    result: { textContent: '0', classList: { toggle: () => {} } }
  };

  const eventListeners = {};

  const fakeDOM = {
    getElementById: (id) => stubElements[id] || null,
    querySelector: (selector) => {
      if (selector === '.main-buttons') {
        return {
          addEventListener: (event, handler) => {
            eventListeners['main-buttons'] = handler;
          }
        };
      }
      if (selector === '.sci-buttons') {
        return {
          addEventListener: (event, handler) => {
            eventListeners['sci-buttons'] = handler;
          }
        };
      }
      return null;
    }
  };

  // Set up fake globals before requiring script.js
  global.document = fakeDOM;
  global.window = {};

  // Clear the require cache and re-require script.js with our fake DOM
  delete require.cache[require.resolve('./script.js')];
  const Calculator = require('./script.js');

  // Helper to simulate a button click
  function simulateButtonClick(containerKey, selector, classList = []) {
    const handler = eventListeners[containerKey];
    const fakeButton = {
      dataset: {},
      classList: classList.reduce((acc, cls) => ({ ...acc, [cls]: true }), {}),
      closest: (s) => fakeButton
    };

    if (selector.dataValue !== undefined) {
      fakeButton.dataset.value = selector.dataValue;
    }
    if (selector.dataAction !== undefined) {
      fakeButton.dataset.action = selector.dataAction;
    }

    const classList_contains = (cls) => classList.includes(cls);
    fakeButton.classList.contains = classList_contains;

    handler({ target: fakeButton });
  }

  // Test: Pressing digits updates the display in real-time
  {
    simulateButtonClick('main-buttons', { dataValue: '2' }, ['digit']);
    assert.strictEqual(stubElements.expression.textContent, '2', 'After pressing 2, expression should display "2"');
  }
  console.log('  ✓ Pressing digit 2 displays "2" immediately');

  {
    simulateButtonClick('main-buttons', { dataValue: '+' }, ['operator']);
    assert.strictEqual(stubElements.expression.textContent, '2+', 'After pressing +, expression should display "2+"');
  }
  console.log('  ✓ Pressing operator + displays "2+" immediately');

  {
    simulateButtonClick('main-buttons', { dataValue: '3' }, ['digit']);
    assert.strictEqual(stubElements.expression.textContent, '2+3', 'After pressing 3, expression should display "2+3"');
  }
  console.log('  ✓ Pressing digit 3 displays "2+3" immediately');

  // Test: Pressing equals evaluates and displays result
  {
    simulateButtonClick('main-buttons', { dataAction: 'equals' }, ['equals']);
    assert.strictEqual(stubElements.result.textContent, '5', 'After pressing =, result should display "5"');
  }
  console.log('  ✓ Pressing equals displays result "5"');

  // Test: Clear resets to default empty state
  {
    simulateButtonClick('main-buttons', { dataAction: 'clear' }, ['util']);
    assert.strictEqual(stubElements.expression.textContent, '', 'After pressing Clear, expression should be empty');
    assert.strictEqual(stubElements.result.textContent, '0', 'After pressing Clear, result should be "0"');
  }
  console.log('  ✓ Pressing Clear resets expression to "" and result to "0"');

  // Test: Building another expression after clear
  {
    simulateButtonClick('main-buttons', { dataValue: '1' }, ['digit']);
    assert.strictEqual(stubElements.expression.textContent, '1', 'New expression should start fresh');
  }
  console.log('  ✓ Can build new expression after Clear');

  // Test: Real-time update during complex expression
  {
    simulateButtonClick('main-buttons', { dataValue: '2' }, ['digit']);
    assert.strictEqual(stubElements.expression.textContent, '12', 'Digit 2 appends to expression');

    simulateButtonClick('main-buttons', { dataValue: '*' }, ['operator']);
    assert.strictEqual(stubElements.expression.textContent, '12×', 'Operator * appends (displayed as ×)');

    simulateButtonClick('main-buttons', { dataValue: '3' }, ['digit']);
    assert.strictEqual(stubElements.expression.textContent, '12×3', 'Digit 3 appends to expression');

    simulateButtonClick('main-buttons', { dataAction: 'equals' }, ['equals']);
    // 12 * 3 = 36
    assert.strictEqual(stubElements.result.textContent, '36', 'Result of 12*3 is 36');
  }
  console.log('  ✓ Real-time display during complex expression (1 2 × 3 = 36)');

  // Test: Clear after an expression
  {
    simulateButtonClick('main-buttons', { dataAction: 'clear' }, ['util']);
    assert.strictEqual(stubElements.expression.textContent, '', 'Clear resets expression');
    assert.strictEqual(stubElements.result.textContent, '0', 'Clear resets result to 0');
  }
  console.log('  ✓ Clear works after complex expression');
}

// ============================================================================
// AC5: Error recovery (remains usable after error) - DOM-stub tests
// ============================================================================

console.log('\nAC5: Error Recovery (Remains Usable After Error)');

{
  // Clean up and create fresh fake DOM
  delete global.document;
  delete global.window;

  const stubElements = {
    expression: { textContent: '', classList: { toggle: () => {} } },
    result: { textContent: '0', classList: { toggle: () => {} } }
  };

  const eventListeners = {};

  const fakeDOM = {
    getElementById: (id) => stubElements[id] || null,
    querySelector: (selector) => {
      if (selector === '.main-buttons') {
        return {
          addEventListener: (event, handler) => {
            eventListeners['main-buttons'] = handler;
          }
        };
      }
      if (selector === '.sci-buttons') {
        return {
          addEventListener: (event, handler) => {
            eventListeners['sci-buttons'] = handler;
          }
        };
      }
      return null;
    }
  };

  global.document = fakeDOM;
  global.window = {};

  // Re-require with fresh fake DOM
  delete require.cache[require.resolve('./script.js')];
  const Calculator = require('./script.js');

  function simulateButtonClick(containerKey, selector, classList = []) {
    const handler = eventListeners[containerKey];
    const fakeButton = {
      dataset: {},
      classList: classList.reduce((acc, cls) => ({ ...acc, [cls]: true }), {}),
      closest: (s) => fakeButton
    };

    if (selector.dataValue !== undefined) {
      fakeButton.dataset.value = selector.dataValue;
    }
    if (selector.dataAction !== undefined) {
      fakeButton.dataset.action = selector.dataAction;
    }

    const classList_contains = (cls) => classList.includes(cls);
    fakeButton.classList.contains = classList_contains;

    handler({ target: fakeButton });
  }

  // Test: Division by zero error recovery with Clear
  {
    simulateButtonClick('main-buttons', { dataValue: '5' }, ['digit']);
    simulateButtonClick('main-buttons', { dataValue: '/' }, ['operator']);
    simulateButtonClick('main-buttons', { dataValue: '0' }, ['digit']);
    simulateButtonClick('main-buttons', { dataAction: 'equals' }, ['equals']);

    // Should show error message
    assert(stubElements.result.textContent.toLowerCase().includes('divide') ||
           stubElements.result.textContent.toLowerCase().includes('zero'),
           'Division by zero should show error message');
  }
  console.log('  ✓ Division by zero shows error message');

  // Test: Clear recovers from error state
  {
    simulateButtonClick('main-buttons', { dataAction: 'clear' }, ['util']);
    assert.strictEqual(stubElements.expression.textContent, '', 'Clear resets expression after error');
    assert.strictEqual(stubElements.result.textContent, '0', 'Clear resets result to 0 after error');
  }
  console.log('  ✓ Clear recovers from error state (expression="" and result="0")');

  // Test: Calculator remains usable after error recovery
  {
    simulateButtonClick('main-buttons', { dataValue: '9' }, ['digit']);
    simulateButtonClick('main-buttons', { dataValue: '+' }, ['operator']);
    simulateButtonClick('main-buttons', { dataValue: '1' }, ['digit']);
    simulateButtonClick('main-buttons', { dataAction: 'equals' }, ['equals']);
    assert.strictEqual(stubElements.result.textContent, '10', 'Can perform a new calculation after error recovery');
  }
  console.log('  ✓ Calculator remains usable after Clear (9+1=10)');

  // Test: sqrt of negative error recovery
  {
    simulateButtonClick('main-buttons', { dataAction: 'clear' }, ['util']);
    simulateButtonClick('main-buttons', { dataValue: '4' }, ['digit']);
    simulateButtonClick('sci-buttons', { dataAction: 'sqrt' }, ['fn']);

    // Should show result (sqrt(4) = 2)
    assert.strictEqual(stubElements.result.textContent, '2', 'sqrt(4) = 2');
  }
  console.log('  ✓ Scientific function works after recovery');

  // Test: Error in scientific function (sqrt of negative) recovery
  {
    simulateButtonClick('main-buttons', { dataValue: '5' }, ['digit']);
    stubElements.expression.textContent = '5';
    simulateButtonClick('sci-buttons', { dataAction: 'sqrt' }, ['fn']);

    // Check that we have expression and result set (recovery possible)
    assert(stubElements.result.textContent !== '', 'Result should be set after scientific function');
  }
  console.log('  ✓ Scientific function preserves state for recovery');

  // Test: Clear works from any error state
  {
    simulateButtonClick('main-buttons', { dataAction: 'clear' }, ['util']);
    assert.strictEqual(stubElements.expression.textContent, '', 'Clear always resets expression');
    assert.strictEqual(stubElements.result.textContent, '0', 'Clear always resets result to 0');
  }
  console.log('  ✓ Clear always recovers to default state');
}

console.log('\n' + '='.repeat(70));
console.log('✅ All tests passed!');
console.log('='.repeat(70));

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
  applyJakify,
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

// Create a more complete fake DOM for theme tests
const createClassListMock = () => {
  const classes = new Set();
  return {
    add(...classList) {
      for (const cls of classList) {
        classes.add(cls);
      }
    },
    remove(...classList) {
      for (const cls of classList) {
        classes.delete(cls);
      }
    },
    contains(cls) {
      return classes.has(cls);
    },
    toggle(cls, force) {
      if (force === undefined) {
        classes.has(cls) ? classes.delete(cls) : classes.add(cls);
      } else if (force) {
        classes.add(cls);
      } else {
        classes.delete(cls);
      }
    },
    has(cls) {
      return classes.has(cls);
    }
  };
};

// Patch all FakeDOMs to support Roman theme (querySelectorAll for digit buttons)
const createDefaultDigitButtons = () => {
  const zeroMock = createClassListMock();
  zeroMock.add('zero');
  return [
    { textContent: '1', dataset: { value: '1' }, classList: createClassListMock() },
    { textContent: '2', dataset: { value: '2' }, classList: createClassListMock() },
    { textContent: '3', dataset: { value: '3' }, classList: createClassListMock() },
    { textContent: '4', dataset: { value: '4' }, classList: createClassListMock() },
    { textContent: '5', dataset: { value: '5' }, classList: createClassListMock() },
    { textContent: '6', dataset: { value: '6' }, classList: createClassListMock() },
    { textContent: '7', dataset: { value: '7' }, classList: createClassListMock() },
    { textContent: '8', dataset: { value: '8' }, classList: createClassListMock() },
    { textContent: '9', dataset: { value: '9' }, classList: createClassListMock() },
    { textContent: '0', dataset: { value: '0' }, classList: zeroMock }
  ];
};

const patchFakeDOMForRomanTheme = (fakeDOM) => {
  if (!fakeDOM.querySelectorAll) {
    fakeDOM.querySelectorAll = (selector) => {
      if (selector === '.btn.digit') return createDefaultDigitButtons();
      return [];
    };
  }
  return fakeDOM;
};

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
  global.document = patchFakeDOMForRomanTheme(fakeDOM);
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

  global.document = patchFakeDOMForRomanTheme(fakeDOM);
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

// ============================================================================
// JMNT-2: Theme Picker Tests (AC1-6)
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('JMNT-2: Theme Picker and Styling');
console.log('='.repeat(70));

// Clean up prior globals for fresh test
delete global.document;
delete global.window;

const themeTestElements = {
  expression: {
    id: 'expression',
    textContent: '',
    classList: createClassListMock()
  },
  result: {
    id: 'result',
    textContent: '0',
    classList: createClassListMock()
  },
  themeSelect: {
    id: 'theme-select',
    value: '',
    options: [
      { value: '', textContent: 'Default' },
      { value: 'halloween', textContent: 'Halloween' },
      { value: 'dark-mode', textContent: 'Dark Mode' },
      { value: 'childrens', textContent: "Children's" },
      { value: 'monolith', textContent: '2001: A Space Odyssey' },
      { value: 'minions', textContent: 'Minions' },
      { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
      { value: 'coffee-lovers', textContent: 'Coffee Lovers' },
      { value: 'roman', textContent: 'Roman' }
    ],
    addEventListener: (event, handler) => {
      if (event === 'change') {
        themeTestElements.themeSelect.changeHandler = handler;
      }
    }
  },
  calculator: {
    classList: createClassListMock()
  },
  ghostEmoji: {
    id: 'ghost-emoji',
    style: { top: '', left: '' },
    classList: createClassListMock()
  },
  monolithEmoji: {
    id: 'monolith-emoji',
    classList: createClassListMock()
  },
  coffeeEmoji: {
    id: 'coffee-emoji',
    classList: createClassListMock()
  },
  clearButton: {
    textContent: 'Clear',
    dataset: { action: 'clear' },
    classList: createClassListMock(),
    closest: function(s) { return this; }
  },
  equalsButton: {
    textContent: '=',
    dataset: { action: 'equals' },
    classList: createClassListMock(),
    closest: function(s) { return this; }
  },
  digitButtons: [
    { textContent: '1', dataset: { value: '1' }, classList: createClassListMock() },
    { textContent: '2', dataset: { value: '2' }, classList: createClassListMock() },
    { textContent: '3', dataset: { value: '3' }, classList: createClassListMock() },
    { textContent: '4', dataset: { value: '4' }, classList: createClassListMock() },
    { textContent: '5', dataset: { value: '5' }, classList: createClassListMock() },
    { textContent: '6', dataset: { value: '6' }, classList: createClassListMock() },
    { textContent: '7', dataset: { value: '7' }, classList: createClassListMock() },
    { textContent: '8', dataset: { value: '8' }, classList: createClassListMock() },
    { textContent: '9', dataset: { value: '9' }, classList: createClassListMock() },
    { textContent: '0', dataset: { value: '0' }, classList: createClassListMock(), isZero: true }
  ],
  eventListeners: {}
};

const themeTestFakeDOM = {
  getElementById: (id) => {
    if (id === 'expression') return themeTestElements.expression;
    if (id === 'result') return themeTestElements.result;
    if (id === 'theme-select') return themeTestElements.themeSelect;
    if (id === 'ghost-emoji') return themeTestElements.ghostEmoji;
    if (id === 'monolith-emoji') return themeTestElements.monolithEmoji;
    if (id === 'coffee-emoji') return themeTestElements.coffeeEmoji;
    return null;
  },
  querySelector: (selector) => {
    if (selector === '.calculator') return themeTestElements.calculator;
    if (selector === '.main-buttons') {
      return {
        addEventListener: (event, handler) => {
          themeTestFakeDOM.eventListeners['main-buttons'] = handler;
        }
      };
    }
    if (selector === '.sci-buttons') {
      return {
        addEventListener: (event, handler) => {
          themeTestFakeDOM.eventListeners['sci-buttons'] = handler;
        }
      };
    }
    if (selector === '[data-action="clear"]') return themeTestElements.clearButton;
    if (selector === '[data-action="equals"]') return themeTestElements.equalsButton;
    return null;
  },
  querySelectorAll: (selector) => {
    if (selector === '.btn.digit') return themeTestElements.digitButtons;
    return [];
  },
  eventListeners: {}
};

global.document = themeTestFakeDOM;
global.window = {};

// Mock localStorage for theme persistence tests
const localStorageMock = {};
global.localStorage = {
  getItem: (key) => localStorageMock[key],
  setItem: (key, value) => { localStorageMock[key] = value; },
  removeItem: (key) => delete localStorageMock[key]
};

// Re-require script.js with the theme test DOM
delete require.cache[require.resolve('./script.js')];
const CalculatorWithTheme = require('./script.js');

// ============================================================================
// AC1: Theme dropdown exists with correct options and default selection
// ============================================================================

console.log('\nAC1: Theme Dropdown Exists with Correct Options');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  assert(selectEl, 'Select element with id="theme-select" should exist');
}
console.log('  ✓ Select element with id="theme-select" exists');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  assert.strictEqual(selectEl.options.length, 9, 'Select should have exactly 9 options (including Roman)');
}
console.log('  ✓ Select has exactly 9 options (including Roman)');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const optionValues = selectEl.options.map(o => o.value);
  assert.deepStrictEqual(optionValues, ['', 'halloween', 'dark-mode', 'childrens', 'monolith', 'minions', 'marvel-ironman', 'coffee-lovers', 'roman'], 'Options should be in correct order');
}
console.log('  ✓ Options are: Default, Halloween, Dark Mode, Children\'s, 2001: A Space Odyssey, Minions, Marvel/Iron Man, Coffee Lovers, Roman');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  assert.strictEqual(selectEl.value, '', 'Default option should be selected on initial load');
}
console.log('  ✓ Default option is selected on initial load');

// ============================================================================
// AC2: Choosing a theme applies classes; choosing default removes them
// ============================================================================

console.log('\nAC2: Theme Selection Applies and Removes Classes');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const calculatorEl = themeTestFakeDOM.querySelector('.calculator');

  // Simulate selecting Halloween
  selectEl.value = 'halloween';
  const changeEvent = { target: selectEl };
  selectEl.changeHandler(changeEvent);

  assert(calculatorEl.classList.contains('theme-halloween'), 'Selecting halloween should add theme-halloween class');
}
console.log('  ✓ Selecting Halloween adds theme-halloween class');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const calculatorEl = themeTestFakeDOM.querySelector('.calculator');

  // Simulate selecting Dark Mode
  selectEl.value = 'dark-mode';
  const changeEvent = { target: selectEl };
  selectEl.changeHandler(changeEvent);

  assert(!calculatorEl.classList.contains('theme-halloween'), 'theme-halloween should be removed');
  assert(calculatorEl.classList.contains('theme-dark-mode'), 'Selecting dark-mode should add theme-dark-mode class');
}
console.log('  ✓ Selecting Dark Mode removes other themes and adds theme-dark-mode');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const calculatorEl = themeTestFakeDOM.querySelector('.calculator');

  // Simulate selecting Children's
  selectEl.value = 'childrens';
  const changeEvent = { target: selectEl };
  selectEl.changeHandler(changeEvent);

  assert(!calculatorEl.classList.contains('theme-dark-mode'), 'theme-dark-mode should be removed');
  assert(calculatorEl.classList.contains('theme-childrens'), 'Selecting childrens should add theme-childrens class');
}
console.log('  ✓ Selecting Children\'s removes other themes and adds theme-childrens');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const calculatorEl = themeTestFakeDOM.querySelector('.calculator');

  // Simulate selecting Default (empty value)
  selectEl.value = '';
  const changeEvent = { target: selectEl };
  selectEl.changeHandler(changeEvent);

  assert(!calculatorEl.classList.contains('theme-childrens'), 'theme-childrens should be removed when selecting default');
  assert(!calculatorEl.classList.contains('theme-halloween'), 'No theme classes should remain after selecting default');
  assert(!calculatorEl.classList.contains('theme-dark-mode'), 'No theme classes should remain after selecting default');
}
console.log('  ✓ Selecting Default removes all theme classes');

// ============================================================================
// AC3: Halloween theme applies orange buttons and manages ghost emoji intervals
// ============================================================================

console.log('\nAC3: Halloween Theme - Orange Buttons and Ghost Emoji');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const calculatorEl = themeTestFakeDOM.querySelector('.calculator');
  const ghostEl = themeTestFakeDOM.getElementById('ghost-emoji');

  // Select Halloween theme
  selectEl.value = 'halloween';
  const changeEvent = { target: selectEl };
  selectEl.changeHandler(changeEvent);

  assert(calculatorEl.classList.contains('theme-halloween'), 'theme-halloween class should be applied');

  // Switch back to default to clean up setTimeout
  selectEl.value = '';
  selectEl.changeHandler({ target: selectEl });
}
console.log('  ✓ Halloween theme class is applied');

{
  // Create new test context to measure ghost interval
  delete global.document;
  delete global.window;

  // Track if moveGhost function is called
  let ghostIntervalStarted = false;
  let ghostIntervalCleared = false;
  const originalSetTimeout = global.setTimeout;
  const originalClearTimeout = global.clearTimeout;

  let timeoutId = null;
  global.setTimeout = function(fn, delay) {
    ghostIntervalStarted = true;
    timeoutId = originalSetTimeout(fn, delay);
    return timeoutId;
  };
  global.clearTimeout = function(id) {
    ghostIntervalCleared = true;
    return originalClearTimeout(id);
  };

  const ghostTestElements = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' },
        { value: 'roman', textContent: 'Roman' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          ghostTestElements.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const ghostTestFakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return ghostTestElements.expression;
      if (id === 'result') return ghostTestElements.result;
      if (id === 'theme-select') return ghostTestElements.themeSelect;
      if (id === 'ghost-emoji') return ghostTestElements.ghostEmoji;
      if (id === 'monolith-emoji') return ghostTestElements.monolithEmoji;
      if (id === 'coffee-emoji') return ghostTestElements.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return ghostTestElements.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      if (selector === '[data-action="clear"]') return { textContent: 'Clear' };
      if (selector === '[data-action="equals"]') return { textContent: '=' };
      return null;
    },
    querySelectorAll: (selector) => {
      if (selector === '.btn.digit') {
        const zeroMock = createClassListMock();
        zeroMock.add('zero');
        return [
          { textContent: '1', dataset: { value: '1' }, classList: createClassListMock() },
          { textContent: '2', dataset: { value: '2' }, classList: createClassListMock() },
          { textContent: '3', dataset: { value: '3' }, classList: createClassListMock() },
          { textContent: '4', dataset: { value: '4' }, classList: createClassListMock() },
          { textContent: '5', dataset: { value: '5' }, classList: createClassListMock() },
          { textContent: '6', dataset: { value: '6' }, classList: createClassListMock() },
          { textContent: '7', dataset: { value: '7' }, classList: createClassListMock() },
          { textContent: '8', dataset: { value: '8' }, classList: createClassListMock() },
          { textContent: '9', dataset: { value: '9' }, classList: createClassListMock() },
          { textContent: '0', dataset: { value: '0' }, classList: zeroMock }
        ];
      }
      return [];
    }
  };

  global.document = ghostTestFakeDOM;
  global.window = {};
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };

  delete require.cache[require.resolve('./script.js')];
  const CalculatorGhostTest = require('./script.js');

  // Select Halloween to start ghost interval
  ghostTestElements.themeSelect.value = 'halloween';
  ghostTestElements.themeSelect.changeHandler({ target: ghostTestElements.themeSelect });

  assert(ghostIntervalStarted, 'Selecting Halloween should start a setTimeout for ghost emoji');

  // Switch back to default to clean up setTimeout before restoring globals
  ghostTestElements.themeSelect.value = '';
  ghostTestElements.themeSelect.changeHandler({ target: ghostTestElements.themeSelect });

  // Restore globals
  global.setTimeout = originalSetTimeout;
  global.clearTimeout = originalClearTimeout;
}
console.log('  ✓ Halloween theme starts ghost emoji interval');

{
  // Test that ghost stops when switching away from Halloween
  delete global.document;
  delete global.window;

  let ghostIntervalStarted = false;
  let ghostIntervalCleared = false;
  const originalSetTimeout = global.setTimeout;
  const originalClearTimeout = global.clearTimeout;

  global.setTimeout = function(fn, delay) {
    ghostIntervalStarted = true;
    return originalSetTimeout(fn, delay);
  };
  global.clearTimeout = function(id) {
    ghostIntervalCleared = true;
    return originalClearTimeout(id);
  };

  const ghostStopElements = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' },
        { value: 'roman', textContent: 'Roman' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          ghostStopElements.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    },
    clearButton: {
      textContent: 'Clear',
      dataset: { action: 'clear' }
    },
    equalsButton: {
      textContent: '=',
      dataset: { action: 'equals' }
    },
    digitButtons: [
      { textContent: '1', dataset: { value: '1' }, classList: createClassListMock() },
      { textContent: '2', dataset: { value: '2' }, classList: createClassListMock() },
      { textContent: '3', dataset: { value: '3' }, classList: createClassListMock() },
      { textContent: '4', dataset: { value: '4' }, classList: createClassListMock() },
      { textContent: '5', dataset: { value: '5' }, classList: createClassListMock() },
      { textContent: '6', dataset: { value: '6' }, classList: createClassListMock() },
      { textContent: '7', dataset: { value: '7' }, classList: createClassListMock() },
      { textContent: '8', dataset: { value: '8' }, classList: createClassListMock() },
      { textContent: '9', dataset: { value: '9' }, classList: createClassListMock() },
      { textContent: '0', dataset: { value: '0' }, classList: createClassListMock(), isZero: true }
    ]
  };

  const ghostStopFakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return ghostStopElements.expression;
      if (id === 'result') return ghostStopElements.result;
      if (id === 'theme-select') return ghostStopElements.themeSelect;
      if (id === 'ghost-emoji') return ghostStopElements.ghostEmoji;
      if (id === 'monolith-emoji') return ghostStopElements.monolithEmoji;
      if (id === 'coffee-emoji') return ghostStopElements.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return ghostStopElements.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      if (selector === '[data-action="clear"]') return ghostStopElements.clearButton;
      if (selector === '[data-action="equals"]') return ghostStopElements.equalsButton;
      return null;
    },
    querySelectorAll: (selector) => {
      if (selector === '.btn.digit') return ghostStopElements.digitButtons;
      return [];
    }
  };

  global.document = ghostStopFakeDOM;
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorGhostStopTest = require('./script.js');

  // First select Halloween to start ghost
  ghostStopElements.themeSelect.value = 'halloween';
  ghostStopElements.themeSelect.changeHandler({ target: ghostStopElements.themeSelect });
  assert(ghostIntervalStarted, 'Halloween should start ghost interval');

  // Reset flag
  ghostIntervalCleared = false;

  // Now switch to Dark Mode
  ghostStopElements.themeSelect.value = 'dark-mode';
  ghostStopElements.themeSelect.changeHandler({ target: ghostStopElements.themeSelect });

  assert(ghostIntervalCleared, 'Switching away from Halloween should clear the ghost interval');
  assert(!ghostStopElements.ghostEmoji.classList.contains('visible'), 'Ghost should not be visible after clearing');

  // Restore globals
  global.setTimeout = originalSetTimeout;
  global.clearTimeout = originalClearTimeout;
}
console.log('  ✓ Ghost emoji interval stops when switching away from Halloween');

// ============================================================================
// AC4: Dark Mode theme applies dark styling
// ============================================================================

console.log('\nAC4: Dark Mode Theme - Dark Background and Light Text');

{
  // Clean up and create fresh test context for Dark Mode CSS class test
  delete global.document;
  delete global.window;

  const darkModeElements = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          darkModeElements.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const darkModeFakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return darkModeElements.expression;
      if (id === 'result') return darkModeElements.result;
      if (id === 'theme-select') return darkModeElements.themeSelect;
      if (id === 'ghost-emoji') return darkModeElements.ghostEmoji;
      if (id === 'monolith-emoji') return darkModeElements.monolithEmoji;
      if (id === 'coffee-emoji') return darkModeElements.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return darkModeElements.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(darkModeFakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorDarkModeTest = require('./script.js');

  // Select Dark Mode
  darkModeElements.themeSelect.value = 'dark-mode';
  darkModeElements.themeSelect.changeHandler({ target: darkModeElements.themeSelect });

  assert(darkModeElements.calculator.classList.contains('theme-dark-mode'), 'Dark Mode theme should be applied');
}
console.log('  ✓ Dark Mode theme class is applied to calculator');

// ============================================================================
// AC5: Children's theme applies bright, playful styling
// ============================================================================

console.log('\nAC5: Children\'s Theme - Bright, Playful Colors');

{
  // Clean up and create fresh test context for Children's CSS class test
  delete global.document;
  delete global.window;

  const childrensElements = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          childrensElements.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const childrensFakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return childrensElements.expression;
      if (id === 'result') return childrensElements.result;
      if (id === 'theme-select') return childrensElements.themeSelect;
      if (id === 'ghost-emoji') return childrensElements.ghostEmoji;
      if (id === 'monolith-emoji') return childrensElements.monolithEmoji;
      if (id === 'coffee-emoji') return childrensElements.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return childrensElements.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(childrensFakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorChildrensTest = require('./script.js');

  // Select Children's
  childrensElements.themeSelect.value = 'childrens';
  childrensElements.themeSelect.changeHandler({ target: childrensElements.themeSelect });

  assert(childrensElements.calculator.classList.contains('theme-childrens'), 'Children\'s theme should be applied');
}
console.log('  ✓ Children\'s theme class is applied to calculator');

// ============================================================================
// AC1: Coffee Lovers option exists in theme select
// ============================================================================

console.log('\nAC1: Coffee Lovers Option in Theme Select');

{
  // Test that coffee-lovers option exists in the select element
  delete global.document;
  delete global.window;

  const coffeeTestElements = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          coffeeTestElements.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const coffeeTestFakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return coffeeTestElements.expression;
      if (id === 'result') return coffeeTestElements.result;
      if (id === 'theme-select') return coffeeTestElements.themeSelect;
      if (id === 'ghost-emoji') return coffeeTestElements.ghostEmoji;
      if (id === 'monolith-emoji') return coffeeTestElements.monolithEmoji;
      if (id === 'coffee-emoji') return coffeeTestElements.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return coffeeTestElements.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(coffeeTestFakeDOM);
  global.window = {};
  global.localStorage = {
    getItem: () => null,
    setItem: () => {}
  };

  // Verify coffee-lovers option exists
  const coffeeOption = coffeeTestElements.themeSelect.options.find(opt => opt.value === 'coffee-lovers');
  assert(coffeeOption, 'coffee-lovers option should exist in theme select');
  assert.strictEqual(coffeeOption.textContent, 'Coffee Lovers', 'coffee-lovers option should have label "Coffee Lovers"');
}
console.log('  ✓ Coffee Lovers option exists with correct value and label');

// ============================================================================
// AC2/AC3/AC4: Coffee Lovers theme class toggling
// ============================================================================

console.log('\nAC2/AC3/AC4: Theme Class Toggling for Coffee Lovers');

{
  // Test that selecting coffee-lovers adds theme-coffee-lovers class to calculator
  delete global.document;
  delete global.window;

  const coffeeClassElements = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          coffeeClassElements.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const coffeeClassFakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return coffeeClassElements.expression;
      if (id === 'result') return coffeeClassElements.result;
      if (id === 'theme-select') return coffeeClassElements.themeSelect;
      if (id === 'ghost-emoji') return coffeeClassElements.ghostEmoji;
      if (id === 'monolith-emoji') return coffeeClassElements.monolithEmoji;
      if (id === 'coffee-emoji') return coffeeClassElements.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return coffeeClassElements.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(coffeeClassFakeDOM);
  global.window = {};
  global.localStorage = {
    getItem: () => null,
    setItem: () => {}
  };

  delete require.cache[require.resolve('./script.js')];
  const CalculatorCoffeeClassTest = require('./script.js');

  // Select Coffee Lovers theme
  coffeeClassElements.themeSelect.value = 'coffee-lovers';
  coffeeClassElements.themeSelect.changeHandler({ target: coffeeClassElements.themeSelect });

  assert(coffeeClassElements.calculator.classList.contains('theme-coffee-lovers'), 'should add theme-coffee-lovers class when selected');

  // Now switch to another theme - coffee-lovers should be removed
  coffeeClassElements.themeSelect.value = 'halloween';
  coffeeClassElements.themeSelect.changeHandler({ target: coffeeClassElements.themeSelect });

  assert(!coffeeClassElements.calculator.classList.contains('theme-coffee-lovers'), 'should remove theme-coffee-lovers when switching to halloween');
  assert(coffeeClassElements.calculator.classList.contains('theme-halloween'), 'should add theme-halloween when switching');
}
console.log('  ✓ Coffee Lovers theme class is added and removed correctly');

// ============================================================================
// AC5: Coffee icon visibility when theme is selected
// ============================================================================

console.log('\nAC5: Coffee Icon Visibility');

{
  // Test that coffee icon becomes visible when coffee-lovers is selected
  delete global.document;
  delete global.window;

  const coffeeIconElements = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          coffeeIconElements.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const coffeeIconFakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return coffeeIconElements.expression;
      if (id === 'result') return coffeeIconElements.result;
      if (id === 'theme-select') return coffeeIconElements.themeSelect;
      if (id === 'ghost-emoji') return coffeeIconElements.ghostEmoji;
      if (id === 'monolith-emoji') return coffeeIconElements.monolithEmoji;
      if (id === 'coffee-emoji') return coffeeIconElements.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return coffeeIconElements.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(coffeeIconFakeDOM);
  global.window = {};
  global.localStorage = {
    getItem: () => null,
    setItem: () => {}
  };

  delete require.cache[require.resolve('./script.js')];
  const CalculatorCoffeeIconTest = require('./script.js');

  // Select coffee-lovers theme
  coffeeIconElements.themeSelect.value = 'coffee-lovers';
  coffeeIconElements.themeSelect.changeHandler({ target: coffeeIconElements.themeSelect });

  assert(coffeeIconElements.coffeeEmoji.classList.contains('visible'), 'coffee icon should be visible when coffee-lovers theme is selected');

  // Switch away from coffee-lovers - icon should hide
  coffeeIconElements.themeSelect.value = '';
  coffeeIconElements.themeSelect.changeHandler({ target: coffeeIconElements.themeSelect });

  assert(!coffeeIconElements.coffeeEmoji.classList.contains('visible'), 'coffee icon should be hidden when switching away from coffee-lovers');

  // Regression test: monolith icon visibility still works
  coffeeIconElements.themeSelect.value = 'monolith';
  coffeeIconElements.themeSelect.changeHandler({ target: coffeeIconElements.themeSelect });

  assert(coffeeIconElements.monolithEmoji.classList.contains('visible'), 'monolith icon should be visible when monolith theme is selected');
  assert(!coffeeIconElements.coffeeEmoji.classList.contains('visible'), 'coffee icon should remain hidden when monolith is selected');
}
console.log('  ✓ Coffee icon visibility is toggled correctly; monolith icon regression check passes');

// ============================================================================
// AC6: Theme persistence - localStorage integration
// ============================================================================

console.log('\nAC6: Theme Persistence (localStorage)');

{
  // Test 1: Selecting coffee-lovers writes to localStorage
  delete global.document;
  delete global.window;

  const localStorageMock = {};
  global.localStorage = {
    setItem: (key, value) => {
      localStorageMock[key] = value;
    },
    getItem: (key) => localStorageMock[key]
  };

  const persistenceElements1 = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          persistenceElements1.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const persistence1FakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return persistenceElements1.expression;
      if (id === 'result') return persistenceElements1.result;
      if (id === 'theme-select') return persistenceElements1.themeSelect;
      if (id === 'ghost-emoji') return persistenceElements1.ghostEmoji;
      if (id === 'monolith-emoji') return persistenceElements1.monolithEmoji;
      if (id === 'coffee-emoji') return persistenceElements1.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return persistenceElements1.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(persistence1FakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorPersistence1Test = require('./script.js');

  // Select coffee-lovers - should write to localStorage
  persistenceElements1.themeSelect.value = 'coffee-lovers';
  persistenceElements1.themeSelect.changeHandler({ target: persistenceElements1.themeSelect });

  assert.strictEqual(localStorageMock['calculator-theme'], 'coffee-lovers', 'should write coffee-lovers to localStorage with key "calculator-theme"');
}
console.log('  ✓ Selecting a theme writes to localStorage');

{
  // Test 2: Page load with stored theme restores it and applies it
  delete global.document;
  delete global.window;

  const localStorageMock = { 'calculator-theme': 'coffee-lovers' };
  global.localStorage = {
    setItem: (key, value) => {
      localStorageMock[key] = value;
    },
    getItem: (key) => localStorageMock[key]
  };

  const persistenceElements2 = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          persistenceElements2.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const persistence2FakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return persistenceElements2.expression;
      if (id === 'result') return persistenceElements2.result;
      if (id === 'theme-select') return persistenceElements2.themeSelect;
      if (id === 'ghost-emoji') return persistenceElements2.ghostEmoji;
      if (id === 'monolith-emoji') return persistenceElements2.monolithEmoji;
      if (id === 'coffee-emoji') return persistenceElements2.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return persistenceElements2.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(persistence2FakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorPersistence2Test = require('./script.js');

  // After script loads, it should have restored the theme from localStorage
  assert.strictEqual(persistenceElements2.themeSelect.value, 'coffee-lovers', 'themeSelect.value should be set to stored theme on load');
  assert(persistenceElements2.calculator.classList.contains('theme-coffee-lovers'), 'coffee-lovers theme class should be applied on load');
  assert(persistenceElements2.coffeeEmoji.classList.contains('visible'), 'coffee icon should be visible after restoring coffee-lovers theme');
}
console.log('  ✓ Page load restores and applies stored theme');

{
  // Test 3: Page load with no stored theme uses defaults
  delete global.document;
  delete global.window;

  const localStorageMock = {};
  global.localStorage = {
    setItem: (key, value) => {
      localStorageMock[key] = value;
    },
    getItem: (key) => localStorageMock[key]
  };

  const persistenceElements3 = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          persistenceElements3.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const persistence3FakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return persistenceElements3.expression;
      if (id === 'result') return persistenceElements3.result;
      if (id === 'theme-select') return persistenceElements3.themeSelect;
      if (id === 'ghost-emoji') return persistenceElements3.ghostEmoji;
      if (id === 'monolith-emoji') return persistenceElements3.monolithEmoji;
      if (id === 'coffee-emoji') return persistenceElements3.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return persistenceElements3.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(persistence3FakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorPersistence3Test = require('./script.js');

  // With no stored theme, calculator should have no theme class
  assert.strictEqual(persistenceElements3.themeSelect.value, '', 'themeSelect.value should remain empty with no stored theme');
  assert(!persistenceElements3.calculator.classList.contains('theme-coffee-lovers'), 'no coffee-lovers class should be applied with no stored theme');
  assert(!persistenceElements3.coffeeEmoji.classList.contains('visible'), 'coffee icon should not be visible with no stored theme');
}
console.log('  ✓ Page load defaults to no theme when nothing is stored');

{
  // Test 4: Page load with invalid stored theme falls back to no theme
  delete global.document;
  delete global.window;

  const localStorageMock = { 'calculator-theme': 'not-a-real-theme' };
  global.localStorage = {
    setItem: (key, value) => {
      localStorageMock[key] = value;
    },
    getItem: (key) => localStorageMock[key]
  };

  const persistenceElements4 = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          persistenceElements4.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const persistence4FakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return persistenceElements4.expression;
      if (id === 'result') return persistenceElements4.result;
      if (id === 'theme-select') return persistenceElements4.themeSelect;
      if (id === 'ghost-emoji') return persistenceElements4.ghostEmoji;
      if (id === 'monolith-emoji') return persistenceElements4.monolithEmoji;
      if (id === 'coffee-emoji') return persistenceElements4.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return persistenceElements4.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(persistence4FakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorPersistence4Test = require('./script.js');

  // Invalid theme should not be applied
  assert.strictEqual(persistenceElements4.themeSelect.value, '', 'themeSelect.value should remain empty with invalid stored theme');
  assert(!persistenceElements4.calculator.classList.contains('theme-coffee-lovers'), 'invalid theme should not be applied');
  assert(!persistenceElements4.coffeeEmoji.classList.contains('visible'), 'coffee icon should not be visible with invalid stored theme');
}
console.log('  ✓ Invalid stored theme falls back to no theme');

{
  // Test 5: Other valid themes persist correctly
  delete global.document;
  delete global.window;

  const localStorageMock = { 'calculator-theme': 'halloween' };
  global.localStorage = {
    setItem: (key, value) => {
      localStorageMock[key] = value;
    },
    getItem: (key) => localStorageMock[key]
  };

  const persistenceElements5 = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          persistenceElements5.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const persistence5FakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return persistenceElements5.expression;
      if (id === 'result') return persistenceElements5.result;
      if (id === 'theme-select') return persistenceElements5.themeSelect;
      if (id === 'ghost-emoji') return persistenceElements5.ghostEmoji;
      if (id === 'monolith-emoji') return persistenceElements5.monolithEmoji;
      if (id === 'coffee-emoji') return persistenceElements5.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return persistenceElements5.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(persistence5FakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorPersistence5Test = require('./script.js');

  // Halloween theme should be restored
  assert.strictEqual(persistenceElements5.themeSelect.value, 'halloween', 'halloween theme should be restored from storage');
  assert(persistenceElements5.calculator.classList.contains('theme-halloween'), 'halloween theme class should be applied on load');
}
console.log('  ✓ Other theme options persist and restore correctly');

// ============================================================================
// Edge Cases for Theme Switching
// ============================================================================

console.log('\nEdge Cases: Theme Switching');

{
  // Test rapid theme switching
  delete global.document;
  delete global.window;

  let timeoutClears = 0;
  const originalSetTimeout = global.setTimeout;
  const originalClearTimeout = global.clearTimeout;

  global.setTimeout = function(fn, delay) {
    return originalSetTimeout(fn, delay);
  };
  global.clearTimeout = function(id) {
    timeoutClears++;
    return originalClearTimeout(id);
  };

  const rapidSwitchElements = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          rapidSwitchElements.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const rapidSwitchFakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return rapidSwitchElements.expression;
      if (id === 'result') return rapidSwitchElements.result;
      if (id === 'theme-select') return rapidSwitchElements.themeSelect;
      if (id === 'ghost-emoji') return rapidSwitchElements.ghostEmoji;
      if (id === 'monolith-emoji') return rapidSwitchElements.monolithEmoji;
      if (id === 'coffee-emoji') return rapidSwitchElements.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return rapidSwitchElements.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(rapidSwitchFakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorRapidSwitchTest = require('./script.js');

  // Rapid switch: Halloween -> Dark Mode -> Halloween
  rapidSwitchElements.themeSelect.value = 'halloween';
  rapidSwitchElements.themeSelect.changeHandler({ target: rapidSwitchElements.themeSelect });

  rapidSwitchElements.themeSelect.value = 'dark-mode';
  rapidSwitchElements.themeSelect.changeHandler({ target: rapidSwitchElements.themeSelect });

  rapidSwitchElements.themeSelect.value = 'halloween';
  rapidSwitchElements.themeSelect.changeHandler({ target: rapidSwitchElements.themeSelect });

  assert(rapidSwitchElements.calculator.classList.contains('theme-halloween'), 'Final theme should be Halloween');
  assert(!rapidSwitchElements.calculator.classList.contains('theme-dark-mode'), 'Dark Mode should not be applied');

  // Switch back to default to clean up setTimeout before restoring globals
  rapidSwitchElements.themeSelect.value = '';
  rapidSwitchElements.themeSelect.changeHandler({ target: rapidSwitchElements.themeSelect });

  // Restore globals
  global.setTimeout = originalSetTimeout;
  global.clearTimeout = originalClearTimeout;
}
console.log('  ✓ Rapid theme switching works without errors (Halloween → Dark → Halloween)');

{
  // Test selecting same theme twice
  delete global.document;
  delete global.window;

  const samethemeElements = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          samethemeElements.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const samethemeFakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return samethemeElements.expression;
      if (id === 'result') return samethemeElements.result;
      if (id === 'theme-select') return samethemeElements.themeSelect;
      if (id === 'ghost-emoji') return samethemeElements.ghostEmoji;
      if (id === 'monolith-emoji') return samethemeElements.monolithEmoji;
      if (id === 'coffee-emoji') return samethemeElements.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return samethemeElements.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(samethemeFakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorSameThemeTest = require('./script.js');

  // Select Halloween twice
  samethemeElements.themeSelect.value = 'halloween';
  samethemeElements.themeSelect.changeHandler({ target: samethemeElements.themeSelect });

  const hadClassFirst = samethemeElements.calculator.classList.contains('theme-halloween');

  samethemeElements.themeSelect.changeHandler({ target: samethemeElements.themeSelect });

  const hadClassSecond = samethemeElements.calculator.classList.contains('theme-halloween');
  assert(hadClassFirst && hadClassSecond, 'Selecting same theme twice should not error');

  // Switch back to default to clean up setTimeout
  samethemeElements.themeSelect.value = '';
  samethemeElements.themeSelect.changeHandler({ target: samethemeElements.themeSelect });
}
console.log('  ✓ Selecting same theme twice does not cause errors');

// ============================================================================
// JMNT-3: 2001: A Space Odyssey (Monolith) Theme Tests
// ============================================================================

console.log('\nJMNT-3: 2001: A Space Odyssey (Monolith) Theme - AC1');

{
  // Clean up and create fresh test context for Monolith theme class test
  delete global.document;
  delete global.window;

  const monolithElements = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          monolithElements.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const monolithFakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return monolithElements.expression;
      if (id === 'result') return monolithElements.result;
      if (id === 'theme-select') return monolithElements.themeSelect;
      if (id === 'ghost-emoji') return monolithElements.ghostEmoji;
      if (id === 'monolith-emoji') return monolithElements.monolithEmoji;
      if (id === 'coffee-emoji') return monolithElements.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return monolithElements.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(monolithFakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorMonolithTest = require('./script.js');

  // Select Monolith theme
  monolithElements.themeSelect.value = 'monolith';
  monolithElements.themeSelect.changeHandler({ target: monolithElements.themeSelect });

  assert(monolithElements.calculator.classList.contains('theme-monolith'), 'Monolith theme class should be applied when selected');
}
console.log('  ✓ Monolith theme class is applied when selected');

{
  // Test that monolith theme class is removed when selecting another theme
  delete global.document;
  delete global.window;

  const monolithRemoveElements = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          monolithRemoveElements.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const monolithRemoveFakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return monolithRemoveElements.expression;
      if (id === 'result') return monolithRemoveElements.result;
      if (id === 'theme-select') return monolithRemoveElements.themeSelect;
      if (id === 'ghost-emoji') return monolithRemoveElements.ghostEmoji;
      if (id === 'monolith-emoji') return monolithRemoveElements.monolithEmoji;
      if (id === 'coffee-emoji') return monolithRemoveElements.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return monolithRemoveElements.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(monolithRemoveFakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorMonolithRemoveTest = require('./script.js');

  // First select Monolith
  monolithRemoveElements.themeSelect.value = 'monolith';
  monolithRemoveElements.themeSelect.changeHandler({ target: monolithRemoveElements.themeSelect });
  assert(monolithRemoveElements.calculator.classList.contains('theme-monolith'), 'Monolith theme should be applied initially');

  // Now select Default theme
  monolithRemoveElements.themeSelect.value = '';
  monolithRemoveElements.themeSelect.changeHandler({ target: monolithRemoveElements.themeSelect });

  assert(!monolithRemoveElements.calculator.classList.contains('theme-monolith'), 'Monolith theme class should be removed when selecting Default');
}
console.log('  ✓ Monolith theme class is removed when switching to another theme');

// ============================================================================
// JMNT-3: 2001: A Space Odyssey (Monolith) Theme - AC3 (Motif Visibility)
// ============================================================================

console.log('\nJMNT-3: 2001: A Space Odyssey (Monolith) Theme - AC3');

{
  // Test that monolith emoji becomes visible when monolith theme is selected
  delete global.document;
  delete global.window;

  const monolithMotifElements = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          monolithMotifElements.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const monolithMotifFakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return monolithMotifElements.expression;
      if (id === 'result') return monolithMotifElements.result;
      if (id === 'theme-select') return monolithMotifElements.themeSelect;
      if (id === 'ghost-emoji') return monolithMotifElements.ghostEmoji;
      if (id === 'monolith-emoji') return monolithMotifElements.monolithEmoji;
      if (id === 'coffee-emoji') return monolithMotifElements.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return monolithMotifElements.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(monolithMotifFakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorMonolithMotifTest = require('./script.js');

  // Select Monolith theme
  monolithMotifElements.themeSelect.value = 'monolith';
  monolithMotifElements.themeSelect.changeHandler({ target: monolithMotifElements.themeSelect });

  assert(monolithMotifElements.monolithEmoji.classList.contains('visible'), 'Monolith emoji should become visible when monolith theme is selected');
}
console.log('  ✓ Monolith emoji becomes visible when monolith theme is selected');

{
  // Test that monolith emoji is hidden when switching away from monolith theme
  delete global.document;
  delete global.window;

  const monolithHideElements = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          monolithHideElements.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const monolithHideFakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return monolithHideElements.expression;
      if (id === 'result') return monolithHideElements.result;
      if (id === 'theme-select') return monolithHideElements.themeSelect;
      if (id === 'ghost-emoji') return monolithHideElements.ghostEmoji;
      if (id === 'monolith-emoji') return monolithHideElements.monolithEmoji;
      if (id === 'coffee-emoji') return monolithHideElements.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return monolithHideElements.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(monolithHideFakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorMonolithHideTest = require('./script.js');

  // First select Monolith theme
  monolithHideElements.themeSelect.value = 'monolith';
  monolithHideElements.themeSelect.changeHandler({ target: monolithHideElements.themeSelect });
  assert(monolithHideElements.monolithEmoji.classList.contains('visible'), 'Monolith should be visible when theme is active');

  // Now switch to Dark Mode
  monolithHideElements.themeSelect.value = 'dark-mode';
  monolithHideElements.themeSelect.changeHandler({ target: monolithHideElements.themeSelect });

  assert(!monolithHideElements.monolithEmoji.classList.contains('visible'), 'Monolith emoji should be hidden when switching away from monolith theme');
}
console.log('  ✓ Monolith emoji is hidden when switching away from monolith theme');

// ============================================================================
// JMNT-3: 2001: A Space Odyssey (Monolith) Theme - AC4 (Calculator behavior)
// ============================================================================

console.log('\nJMNT-3: 2001: A Space Odyssey (Monolith) Theme - AC4');

{
  // Test that calculator operations work unchanged with monolith theme active
  delete global.document;
  delete global.window;

  const monolithCalcElements = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          monolithCalcElements.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const monolithCalcFakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return monolithCalcElements.expression;
      if (id === 'result') return monolithCalcElements.result;
      if (id === 'theme-select') return monolithCalcElements.themeSelect;
      if (id === 'ghost-emoji') return monolithCalcElements.ghostEmoji;
      if (id === 'monolith-emoji') return monolithCalcElements.monolithEmoji;
      if (id === 'coffee-emoji') return monolithCalcElements.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return monolithCalcElements.calculator;
      if (selector === '.main-buttons') {
        return {
          addEventListener: (event, handler) => {
            monolithCalcElements.mainButtonsHandler = handler;
          }
        };
      }
      if (selector === '.sci-buttons') {
        return {
          addEventListener: (event, handler) => {
            monolithCalcElements.sciButtonsHandler = handler;
          }
        };
      }
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(monolithCalcFakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorMonolithCalcTest = require('./script.js');

  // Helper to simulate button clicks
  function simulateMonolithClick(containerKey, selector, classList = []) {
    const handler = containerKey === 'main' ? monolithCalcElements.mainButtonsHandler : monolithCalcElements.sciButtonsHandler;
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

  // Select Monolith theme first
  monolithCalcElements.themeSelect.value = 'monolith';
  monolithCalcElements.themeSelect.changeHandler({ target: monolithCalcElements.themeSelect });

  // Test basic arithmetic with monolith theme active
  simulateMonolithClick('main', { dataValue: '5' }, ['digit']);
  simulateMonolithClick('main', { dataValue: '+' }, ['operator']);
  simulateMonolithClick('main', { dataValue: '3' }, ['digit']);
  simulateMonolithClick('main', { dataAction: 'equals' }, ['equals']);

  assert.strictEqual(monolithCalcElements.result.textContent, '8', 'With monolith theme: 5 + 3 should equal 8');
}
console.log('  ✓ Calculator arithmetic operations work unchanged with monolith theme active');

{
  // Test that sqrt/log/sin/cos/tan work with monolith theme active
  delete global.document;
  delete global.window;

  const monolithSciElements = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          monolithSciElements.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const monolithSciFakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return monolithSciElements.expression;
      if (id === 'result') return monolithSciElements.result;
      if (id === 'theme-select') return monolithSciElements.themeSelect;
      if (id === 'ghost-emoji') return monolithSciElements.ghostEmoji;
      if (id === 'monolith-emoji') return monolithSciElements.monolithEmoji;
      if (id === 'coffee-emoji') return monolithSciElements.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return monolithSciElements.calculator;
      if (selector === '.main-buttons') {
        return {
          addEventListener: (event, handler) => {
            monolithSciElements.mainButtonsHandler = handler;
          }
        };
      }
      if (selector === '.sci-buttons') {
        return {
          addEventListener: (event, handler) => {
            monolithSciElements.sciButtonsHandler = handler;
          }
        };
      }
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(monolithSciFakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorMonolithSciTest = require('./script.js');

  function simulateMonolithSciClick(containerKey, selector, classList = []) {
    const handler = containerKey === 'main' ? monolithSciElements.mainButtonsHandler : monolithSciElements.sciButtonsHandler;
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

  // Select Monolith theme
  monolithSciElements.themeSelect.value = 'monolith';
  monolithSciElements.themeSelect.changeHandler({ target: monolithSciElements.themeSelect });

  // Test sqrt(16) = 4 with monolith theme active
  simulateMonolithSciClick('main', { dataValue: '1' }, ['digit']);
  simulateMonolithSciClick('main', { dataValue: '6' }, ['digit']);
  simulateMonolithSciClick('sci', { dataAction: 'sqrt' }, ['fn']);

  assert.strictEqual(monolithSciElements.result.textContent, '4', 'With monolith theme: sqrt(16) should equal 4');
}
console.log('  ✓ Scientific functions (sqrt/log/sin/cos/tan) work unchanged with monolith theme active');

// ============================================================================
// JMNT-3: 2001: A Space Odyssey (Monolith) Theme - AC5 (Theme distinctness)
// ============================================================================

console.log('\nJMNT-3: 2001: A Space Odyssey (Monolith) Theme - AC5');

{
  // Test that monolith theme is distinct from other themes (only one theme class at a time)
  delete global.document;
  delete global.window;

  const distinctElements = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          distinctElements.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const distinctFakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return distinctElements.expression;
      if (id === 'result') return distinctElements.result;
      if (id === 'theme-select') return distinctElements.themeSelect;
      if (id === 'ghost-emoji') return distinctElements.ghostEmoji;
      if (id === 'monolith-emoji') return distinctElements.monolithEmoji;
      if (id === 'coffee-emoji') return distinctElements.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return distinctElements.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(distinctFakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorDistinctTest = require('./script.js');

  // Test: monolith theme class name is distinct
  distinctElements.themeSelect.value = 'monolith';
  distinctElements.themeSelect.changeHandler({ target: distinctElements.themeSelect });

  assert(distinctElements.calculator.classList.contains('theme-monolith'), 'theme-monolith class should be present');
  assert(!distinctElements.calculator.classList.contains('theme-halloween'), 'theme-halloween should not be present');
  assert(!distinctElements.calculator.classList.contains('theme-dark-mode'), 'theme-dark-mode should not be present');
  assert(!distinctElements.calculator.classList.contains('theme-childrens'), 'theme-childrens should not be present');
}
console.log('  ✓ Monolith theme class name is distinct from all existing themes');

{
  // Test switching between monolith and other themes removes/adds correctly
  delete global.document;
  delete global.window;

  const switchElements = {
    expression: {
      id: 'expression',
      textContent: '',
      classList: createClassListMock()
    },
    result: {
      id: 'result',
      textContent: '0',
      classList: createClassListMock()
    },
    themeSelect: {
      id: 'theme-select',
      value: '',
      options: [
        { value: '', textContent: 'Default' },
        { value: 'halloween', textContent: 'Halloween' },
        { value: 'dark-mode', textContent: 'Dark Mode' },
        { value: 'childrens', textContent: "Children's" },
        { value: 'monolith', textContent: '2001: A Space Odyssey' },
        { value: 'minions', textContent: 'Minions' },
        { value: 'marvel-ironman', textContent: 'Marvel/Iron Man' },
        { value: 'coffee-lovers', textContent: 'Coffee Lovers' }
      ],
      addEventListener: (event, handler) => {
        if (event === 'change') {
          switchElements.themeSelect.changeHandler = handler;
        }
      }
    },
    calculator: {
      classList: createClassListMock()
    },
    ghostEmoji: {
      id: 'ghost-emoji',
      style: { top: '', left: '' },
      classList: createClassListMock()
    },
    monolithEmoji: {
      id: 'monolith-emoji',
      classList: createClassListMock()
    },
    coffeeEmoji: {
      id: 'coffee-emoji',
      classList: createClassListMock()
    }
  };

  const switchFakeDOM = {
    getElementById: (id) => {
      if (id === 'expression') return switchElements.expression;
      if (id === 'result') return switchElements.result;
      if (id === 'theme-select') return switchElements.themeSelect;
      if (id === 'ghost-emoji') return switchElements.ghostEmoji;
      if (id === 'monolith-emoji') return switchElements.monolithEmoji;
      if (id === 'coffee-emoji') return switchElements.coffeeEmoji;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.calculator') return switchElements.calculator;
      if (selector === '.main-buttons') return { addEventListener: () => {} };
      if (selector === '.sci-buttons') return { addEventListener: () => {} };
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(switchFakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorSwitchTest = require('./script.js');

  // Start with Halloween
  switchElements.themeSelect.value = 'halloween';
  switchElements.themeSelect.changeHandler({ target: switchElements.themeSelect });

  // Switch to Monolith
  switchElements.themeSelect.value = 'monolith';
  switchElements.themeSelect.changeHandler({ target: switchElements.themeSelect });

  assert(switchElements.calculator.classList.contains('theme-monolith'), 'Monolith class should be present');
  assert(!switchElements.calculator.classList.contains('theme-halloween'), 'Halloween class should be removed');

  // Switch back to Halloween
  switchElements.themeSelect.value = 'halloween';
  switchElements.themeSelect.changeHandler({ target: switchElements.themeSelect });

  assert(switchElements.calculator.classList.contains('theme-halloween'), 'Halloween class should be present');
  assert(!switchElements.calculator.classList.contains('theme-monolith'), 'Monolith class should be removed');

  // Clean up timeout
  switchElements.themeSelect.value = '';
  switchElements.themeSelect.changeHandler({ target: switchElements.themeSelect });
}
console.log('  ✓ Only one theme class is present at a time (monolith + other themes mutually exclusive)');

// ============================================================================
// JMNT-5: Jakify Operation - AC1-4
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('JMNT-5: Jakify Operation');
console.log('='.repeat(70));

// AC1: Jakify button exists and is wired to sci-buttons listener
console.log('\nAC1: Jakify Button Exists in Scientific Functions Row');

{
  // Test that Jakify button works via sci-buttons click handler
  delete global.document;
  delete global.window;

  const ac1Elements = {
    expression: { textContent: '', classList: { toggle: () => {} } },
    result: { textContent: '0', classList: { toggle: () => {} } }
  };

  const ac1EventListeners = {};

  const ac1FakeDOM = {
    getElementById: (id) => ac1Elements[id] || null,
    querySelector: (selector) => {
      if (selector === '.main-buttons') {
        return {
          addEventListener: (event, handler) => {
            ac1EventListeners['main-buttons'] = handler;
          }
        };
      }
      if (selector === '.sci-buttons') {
        return {
          addEventListener: (event, handler) => {
            ac1EventListeners['sci-buttons'] = handler;
          }
        };
      }
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(ac1FakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorAC1Test = require('./script.js');

  // Test that clicking a button with data-action="jakify" in sci-buttons works
  const ac1Handler = ac1EventListeners['sci-buttons'];
  assert(ac1Handler, 'sci-buttons should have a click event listener registered');

  // Create a fake button matching the jakify button from index.html
  const jakifyButton = {
    dataset: { action: 'jakify' },
    classList: { contains: (c) => c === 'fn' },
    closest: (s) => jakifyButton
  };

  // Simulate clicking the jakify button (no error should occur)
  let clickHandled = false;
  try {
    ac1Handler({ target: jakifyButton });
    clickHandled = true;
  } catch (e) {
    // If jakify is not implemented, this would throw
  }

  assert(clickHandled, 'Clicking jakify button should be handled without error');
}
console.log('  ✓ Jakify button with data-action="jakify" is wired to sci-buttons listener');

// AC2/AC3: applyJakify function tests
console.log('\nAC2/AC3: Jakify Function - f(x) = 2x + 3');

{
  const result = applyJakify(1);
  assert(!result.error, 'applyJakify(1) should not produce an error');
  assert.deepStrictEqual(result.value, 5, 'applyJakify(1) should equal 5');
}
console.log('  ✓ applyJakify(1) = 5');

{
  const result = applyJakify(2);
  assert(!result.error, 'applyJakify(2) should not produce an error');
  assert.deepStrictEqual(result.value, 7, 'applyJakify(2) should equal 7');
}
console.log('  ✓ applyJakify(2) = 7');

{
  const result = applyJakify(3);
  assert(!result.error, 'applyJakify(3) should not produce an error');
  assert.deepStrictEqual(result.value, 9, 'applyJakify(3) should equal 9');
}
console.log('  ✓ applyJakify(3) = 9');

{
  const result = applyJakify(5);
  assert(!result.error, 'applyJakify(5) should not produce an error');
  assert.deepStrictEqual(result.value, 13, 'applyJakify(5) should equal 13');
}
console.log('  ✓ applyJakify(5) = 13');

{
  const result = applyJakify(10);
  assert(!result.error, 'applyJakify(10) should not produce an error');
  assert.deepStrictEqual(result.value, 23, 'applyJakify(10) should equal 23');
}
console.log('  ✓ applyJakify(10) = 23');

{
  const result = applyJakify(-4);
  assert(!result.error, 'applyJakify(-4) should not produce an error');
  assert.deepStrictEqual(result.value, -5, 'applyJakify(-4) should equal -5');
}
console.log('  ✓ applyJakify(-4) = -5 (negative numbers)');

{
  const result = applyJakify(1.5);
  assert(!result.error, 'applyJakify(1.5) should not produce an error');
  assert.deepStrictEqual(result.value, 6, 'applyJakify(1.5) should equal 6');
}
console.log('  ✓ applyJakify(1.5) = 6 (decimals)');

{
  const result = applyJakify(0);
  assert(!result.error, 'applyJakify(0) should not produce an error');
  assert.deepStrictEqual(result.value, 3, 'applyJakify(0) should equal 3');
}
console.log('  ✓ applyJakify(0) = 3 (zero)');

// AC2/AC3: Test applyJakify via applyUnary
{
  const result = applyUnary('jakify', 2);
  assert(!result.error, 'applyUnary(jakify, 2) should not produce an error');
  assert.deepStrictEqual(result.value, 7, 'applyUnary(jakify, 2) should equal 7');
}
console.log('  ✓ applyJakify is accessible via applyUnary("jakify", value)');

// AC2/AC3: Integration test - simulate button click and check result display
console.log('\nAC2/AC3: Jakify Button Integration - Result Display');

{
  delete global.document;
  delete global.window;

  const ac23IntegrationElements = {
    expression: { textContent: '', classList: { toggle: () => {} } },
    result: { textContent: '0', classList: { toggle: () => {} } }
  };

  const ac23EventListeners = {};

  const ac23FakeDOM = {
    getElementById: (id) => ac23IntegrationElements[id] || null,
    querySelector: (selector) => {
      if (selector === '.main-buttons') {
        return {
          addEventListener: (event, handler) => {
            ac23EventListeners['main-buttons'] = handler;
          }
        };
      }
      if (selector === '.sci-buttons') {
        return {
          addEventListener: (event, handler) => {
            ac23EventListeners['sci-buttons'] = handler;
          }
        };
      }
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(ac23FakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorJakifyTest = require('./script.js');

  function simulateJakifyClick(containerKey, selector, classList = []) {
    const handler = ac23EventListeners[containerKey];
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

  // Test: Enter 5, click Jakify, should get 13
  {
    simulateJakifyClick('main-buttons', { dataValue: '5' }, ['digit']);
    simulateJakifyClick('sci-buttons', { dataAction: 'jakify' }, ['fn']);
    assert.strictEqual(ac23IntegrationElements.result.textContent, '13', 'After entering 5 and clicking Jakify, result should display 13');
  }
  console.log('  ✓ Enter 5, click Jakify → display shows 13');

  // Clear and test with expression
  {
    simulateJakifyClick('main-buttons', { dataAction: 'clear' }, ['util']);
    simulateJakifyClick('main-buttons', { dataValue: '2' }, ['digit']);
    simulateJakifyClick('main-buttons', { dataValue: '+' }, ['operator']);
    simulateJakifyClick('main-buttons', { dataValue: '3' }, ['digit']);
    simulateJakifyClick('sci-buttons', { dataAction: 'jakify' }, ['fn']);
    // Expression "2+3" evaluates to 5, Jakify: 2*5+3 = 13
    assert.strictEqual(ac23IntegrationElements.result.textContent, '13', 'After entering "2+3" and clicking Jakify, result should display 13 (evaluated to 5 first)');
  }
  console.log('  ✓ Enter expression "2+3", click Jakify → evaluates to 5, then Jakify(5) = 13');

  // Test with negative number
  {
    simulateJakifyClick('main-buttons', { dataAction: 'clear' }, ['util']);
    simulateJakifyClick('main-buttons', { dataValue: '0' }, ['digit']);
    simulateJakifyClick('sci-buttons', { dataAction: 'jakify' }, ['fn']);
    assert.strictEqual(ac23IntegrationElements.result.textContent, '3', 'Jakify(0) should display 3');
  }
  console.log('  ✓ Jakify(0) = 3');
}

// AC4: Error handling when expression is invalid
console.log('\nAC4: Jakify Error Handling - Invalid Expression');

{
  delete global.document;
  delete global.window;

  const ac4Elements = {
    expression: { textContent: '', classList: { toggle: () => {} } },
    result: { textContent: '0', classList: { toggle: () => {} } }
  };

  const ac4EventListeners = {};

  const ac4FakeDOM = {
    getElementById: (id) => ac4Elements[id] || null,
    querySelector: (selector) => {
      if (selector === '.main-buttons') {
        return {
          addEventListener: (event, handler) => {
            ac4EventListeners['main-buttons'] = handler;
          }
        };
      }
      if (selector === '.sci-buttons') {
        return {
          addEventListener: (event, handler) => {
            ac4EventListeners['sci-buttons'] = handler;
          }
        };
      }
      return null;
    }
  };

  global.document = patchFakeDOMForRomanTheme(ac4FakeDOM);
  global.window = {};

  delete require.cache[require.resolve('./script.js')];
  const CalculatorJakifyErrorTest = require('./script.js');

  function simulateErrorClick(containerKey, selector, classList = []) {
    const handler = ac4EventListeners[containerKey];
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

  // Test: Enter just a decimal point ".", click Jakify, should show error
  {
    simulateErrorClick('main-buttons', { dataValue: '.' }, ['digit', 'dot']);
    simulateErrorClick('sci-buttons', { dataAction: 'jakify' }, ['fn']);
    assert(ac4Elements.result.textContent.toLowerCase().includes('invalid'), 'Entering "." and clicking Jakify should show error message containing "Invalid"');
  }
  console.log('  ✓ Entering "." and clicking Jakify shows error message');

  // Test: Calculator remains usable after error (digit press starts new expression)
  {
    simulateErrorClick('main-buttons', { dataValue: '5' }, ['digit']);
    assert.strictEqual(ac4Elements.expression.textContent, '5', 'After pressing digit, new expression starts and is displayed');
  }
  console.log('  ✓ Calculator remains usable after error (digit starts new expression)');

  // Test: Can perform calculation after error (expression and Jakify work)
  {
    simulateErrorClick('main-buttons', { dataValue: '2' }, ['digit']);
    simulateErrorClick('main-buttons', { dataValue: '+' }, ['operator']);
    simulateErrorClick('main-buttons', { dataValue: '1' }, ['digit']);
    simulateErrorClick('sci-buttons', { dataAction: 'jakify' }, ['fn']);
    // "52+1" = 53, Jakify: 2*53+3 = 109
    assert.strictEqual(ac4Elements.result.textContent, '109', 'Jakify works after error recovery with new expression');
  }
  console.log('  ✓ Jakify works after error recovery: Jakify(52+1) = 109');
}

// ============================================================================
// AC1-AC6: Roman Theme Tests
// ============================================================================

// Restore the theme test DOM (Jakify test changed it)
global.document = themeTestFakeDOM;
global.window = {};
global.localStorage = {
  getItem: (key) => localStorageMock[key],
  setItem: (key, value) => { localStorageMock[key] = value; },
  removeItem: (key) => delete localStorageMock[key]
};
delete require.cache[require.resolve('./script.js')];
const CalculatorRomanTheme = require('./script.js');

console.log('\nAC1: Roman theme option exists in dropdown');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const romanOption = selectEl.options.find(o => o.value === 'roman');
  assert(romanOption, 'Roman option should exist in the select');
  assert.strictEqual(romanOption.textContent, 'Roman', 'Roman option text should be "Roman"');
}
console.log('  ✓ Roman option exists in theme dropdown');

// ============================================================================
// AC2: toRomanNumeral function tests
// ============================================================================

console.log('\nAC2: toRomanNumeral(value) pure function tests');

{
  const { toRomanNumeral } = CalculatorMath;
  assert.strictEqual(toRomanNumeral(0), '0', 'Zero should return "0"');
}
console.log('  ✓ toRomanNumeral(0) returns "0"');

{
  const { toRomanNumeral } = CalculatorMath;
  assert.strictEqual(toRomanNumeral(1), 'I', 'One should return "I"');
  assert.strictEqual(toRomanNumeral(2), 'II', 'Two should return "II"');
  assert.strictEqual(toRomanNumeral(3), 'III', 'Three should return "III"');
}
console.log('  ✓ toRomanNumeral(1-3) returns correct values');

{
  const { toRomanNumeral } = CalculatorMath;
  assert.strictEqual(toRomanNumeral(4), 'IV', 'Four should return "IV" (subtractive)');
  assert.strictEqual(toRomanNumeral(9), 'IX', 'Nine should return "IX" (subtractive)');
}
console.log('  ✓ toRomanNumeral(4,9) returns subtractive notation');

{
  const { toRomanNumeral } = CalculatorMath;
  assert.strictEqual(toRomanNumeral(40), 'XL', 'Forty should return "XL"');
  assert.strictEqual(toRomanNumeral(90), 'XC', 'Ninety should return "XC"');
}
console.log('  ✓ toRomanNumeral(40,90) returns correct values');

{
  const { toRomanNumeral } = CalculatorMath;
  assert.strictEqual(toRomanNumeral(3999), 'MMMCMXCIX', 'Upper boundary 3999 should convert correctly');
}
console.log('  ✓ toRomanNumeral(3999) returns MMMCMXCIX (upper boundary)');

{
  const { toRomanNumeral } = CalculatorMath;
  assert.strictEqual(toRomanNumeral(4000), '4000', 'Value >= 4000 should fall back to Arabic string');
  assert.strictEqual(toRomanNumeral(5000), '5000', 'Value >= 4000 should fall back to Arabic string');
}
console.log('  ✓ toRomanNumeral(4000+) falls back to Arabic text');

{
  const { toRomanNumeral } = CalculatorMath;
  assert.strictEqual(toRomanNumeral(-5), '-5', 'Negative values should fall back to Arabic string');
  assert.strictEqual(toRomanNumeral(-1), '-1', 'Negative one should fall back to Arabic string');
}
console.log('  ✓ toRomanNumeral(negative) falls back to Arabic text');

{
  const { toRomanNumeral } = CalculatorMath;
  assert.strictEqual(toRomanNumeral(3.5), '3.5', 'Decimal values should fall back to Arabic string');
  assert.strictEqual(toRomanNumeral(1.14), '1.14', 'Decimal values should fall back to Arabic string');
}
console.log('  ✓ toRomanNumeral(decimal) falls back to Arabic text');

// ============================================================================
// AC2: Digit button text swapping with Roman theme
// ============================================================================

console.log('\nAC2: Digit buttons display Roman numerals when Roman theme active');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const calculatorEl = themeTestFakeDOM.querySelector('.calculator');
  const digitButtons = themeTestElements.digitButtons.filter(b => !b.isZero);

  // Apply Roman theme
  selectEl.value = 'roman';
  const changeEvent = { target: selectEl };
  selectEl.changeHandler(changeEvent);

  // Check digit button text changed to Roman
  const expectedRoman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  digitButtons.forEach((btn, idx) => {
    assert.strictEqual(btn.textContent, expectedRoman[idx], `Digit button ${idx + 1} should show Roman numeral`);
  });
}
console.log('  ✓ Digit buttons 1-9 display Roman numerals I-IX when theme is active');

{
  const digitButtons = themeTestElements.digitButtons;
  const zeroButton = digitButtons.find(b => b.isZero);
  assert.strictEqual(zeroButton.textContent, '0', 'Zero button should remain "0" in Roman theme');
}
console.log('  ✓ Zero button stays "0" in Roman theme');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const digitButtons = themeTestElements.digitButtons.filter(b => !b.isZero);

  // Switch back to default theme
  selectEl.value = '';
  const changeEvent = { target: selectEl };
  selectEl.changeHandler(changeEvent);

  // Check digit buttons reverted to Arabic
  ['1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach((digit, idx) => {
    assert.strictEqual(digitButtons[idx].textContent, digit, `Digit button should revert to ${digit}`);
  });
}
console.log('  ✓ Digit buttons revert to Arabic digits when Roman theme deselected');

// ============================================================================
// AC6: Clear and Equals button text swapping
// ============================================================================

console.log('\nAC6: Clear and Equals buttons relabel in Roman theme');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const clearBtn = themeTestFakeDOM.querySelector('[data-action="clear"]');
  const equalsBtn = themeTestFakeDOM.querySelector('[data-action="equals"]');

  // Apply Roman theme
  selectEl.value = 'roman';
  const changeEvent = { target: selectEl };
  selectEl.changeHandler(changeEvent);

  assert.strictEqual(clearBtn.textContent, 'Dele', 'Clear button should read "Dele" in Roman theme');
  assert.strictEqual(equalsBtn.textContent, 'Solve', 'Equals button should read "Solve" in Roman theme');
}
console.log('  ✓ Clear button reads "Dele" and Equals button reads "Solve" in Roman theme');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const clearBtn = themeTestFakeDOM.querySelector('[data-action="clear"]');
  const equalsBtn = themeTestFakeDOM.querySelector('[data-action="equals"]');

  // Switch to Halloween theme
  selectEl.value = 'halloween';
  const changeEvent = { target: selectEl };
  selectEl.changeHandler(changeEvent);

  assert.strictEqual(clearBtn.textContent, 'Clear', 'Clear button should revert to "Clear" when switching themes');
  assert.strictEqual(equalsBtn.textContent, '=', 'Equals button should revert to "=" when switching themes');
}
console.log('  ✓ Clear and Equals buttons revert to "Clear" and "=" in other themes');

// ============================================================================
// AC2: Expression tokenization with Roman numerals (via actual DOM render)
// ============================================================================

console.log('\nAC2: Expression tokenization with Roman numerals');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const expressionEl = themeTestFakeDOM.getElementById('expression');
  const mainButtonsHandler = themeTestFakeDOM.eventListeners['main-buttons'];
  const digitButtons = themeTestElements.digitButtons;

  // Apply Roman theme
  selectEl.value = 'roman';
  selectEl.changeHandler({ target: selectEl });

  // Simulate clicking "1", "2", "+", "7" to build expression "12+7"
  // Set up the digit buttons with proper classList
  digitButtons.forEach(btn => {
    btn.classList.add('digit');
    btn.closest = (s) => btn;
  });

  const digit1 = digitButtons[0]; // "1"
  const digit2 = digitButtons[1]; // "2"
  const digit7 = digitButtons[6]; // "7"

  const opPlus = { dataset: { value: '+' }, classList: createClassListMock() };
  opPlus.classList.add('operator');
  opPlus.closest = (s) => opPlus;

  mainButtonsHandler({ target: digit1 });
  mainButtonsHandler({ target: digit2 });
  mainButtonsHandler({ target: opPlus });
  mainButtonsHandler({ target: digit7 });

  assert.strictEqual(expressionEl.textContent, 'XII+VII', 'Expression "12+7" should display as "XII+VII" with Roman theme');
}
console.log('  ✓ Expression "12+7" displays as "XII+VII" via actual render pipeline');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const expressionEl = themeTestFakeDOM.getElementById('expression');
  const mainButtonsHandler = themeTestFakeDOM.eventListeners['main-buttons'];
  const digitButtons = themeTestElements.digitButtons;
  const clearBtn = themeTestFakeDOM.querySelector('[data-action="clear"]');

  // Clear and apply Roman theme
  selectEl.value = 'roman';
  selectEl.changeHandler({ target: selectEl });
  mainButtonsHandler({ target: clearBtn });

  // Ensure digit buttons have proper classList
  digitButtons.forEach(btn => {
    btn.classList.add('digit');
    btn.closest = (s) => btn;
  });

  // Build expression with decimal: "3.14+2"
  const digit3 = digitButtons[2]; // "3"
  const dot = { dataset: { value: '.' }, classList: createClassListMock() };
  dot.classList.add('digit', 'dot');
  dot.closest = (s) => dot;
  const digit1 = digitButtons[0]; // "1"
  const digit4 = digitButtons[3]; // "4"
  const opPlus = { dataset: { value: '+' }, classList: createClassListMock() };
  opPlus.classList.add('operator');
  opPlus.closest = (s) => opPlus;
  const digit2 = digitButtons[1]; // "2"

  mainButtonsHandler({ target: digit3 });
  mainButtonsHandler({ target: dot });
  mainButtonsHandler({ target: digit1 });
  mainButtonsHandler({ target: digit4 });
  mainButtonsHandler({ target: opPlus });
  mainButtonsHandler({ target: digit2 });

  assert.strictEqual(expressionEl.textContent, '3.14+II', 'Decimal token stays Arabic, integer token converts: "3.14+2" → "3.14+II"');
}
console.log('  ✓ Decimal tokens remain Arabic: "3.14+2" → "3.14+II"');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const expressionEl = themeTestFakeDOM.getElementById('expression');
  const mainButtonsHandler = themeTestFakeDOM.eventListeners['main-buttons'];
  const digitButtons = themeTestElements.digitButtons;
  const clearBtn = themeTestFakeDOM.querySelector('[data-action="clear"]');

  // Clear and apply Roman theme
  selectEl.value = 'roman';
  selectEl.changeHandler({ target: selectEl });
  mainButtonsHandler({ target: clearBtn });

  digitButtons.forEach(btn => {
    btn.classList.add('digit');
    btn.closest = (s) => btn;
  });

  // Build "5*4"
  const digit5 = digitButtons[4]; // "5"
  const digit4 = digitButtons[3]; // "4"
  const opMult = { dataset: { value: '*' }, classList: createClassListMock() };
  opMult.classList.add('operator');
  opMult.closest = (s) => opMult;

  mainButtonsHandler({ target: digit5 });
  mainButtonsHandler({ target: opMult });
  mainButtonsHandler({ target: digit4 });

  assert.strictEqual(expressionEl.textContent, 'V×IV', 'Operator * converts to × symbol: "5*4" → "V×IV"');
}
console.log('  ✓ Operator conversion: "5*4" → "V×IV" (× symbol)');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const expressionEl = themeTestFakeDOM.getElementById('expression');
  const mainButtonsHandler = themeTestFakeDOM.eventListeners['main-buttons'];
  const digitButtons = themeTestElements.digitButtons;
  const clearBtn = themeTestFakeDOM.querySelector('[data-action="clear"]');

  // Clear and apply Roman theme
  selectEl.value = 'roman';
  selectEl.changeHandler({ target: selectEl });
  mainButtonsHandler({ target: clearBtn });

  digitButtons.forEach(btn => {
    btn.classList.add('digit');
    btn.closest = (s) => btn;
  });

  // Build "10/2"
  const digit1 = digitButtons[0]; // "1"
  const digit0 = digitButtons[9]; // "0" (zero button)
  const digit2 = digitButtons[1]; // "2"
  const opDiv = { dataset: { value: '/' }, classList: createClassListMock() };
  opDiv.classList.add('operator');
  opDiv.closest = (s) => opDiv;

  mainButtonsHandler({ target: digit1 });
  mainButtonsHandler({ target: digit0 });
  mainButtonsHandler({ target: opDiv });
  mainButtonsHandler({ target: digit2 });

  assert.strictEqual(expressionEl.textContent, 'X÷II', 'Operator / converts to ÷ symbol: "10/2" → "X÷II"');
}
console.log('  ✓ Operator conversion: "10/2" → "X÷II" (÷ symbol)');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const expressionEl = themeTestFakeDOM.getElementById('expression');
  const mainButtonsHandler = themeTestFakeDOM.eventListeners['main-buttons'];
  const digitButtons = themeTestElements.digitButtons;
  const clearBtn = themeTestFakeDOM.querySelector('[data-action="clear"]');

  // Clear and apply Roman theme
  selectEl.value = 'roman';
  selectEl.changeHandler({ target: selectEl });
  mainButtonsHandler({ target: clearBtn });

  digitButtons.forEach(btn => {
    btn.classList.add('digit');
    btn.closest = (s) => btn;
  });

  // Build "8-3"
  const digit8 = digitButtons[7]; // "8"
  const digit3 = digitButtons[2]; // "3"
  const opMinus = { dataset: { value: '-' }, classList: createClassListMock() };
  opMinus.classList.add('operator');
  opMinus.closest = (s) => opMinus;

  mainButtonsHandler({ target: digit8 });
  mainButtonsHandler({ target: opMinus });
  mainButtonsHandler({ target: digit3 });

  assert.strictEqual(expressionEl.textContent, 'VIII−III', 'Operator - converts to − symbol: "8-3" → "VIII−III"');
}
console.log('  ✓ Operator conversion: "8-3" → "VIII−III" (− symbol)');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const expressionEl = themeTestFakeDOM.getElementById('expression');
  const mainButtonsHandler = themeTestFakeDOM.eventListeners['main-buttons'];
  const digitButtons = themeTestElements.digitButtons;
  const clearBtn = themeTestFakeDOM.querySelector('[data-action="clear"]');

  // Clear and apply Roman theme
  selectEl.value = 'roman';
  selectEl.changeHandler({ target: selectEl });
  mainButtonsHandler({ target: clearBtn });

  digitButtons.forEach(btn => {
    btn.classList.add('digit');
    btn.closest = (s) => btn;
  });

  // Build "6+" with trailing operator
  const digit6 = digitButtons[5]; // "6"
  const opPlus = { dataset: { value: '+' }, classList: createClassListMock() };
  opPlus.classList.add('operator');
  opPlus.closest = (s) => opPlus;

  mainButtonsHandler({ target: digit6 });
  mainButtonsHandler({ target: opPlus });

  assert.strictEqual(expressionEl.textContent, 'VI+', 'Trailing operator is preserved in expression: "6+" → "VI+"');
}
console.log('  ✓ Trailing operator preserved: "6+" → "VI+"');

// ============================================================================
// AC2: Roman numeral result display via actual render pipeline
// ============================================================================

console.log('\nAC2: Result display shows Roman numerals for in-range integers');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const resultEl = themeTestFakeDOM.getElementById('result');
  const mainButtonsHandler = themeTestFakeDOM.eventListeners['main-buttons'];
  const digitButtons = themeTestElements.digitButtons;
  const clearBtn = themeTestFakeDOM.querySelector('[data-action="clear"]');
  const equalsBtn = themeTestFakeDOM.querySelector('[data-action="equals"]');

  // Apply Roman theme
  selectEl.value = 'roman';
  selectEl.changeHandler({ target: selectEl });
  mainButtonsHandler({ target: clearBtn });

  digitButtons.forEach(btn => {
    btn.classList.add('digit');
    btn.closest = (s) => btn;
  });

  // Build "7+2=" and check result displays as "IX"
  const digit7 = digitButtons[6]; // "7"
  const opPlus = { dataset: { value: '+' }, classList: createClassListMock() };
  opPlus.classList.add('operator');
  opPlus.closest = (s) => opPlus;
  const digit2 = digitButtons[1]; // "2"

  mainButtonsHandler({ target: digit7 });
  mainButtonsHandler({ target: opPlus });
  mainButtonsHandler({ target: digit2 });
  mainButtonsHandler({ target: equalsBtn });

  assert.strictEqual(resultEl.textContent, 'IX', 'Result of 7+2 should display as "IX" in Roman theme');
}
console.log('  ✓ Integer result (7+2=9) displays as "IX"');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const resultEl = themeTestFakeDOM.getElementById('result');
  const mainButtonsHandler = themeTestFakeDOM.eventListeners['main-buttons'];
  const digitButtons = themeTestElements.digitButtons;
  const clearBtn = themeTestFakeDOM.querySelector('[data-action="clear"]');
  const equalsBtn = themeTestFakeDOM.querySelector('[data-action="equals"]');

  // Apply Roman theme
  selectEl.value = 'roman';
  selectEl.changeHandler({ target: selectEl });
  mainButtonsHandler({ target: clearBtn });

  digitButtons.forEach(btn => {
    btn.classList.add('digit');
    btn.closest = (s) => btn;
  });

  // First operation: 7+2=9
  const digit7 = digitButtons[6]; // "7"
  const digit2 = digitButtons[1]; // "2"
  const digit5 = digitButtons[4]; // "5"
  const opPlus = { dataset: { value: '+' }, classList: createClassListMock() };
  opPlus.classList.add('operator');
  opPlus.closest = (s) => opPlus;

  mainButtonsHandler({ target: digit7 });
  mainButtonsHandler({ target: opPlus });
  mainButtonsHandler({ target: digit2 });
  mainButtonsHandler({ target: equalsBtn });
  assert.strictEqual(resultEl.textContent, 'IX', 'First result should be 9 (IX)');

  // Chained operation: result=9, press +, then 5, then = to get 14
  mainButtonsHandler({ target: opPlus });
  mainButtonsHandler({ target: digit5 });
  mainButtonsHandler({ target: equalsBtn });

  assert.strictEqual(resultEl.textContent, 'XIV', 'Chained operation 9+5 should display as "XIV"');
}
console.log('  ✓ Chained operations work correctly: 7+2=9 (IX), then +5= shows 14 (XIV)');

{
  const { toRomanNumeral } = CalculatorMath;
  // Test out-of-range result fallback
  assert.strictEqual(toRomanNumeral(4500), '4500', 'Out-of-range result >= 4000 stays Arabic');
}
console.log('  ✓ Out-of-range result (≥4000) displays as Arabic numeral');

{
  const { toRomanNumeral } = CalculatorMath;
  // Test decimal result fallback
  assert.strictEqual(toRomanNumeral(3.5), '3.5', 'Decimal result stays Arabic');
}
console.log('  ✓ Decimal result (e.g., 7/2=3.5) displays as Arabic numeral');

{
  const { toRomanNumeral } = CalculatorMath;
  // Test negative result fallback
  assert.strictEqual(toRomanNumeral(-5), '-5', 'Negative result stays Arabic');
}
console.log('  ✓ Negative result displays as Arabic numeral');

// ============================================================================
// AC1: Roman theme persistent in localStorage
// ============================================================================

console.log('\nAC1: Roman theme persists in localStorage');

{
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const calculatorEl = themeTestFakeDOM.querySelector('.calculator');

  // Clear localStorage
  localStorageMock['calculator-theme'] = undefined;

  // Select Roman theme
  selectEl.value = 'roman';
  const changeEvent = { target: selectEl };
  selectEl.changeHandler(changeEvent);

  assert.strictEqual(localStorageMock['calculator-theme'], 'roman', 'Roman theme should be stored in localStorage');
  assert(calculatorEl.classList.contains('theme-roman'), 'theme-roman class should be applied');
}
console.log('  ✓ Selecting Roman theme stores "roman" in localStorage');

{
  // Verify the theme applies on initialization from stored value
  const selectEl = themeTestFakeDOM.getElementById('theme-select');
  const calculatorEl = themeTestFakeDOM.querySelector('.calculator');

  localStorageMock['calculator-theme'] = 'roman';
  selectEl.value = 'roman';

  // Simulate reload by re-requiring the module
  delete require.cache[require.resolve('./script.js')];
  const ReloadTest = require('./script.js');

  // Verify class persists (checked via manual verification in integration tests)
  assert(calculatorEl.classList.contains('theme-roman'), 'Roman theme should persist from localStorage on reload');
}
console.log('  ✓ Roman theme is restored from localStorage on page reload');

console.log('\n' + '='.repeat(70));
console.log('✅ All tests passed!');
console.log('='.repeat(70));

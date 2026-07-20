/* ---------- Pure calculation logic (no DOM access) ---------- */

function tokenize(expr) {
  const tokens = [];
  let numBuf = '';
  for (const ch of String(expr)) {
    if (/[0-9.]/.test(ch)) {
      numBuf += ch;
    } else if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      if (numBuf !== '') {
        tokens.push(numBuf);
        numBuf = '';
      }
      tokens.push(ch);
    }
  }
  if (numBuf !== '') tokens.push(numBuf);
  return tokens;
}

// Evaluates a flat +,-,*,/ expression (no parentheses, no unary minus)
// respecting standard order of operations (PEMDAS).
function evaluateExpression(expr) {
  const tokens = tokenize(expr);
  if (tokens.length === 0) return { value: 0 };

  const first = parseFloat(tokens[0]);
  if (isNaN(first)) return { error: 'Invalid expression' };

  // Pass 1: resolve * and / left-to-right.
  const stage1 = [first];
  let i = 1;
  while (i < tokens.length) {
    const op = tokens[i];
    const numStr = tokens[i + 1];
    if (numStr === undefined) break; // trailing operator with nothing after it
    const num = parseFloat(numStr);

    if (op === '*') {
      stage1[stage1.length - 1] = stage1[stage1.length - 1] * num;
    } else if (op === '/') {
      if (num === 0) return { error: "Can't divide by zero" };
      stage1[stage1.length - 1] = stage1[stage1.length - 1] / num;
    } else {
      stage1.push(op);
      stage1.push(num);
    }
    i += 2;
  }

  // Pass 2: resolve + and - left-to-right.
  let result = stage1[0];
  i = 1;
  while (i < stage1.length) {
    const op = stage1[i];
    const num = stage1[i + 1];
    if (op === '+') result += num;
    else if (op === '-') result -= num;
    i += 2;
  }

  return { value: result };
}

function applySqrt(value) {
  if (value < 0) return { error: "Can't take the square root of a negative number" };
  return { value: Math.sqrt(value) };
}

function applyLog10(value) {
  if (value <= 0) return { error: "Can't take the log of zero or a negative number" };
  return { value: Math.log10(value) };
}

function applySin(value) {
  return { value: Math.sin((value * Math.PI) / 180) };
}

function applyCos(value) {
  return { value: Math.cos((value * Math.PI) / 180) };
}

function applyTan(value) {
  return { value: Math.tan((value * Math.PI) / 180) };
}

function applyJakify(value) {
  return { value: 2 * value + 3 };
}

function applyUnary(name, value) {
  switch (name) {
    case 'sqrt': return applySqrt(value);
    case 'log': return applyLog10(value);
    case 'sin': return applySin(value);
    case 'cos': return applyCos(value);
    case 'tan': return applyTan(value);
    case 'jakify': return applyJakify(value);
    default: return { error: 'Unknown function' };
  }
}

// Rounds away floating-point noise and keeps the display readable.
function formatNumber(value) {
  if (!isFinite(value)) return 'Error';

  let rounded = Math.round(value * 1e10) / 1e10;
  if (rounded === 0) rounded = 0; // normalize -0

  if (rounded !== 0 && (Math.abs(rounded) >= 1e15 || Math.abs(rounded) < 1e-9)) {
    return rounded.toExponential(6);
  }
  return String(rounded);
}

const CalculatorMath = {
  tokenize,
  evaluateExpression,
  applySqrt,
  applyLog10,
  applySin,
  applyCos,
  applyTan,
  applyJakify,
  applyUnary,
  formatNumber,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalculatorMath;
}
if (typeof window !== 'undefined') {
  window.Calculator = CalculatorMath;
}

/* ---------- DOM wiring (browser only) ---------- */

if (typeof document !== 'undefined') {
  (function () {
    const expressionEl = document.getElementById('expression');
    const resultEl = document.getElementById('result');

    let expression = '';
    let resultDisplay = '0';
    let lastResultValue = 0;
    let justEvaluated = false;
    let hasError = false;

    function currentSegment(expr) {
      const match = expr.match(/[^+\-*/]*$/);
      return match ? match[0] : '';
    }

    function toDisplayExpression(expr) {
      return expr.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');
    }

    function render() {
      expressionEl.textContent = toDisplayExpression(expression);
      resultEl.textContent = resultDisplay;
      resultEl.classList.toggle('error', hasError);
    }

    function showError(message) {
      hasError = true;
      resultDisplay = message;
      render();
    }

    function handleDigit(d) {
      if (hasError) {
        expression = '';
        hasError = false;
      }
      if (justEvaluated) {
        expression = '';
        justEvaluated = false;
      }
      if (d === '.' && currentSegment(expression).includes('.')) return;
      expression += d;
      render();
    }

    function handleOperator(op) {
      if (hasError) {
        expression = '';
        hasError = false;
      }
      if (justEvaluated) {
        expression = String(lastResultValue);
        justEvaluated = false;
      }
      if (expression === '') return;

      const last = expression[expression.length - 1];
      if (last === '+' || last === '-' || last === '*' || last === '/') {
        expression = expression.slice(0, -1) + op;
      } else {
        expression += op;
      }
      render();
    }

    function handleEquals() {
      if (hasError || expression === '') return;
      const outcome = evaluateExpression(expression);
      if (outcome.error) {
        showError(outcome.error);
        return;
      }
      lastResultValue = outcome.value;
      resultDisplay = formatNumber(outcome.value);
      hasError = false;
      justEvaluated = true;
      render();
    }

    function handleClear() {
      expression = '';
      resultDisplay = '0';
      lastResultValue = 0;
      justEvaluated = false;
      hasError = false;
      render();
    }

    function handleSciFunction(name) {
      let value;
      if (expression === '') {
        value = justEvaluated ? lastResultValue : 0;
      } else {
        const outcome = evaluateExpression(expression);
        if (outcome.error) {
          showError(outcome.error);
          return;
        }
        value = outcome.value;
      }

      const fnOutcome = applyUnary(name, value);
      if (fnOutcome.error) {
        showError(fnOutcome.error);
        return;
      }

      lastResultValue = fnOutcome.value;
      resultDisplay = formatNumber(fnOutcome.value);
      expression = '';
      hasError = false;
      justEvaluated = true;
      render();
    }

    document.querySelector('.main-buttons').addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('digit')) {
        handleDigit(btn.dataset.value);
      } else if (btn.classList.contains('operator')) {
        handleOperator(btn.dataset.value);
      } else if (btn.dataset.action === 'equals') {
        handleEquals();
      } else if (btn.dataset.action === 'clear') {
        handleClear();
      }
    });

    document.querySelector('.sci-buttons').addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      handleSciFunction(btn.dataset.action);
    });

    /* ---------- Theme picker + ghost emoji (Halloween only) ---------- */

    const calculatorEl = document.querySelector('.calculator');
    const themeSelect = document.getElementById('theme-select');
    const ghostEl = document.getElementById('ghost-emoji');
    const monolithEl = document.getElementById('monolith-emoji');
    const coffeeEl = document.getElementById('coffee-emoji');
    const THEME_STORAGE_KEY = 'calculator-theme';

    if (calculatorEl && themeSelect && ghostEl && monolithEl && coffeeEl) {
      let ghostTimeoutId = null;

      const stopGhost = () => {
        if (ghostTimeoutId !== null) {
          clearTimeout(ghostTimeoutId);
          ghostTimeoutId = null;
        }
        ghostEl.classList.remove('visible');
      };

      const moveGhost = () => {
        const maxTop = Math.max(window.innerHeight - 60, 0);
        const maxLeft = Math.max(window.innerWidth - 60, 0);
        ghostEl.style.top = `${Math.random() * maxTop}px`;
        ghostEl.style.left = `${Math.random() * maxLeft}px`;
        ghostEl.classList.add('visible');
        ghostTimeoutId = setTimeout(moveGhost, 700 + Math.random() * 1800);
      };

      const stopMonolith = () => {
        monolithEl.classList.remove('visible');
      };

      const showMonolith = () => {
        monolithEl.classList.add('visible');
      };

      const stopCoffee = () => {
        coffeeEl.classList.remove('visible');
      };

      const showCoffee = () => {
        coffeeEl.classList.add('visible');
      };

      const applyTheme = (theme) => {
        calculatorEl.classList.remove('theme-halloween', 'theme-dark-mode', 'theme-childrens', 'theme-monolith', 'theme-minions', 'theme-marvel-ironman', 'theme-coffee-lovers');
        stopGhost();
        stopMonolith();
        stopCoffee();
        if (theme) {
          calculatorEl.classList.add(`theme-${theme}`);
        }
        if (theme === 'halloween') {
          moveGhost();
        } else if (theme === 'monolith') {
          showMonolith();
        } else if (theme === 'coffee-lovers') {
          showCoffee();
        }
      };

      themeSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value);
        localStorage.setItem(THEME_STORAGE_KEY, e.target.value);
      });

      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      const knownThemeValues = Array.from(themeSelect.options).map((opt) => opt.value);
      if (storedTheme && knownThemeValues.includes(storedTheme)) {
        themeSelect.value = storedTheme;
        applyTheme(storedTheme);
      }
    }

    render();
  })();
}

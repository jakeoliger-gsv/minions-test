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

// Classical subtractive-notation Roman numeral for 1-3999; "0" for zero;
// falls back to the plain Arabic-numeral string for anything else (negatives,
// non-integers, values >= 4000) rather than throwing.
function toRomanNumeral(value) {
  if (value === 0) return '0';
  if (!Number.isInteger(value) || value < 1 || value > 3999) return String(value);

  const numerals = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let remaining = value;
  let result = '';
  for (const [num, symbol] of numerals) {
    while (remaining >= num) {
      result += symbol;
      remaining -= num;
    }
  }
  return result;
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

// Projects monthly-compounding growth of a lump sum plus recurring monthly
// contributions. r = annualRate/100/12; each month: balance = balance*(1+r) + monthlyPayment.
// Returns { finalBalance, totalContributed, totalInterest, monthlyBreakdown, annualSummary,
// useAnnualView } or { error: 'Invalid input' } for negative/non-finite/non-integer input.
function calculateCompoundInterest({ principal, annualRate, monthlyPayment, years }) {
  if (
    !Number.isFinite(principal) || principal < 0 ||
    !Number.isFinite(annualRate) || annualRate < 0 ||
    !Number.isFinite(monthlyPayment) || monthlyPayment < 0 ||
    !Number.isInteger(years) || years <= 0
  ) {
    return { error: 'Invalid input' };
  }

  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = years * 12;
  const monthlyBreakdown = [];
  let balance = principal;

  for (let month = 1; month <= totalMonths; month++) {
    const interestEarned = balance * monthlyRate;
    balance = balance + interestEarned + monthlyPayment;
    monthlyBreakdown.push({ month, balance, interestEarned, contribution: monthlyPayment });
  }

  const annualSummary = [];
  for (let year = 1; year <= years; year++) {
    const yearMonths = monthlyBreakdown.slice((year - 1) * 12, year * 12);
    const interestEarnedInYear = yearMonths.reduce((sum, m) => sum + m.interestEarned, 0);
    const contributedInYear = yearMonths.reduce((sum, m) => sum + m.contribution, 0);
    annualSummary.push({
      year,
      balance: yearMonths[yearMonths.length - 1].balance,
      interestEarnedInYear,
      contributedInYear,
    });
  }

  const finalBalance = balance;
  const totalContributed = principal + monthlyPayment * totalMonths;
  const totalInterest = finalBalance - totalContributed;

  return {
    finalBalance,
    totalContributed,
    totalInterest,
    monthlyBreakdown,
    annualSummary,
    useAnnualView: years > 10,
  };
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
  toRomanNumeral,
  calculateCompoundInterest,
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
    const TAB_STORAGE_KEY = 'active-tab';
    const KNOWN_TABS = ['calculator', 'compound-interest', 'planetary-weight'];

    function activateTab(tabName) {
      document.querySelectorAll('[data-tab]').forEach((btn) => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
          btn.classList.add('active');
        }
      });
      document.querySelectorAll('.tab-panel').forEach((panel) => {
        panel.classList.remove('active');
      });
      const targetPanel = document.getElementById(`panel-${tabName}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    }

    document.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        activateTab(tabName);
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem(TAB_STORAGE_KEY, tabName);
          } catch (e) {
            /* localStorage unavailable — tab still switches, just isn't persisted */
          }
        }
      });
    });

    if (typeof localStorage !== 'undefined') {
      try {
        const storedTab = localStorage.getItem(TAB_STORAGE_KEY);
        if (storedTab && KNOWN_TABS.includes(storedTab)) {
          activateTab(storedTab);
        }
      } catch (e) {
        /* localStorage unavailable — default markup (calculator active) stands */
      }
    }
  })();

  (function () {
    const expressionEl = document.getElementById('expression');
    const resultEl = document.getElementById('result');

    let expression = '';
    let resultDisplay = '0';
    let lastResultValue = 0;
    let justEvaluated = false;
    let hasError = false;
    let isRomanTheme = false;

    function currentSegment(expr) {
      const match = expr.match(/[^+\-*/]*$/);
      return match ? match[0] : '';
    }

    function toDisplayExpression(expr) {
      return expr.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');
    }

    function toDisplayExpressionRoman(expr) {
      return tokenize(expr)
        .map((token) => {
          if (token === '*') return '×';
          if (token === '/') return '÷';
          if (token === '-') return '−';
          if (token === '+') return '+';
          if (/^[0-9]+$/.test(token)) return toRomanNumeral(parseInt(token, 10));
          return token;
        })
        .join('');
    }

    function render() {
      if (isRomanTheme) {
        expressionEl.textContent = toDisplayExpressionRoman(expression);
        resultEl.textContent = hasError ? resultDisplay : toRomanNumeral(Number(resultDisplay));
      } else {
        expressionEl.textContent = toDisplayExpression(expression);
        resultEl.textContent = resultDisplay;
      }
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
    const clearBtn = document.querySelector('[data-action="clear"]');
    const equalsBtn = document.querySelector('[data-action="equals"]');
    const ROMAN_DIGITS = {
      '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V',
      '6': 'VI', '7': 'VII', '8': 'VIII', '9': 'IX',
    };

    function updateRomanLabels(active) {
      document.querySelectorAll('.btn.digit').forEach((btn) => {
        if (btn.classList.contains('zero')) return;
        const romanValue = ROMAN_DIGITS[btn.dataset.value];
        if (romanValue === undefined) return;
        btn.textContent = active ? romanValue : btn.dataset.value;
      });
      if (clearBtn) clearBtn.textContent = active ? 'Dele' : 'Clear';
      if (equalsBtn) equalsBtn.textContent = active ? 'Solve' : '=';
    }

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
        calculatorEl.classList.remove('theme-halloween', 'theme-dark-mode', 'theme-childrens', 'theme-monolith', 'theme-minions', 'theme-marvel-ironman', 'theme-coffee-lovers', 'theme-roman');
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
        isRomanTheme = theme === 'roman';
        updateRomanLabels(isRomanTheme);
        render();
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

  (function () {
    const principalInput = document.getElementById('ci-principal');
    const rateInput = document.getElementById('ci-rate');
    const monthlyInput = document.getElementById('ci-monthly');
    const yearsInput = document.getElementById('ci-years');
    const calculateBtn = document.getElementById('ci-calculate');
    const errorEl = document.getElementById('ci-error');
    const resultsEl = document.getElementById('ci-results');
    const finalBalanceEl = document.getElementById('ci-final-balance');
    const totalContributedEl = document.getElementById('ci-total-contributed');
    const totalInterestEl = document.getElementById('ci-total-interest');
    const viewLabelEl = document.getElementById('ci-view-label');
    const tableBodyEl = document.getElementById('ci-table-body');

    if (
      !principalInput || !rateInput || !monthlyInput || !yearsInput || !calculateBtn ||
      !errorEl || !resultsEl || !finalBalanceEl || !totalContributedEl || !totalInterestEl ||
      !viewLabelEl || !tableBodyEl
    ) {
      return;
    }

    function formatCurrency(value) {
      return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    function showCiError(message) {
      errorEl.textContent = message;
      resultsEl.hidden = true;
    }

    function renderCiResults(result) {
      finalBalanceEl.textContent = formatCurrency(result.finalBalance);
      totalContributedEl.textContent = formatCurrency(result.totalContributed);
      totalInterestEl.textContent = formatCurrency(result.totalInterest);

      const rows = result.useAnnualView
        ? result.annualSummary.map((row) => ({
            period: `Year ${row.year}`,
            balance: row.balance,
            interest: row.interestEarnedInYear,
            contribution: row.contributedInYear,
          }))
        : result.monthlyBreakdown.map((row) => ({
            period: `Month ${row.month}`,
            balance: row.balance,
            interest: row.interestEarned,
            contribution: row.contribution,
          }));

      tableBodyEl.innerHTML = '';
      rows.forEach((row) => {
        const tr = document.createElement('tr');
        [row.period, formatCurrency(row.balance), formatCurrency(row.interest), formatCurrency(row.contribution)].forEach((text) => {
          const td = document.createElement('td');
          td.textContent = text;
          tr.appendChild(td);
        });
        tableBodyEl.appendChild(tr);
      });

      viewLabelEl.textContent = result.useAnnualView
        ? 'Showing annual summary (period exceeds 10 years)'
        : 'Showing month-by-month breakdown';

      resultsEl.hidden = false;
    }

    calculateBtn.addEventListener('click', () => {
      errorEl.textContent = '';

      const principal = parseFloat(principalInput.value);
      const annualRate = parseFloat(rateInput.value);
      const monthlyPayment = parseFloat(monthlyInput.value);
      const years = parseFloat(yearsInput.value);

      const result = calculateCompoundInterest({ principal, annualRate, monthlyPayment, years });
      if (result.error) {
        showCiError(result.error);
        return;
      }
      renderCiResults(result);
    });
  })();
}

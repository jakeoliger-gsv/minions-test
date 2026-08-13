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

function applyAsin(value) {
  if (value < -1 || value > 1) return { error: "Can't take the arcsine of a value outside [-1, 1]" };
  return { value: (Math.asin(value) * 180) / Math.PI };
}

function applyAcos(value) {
  if (value < -1 || value > 1) return { error: "Can't take the arccosine of a value outside [-1, 1]" };
  return { value: (Math.acos(value) * 180) / Math.PI };
}

function applyAtan(value) {
  return { value: (Math.atan(value) * 180) / Math.PI };
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
    case 'asin': return applyAsin(value);
    case 'acos': return applyAcos(value);
    case 'atan': return applyAtan(value);
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

// Surface gravity of each solar-system body relative to Earth (Earth = 1),
// used to convert an Earth weight into the equivalent weight elsewhere.
const PLANETARY_GRAVITY = {
  Mercury: 0.38,
  Venus: 0.904,
  Moon: 0.1655,
  Mars: 0.3794,
  Jupiter: 2.528,
  Saturn: 1.065,
  Uranus: 0.886,
  Neptune: 1.137,
  Pluto: 0.063,
  Titan: 0.138,
};

// Converts an Earth weight in lbs into the equivalent weight on every body in
// PLANETARY_GRAVITY. Returns an array of { body, weight } (weight = earthWeightLbs
// times the body's gravity ratio, rounded to 2 decimals) sorted ascending by
// weight, or { error: 'Weight must be a positive number' } for zero, negative,
// or non-finite input.
function calculatePlanetaryWeights(earthWeightLbs) {
  if (!Number.isFinite(earthWeightLbs) || earthWeightLbs <= 0) {
    return { error: 'Weight must be a positive number' };
  }

  return Object.keys(PLANETARY_GRAVITY)
    .map((body) => ({
      body,
      weight: Math.round(earthWeightLbs * PLANETARY_GRAVITY[body] * 100) / 100,
    }))
    .sort((a, b) => a.weight - b.weight);
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
  applyAsin,
  applyAcos,
  applyAtan,
  applyJakify,
  applyUnary,
  formatNumber,
  toRomanNumeral,
  calculateCompoundInterest,
  PLANETARY_GRAVITY,
  calculatePlanetaryWeights,
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
    let inverseMode = false;

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

    const invToggleBtn = document.getElementById('inv-toggle');
    const sinBtn = document.querySelector('[data-action="sin"]');
    const cosBtn = document.querySelector('[data-action="cos"]');
    const tanBtn = document.querySelector('[data-action="tan"]');
    const INVERSE_TRIG_LABELS = {
      sin: { standard: 'sin', inverse: 'sin⁻¹' },
      cos: { standard: 'cos', inverse: 'cos⁻¹' },
      tan: { standard: 'tan', inverse: 'tan⁻¹' },
    };

    function updateInverseLabels(active) {
      if (sinBtn) sinBtn.textContent = active ? INVERSE_TRIG_LABELS.sin.inverse : INVERSE_TRIG_LABELS.sin.standard;
      if (cosBtn) cosBtn.textContent = active ? INVERSE_TRIG_LABELS.cos.inverse : INVERSE_TRIG_LABELS.cos.standard;
      if (tanBtn) tanBtn.textContent = active ? INVERSE_TRIG_LABELS.tan.inverse : INVERSE_TRIG_LABELS.tan.standard;
      if (invToggleBtn) invToggleBtn.classList.toggle('inv-active', active);
    }

    function handleToggleInverse() {
      inverseMode = !inverseMode;
      updateInverseLabels(inverseMode);
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
      if (btn.dataset.action === 'toggle-inverse') {
        handleToggleInverse();
        return;
      }
      const action = btn.dataset.action;
      const isInvertibleTrig = action === 'sin' || action === 'cos' || action === 'tan';
      handleSciFunction(inverseMode && isInvertibleTrig ? `a${action}` : action);
    });

    /* ---------- Theme picker + ghost emoji (Halloween only) ---------- */

    const calculatorEl = document.querySelector('.calculator');
    const themeSelect = document.getElementById('theme-select');
    const ghostEl = document.getElementById('ghost-emoji');
    const monolithEl = document.getElementById('monolith-emoji');
    const coffeeEl = document.getElementById('coffee-emoji');
    const alienEl = document.getElementById('alien-emoji');
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
      let alienTimeoutId = null;

      const stopGhost = () => {
        if (!ghostEl) return;
        if (ghostTimeoutId !== null) {
          clearTimeout(ghostTimeoutId);
          ghostTimeoutId = null;
        }
        ghostEl.classList.remove('visible');
      };

      const moveGhost = () => {
        if (!ghostEl) return;
        const maxTop = Math.max(window.innerHeight - 60, 0);
        const maxLeft = Math.max(window.innerWidth - 60, 0);
        ghostEl.style.top = `${Math.random() * maxTop}px`;
        ghostEl.style.left = `${Math.random() * maxLeft}px`;
        ghostEl.classList.add('visible');
        ghostTimeoutId = setTimeout(moveGhost, 700 + Math.random() * 1800);
      };

      const stopMonolith = () => {
        if (!monolithEl) return;
        monolithEl.classList.remove('visible');
      };

      const showMonolith = () => {
        if (!monolithEl) return;
        monolithEl.classList.add('visible');
      };

      const stopCoffee = () => {
        if (!coffeeEl) return;
        coffeeEl.classList.remove('visible');
      };

      const showCoffee = () => {
        if (!coffeeEl) return;
        coffeeEl.classList.add('visible');
      };

      const stopAlien = () => {
        if (!alienEl) return;
        if (alienTimeoutId !== null) {
          clearTimeout(alienTimeoutId);
          alienTimeoutId = null;
        }
        alienEl.classList.remove('visible');
      };

      const moveAlien = () => {
        if (!alienEl) return;
        const maxTop = Math.max(window.innerHeight - 60, 0);
        const maxLeft = Math.max(window.innerWidth - 60, 0);
        alienEl.style.top = `${Math.random() * maxTop}px`;
        alienEl.style.left = `${Math.random() * maxLeft}px`;
        alienEl.classList.add('visible');
        alienTimeoutId = setTimeout(moveAlien, 700 + Math.random() * 1800);
      };

      const applyTheme = (theme) => {
        calculatorEl.classList.remove('theme-halloween', 'theme-dark-mode', 'theme-childrens', 'theme-monolith', 'theme-minions', 'theme-marvel-ironman', 'theme-coffee-lovers', 'theme-roman', 'theme-space', 'theme-alien-monster');
        stopGhost();
        stopMonolith();
        stopCoffee();
        stopAlien();
        if (theme) {
          calculatorEl.classList.add(`theme-${theme}`);
        }
        if (theme === 'halloween') {
          moveGhost();
        } else if (theme === 'monolith') {
          showMonolith();
        } else if (theme === 'coffee-lovers') {
          showCoffee();
        } else if (theme === 'alien-monster') {
          moveAlien();
        }
        isRomanTheme = theme === 'roman';
        updateRomanLabels(isRomanTheme);
        render();
      };

      themeSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value);
        localStorage.setItem(THEME_STORAGE_KEY, e.target.value);
      });

      const DEFAULT_THEME = 'roman';
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      const knownThemeValues = Array.from(themeSelect.options).map((opt) => opt.value);
      const themeToApply =
        storedTheme !== null && knownThemeValues.includes(storedTheme) ? storedTheme : DEFAULT_THEME;
      themeSelect.value = themeToApply;
      applyTheme(themeToApply);
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

  (function () {
    const weightInput = document.getElementById('pw-earth-weight');
    const calculateBtn = document.getElementById('pw-calculate');
    const errorEl = document.getElementById('pw-error');
    const resultsEl = document.getElementById('pw-results');
    const tableEl = document.getElementById('pw-table');

    if (!weightInput || !calculateBtn || !errorEl || !resultsEl || !tableEl) {
      return;
    }

    const tabLabelEl = document.querySelector('[data-tab="planetary-weight"]');
    const titleEl = document.getElementById('pw-title');
    const earthWeightLabelEl = document.getElementById('pw-earth-weight-label');
    const thBodyEl = document.getElementById('pw-th-body');
    const thWeightEl = document.getElementById('pw-th-weight');
    const thRelativeEl = document.getElementById('pw-th-relative');
    const langSelect = document.getElementById('pw-lang-select');

    let currentLocale = window.Translations ? window.Translations.getLocale() : 'en';
    let lastResults = null;
    let lastShowedError = false;

    // Astronomical/astrological symbol shown beside each body's name.
    const BODY_EMOJI = {
      Mercury: '☿',
      Venus: '♀',
      Moon: '🌙',
      Mars: '♂',
      Jupiter: '♃',
      Saturn: '♄',
      Uranus: '♅',
      Neptune: '♆',
      Pluto: '♇',
      Titan: '🛰️',
    };

    function renderStaticStrings() {
      if (!window.Translations) {
        return;
      }
      const t = window.Translations.t;
      if (tabLabelEl) tabLabelEl.textContent = t('planetaryWeight.tabLabel', currentLocale);
      if (titleEl) titleEl.textContent = t('planetaryWeight.title', currentLocale);
      if (earthWeightLabelEl) earthWeightLabelEl.textContent = t('planetaryWeight.earthWeightLabel', currentLocale);
      calculateBtn.textContent = t('planetaryWeight.calculateButton', currentLocale);
      if (thBodyEl) thBodyEl.textContent = t('planetaryWeight.tableHeaderBody', currentLocale);
      if (thWeightEl) thWeightEl.textContent = t('planetaryWeight.tableHeaderWeight', currentLocale);
      if (thRelativeEl) thRelativeEl.textContent = t('planetaryWeight.tableHeaderRelative', currentLocale);
    }

    function showPwError(message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      resultsEl.hidden = true;
    }

    function renderPwResults(results) {
      const jupiter = results.find((row) => row.body === 'Jupiter');
      const jupiterWeight = jupiter ? jupiter.weight : 0;
      const unitLabel = window.Translations ? window.Translations.t('planetaryWeight.unitLbs', currentLocale) : 'lbs';

      tableEl.innerHTML = '';
      results.forEach((row) => {
        const tr = document.createElement('tr');
        const bodyName = window.Translations
          ? window.Translations.t('planetaryWeight.bodies.' + row.body, currentLocale)
          : row.body;

        const bodyCell = document.createElement('td');
        bodyCell.textContent = `${BODY_EMOJI[row.body] || ''} ${bodyName}`.trim();
        tr.appendChild(bodyCell);

        const weightCell = document.createElement('td');
        weightCell.className = 'pw-weight';
        weightCell.textContent = `${row.weight.toFixed(2)} ${unitLabel}`;
        tr.appendChild(weightCell);

        const barCell = document.createElement('td');
        const bar = document.createElement('div');
        bar.className = 'pw-bar';
        bar.style.width = `${((row.weight / jupiterWeight) * 100).toFixed(1)}%`;
        barCell.appendChild(bar);
        tr.appendChild(barCell);

        tableEl.appendChild(tr);
      });

      errorEl.hidden = true;
      resultsEl.hidden = false;
    }

    calculateBtn.addEventListener('click', () => {
      const earthWeight = parseFloat(weightInput.value);
      const result = calculatePlanetaryWeights(earthWeight);
      if (result.error) {
        lastResults = null;
        lastShowedError = true;
        const message = window.Translations
          ? window.Translations.t('planetaryWeight.errorPositiveNumber', currentLocale)
          : result.error;
        showPwError(message);
        return;
      }
      lastShowedError = false;
      lastResults = result;
      renderPwResults(result);
    });

    if (langSelect) {
      langSelect.value = currentLocale;
      langSelect.addEventListener('change', (e) => {
        currentLocale = e.target.value;
        if (window.Translations) {
          window.Translations.setLocale(currentLocale);
        }
        renderStaticStrings();
        if (lastShowedError) {
          const message = window.Translations
            ? window.Translations.t('planetaryWeight.errorPositiveNumber', currentLocale)
            : '';
          showPwError(message);
        } else if (lastResults) {
          renderPwResults(lastResults);
        }
      });
    }

    renderStaticStrings();
  })();
}

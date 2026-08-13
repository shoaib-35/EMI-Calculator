// ═══════════════════════════════════════════════════════════════════════
// EmiEngine — direct port of EmiEngine.kt
// ═══════════════════════════════════════════════════════════════════════
const EmiEngine = (() => {

  function round2(v) { return Math.round(v * 100) / 100; }
  function round4(v) { return Math.round(v * 10000) / 10000; }

  function calculateEmiReducing(principal, annualRate, months) {
    if (annualRate === 0) return round2(principal / months);
    const r = annualRate / 12 / 100;
    const emi = principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    return round2(emi);
  }

  function calculateEmiFlat(principal, annualFlatRate, months) {
    const years = months / 12;
    const totalInterest = principal * (annualFlatRate / 100) * years;
    const emi = (principal + totalInterest) / months;
    return round2(emi);
  }

  function reducingToFlat(principal, reducingRate, months) {
    const emi = calculateEmiReducing(principal, reducingRate, months);
    const totalInterest = emi * months - principal;
    const years = months / 12;
    const flatRate = (totalInterest / (principal * years)) * 100;
    return round4(flatRate);
  }

  function flatToReducing(principal, flatRate, months) {
    const years = months / 12;
    const flatInterest = principal * (flatRate / 100) * years;
    const targetEmi = (principal + flatInterest) / months;
    let low = 0, high = 100;
    for (let i = 0; i < 200; i++) {
      const mid = (low + high) / 2;
      const emi = calculateEmiReducing(principal, mid, months);
      if (emi > targetEmi) high = mid; else low = mid;
    }
    return round4((low + high) / 2);
  }

  function generateAmortization(principal, annualRate, months, isReducing) {
    const schedule = [];

    if (isReducing) {
      if (annualRate === 0) {
        const emi = principal / months;
        let balance = principal;
        for (let i = 1; i <= months; i++) {
          balance = round2(balance - emi);
          schedule.push({ month: i, emi: round2(emi), principal: round2(emi), interest: 0, balance: Math.max(balance, 0) });
        }
      } else {
        const r = annualRate / 12 / 100;
        const emi = calculateEmiReducing(principal, annualRate, months);
        let balance = principal;
        for (let i = 1; i <= months; i++) {
          const interest = round2(balance * r);
          const principalPart = round2(emi - interest);
          balance = round2(balance - principalPart);
          schedule.push({ month: i, emi, principal: principalPart, interest, balance: Math.max(balance, 0) });
        }
      }
    } else {
      const emi = calculateEmiFlat(principal, annualRate, months);
      const years = months / 12;
      const totalInterest = principal * (annualRate / 100) * years;
      const monthlyInterest = round2(totalInterest / months);
      const monthlyPrincipal = round2(principal / months);
      let balance = principal;
      for (let i = 1; i <= months; i++) {
        balance = round2(balance - monthlyPrincipal);
        schedule.push({ month: i, emi, principal: monthlyPrincipal, interest: monthlyInterest, balance: Math.max(balance, 0) });
      }
    }
    return schedule;
  }

  function calculate(principal, rate, months) {
    const emiReducing = calculateEmiReducing(principal, rate, months);
    const emiFlat = calculateEmiFlat(principal, rate, months);

    const totalReducing = round2(emiReducing * months);
    const interestReducing = round2(totalReducing - principal);

    const totalFlat = round2(emiFlat * months);
    const interestFlat = round2(totalFlat - principal);

    const equivFlatFromReducing = reducingToFlat(principal, rate, months);
    const equivReducingFromFlat = flatToReducing(principal, rate, months);

    const scheduleReducing = generateAmortization(principal, rate, months, true);
    const scheduleFlat = generateAmortization(principal, rate, months, false);

    return {
      rate, emiReducing, emiFlat, totalReducing, totalFlat,
      interestReducing, interestFlat, equivFlatFromReducing, equivReducingFromFlat,
      scheduleReducing, scheduleFlat
    };
  }

  function toYearlySummary(schedule) {
    const map = new Map();
    schedule.forEach(row => {
      const yr = Math.floor((row.month - 1) / 12) + 1;
      const prev = map.get(yr) || [0, 0, 0];
      map.set(yr, [round2(prev[0] + row.principal), round2(prev[1] + row.interest), row.balance]);
    });
    return Array.from(map.entries()).map(([year, v]) => ({
      year, principalPaid: v[0], interestPaid: v[1], balance: v[2]
    }));
  }

  function formatInr(amount) {
    const isNegative = amount < 0;
    const abs = Math.abs(amount);
    const intPart = Math.floor(abs);
    const decPart = Math.round((abs - intPart) * 100);

    const intStr = String(intPart);
    let formatted;
    if (intStr.length <= 3) {
      formatted = intStr;
    } else {
      const prefix = intStr.slice(0, intStr.length - 3);
      const last3 = intStr.slice(intStr.length - 3);
      let grouped = '';
      const rev = prefix.split('').reverse();
      for (let i = 0; i < rev.length; i++) {
        if (i > 0 && i % 2 === 0) grouped = ',' + grouped;
        grouped = rev[i] + grouped;
      }
      formatted = grouped + ',' + last3;
    }
    const dec = String(decPart).padStart(2, '0');
    return (isNegative ? '-' : '') + '₹' + formatted + '.' + dec;
  }

  return { calculate, toYearlySummary, formatInr, calculateEmiReducing, calculateEmiFlat };
})();

// ═══════════════════════════════════════════════════════════════════════
// UI State — mirrors EmiViewModel
// ═══════════════════════════════════════════════════════════════════════
const state = {
  principal: '500000',
  months: '24',
  rate: '10',
  result: null,
  error: null,
  scheduleType: 'reducing',
  scheduleTab: 'full',
  donutTab: 'reducing'
};

// ── DOM refs ──
const $ = id => document.getElementById(id);

const inputScreen = $('inputScreen');
const resultsScreen = $('resultsScreen');

// Two sets of the same fields: the standalone input screen (used on mobile,
// and as the very first screen on desktop before a calculation exists) and
// the inline copy embedded in column 1 of the desktop results dashboard.
const principalInput = $('principal');
const monthsRange = $('monthsRange');
const monthsInput = $('monthsInput');
const monthsValueLabel = $('monthsValueLabel');
const rateRange = $('rateRange');
const rateInput = $('rateInput');
const rateValueLabel = $('rateValueLabel');
const errorMsg = $('errorMsg');
const calculateBtn = $('calculateBtn');

const principalInputR = $('principalR');
const monthsRangeR = $('monthsRangeR');
const monthsInputR = $('monthsInputR');
const monthsValueLabelR = $('monthsValueLabelR');
const rateRangeR = $('rateRangeR');
const rateInputR = $('rateInputR');
const rateValueLabelR = $('rateValueLabelR');
const errorMsgR = $('errorMsgR');
const recalculateBtn = $('recalculateBtn');

// ── Theme ──
function applyTheme(isDark) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  const icon = isDark ? '☀️' : '🌙';
  $('themeToggleInput').textContent = icon;
  $('themeToggleResults').textContent = icon;
  localStorage.setItem('emi-theme', isDark ? 'dark' : 'light');
}

function initTheme() {
  const saved = localStorage.getItem('emi-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ? saved === 'dark' : prefersDark);
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  applyTheme(!isDark);
}

$('themeToggleInput').addEventListener('click', toggleTheme);
$('themeToggleResults').addEventListener('click', toggleTheme);

// ── Sync helpers: keep both copies of each field showing the same value ──
function syncPrincipal(value) {
  state.principal = value;
  principalInput.value = value;
  principalInputR.value = value;
}
function syncMonths(value) {
  state.months = value;
  monthsInput.value = value;
  monthsInputR.value = value;
  const clamped = Math.min(360, Math.max(3, Number(value) || 3));
  monthsRange.value = clamped;
  monthsRangeR.value = clamped;
  monthsValueLabel.textContent = value;
  monthsValueLabelR.textContent = value;
}
function syncRate(value) {
  state.rate = value;
  rateInput.value = value;
  rateInputR.value = value;
  const clamped = Math.min(36, Math.max(0.1, Number(value) || 0.1));
  rateRange.value = clamped;
  rateRangeR.value = clamped;
  rateValueLabel.textContent = value;
  rateValueLabelR.textContent = value;
}

// ── Input wiring — attach the same handlers to both field sets ──
[principalInput, principalInputR].forEach(el => {
  el.addEventListener('input', e => { syncPrincipal(e.target.value); });
});

[[monthsRange, monthsInput, monthsValueLabel], [monthsRangeR, monthsInputR, monthsValueLabelR]]
  .forEach(([range, text, label]) => {
    range.addEventListener('input', e => {
      const v = String(Math.trunc(Number(e.target.value)));
      syncMonths(v);
    });
    text.addEventListener('input', e => { syncMonths(e.target.value); });
  });

[[rateRange, rateInput, rateValueLabel], [rateRangeR, rateInputR, rateValueLabelR]]
  .forEach(([range, text, label]) => {
    range.addEventListener('input', e => {
      const v = Number(e.target.value).toFixed(1);
      syncRate(v);
    });
    text.addEventListener('input', e => { syncRate(e.target.value); });
  });

function showError(msg) {
  [errorMsg, errorMsgR].forEach(el => {
    if (msg) { el.textContent = msg; el.hidden = false; }
    else { el.hidden = true; }
  });
}

calculateBtn.addEventListener('click', () => {
  calculate();
  if (state.result) showResults();
});
recalculateBtn.addEventListener('click', () => {
  calculate();
  if (state.result) renderResults();
});
function calculate() {
  const principal = parseFloat(state.principal);
  const months = parseInt(state.months, 10);
  const rate = parseFloat(state.rate);

  if (!(principal > 0) || !(months > 0) || !(rate >= 0) || isNaN(principal) || isNaN(months) || isNaN(rate)) {
    state.error = 'Please enter valid values for all fields.';
    showError(state.error);
    state.result = null;
    return;
  }

  showError(null);
  state.error = null;
  state.result = EmiEngine.calculate(principal, rate, months);
  state.scheduleType = 'reducing';
  state.scheduleTab = 'full';
  state.donutTab = 'reducing';
}

// ── Navigation ──
$('backBtn').addEventListener('click', () => {
  resultsScreen.hidden = true;
  inputScreen.hidden = false;
});

function showResults() {
  document.body.classList.add('calculated');
  inputScreen.hidden = true;
  resultsScreen.hidden = false;
  renderResults();
  resultsScreen.scrollTop = 0;
  window.scrollTo(0, 0);
}

// ── Rendering ──
function renderResults() {
  const r = state.result;
  if (!r) return;
  const principal = parseFloat(state.principal);

  $('resultsTitle').textContent = `Results — ${r.rate}% rate`;
  $('emiSectionTitle').textContent = `EMI at ${r.rate}% for both methods`;

  // EMI cards
  $('emiCardReducingLabel').textContent = `EMI at ${r.rate}% reducing`;
  $('emiReducingAmount').textContent = EmiEngine.formatInr(r.emiReducing);
  $('interestReducingAmount').textContent = EmiEngine.formatInr(r.interestReducing);
  $('totalReducingAmount').textContent = EmiEngine.formatInr(r.totalReducing);

  $('emiCardFlatLabel').textContent = `EMI at ${r.rate}% flat`;
  $('emiFlatAmount').textContent = EmiEngine.formatInr(r.emiFlat);
  $('interestFlatAmount').textContent = EmiEngine.formatInr(r.interestFlat);
  $('totalFlatAmount').textContent = EmiEngine.formatInr(r.totalFlat);

  // Conversions
  $('convRFFrom').textContent = `${r.rate}% reducing`;
  $('convRFTo').textContent = `${r.equivFlatFromReducing}% flat`;
  $('convRFNote').textContent = `The flat rate that costs the same total interest as ${r.rate}% reducing balance.`;

  $('convFRFrom').textContent = `${r.rate}% flat`;
  $('convFRTo').textContent = `${r.equivReducingFromFlat}% reducing`;
  $('convFRNote').textContent = `The reducing rate that costs the same total interest as ${r.rate}% flat.`;

  renderDonut(principal);
  renderSchedule();
}

// ── Donut ──
document.querySelectorAll('#donutTabbar .tab').forEach(btn => {
  btn.addEventListener('click', () => {
    state.donutTab = btn.dataset.tab;
    document.querySelectorAll('#donutTabbar .tab').forEach(b => b.classList.toggle('active', b === btn));
    renderDonut(parseFloat(state.principal));
  });
});

const CIRCUMFERENCE = 2 * Math.PI * 49; // r=49
let donutAnimId = null;

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function renderDonut(principal) {
  const r = state.result;
  if (!r) return;
  const isReducing = state.donutTab === 'reducing';
  const interest = isReducing ? r.interestReducing : r.interestFlat;
  const total = isReducing ? r.totalReducing : r.totalFlat;
  const emi = isReducing ? r.emiReducing : r.emiFlat;
  const interestColor = isReducing ? 'var(--accent-orange)' : 'var(--accent-purple)';
  const methodLabel = isReducing ? 'reducing' : 'flat';

  const totalVal = principal + interest;
  const principalPct = totalVal > 0 ? principal / totalVal : 0;

  const principalArc = $('donutPrincipalArc');
  const interestArc = $('donutInterestArc');

  interestArc.setAttribute('stroke', interestColor);

  // Static legend/labels update immediately — only the ring animates.
  $('legendPrincipal').textContent = EmiEngine.formatInr(principal);
  $('legendInterestDot').style.background = interestColor;
  $('legendInterestLabel').textContent = `Interest (${methodLabel})`;
  $('legendInterest').textContent = EmiEngine.formatInr(interest);
  $('legendEmi').textContent = EmiEngine.formatInr(emi);
  $('legendTotal').textContent = EmiEngine.formatInr(total);

  // Two-stage fill: empty ring → principal sweeps in first, then interest
  // sweeps in right after — mirrors the original app's donut animation.
  if (donutAnimId) cancelAnimationFrame(donutAnimId);

  const principalDuration = 700;  // ms
  const interestDuration = 500;   // ms
  const startTime = performance.now();

  function frame(now) {
    const elapsed = now - startTime;
    let principalProgress, interestProgress;

    if (elapsed <= principalDuration) {
      principalProgress = easeOutCubic(Math.min(elapsed / principalDuration, 1));
      interestProgress = 0;
    } else {
      principalProgress = 1;
      interestProgress = easeOutCubic(Math.min((elapsed - principalDuration) / interestDuration, 1));
    }

    const principalLen = CIRCUMFERENCE * principalPct * principalProgress;
    const interestLen = CIRCUMFERENCE * (1 - principalPct) * interestProgress;

    principalArc.setAttribute('stroke-dasharray', `${principalLen} ${CIRCUMFERENCE}`);
    principalArc.setAttribute('stroke-dashoffset', '0');

    interestArc.setAttribute('stroke-dasharray', `${interestLen} ${CIRCUMFERENCE}`);
    interestArc.setAttribute('stroke-dashoffset', String(-principalLen));

    // Percentage counts up alongside the principal arc's sweep
    const displayPct = principalPct * (elapsed <= principalDuration ? principalProgress : 1);
    $('donutPct').textContent = `${Math.round(displayPct * 100)}%`;

    if (elapsed < principalDuration + interestDuration) {
      donutAnimId = requestAnimationFrame(frame);
    } else {
      donutAnimId = null;
    }
  }

  donutAnimId = requestAnimationFrame(frame);
}

// ── Schedule ──
document.querySelectorAll('#scheduleTypeTabbar .tab').forEach(btn => {
  btn.addEventListener('click', () => {
    state.scheduleType = btn.dataset.type;
    document.querySelectorAll('#scheduleTypeTabbar .tab').forEach(b => b.classList.toggle('active', b === btn));
    renderSchedule();
  });
});

document.querySelectorAll('#scheduleSubtabs .subtab').forEach(btn => {
  btn.addEventListener('click', () => {
    state.scheduleTab = btn.dataset.subtab;
    document.querySelectorAll('#scheduleSubtabs .subtab').forEach(b => b.classList.toggle('active', b === btn));
    renderSchedule();
  });
});

function renderSchedule() {
  const r = state.result;
  if (!r) return;
  const schedule = state.scheduleType === 'reducing' ? r.scheduleReducing : r.scheduleFlat;
  const thead = $('scheduleThead');
  const tbody = $('scheduleTbody');
  const table = $('scheduleTable');

  tbody.innerHTML = '';

  if (state.scheduleTab === 'yearly') {
    table.classList.add('yearly');
    thead.innerHTML = '<tr><th>Year</th><th>Principal</th><th>Interest</th><th>Balance</th></tr>';
    const yearly = EmiEngine.toYearlySummary(schedule);
    const frag = document.createDocumentFragment();
    yearly.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="col-month">Year ${row.year}</td>
        <td class="col-principal">${EmiEngine.formatInr(row.principalPaid)}</td>
        <td class="col-interest">${EmiEngine.formatInr(row.interestPaid)}</td>
        <td>${EmiEngine.formatInr(row.balance)}</td>`;
      frag.appendChild(tr);
    });
    tbody.appendChild(frag);
  } else {
    table.classList.remove('yearly');
    thead.innerHTML = '<tr><th>Mo</th><th>EMI</th><th>Principal</th><th>Interest</th><th>Balance</th></tr>';
    const frag = document.createDocumentFragment();
    schedule.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="col-month">${row.month}</td>
        <td>${EmiEngine.formatInr(row.emi)}</td>
        <td class="col-principal">${EmiEngine.formatInr(row.principal)}</td>
        <td class="col-interest">${EmiEngine.formatInr(row.interest)}</td>
        <td>${EmiEngine.formatInr(row.balance)}</td>`;
      frag.appendChild(tr);
    });
    tbody.appendChild(frag);
  }
}

// ── Init: pre-fill defaults but wait for the user's first Calculate ──
initTheme();
calculate();

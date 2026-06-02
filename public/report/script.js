const views = {
  mom: {
    title: "Month-by-month performance",
    copy: "Compare May 2026 against April 2026 and May 2025 using the current monthly tracker.",
    note: "Current view: May 2026 vs April 2026 and May 2025.",
    current: "May 2026",
    a: "vs Apr 2026",
    b: "vs May 2025",
  },
  fq: {
    title: "Financial-quarter comparison",
    copy: "Roll the same KPIs into financial-quarter windows to see whether growth efficiency is improving across a longer operating period.",
    note: "Current view: FQ-to-date 2026 vs prior FQ and same FQ last year. Prototype uses May monthly values until quarterly rollups are added.",
    current: "FQTD 2026",
    a: "vs Prior FQ",
    b: "vs FQ LY",
  },
  yoy: {
    title: "Year-over-year performance",
    copy: "Focus the report on same-month last-year movement, useful for seasonality, demand quality, and revenue benchmark checks.",
    note: "Current view: May 2026 against May 2025, with MoM retained as a secondary signal.",
    current: "May 2026",
    a: "vs May 2025",
    b: "vs Apr 2026",
  },
  fy: {
    title: "Financial-year view",
    copy: "Use the full-year tabs to track cumulative performance against annual target, revenue plan, and marketing efficiency trend.",
    note: "Current view: FY 2026 to date vs FY target and FY 2025 to date. Prototype labels are active; FY rollup rows can be wired next.",
    current: "FYTD 2026",
    a: "vs FY Target",
    b: "vs FYTD 2025",
  },
};

const loadingScreen = document.querySelector("#loading-screen");
const pageShell = document.querySelector(".page-shell");
const railToggle = document.querySelector("#rail-toggle");
const railToggleText = railToggle?.querySelector(".rail-toggle-text");
const themeButtons = document.querySelectorAll("[data-theme-mode]");
const outputModeButtons = document.querySelectorAll("[data-output-mode]");
const slidesOutput = document.querySelector("#slides-output");
const slideFrame = document.querySelector(".slide-frame");
const slides = document.querySelectorAll(".slide");
const slideCounter = document.querySelector("#slide-counter");
const prevSlideButton = document.querySelector("#prev-slide");
const nextSlideButton = document.querySelector("#next-slide");
const printSlidesButton = document.querySelector("#print-slides");
const revealTargets = document.querySelectorAll(
  ".comparison-switcher, .hero, .kpi-grid, .finance-band, .two-col, .graph-options, .chart-grid, .ai-chat, .slides-deck",
);

function storedThemeMode() {
  try {
    return localStorage.getItem("aw3-theme-mode") || "system";
  } catch {
    return "system";
  }
}

function setThemeMode(mode, persist = true) {
  const nextMode = ["light", "dark", "system"].includes(mode) ? mode : "system";
  document.documentElement.dataset.theme = nextMode;
  themeButtons.forEach((button) => {
    const selected = button.dataset.themeMode === nextMode;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-checked", String(selected));
  });
  if (persist) {
    try {
      localStorage.setItem("aw3-theme-mode", nextMode);
    } catch {
      // Local storage can be unavailable in strict browser contexts.
    }
  }
}

setThemeMode(storedThemeMode(), false);

themeButtons.forEach((button) => {
  button.addEventListener("click", () => setThemeMode(button.dataset.themeMode));
});

let activeSlideIndex = 0;

function updateSlideCounter() {
  if (!slideCounter) return;
  slideCounter.textContent = `${activeSlideIndex + 1} / ${slides.length}`;
}

function setActiveSlide(index) {
  if (slides.length === 0) return;
  activeSlideIndex = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeSlideIndex);
  });
  updateSlideCounter();
}

function setOutputMode(mode, persist = true) {
  const nextMode = mode === "slides" ? "slides" : "web";
  document.body.classList.toggle("slides-active", nextMode === "slides");
  if (slidesOutput) {
    slidesOutput.hidden = nextMode !== "slides";
    slidesOutput.setAttribute("aria-hidden", String(nextMode !== "slides"));
  }
  outputModeButtons.forEach((button) => {
    const selected = button.dataset.outputMode === nextMode;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", String(selected));
  });
  if (nextMode === "slides") {
    slidesOutput?.classList.add("is-visible");
    setActiveSlide(activeSlideIndex);
    window.setTimeout(() => slideFrame?.focus({ preventScroll: true }), 160);
  }
  if (persist) {
    try {
      localStorage.setItem("aw3-output-mode", nextMode);
    } catch {
      // Local storage can be unavailable in strict browser contexts.
    }
  }
}

function storedOutputMode() {
  try {
    return localStorage.getItem("aw3-output-mode") || "web";
  } catch {
    return "web";
  }
}

outputModeButtons.forEach((button) => {
  button.addEventListener("click", () => setOutputMode(button.dataset.outputMode));
});

prevSlideButton?.addEventListener("click", () => setActiveSlide(activeSlideIndex - 1));
nextSlideButton?.addEventListener("click", () => setActiveSlide(activeSlideIndex + 1));
printSlidesButton?.addEventListener("click", () => {
  setOutputMode("slides", false);
  window.setTimeout(() => window.print(), 120);
});
slideFrame?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    setActiveSlide(activeSlideIndex + 1);
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    setActiveSlide(activeSlideIndex - 1);
  }
});

setActiveSlide(0);
setOutputMode(storedOutputMode(), false);

function setRailCollapsed(collapsed, persist = true) {
  document.body.classList.toggle("rail-collapsed", collapsed);
  railToggle?.setAttribute("aria-expanded", String(!collapsed));
  if (railToggleText) {
    railToggleText.textContent = collapsed ? "Expand menu" : "Collapse menu";
  }
  if (persist) {
    try {
      localStorage.setItem("aw3-report-rail-collapsed", collapsed ? "true" : "false");
    } catch {
      // Local storage can be unavailable in strict browser contexts.
    }
  }
}

try {
  setRailCollapsed(localStorage.getItem("aw3-report-rail-collapsed") === "true", false);
} catch {
  setRailCollapsed(false, false);
}

railToggle?.addEventListener("click", () => {
  setRailCollapsed(!document.body.classList.contains("rail-collapsed"));
});

revealTargets.forEach((target) => target.classList.add("reveal"));

const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 })
  : null;

revealTargets.forEach((target) => {
  if (revealObserver) {
    revealObserver.observe(target);
  } else {
    target.classList.add("is-visible");
  }
});

function hideLoadingScreen() {
  if (!loadingScreen) return;
  loadingScreen.classList.add("is-hidden");
  pageShell?.classList.add("is-ready");
  revealTargets.forEach((target, index) => {
    if (target.getBoundingClientRect().top < window.innerHeight) {
      window.setTimeout(() => target.classList.add("is-visible"), index * 55);
    }
  });
  window.setTimeout(() => loadingScreen.remove(), 420);
}

function softPageTransition(update) {
  pageShell?.classList.add("is-transitioning");
  window.setTimeout(() => {
    update();
    pageShell?.classList.remove("is-transitioning");
    window.setTimeout(() => pageShell?.classList.remove("is-transitioning"), 180);
  }, 140);
}

window.addEventListener("load", () => {
  window.setTimeout(hideLoadingScreen, 650);
});

window.setTimeout(hideLoadingScreen, 2400);

const tabButtons = document.querySelectorAll(".tabs button");
const title = document.querySelector("#comparison-title");
const copy = document.querySelector("#comparison-copy");
const note = document.querySelector("#comparison-note");
const current = document.querySelector("#current-period");
const periodA = document.querySelector("#period-a");
const periodB = document.querySelector("#period-b");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const view = views[button.dataset.view];
    softPageTransition(() => {
      tabButtons.forEach((tab) => {
        const selected = tab === button;
        tab.classList.toggle("active", selected);
        tab.setAttribute("aria-selected", String(selected));
      });
      title.textContent = view.title;
      copy.textContent = view.copy;
      note.textContent = view.note;
      current.textContent = view.current;
      periodA.textContent = view.a;
      periodB.textContent = view.b;
    });
  });
});

const graphGrid = document.querySelector("#chart-grid");
const graphNote = document.querySelector("#graph-note");
const graphFilterButtons = document.querySelectorAll("[data-graph-filter]");
const graphDensityButtons = document.querySelectorAll("[data-graph-density]");
const chartCards = document.querySelectorAll("[data-graph-group]");
const graphNotes = {
  all: "Showing all chart views with hover annotations for values, changes, and data-quality notes.",
  efficiency: "Emphasising efficiency charts: spend, lead volume, and channel-mix quality checks.",
  revenue: "Emphasising finance cross-checks: revenue, deal value, and year-on-year benchmark movement.",
  funnel: "Emphasising funnel conversion: leads, opportunities, closed-won deals, and conversion pressure points.",
};

function setGraphFilter(filter) {
  const nextFilter = graphNotes[filter] ? filter : "all";
  graphFilterButtons.forEach((button) => {
    const selected = button.dataset.graphFilter === nextFilter;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", String(selected));
  });
  chartCards.forEach((card) => {
    const selected = nextFilter === "all" || card.dataset.graphGroup === nextFilter;
    card.classList.toggle("is-active-graph", selected);
  });
  graphGrid?.classList.toggle("is-filtered", nextFilter !== "all");
  if (graphNote) graphNote.textContent = graphNotes[nextFilter];
}

function setGraphDensity(density) {
  const nextDensity = density === "compact" ? "compact" : "full";
  graphGrid?.setAttribute("data-graph-density", nextDensity);
  graphDensityButtons.forEach((button) => {
    const selected = button.dataset.graphDensity === nextDensity;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-checked", String(selected));
  });
}

graphFilterButtons.forEach((button) => {
  button.addEventListener("click", () => setGraphFilter(button.dataset.graphFilter));
});

graphDensityButtons.forEach((button) => {
  button.addEventListener("click", () => setGraphDensity(button.dataset.graphDensity));
});

setGraphFilter("all");
setGraphDensity("full");

const reportData = {
  month: "May 2026",
  spend: "GBP 41,959",
  spendChange: "-34.3%",
  leads: "822",
  leadsChange: "+40.3%",
  opportunities: "62",
  opportunitiesChange: "+67.6%",
  dealsWon: "10",
  dealValue: "GBP 120,675",
  aov: "GBP 12,068",
  roas: "287.6%",
  mer: "2.88",
  revenue: "GBP 148,296",
  revenueMom: "+84.8%",
  revenueYoy: "-28.3%",
  targetGap: "GBP 181,582",
  spendRevenue: "28.3%",
  dealRevenue: "81.4%",
};

const currencySelect = document.querySelector("#currency-select");
const refreshFxButton = document.querySelector("#refresh-fx");
const fxStatus = document.querySelector("#fx-status");
const baseMoneyMetrics = {
  spend: 41959,
  dealValue: 120675,
  aov: 12068,
  revenue: 148296,
  targetGap: 181582,
};
const supportedCurrencies = {
  GBP: { name: "British Pound" },
  USD: { name: "US Dollar" },
  EUR: { name: "Euro" },
  AUD: { name: "Australian Dollar" },
  CAD: { name: "Canadian Dollar" },
};
const baseCurrency = "GBP";
const fxStorageKey = "aw3-report-fx";
const currencyStorageKey = "aw3-report-currency";
const fxTextNodes = [];
const fxAttributeTemplates = [];
let fxState = {
  currency: storedCurrency(),
  rates: { GBP: 1 },
  date: null,
  updatedAt: null,
  source: "GBP base",
  loading: false,
  error: null,
};

function storedCurrency() {
  try {
    const code = localStorage.getItem(currencyStorageKey);
    return supportedCurrencies[code] ? code : baseCurrency;
  } catch {
    return baseCurrency;
  }
}

function readCachedFx() {
  try {
    const cached = JSON.parse(localStorage.getItem(fxStorageKey) || "null");
    if (!cached?.rates || cached.base !== baseCurrency) return null;
    return cached;
  } catch {
    return null;
  }
}

function writeCachedFx(payload) {
  try {
    localStorage.setItem(fxStorageKey, JSON.stringify(payload));
  } catch {
    // Local storage can be unavailable in strict browser contexts.
  }
}

function persistCurrency(code) {
  try {
    localStorage.setItem(currencyStorageKey, code);
  } catch {
    // Local storage can be unavailable in strict browser contexts.
  }
}

function applyCachedFx() {
  const cached = readCachedFx();
  if (!cached) return;
  fxState = {
    ...fxState,
    rates: { GBP: 1, ...cached.rates },
    date: cached.date || null,
    updatedAt: cached.updatedAt || null,
    source: cached.source || "Cached FX",
    error: null,
  };
}

function moneyAmountFromText(value) {
  return Number(String(value).replace(/,/g, ""));
}

function activeCurrency() {
  return supportedCurrencies[fxState.currency] ? fxState.currency : baseCurrency;
}

function activeFxRate(currency = activeCurrency()) {
  return Number(fxState.rates?.[currency]) || (currency === baseCurrency ? 1 : null);
}

function formatMoneyFromGbp(amountGbp, currency = activeCurrency()) {
  const rate = activeFxRate(currency);
  const targetCurrency = rate ? currency : baseCurrency;
  const amount = amountGbp * (rate || 1);
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: targetCurrency,
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(amount).replace(/\u00a0/g, " ");
}

function convertMoneyTemplate(template) {
  return template.replace(/GBP\s([\d,]+)/g, (_, amount) => (
    formatMoneyFromGbp(moneyAmountFromText(amount))
  ));
}

function registerCurrencyTemplates() {
  const root = document.querySelector(".report");
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || !/GBP\s[\d,]+/.test(node.nodeValue || "")) {
        return NodeFilter.FILTER_REJECT;
      }
      if (["SCRIPT", "STYLE", "SELECT", "OPTION", "TEXTAREA"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach((node) => {
    const span = document.createElement("span");
    span.className = "fx-text";
    span.dataset.fxTextTemplate = node.nodeValue;
    span.textContent = node.nodeValue;
    node.replaceWith(span);
    fxTextNodes.push(span);
  });

  document.querySelectorAll("[data-annotation]").forEach((element) => {
    if (!/GBP\s[\d,]+/.test(element.dataset.annotation || "")) return;
    element.dataset.fxAnnotationTemplate = element.dataset.annotation;
    fxAttributeTemplates.push(element);
  });
}

function syncReportDataMoney() {
  reportData.spend = formatMoneyFromGbp(baseMoneyMetrics.spend);
  reportData.dealValue = formatMoneyFromGbp(baseMoneyMetrics.dealValue);
  reportData.aov = formatMoneyFromGbp(baseMoneyMetrics.aov);
  reportData.revenue = formatMoneyFromGbp(baseMoneyMetrics.revenue);
  reportData.targetGap = formatMoneyFromGbp(baseMoneyMetrics.targetGap);
}

function rateLabel() {
  const currency = activeCurrency();
  if (fxState.loading) return "FX: updating live rates...";
  if (currency === baseCurrency) {
    return fxState.date ? `FX: GBP base · latest ${fxState.date}` : "FX: GBP base";
  }
  const rate = activeFxRate(currency);
  if (!rate) return "FX unavailable; showing GBP";
  const date = fxState.date ? ` · latest ${fxState.date}` : "";
  return `FX: 1 GBP = ${rate.toFixed(4)} ${currency}${date}`;
}

function updateCurrencyControls() {
  if (currencySelect) currencySelect.value = activeCurrency();
  if (fxStatus) fxStatus.textContent = fxState.error || rateLabel();
}

function renderCurrency() {
  fxTextNodes.forEach((node) => {
    node.textContent = convertMoneyTemplate(node.dataset.fxTextTemplate || "");
  });
  fxAttributeTemplates.forEach((element) => {
    element.dataset.annotation = convertMoneyTemplate(element.dataset.fxAnnotationTemplate || "");
  });
  syncReportDataMoney();
  updateCurrencyControls();
}

async function refreshFxRates({ force = false } = {}) {
  if (fxState.loading) return;
  fxState.loading = true;
  fxState.error = null;
  updateCurrencyControls();
  if (refreshFxButton) {
    refreshFxButton.disabled = true;
    refreshFxButton.textContent = "Updating";
  }

  try {
    const symbols = Object.keys(supportedCurrencies)
      .filter((currency) => currency !== baseCurrency)
      .join(",");
    const response = await fetch(`/api/fx?base=${baseCurrency}&symbols=${symbols}&refresh=${force ? Date.now() : "auto"}`, {
      cache: force ? "no-store" : "default",
    });
    if (!response.ok) {
      throw new Error(`FX refresh failed with ${response.status}`);
    }
    const payload = await response.json();
    fxState = {
      ...fxState,
      rates: { GBP: 1, ...payload.rates },
      date: payload.date || null,
      updatedAt: payload.updatedAt || null,
      source: payload.source || "Frankfurter",
      loading: false,
      error: null,
    };
    writeCachedFx({
      base: baseCurrency,
      rates: fxState.rates,
      date: fxState.date,
      updatedAt: fxState.updatedAt,
      source: fxState.source,
    });
  } catch (error) {
    console.error(error);
    fxState.loading = false;
    if (!activeFxRate()) {
      fxState.currency = baseCurrency;
      persistCurrency(baseCurrency);
    }
    fxState.error = activeCurrency() === baseCurrency
      ? "FX unavailable; showing GBP base"
      : "Live FX unavailable; showing cached rate";
  } finally {
    fxState.loading = false;
    if (refreshFxButton) {
      refreshFxButton.disabled = false;
      refreshFxButton.textContent = "Update FX";
    }
    renderCurrency();
  }
}

applyCachedFx();
registerCurrencyTemplates();
renderCurrency();

currencySelect?.addEventListener("change", async () => {
  const nextCurrency = supportedCurrencies[currencySelect.value] ? currencySelect.value : baseCurrency;
  fxState.currency = nextCurrency;
  persistCurrency(nextCurrency);
  if (!activeFxRate(nextCurrency)) {
    await refreshFxRates({ force: true });
  } else {
    renderCurrency();
  }
});

refreshFxButton?.addEventListener("click", () => refreshFxRates({ force: true }));
window.setTimeout(() => refreshFxRates(), 0);

let extractedData = window.REPORT_DATA || null;
const dataStatus = document.querySelector("#data-status");
const lastUpdated = document.querySelector("#last-updated");
const refreshButton = document.querySelector("#refresh-data");
const exportButton = document.querySelector("#export-report");
const monthOrder = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const monthShort = {
  January: "Jan",
  February: "Feb",
  March: "Mar",
  April: "Apr",
  May: "May",
  June: "Jun",
  July: "Jul",
  August: "Aug",
  September: "Sep",
  October: "Oct",
  November: "Nov",
  December: "Dec",
};

function availableYears() {
  const sheets = extractedData?.marketing?.sheets || {};
  return Object.keys(sheets)
    .filter((name) => /^\d{4}$/.test(name))
    .sort((a, b) => Number(b) - Number(a));
}

function availableMonthsForYear(year) {
  const rows = extractedData?.marketing?.sheets?.[year]?.monthly || [];
  const months = rows.map((row) => row.Month).filter(Boolean);
  return monthOrder.filter((month) => months.includes(month));
}

function dataTotals(data = extractedData) {
  if (!data) return { marketingRows: 0, financialRows: 0, totalRows: 0 };
  const marketingRows = Object.values(data.marketing?.sheets || {})
    .reduce((sum, sheet) => sum + (sheet.monthly?.length || 0), 0);
  const financialRows = Object.values(data.financial?.sheets || {})
    .reduce((sum, sheet) => sum + (sheet.monthly?.length || 0), 0);
  return {
    marketingRows,
    financialRows,
    totalRows: marketingRows + financialRows,
  };
}

function setDataStatus(statusText) {
  if (!dataStatus) return;
  if (statusText) {
    dataStatus.textContent = statusText;
    return;
  }
  if (!extractedData) {
    dataStatus.textContent = "No historical data loaded";
    return;
  }
  const totals = dataTotals();
  dataStatus.textContent = `${totals.totalRows} historical monthly rows loaded`;
}

function formatTimestamp(value) {
  const fallback = document.lastModified ? new Date(document.lastModified) : new Date();
  const parsed = value ? new Date(value) : fallback;
  const date = Number.isNaN(parsed.getTime()) ? fallback : parsed;
  return {
    iso: date.toISOString(),
    label: new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date),
  };
}

function setLastUpdated(value = extractedData?.generatedAt) {
  if (!lastUpdated) return;
  const timestamp = formatTimestamp(value);
  lastUpdated.textContent = timestamp.label;
  lastUpdated.dateTime = timestamp.iso;
}

const dateTrigger = document.querySelector("#date-trigger");
const datePopover = document.querySelector("#date-popover");
const dateLabel = document.querySelector("#date-label");
const dateHelper = document.querySelector("#date-helper");
const dateApply = document.querySelector("#date-apply");
const monthGrid = document.querySelector("#month-grid");
const yearPicker = document.querySelector("#year-picker");
const presetButtons = document.querySelectorAll("[data-preset]");
let selectedRange = "May 2026";

function renderYearPicker() {
  const years = availableYears();
  if (!yearPicker || years.length === 0) return;
  yearPicker.innerHTML = years.map((year) => `<option value="${year}">${year}</option>`).join("");
  yearPicker.value = years.includes("2026") ? "2026" : years[0];
  renderMonthGrid(yearPicker.value);
}

function renderMonthGrid(year) {
  if (!monthGrid) return;
  const months = availableMonthsForYear(year);
  monthGrid.innerHTML = months
    .map((month) => {
      const label = `${month} ${year}`;
      const selected = selectedRange === label ? " selected" : "";
      return `<button type="button" data-month="${label}" class="${selected}">${monthShort[month]}</button>`;
    })
    .join("");
}

function setSelectedRange(label) {
  selectedRange = label;
  dateHelper.textContent = `Selected: ${label}`;
  monthGrid?.querySelectorAll("[data-month]").forEach((button) => {
    button.classList.toggle("selected", label === button.dataset.month);
  });
}

setDataStatus();
setLastUpdated();
renderYearPicker();

dateTrigger.addEventListener("click", () => {
  const expanded = dateTrigger.getAttribute("aria-expanded") === "true";
  dateTrigger.setAttribute("aria-expanded", String(!expanded));
  datePopover.hidden = expanded;
});

yearPicker?.addEventListener("change", () => renderMonthGrid(yearPicker.value));

monthGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-month]");
  if (button) setSelectedRange(button.dataset.month);
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const ranges = {
      "last-month": "May 2026",
      quarter: "Apr-Jun 2026",
      year: "Jan-May 2026",
    };
    setSelectedRange(ranges[button.dataset.preset]);
  });
});

dateApply.addEventListener("click", () => {
  softPageTransition(() => {
    dateLabel.textContent = selectedRange;
    dateTrigger.setAttribute("aria-expanded", "false");
    datePopover.hidden = true;
  });
});

function selectedMonthParts() {
  const match = selectedRange.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return null;
  return { month: match[1], year: match[2] };
}

function selectedRowsForExport() {
  const selected = selectedMonthParts();
  if (!selected || !extractedData) {
    return { marketing: null, financial: null };
  }
  return {
    marketing: extractedData.marketing?.sheets?.[selected.year]?.monthly
      ?.find((row) => row.Month === selected.month) || null,
    financial: extractedData.financial?.sheets?.[selected.year]?.monthly
      ?.find((row) => row.Month === selected.month) || null,
  };
}

function activeComparisonView() {
  const active = document.querySelector(".tabs button.active");
  return active?.dataset.view || "mom";
}

function downloadJson(fileName, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportReport() {
  const totals = dataTotals();
  const timestamp = formatTimestamp(extractedData?.generatedAt);
  const safeRange = selectedRange.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const payload = {
    appName: extractedData?.appName || "AW3® Marketing Reporting",
    exportedAt: new Date().toISOString(),
    lastUpdated: timestamp.iso,
    selectedRange,
    comparisonView: activeComparisonView(),
    currency: activeCurrency(),
    fx: {
      base: baseCurrency,
      rate: activeFxRate() || 1,
      date: fxState.date,
      updatedAt: fxState.updatedAt,
      source: fxState.source,
    },
    rowCoverage: totals,
    summaryMetrics: reportData,
    selectedSourceRows: selectedRowsForExport(),
    generatedFrom: extractedData?.generatedFrom || {},
  };
  downloadJson(`aw3-marketing-reporting-${safeRange || "custom-export"}.json`, payload);
}

async function refreshHistoricalData() {
  if (!refreshButton) return;
  const originalLabel = refreshButton.textContent;
  refreshButton.disabled = true;
  refreshButton.textContent = "Refreshing";
  setDataStatus("Refreshing historical data...");

  try {
    const response = await fetch(`./data/report-data.json?refresh=${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Refresh failed with ${response.status}`);
    }
    extractedData = await response.json();
    window.REPORT_DATA = extractedData;
    setDataStatus();
    setLastUpdated();
    renderYearPicker();
  } catch (error) {
    console.error(error);
    setDataStatus("Refresh failed. Try again after the next data publish.");
  } finally {
    window.setTimeout(() => {
      refreshButton.disabled = false;
      refreshButton.textContent = originalLabel;
    }, 350);
  }
}

refreshButton?.addEventListener("click", refreshHistoricalData);
exportButton?.addEventListener("click", exportReport);

document.addEventListener("click", (event) => {
  if (!event.target.closest(".date-picker")) {
    dateTrigger.setAttribute("aria-expanded", "false");
    datePopover.hidden = true;
  }
});

const chatLog = document.querySelector("#chat-log");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const promptButtons = document.querySelectorAll("[data-prompt]");

function answerQuestion(question) {
  const q = question.toLowerCase();
  if (q.includes("risk") || q.includes("concern")) {
    return `The main risks are data quality and deal quality. Google Ads shows GBP 0 spend, AOV is down to ${reportData.aov}, and revenue is still ${reportData.revenueYoy} YoY despite stronger MoM efficiency.`;
  }
  if (q.includes("mer") || q.includes("roas") || q.includes("efficiency")) {
    return `MER improved to ${reportData.mer} because spend fell ${reportData.spendChange} MoM while revenue rose ${reportData.revenueMom}. ROAS also rose to ${reportData.roas}, helped by ${reportData.leads} leads and ${reportData.dealValue} in tracked deal value.`;
  }
  if (q.includes("finance") || q.includes("revenue") || q.includes("reconcile")) {
    return `The financial report shows ${reportData.revenue} revenue. Marketing deal value is ${reportData.dealRevenue} of revenue, spend is ${reportData.spendRevenue} of revenue, and the revenue target gap is ${reportData.targetGap}. That makes attribution timing worth checking.`;
  }
  if (q.includes("next") || q.includes("do") || q.includes("action")) {
    return "Next steps: confirm whether Google Ads spend is truly zero, isolate the Meta campaigns behind the lower CPL, improve opportunity qualification to lift AOV, and reconcile Salesforce deal timing against financial revenue.";
  }
  if (q.includes("lead") || q.includes("opportunit") || q.includes("funnel")) {
    return `The funnel expanded at the top: leads reached ${reportData.leads} (${reportData.leadsChange} MoM) and opportunities reached ${reportData.opportunities} (${reportData.opportunitiesChange} MoM). The pressure point is converting that volume into higher-value wins.`;
  }
  return `For ${reportData.month}, spend was ${reportData.spend}, leads were ${reportData.leads}, revenue was ${reportData.revenue}, MER was ${reportData.mer}, and total deal value was ${reportData.dealValue}. The strongest signal is improved efficiency; the watchout is revenue still below last year and target.`;
}

function addMessage(type, text) {
  const message = document.createElement("article");
  message.className = `message ${type}`;
  const speaker = type === "user" ? "You" : "D.O.G.E. AI";
  message.innerHTML = `<strong>${speaker}</strong><p>${text}</p>`;
  chatLog.append(message);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function submitChat(question) {
  const trimmed = question.trim();
  if (!trimmed) return;
  addMessage("user", trimmed);
  addMessage("ai", answerQuestion(trimmed));
  chatInput.value = "";
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitChat(chatInput.value);
});

promptButtons.forEach((button) => {
  button.addEventListener("click", () => submitChat(button.dataset.prompt));
});

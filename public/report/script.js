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
const revealTargets = document.querySelectorAll(
  ".comparison-switcher, .hero, .kpi-grid, .finance-band, .two-col, .chart-grid, .ai-chat",
);

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
    appName: extractedData?.appName || "AW3 Marketing Reporting",
    exportedAt: new Date().toISOString(),
    lastUpdated: timestamp.iso,
    selectedRange,
    comparisonView: activeComparisonView(),
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

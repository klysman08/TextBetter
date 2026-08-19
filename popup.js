// popup.js - Browser action popup script with analytics, history tab, and UI sounds

// Mock chrome API for local testing outside Chrome Extension environment
if (typeof chrome === "undefined" || !chrome.storage) {
  // Seed mock statistics, history and settings if mock storage is empty
  if (!localStorage.getItem("tb_mock_storage")) {
    localStorage.setItem("tb_mock_storage", JSON.stringify({
      enabled: true,
      theme: "dark",
      muted: false,
      apiKey: "AIzaSyMockKeyForLocalPreviews",
      selectedModel: "gemini-3.7-flash",
      targetLanguage: "English (US)",
      stats: {
        totalRequests: 24,
        inputTokens: 1480,
        outputTokens: 2540,
        actionCounts: {
          rewrite: 12,
          review: 5,
          professional: 4,
          appealing: 2,
          emojis: 1,
          detail: 0,
          shorten: 0,
          summarize: 0,
          simplify: 0,
          friendly: 0,
          translate: 0
        }
      },
      history: [
        {
          id: "mock_1",
          timestamp: Date.now() - 1000 * 60 * 5,
          action: "professional",
          actionLabel: "Professional",
          inputText: "hey can you send the report asap thx",
          outputText: "Could you please provide the report at your earliest convenience? Thank you.",
          model: "gemini-3.7-flash",
          targetLanguage: null,
          tokens: { input: 28, output: 35, total: 63 }
        },
        {
          id: "mock_2",
          timestamp: Date.now() - 1000 * 60 * 45,
          action: "translate",
          actionLabel: "Translate",
          inputText: "Obrigado pela sua ajuda com o projeto.",
          outputText: "Thank you for your assistance with the project.",
          model: "gemini-3.7-flash",
          targetLanguage: "English (GB)",
          tokens: { input: 32, output: 29, total: 61 }
        }
      ]
    }));
  }

  window.chrome = {
    storage: {
      local: {
        get: async (keys) => {
          const store = JSON.parse(localStorage.getItem("tb_mock_storage") || "{}");
          const res = {};
          if (Array.isArray(keys)) {
            keys.forEach(k => res[k] = store[k]);
          } else if (typeof keys === "string") {
            res[keys] = store[keys];
          } else {
            Object.keys(keys).forEach(k => res[k] = store[k] !== undefined ? store[k] : keys[k]);
          }
          return res;
        },
        set: async (obj) => {
          const store = JSON.parse(localStorage.getItem("tb_mock_storage") || "{}");
          Object.assign(store, obj);
          localStorage.setItem("tb_mock_storage", JSON.stringify(store));
        }
      }
    },
    runtime: {
      openOptionsPage: () => {
        window.open("options.html", "_blank");
      }
    }
  };
}

// Element Selectors
const extensionToggle = document.getElementById("extension-toggle");
const autoOpenToggle = document.getElementById("auto-open-toggle");
const apiStatusBadge = document.getElementById("api-status-badge");
const popupModelSelect = document.getElementById("popup-model-select");
const popupLanguageSelect = document.getElementById("popup-language-select");
const openSettingsBtn = document.getElementById("open-settings-btn");
const themeToggleBtn = document.getElementById("popup-theme-toggle");
const soundToggleBtn = document.getElementById("popup-sound-toggle");

// Tabs & Navigation
const tabBtnDashboard = document.getElementById("tab-btn-dashboard");
const tabBtnHistory = document.getElementById("tab-btn-history");
const viewDashboard = document.getElementById("view-dashboard");
const viewHistory = document.getElementById("view-history");
const historyCountBadge = document.getElementById("history-count-badge");

// History UI elements
const historySearchInput = document.getElementById("history-search-input");
const exportCsvBtn = document.getElementById("export-csv-btn");
const clearHistoryBtn = document.getElementById("clear-history-btn");
const historyListContainer = document.getElementById("history-list");
const historyEmptyState = document.getElementById("history-empty");
const historyPagination = document.getElementById("history-pagination");
const historyPrevPageBtn = document.getElementById("history-prev-page");
const historyNextPageBtn = document.getElementById("history-next-page");
const historyPageInfo = document.getElementById("history-page-info");

// Dashboard UI elements
const statRequests = document.getElementById("stat-requests");
const statTokens = document.getElementById("stat-tokens");
const statTopAction = document.getElementById("stat-top-action");
const clearStatsBtn = document.getElementById("clear-stats-btn");

// Extended Dashboard elements
const tokenInputVal = document.getElementById("token-input-val");
const tokenOutputVal = document.getElementById("token-output-val");
const tokenRatioInput = document.getElementById("token-ratio-input");
const tokenRatioOutput = document.getElementById("token-ratio-output");
const chartBarsContainer = document.getElementById("chart-bars-container");

// In-memory history cache & pagination
let historyRecords = [];
const HISTORY_PAGE_SIZE = 5;
let currentHistoryPage = 1;

// Web Audio API Sound Synthesiser
let audioCtx = null;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

async function playSound(type) {
  const settings = await chrome.storage.local.get("muted");
  if (settings.muted) return;
  
  try {
    initAudioContext();
    const now = audioCtx.currentTime;
    
    switch (type) {
      case "click": {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
        
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
      
      case "success": {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        const gain2 = audioCtx.createGain();
        
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(523.25, now);
        gain1.gain.setValueAtTime(0.02, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.09);
        
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(659.25, now + 0.07);
        gain2.gain.setValueAtTime(0.02, now + 0.07);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(now + 0.07);
        osc2.stop(now + 0.23);
        break;
      }
      
      case "toggle-on": {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
        
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(now);
        osc.stop(now + 0.11);
        break;
      }
      
      case "toggle-off": {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.1);
        
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(now);
        osc.stop(now + 0.11);
        break;
      }
    }
  } catch (e) {
    console.warn("Audio Context blocked or unsupported:", e);
  }
}

// Load settings on startup
document.addEventListener("DOMContentLoaded", async () => {
  await initializePopup();
});

// Tab Switching
if (tabBtnDashboard && tabBtnHistory) {
  tabBtnDashboard.addEventListener("click", () => {
    switchTab("dashboard");
    playSound("click");
  });

  tabBtnHistory.addEventListener("click", () => {
    switchTab("history");
    playSound("click");
  });
}

function switchTab(tab) {
  if (tab === "dashboard") {
    tabBtnDashboard.classList.add("active");
    tabBtnHistory.classList.remove("active");
    viewDashboard.classList.remove("hidden");
    viewHistory.classList.add("hidden");
  } else {
    tabBtnHistory.classList.add("active");
    tabBtnDashboard.classList.remove("active");
    viewHistory.classList.remove("hidden");
    viewDashboard.classList.add("hidden");
    renderHistory();
  }
}

// Extension Toggle handler
extensionToggle.addEventListener("change", async (e) => {
  const isEnabled = e.target.checked;
  await chrome.storage.local.set({ enabled: isEnabled });
  playSound(isEnabled ? "toggle-on" : "toggle-off");
});

// Auto-open Toggle handler
autoOpenToggle.addEventListener("change", async (e) => {
  const isAutoOpen = e.target.checked;
  await chrome.storage.local.set({ autoOpen: isAutoOpen });
  playSound(isAutoOpen ? "toggle-on" : "toggle-off");
});

// Model selector handler
if (popupModelSelect) {
  popupModelSelect.addEventListener("change", async (e) => {
    const selectedModel = e.target.value;
    await chrome.storage.local.set({ selectedModel });
    playSound("click");
  });
}

// Language selector handler
if (popupLanguageSelect) {
  popupLanguageSelect.addEventListener("change", async (e) => {
    const targetLanguage = e.target.value;
    await chrome.storage.local.set({ targetLanguage });
    playSound("click");
  });
}

// Theme Toggle handler
themeToggleBtn.addEventListener("click", async () => {
  const isDark = document.documentElement.classList.toggle("dark");
  await chrome.storage.local.set({ theme: isDark ? "dark" : "light" });
  playSound(isDark ? "toggle-on" : "toggle-off");
});

// Sound Toggle handler
soundToggleBtn.addEventListener("click", async () => {
  const isMuted = document.documentElement.classList.toggle("muted");
  await chrome.storage.local.set({ muted: isMuted });
  if (!isMuted) {
    initAudioContext();
    playSound("click");
  } else {
    playSound("toggle-off");
  }
});

// Open settings page
openSettingsBtn.addEventListener("click", () => {
  playSound("click");
  setTimeout(() => {
    chrome.runtime.openOptionsPage();
  }, 100);
});

// Clear statistics handler
clearStatsBtn.addEventListener("click", async () => {
  playSound("click");
  if (confirm("Are you sure you want to reset your usage statistics?")) {
    const emptyStats = {
      totalRequests: 0,
      inputTokens: 0,
      outputTokens: 0,
      actionCounts: {
        rewrite: 0,
        review: 0,
        professional: 0,
        appealing: 0,
        emojis: 0,
        detail: 0,
        shorten: 0,
        summarize: 0,
        simplify: 0,
        friendly: 0,
        translate: 0
      }
    };
    await chrome.storage.local.set({ stats: emptyStats });
    displayStats(emptyStats);
    playSound("success");
  }
});

// History search input
if (historySearchInput) {
  historySearchInput.addEventListener("input", () => {
    currentHistoryPage = 1;
    renderHistory();
  });
}

// Export history to CSV
if (exportCsvBtn) {
  exportCsvBtn.addEventListener("click", () => {
    if (!historyRecords || historyRecords.length === 0) {
      alert("No transformation history records available to export.");
      return;
    }
    playSound("click");
    exportHistoryToCsv(historyRecords);
  });
}

// Clear all history
if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener("click", async () => {
    if (historyRecords.length === 0) return;
    playSound("click");
    if (confirm("Are you sure you want to clear all transformation history?")) {
      historyRecords = [];
      currentHistoryPage = 1;
      await chrome.storage.local.set({ history: [] });
      updateHistoryBadge();
      renderHistory();
      playSound("success");
    }
  });
}

// Pagination button listeners
if (historyPrevPageBtn) {
  historyPrevPageBtn.addEventListener("click", () => {
    if (currentHistoryPage > 1) {
      currentHistoryPage--;
      renderHistory();
      playSound("click");
    }
  });
}

if (historyNextPageBtn) {
  historyNextPageBtn.addEventListener("click", () => {
    const query = historySearchInput ? historySearchInput.value.trim().toLowerCase() : "";
    const filteredCount = query
      ? historyRecords.filter(item => 
          (item.inputText && item.inputText.toLowerCase().includes(query)) ||
          (item.outputText && item.outputText.toLowerCase().includes(query)) ||
          (item.actionLabel && item.actionLabel.toLowerCase().includes(query)) ||
          (item.action && item.action.toLowerCase().includes(query)) ||
          (item.targetLanguage && item.targetLanguage.toLowerCase().includes(query))
        ).length
      : historyRecords.length;
    const totalPages = Math.max(1, Math.ceil(filteredCount / HISTORY_PAGE_SIZE));
    if (currentHistoryPage < totalPages) {
      currentHistoryPage++;
      renderHistory();
      playSound("click");
    }
  });
}

/**
 * Initialize popup state
 */
async function initializePopup() {
  const settings = await chrome.storage.local.get([
    "apiKey", "selectedModel", "targetLanguage", "enabled", "theme", "stats", "muted", "autoOpen", "history"
  ]);

  // Set Enable/Disable switches
  extensionToggle.checked = settings.enabled !== false;
  autoOpenToggle.checked = settings.autoOpen !== false;

  // Set Model dropdown
  if (popupModelSelect) {
    popupModelSelect.value = settings.selectedModel || "gemini-3.7-flash";
  }

  // Set Language dropdown with normalization
  if (popupLanguageSelect) {
    let lang = settings.targetLanguage || "English (US)";
    if (lang === "English") lang = "English (US)";
    if (lang === "Portuguese") lang = "Portuguese (PT)";
    popupLanguageSelect.value = lang;
    if (!popupLanguageSelect.value) {
      popupLanguageSelect.value = "English (US)";
    }
  }

  // Set Theme
  let theme = settings.theme;
  if (!theme) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    theme = prefersDark ? "dark" : "light";
  }

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  // Set Sound status class
  const isMuted = settings.muted === true;
  if (isMuted) {
    document.documentElement.classList.add("muted");
  } else {
    document.documentElement.classList.remove("muted");
  }

  // Set API Key status badge
  if (settings.apiKey) {
    apiStatusBadge.className = "status-badge ok";
    apiStatusBadge.innerHTML = `<span class="dot"></span>Active`;
  } else {
    apiStatusBadge.className = "status-badge error";
    apiStatusBadge.innerHTML = `<span class="dot"></span>No API Key`;
  }

  // History cache
  historyRecords = Array.isArray(settings.history) ? settings.history : [];
  currentHistoryPage = 1;
  updateHistoryBadge();

  // Render stats
  displayStats(settings.stats);
}

/**
 * Update the count badge in the History tab header
 */
function updateHistoryBadge() {
  if (historyCountBadge) {
    historyCountBadge.textContent = historyRecords.length;
  }
}

/**
 * Format relative timestamps
 */
function formatRelativeTime(timestamp) {
  if (!timestamp) return "";
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Render history records with pagination and search filtering
 */
function renderHistory() {
  if (!historyListContainer) return;

  const query = historySearchInput ? historySearchInput.value.trim().toLowerCase() : "";
  const filtered = query
    ? historyRecords.filter(item => 
        (item.inputText && item.inputText.toLowerCase().includes(query)) ||
        (item.outputText && item.outputText.toLowerCase().includes(query)) ||
        (item.actionLabel && item.actionLabel.toLowerCase().includes(query)) ||
        (item.action && item.action.toLowerCase().includes(query)) ||
        (item.targetLanguage && item.targetLanguage.toLowerCase().includes(query))
      )
    : historyRecords;

  historyListContainer.innerHTML = "";

  const totalPages = Math.max(1, Math.ceil(filtered.length / HISTORY_PAGE_SIZE));
  if (currentHistoryPage > totalPages) currentHistoryPage = totalPages;
  if (currentHistoryPage < 1) currentHistoryPage = 1;

  if (filtered.length === 0) {
    historyEmptyState.classList.remove("hidden");
    if (query) {
      historyEmptyState.querySelector("span").textContent = `No matches found for "${query}"`;
    } else {
      historyEmptyState.querySelector("span").textContent = "No transformations recorded yet.";
    }
    if (historyPagination) {
      historyPagination.classList.add("hidden");
    }
    return;
  }

  historyEmptyState.classList.add("hidden");

  // Render pagination info
  if (historyPagination) {
    historyPagination.classList.remove("hidden");
    if (historyPageInfo) {
      historyPageInfo.textContent = `Page ${currentHistoryPage} of ${totalPages}`;
    }
    if (historyPrevPageBtn) {
      historyPrevPageBtn.disabled = currentHistoryPage <= 1;
    }
    if (historyNextPageBtn) {
      historyNextPageBtn.disabled = currentHistoryPage >= totalPages;
    }
  }

  // Slice records for current page
  const startIndex = (currentHistoryPage - 1) * HISTORY_PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + HISTORY_PAGE_SIZE);

  pageItems.forEach(item => {
    const card = document.createElement("div");
    card.className = "history-card";
    card.dataset.id = item.id;

    const actionText = item.actionLabel || item.action || "Transformation";
    const langBadge = item.targetLanguage ? ` → ${item.targetLanguage}` : "";
    const totalTokens = item.tokens?.total || (item.tokens?.input || 0) + (item.tokens?.output || 0);
    const tokenBadge = totalTokens > 0 ? `• ${totalTokens} tok` : "";
    const timeStr = formatRelativeTime(item.timestamp);

    card.innerHTML = `
      <div class="history-card-header">
        <span class="history-action-tag">
          ${actionText}${langBadge}
        </span>
        <span class="history-time-meta">
          <span>${timeStr}</span>
          ${tokenBadge ? `<span>${tokenBadge}</span>` : ""}
          <button class="history-delete-btn" title="Delete record" data-id="${item.id}" type="button">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </span>
      </div>

      <div class="history-text-block">
        <div class="history-text-header">
          <span class="history-text-label">Input</span>
          <button class="history-copy-btn" data-type="input" type="button">Copy</button>
        </div>
        <div class="history-text-content">${escapeHtml(item.inputText || "")}</div>
      </div>

      <div class="history-text-block">
        <div class="history-text-header">
          <span class="history-text-label">Output</span>
          <button class="history-copy-btn" data-type="output" type="button">Copy</button>
        </div>
        <div class="history-text-content">${escapeHtml(item.outputText || "")}</div>
      </div>
    `;

    // Copy Input button
    const copyInputBtn = card.querySelector('[data-type="input"]');
    copyInputBtn.addEventListener("click", async () => {
      await copyToClipboard(item.inputText || "", copyInputBtn);
    });

    // Copy Output button
    const copyOutputBtn = card.querySelector('[data-type="output"]');
    copyOutputBtn.addEventListener("click", async () => {
      await copyToClipboard(item.outputText || "", copyOutputBtn);
    });

    // Delete Item button
    const deleteBtn = card.querySelector(".history-delete-btn");
    deleteBtn.addEventListener("click", async () => {
      await deleteHistoryItem(item.id);
    });

    historyListContainer.appendChild(card);
  });
}

/**
 * Delete a single history record by ID
 */
async function deleteHistoryItem(id) {
  historyRecords = historyRecords.filter(item => item.id !== id);
  await chrome.storage.local.set({ history: historyRecords });
  updateHistoryBadge();

  const query = historySearchInput ? historySearchInput.value.trim().toLowerCase() : "";
  const filteredCount = query
    ? historyRecords.filter(item => 
        (item.inputText && item.inputText.toLowerCase().includes(query)) ||
        (item.outputText && item.outputText.toLowerCase().includes(query)) ||
        (item.actionLabel && item.actionLabel.toLowerCase().includes(query)) ||
        (item.action && item.action.toLowerCase().includes(query)) ||
        (item.targetLanguage && item.targetLanguage.toLowerCase().includes(query))
      ).length
    : historyRecords.length;

  const totalPages = Math.max(1, Math.ceil(filteredCount / HISTORY_PAGE_SIZE));
  if (currentHistoryPage > totalPages) {
    currentHistoryPage = totalPages;
  }

  renderHistory();
  playSound("click");
}

/**
 * Copy text with button state animation
 */
async function copyToClipboard(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    playSound("click");
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = "Copy";
      btn.classList.remove("copied");
    }, 1500);
  } catch (err) {
    console.error("Copy failed:", err);
  }
}

/**
 * Export history records to CSV format and trigger file download
 */
function exportHistoryToCsv(records) {
  if (!records || records.length === 0) return;

  const headers = [
    "ID",
    "Timestamp (ISO)",
    "Date",
    "Action",
    "Model",
    "Target Language",
    "Input Tokens",
    "Output Tokens",
    "Total Tokens",
    "Input Text",
    "Output Text"
  ];

  function escapeCsvCell(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  }

  const rows = records.map(item => {
    const d = item.timestamp ? new Date(item.timestamp) : new Date();
    const inTok = item.tokens?.input ?? 0;
    const outTok = item.tokens?.output ?? 0;
    const totalTok = item.tokens?.total ?? (inTok + outTok);

    return [
      escapeCsvCell(item.id || ""),
      escapeCsvCell(d.toISOString()),
      escapeCsvCell(d.toLocaleString()),
      escapeCsvCell(item.actionLabel || item.action || ""),
      escapeCsvCell(item.model || ""),
      escapeCsvCell(item.targetLanguage || ""),
      escapeCsvCell(inTok),
      escapeCsvCell(outTok),
      escapeCsvCell(totalTok),
      escapeCsvCell(item.inputText || ""),
      escapeCsvCell(item.outputText || "")
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `textbetter-history-${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  playSound("success");
}

/**
 * Escape HTML to prevent injection in history cards
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Calculate and display statistics in the dashboard UI, including charts
 */
function displayStats(stats) {
  if (!stats) {
    // Reset all elements
    statRequests.textContent = "0";
    statTokens.textContent = "0";
    statTopAction.textContent = "None yet";
    tokenInputVal.textContent = "0";
    tokenOutputVal.textContent = "0";
    tokenRatioInput.style.width = "0%";
    tokenRatioOutput.style.width = "0%";
    chartBarsContainer.innerHTML = `<div class="empty-chart">No actions used yet</div>`;
    return;
  }

  // Requests
  const totalReqs = stats.totalRequests || 0;
  statRequests.textContent = totalReqs;
  
  // Tokens
  const inTokens = Math.max(0, parseInt(stats.inputTokens, 10) || 0);
  const outTokens = Math.max(0, parseInt(stats.outputTokens, 10) || 0);
  const totalTokens = inTokens + outTokens;
  statTokens.textContent = totalTokens.toLocaleString();
  
  // Detailed token breakdown
  tokenInputVal.textContent = inTokens.toLocaleString();
  tokenOutputVal.textContent = outTokens.toLocaleString();

  // Token ratio visualization (safe division)
  if (totalTokens > 0) {
    const inPct = Math.round((inTokens / totalTokens) * 100);
    const outPct = 100 - inPct;
    tokenRatioInput.style.width = `${inPct}%`;
    tokenRatioOutput.style.width = `${outPct}%`;
  } else {
    tokenRatioInput.style.width = "0%";
    tokenRatioOutput.style.width = "0%";
  }

  // Action count friendly labels
  const friendlyNames = {
    rewrite: "Rewrite",
    review: "Correct Text",
    professional: "Professional",
    appealing: "Appealing",
    emojis: "Add Emojis",
    detail: "Detail It",
    shorten: "Shorten Text",
    summarize: "Summarize",
    simplify: "Simplify",
    friendly: "Friendly Tone",
    translate: "Translate"
  };

  // Find top action and gather active ones for the breakdown chart
  let topActionName = "None yet";
  let maxCount = 0;
  const activeActions = [];

  if (stats.actionCounts) {
    Object.entries(stats.actionCounts).forEach(([action, count]) => {
      if (count > 0) {
        activeActions.push({ action, count });
        if (count > maxCount) {
          maxCount = count;
          topActionName = `${friendlyNames[action] || action} (${count})`;
        }
      }
    });
  }

  statTopAction.textContent = topActionName;

  // Build the Action Breakdown Graph
  chartBarsContainer.innerHTML = "";
  if (activeActions.length === 0) {
    chartBarsContainer.innerHTML = `<div class="empty-chart">No actions used yet</div>`;
  } else {
    // Sort descending by count
    activeActions.sort((a, b) => b.count - a.count);

    activeActions.forEach(({ action, count }) => {
      const relPct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
      const readableLabel = friendlyNames[action] || action;

      const chartRow = document.createElement("div");
      chartRow.className = "chart-row";
      chartRow.innerHTML = `
        <span class="chart-label" title="${readableLabel}">${readableLabel}</span>
        <div class="chart-bar-wrap">
          <div class="chart-bar-fill" style="width: ${relPct}%"></div>
        </div>
        <span class="chart-val">${count}</span>
      `;
      chartBarsContainer.appendChild(chartRow);
    });
  }
}

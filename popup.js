// popup.js - Browser action popup script with analytics and UI sounds

// Mock chrome API for local testing outside Chrome Extension environment
if (typeof chrome === "undefined" || !chrome.storage) {
  // Seed mock statistics and settings if mock storage is empty
  if (!localStorage.getItem("tb_mock_storage")) {
    localStorage.setItem("tb_mock_storage", JSON.stringify({
      enabled: true,
      theme: "dark",
      muted: false,
      apiKey: "AIzaSyMockKeyForLocalPreviews",
      selectedModel: "gemini-3.5-flash",
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
          shorten: 0
        }
      }
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
const apiStatusBadge = document.getElementById("api-status-badge");
const activeModelName = document.getElementById("active-model-name");
const openSettingsBtn = document.getElementById("open-settings-btn");
const themeToggleBtn = document.getElementById("popup-theme-toggle");
const soundToggleBtn = document.getElementById("popup-sound-toggle");

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

// Extension Toggle handler
extensionToggle.addEventListener("change", async (e) => {
  const isEnabled = e.target.checked;
  await chrome.storage.local.set({ enabled: isEnabled });
  playSound(isEnabled ? "toggle-on" : "toggle-off");
});

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
    // Play a brief sweep down before muting
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
        shorten: 0
      }
    };
    await chrome.storage.local.set({ stats: emptyStats });
    displayStats(emptyStats);
    playSound("success");
  }
});

/**
 * Initialize popup state
 */
async function initializePopup() {
  const settings = await chrome.storage.local.get(["apiKey", "selectedModel", "enabled", "theme", "stats", "muted"]);

  // Set Enable/Disable switch
  extensionToggle.checked = settings.enabled !== false; // Default to true if undefined

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

  // Set Model text
  activeModelName.textContent = settings.selectedModel || "gemini-3.5-flash";

  // Set API Key status badge
  if (settings.apiKey) {
    apiStatusBadge.className = "status-badge ok";
    apiStatusBadge.innerHTML = `<span class="dot"></span>Active`;
  } else {
    apiStatusBadge.className = "status-badge error";
    apiStatusBadge.innerHTML = `<span class="dot"></span>No API Key`;
  }

  // Render stats
  displayStats(settings.stats);
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
  const inTokens = stats.inputTokens || 0;
  const outTokens = stats.outputTokens || 0;
  const totalTokens = inTokens + outTokens;
  statTokens.textContent = totalTokens.toLocaleString();
  
  // Detailed token breakdown
  tokenInputVal.textContent = inTokens.toLocaleString();
  tokenOutputVal.textContent = outTokens.toLocaleString();

  // Token ratio visualization
  if (totalTokens > 0) {
    const inPct = (inTokens / totalTokens) * 100;
    const outPct = (outTokens / totalTokens) * 100;
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
    shorten: "Shorten Text"
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
      // Relative scale: top action is 100%, others are proportional
      const relPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
      const readableLabel = friendlyNames[action] || action;

      const chartRow = document.createElement("div");
      chartRow.className = "chart-row";
      chartRow.innerHTML = `
        <div class="chart-row-header">
          <span class="chart-row-name">${readableLabel}</span>
          <span class="chart-row-count">${count}</span>
        </div>
        <div class="chart-row-bar-bg">
          <div class="chart-row-bar-fill" style="width: 0%"></div>
        </div>
      `;
      chartBarsContainer.appendChild(chartRow);

      // Trigger width transition in next paint frame for smooth grow animations
      requestAnimationFrame(() => {
        setTimeout(() => {
          const fillBar = chartRow.querySelector(".chart-row-bar-fill");
          if (fillBar) fillBar.style.width = `${relPct}%`;
        }, 50);
      });
    });
  }
}

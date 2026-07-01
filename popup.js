// popup.js - Browser action popup script

// Mock chrome API for local testing outside Chrome Extension environment
if (typeof chrome === "undefined" || !chrome.storage) {
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


const extensionToggle = document.getElementById("extension-toggle");
const apiStatusBadge = document.getElementById("api-status-badge");
const activeModelName = document.getElementById("active-model-name");
const openSettingsBtn = document.getElementById("open-settings-btn");
const themeToggleBtn = document.getElementById("popup-theme-toggle");

// Load settings on startup
document.addEventListener("DOMContentLoaded", async () => {
  await initializePopup();
});

// Extension Toggle handler
extensionToggle.addEventListener("change", async (e) => {
  const isEnabled = e.target.checked;
  await chrome.storage.local.set({ enabled: isEnabled });
  // Notify content scripts of state change if necessary
});

// Theme Toggle handler
themeToggleBtn.addEventListener("click", async () => {
  const isDark = document.documentElement.classList.toggle("dark");
  await chrome.storage.local.set({ theme: isDark ? "dark" : "light" });
});

// Open settings page
openSettingsBtn.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

/**
 * Initialize popup state
 */
async function initializePopup() {
  const settings = await chrome.storage.local.get(["apiKey", "selectedModel", "enabled", "theme"]);

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

  // Set Model text
  activeModelName.textContent = settings.selectedModel || "gemini-3.1-flash-lite";

  // Set API Key status badge
  if (settings.apiKey) {
    apiStatusBadge.className = "status-badge ok";
    apiStatusBadge.innerHTML = `<span class="dot"></span>Active`;
  } else {
    apiStatusBadge.className = "status-badge error";
    apiStatusBadge.innerHTML = `<span class="dot"></span>No API Key`;
  }
}

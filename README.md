# TextBetter — Premium Gemini-Powered AI Writing Assistant

Official Site: [textbetter.astrofocus.app](https://textbetter.astrofocus.app)

TextBetter is a privacy-first, client-side Chrome Extension that enhances your writing instantly on any website. Powered by Google's Gemini API, TextBetter injects a sleek, interactive widget directly into your browser whenever you highlight text, allowing you to edit, correct, or rephrase it dynamically.

Designed with **Shadcn Zinc** aesthetics, a native Web Audio synthesis engine, and developer previews, it offers a premium desktop editing experience.

---

## ✦ Key Features in v2.0.0

- 🧠 **Next-Generation Gemini Models**:
  - **Gemini 3.7 Flash** (Default / Recommended): State-of-the-art speed, reasoning, and nuanced editing.
  - **Gemini 3.5 Flash**: Frontier-level multimodal reasoning and text refinement.
  - **Gemini 3.1 Flash-Lite**: High-throughput, ultra-fast responses for quick edits.
  - **Gemini 2.5 Flash & Pro**: Reliable, battle-tested options for extensive transformations.
- 🔒 **Offline-First Privacy**: No middleman servers. Your Gemini API key is stored securely in your browser's local sandbox (`chrome.storage.local`) and all calls go directly to Google's official endpoints.
- 🌐 **11 Writing Actions & Multilingual Translation**:
  - **Rewrite**: Improve general flow and style while maintaining the original meaning.
  - **Review**: Spotless grammar, punctuation, and spelling correction.
  - **Professional**: Upgrade to business-formal, crisp corporate tone.
  - **Casual**: Friendly, approachable, and natural phrasing.
  - **Academic**: Rigorous, scholarly vocabulary and syntax.
  - **Bullet Points**: Convert dense paragraphs into clean, scannable lists.
  - **Simplify**: Plain language translation for complex concepts.
  - **Appealing**: Engaging, persuasive copywriting edits.
  - **Emojis**: Infuse expressive, tasteful emojis.
  - **Detail**: Expand and elaborate with rich context.
  - **Shorten**: Condense to direct, brief sentences.
  - **Translate**: Accurate translation with customizable target languages and regional variants (e.g., `pt-BR`, `es-MX`, `en-GB`, `ja`, `de`, `fr`, etc.).
- 📜 **Transformation History & Token Analytics**:
  - Complete history log of past text transformations in the tabbed popup UI.
  - Search & query filtering across original text, transformed text, and action labels.
  - Real-time token usage breakdown (prompt tokens vs candidate tokens).
  - Quick 1-click CSV export and individual item deletion.
- ⌨️ **Keyboard Shortcut Engine & Smart Triggers**:
  - Global customizable shortcut (e.g., `Ctrl+Shift+K`, `Alt+Space`) to instantly open the rewrite bar on any selected text.
  - Built-in interactive shortcut recorder in Settings.
  - Configurable trigger icon placement (`Above Selection` or `Below Selection`) and Auto-open toggle.
- ⚡ **Universal & Resilient Input Replacement**:
  - 1-click text replacement across standard inputs, textareas, `contenteditable` divs, and modern web apps (Microsoft Teams, Slack, Notion, Google Docs / ProseMirror, Lexical, Draft.js, Monaco editor).
  - Safe extension context invalidation handling.
- 🎨 **Shadcn Zinc Design System**: A responsive UI with a custom dark/light theme matching Shadcn's modern palette.
- 🔊 **Synthesized UI Sounds**: Responsive audio feedback (clicks, successes, error blips) synthesized in real-time using the **Web Audio API** (completely mutable in settings).
- 📝 **Customizable Prompts**: Edit system prompt instructions sent to Gemini for each action directly from the settings page.
- ☕ **Support & GitHub**: Built-in Stripe donation ("Buy me a coffee") and official GitHub repository links on both settings and popup menus.

---

## 🛠️ File Structure

The project is structured with zero external bundler dependencies, making it clean, lightweight, and fast to load:

- [manifest.json](file:///c:/Users/klysm/Documents/Github/TextBetter/manifest.json) — Extension manifest (Manifest V3) declaring permissions, background workers, and content scripts.
- [background.js](file:///c:/Users/klysm/Documents/Github/TextBetter/background.js) — Non-persistent Service Worker managing secure API calls to Gemini and updating token/usage statistics.
- [content.js](file:///c:/Users/klysm/Documents/Github/TextBetter/content.js) — Core script injected into web pages. It listens to user selection events, spawns the custom Shadow DOM widget, and handles text replacement.
- [popup.html](file:///c:/Users/klysm/Documents/Github/TextBetter/popup.html) / [popup.js](file:///c:/Users/klysm/Documents/Github/TextBetter/popup.js) — The main extension popup UI, detailing real-time statistics, active connections, and options toggles.
- [options.html](file:///c:/Users/klysm/Documents/Github/TextBetter/options.html) / [options.js](file:///c:/Users/klysm/Documents/Github/TextBetter/options.js) / [options.css](file:///c:/Users/klysm/Documents/Github/TextBetter/options.css) — Customization panel for setting the API Key, choosing models, managing prompts, and muting sounds.
- [docs/](file:///c:/Users/klysm/Documents/Github/TextBetter/docs) — A premium landing page/documentation site introducing the extension.

---

## 🚀 Installation & Setup

### 1. Prerequisites
- Google Chrome, Brave, Edge, or any Chromium-based browser.
- A Gemini API Key. You can get one for free at [Google AI Studio](https://aistudio.google.com/).

### 2. Loading the Extension
1. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/klysman08/TextBetter.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. In the top-right corner, toggle **Developer mode** to ON.
4. Click **Load unpacked** in the top-left corner.
5. Select the cloned repository folder (containing `manifest.json`).

### 3. Setting your API Key
1. Click the extensions puzzle icon in your browser toolbar and pin **TextBetter**.
2. Click the **TextBetter** icon, then click the **Settings** gear icon (or right-click the extension icon and select *Options*).
3. Paste your Google Gemini API key into the input field.
4. Select your preferred LLM model:
   - **Gemini 3.5 Flash** (Recommended for reasoning/tone)
   - **Gemini 3.1 Flash-Lite** (Recommended for speed/low resource usage)
5. Click **Test Connection** to verify your key, then click **Save Settings**.

---

## 💡 How To Use

1. **Select Text**: Highlight any text on any website (works inside editable input areas, rich-text textareas, or static website texts).
2. **Click the Widget**: A small floating **TextBetter** badge (`✦`) will appear near your selection. Click it.
3. **Choose an Action**: Select one of the 7 writing actions from the menu.
4. **Preview & Replace**:
   - The widget will display the AI-optimized response.
   - For textboxes or inputs, click **Replace** to overwrite your text instantly.
   - For static webpage texts, click **Copy** to save the optimized text to your clipboard.

---

## 🧪 Local Preview & Development

To test or preview the UI designs locally without installing the extension:
- You can open [popup.html](file:///c:/Users/klysm/Documents/Github/TextBetter/popup.html) or [options.html](file:///c:/Users/klysm/Documents/Github/TextBetter/options.html) directly in any browser.
- Both pages include **mock API and Storage handlers** that run fully client-side using `localStorage`. This allows previewing themes, loading sample metrics/charts, and testing simulated API runs offline.

---

## 📜 License

This project is open-source. Feel free to fork, modify, and distribute it for your personal use.

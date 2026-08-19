## Context

TextBetter is a zero-dependency Chrome Extension (Manifest V3) with a Shadow DOM injected content script (`content.js`), a service worker (`background.js`), an options settings page (`options.html`/`options.js`), and a browser action popup (`popup.html`/`popup.js`).

See `proposal.md` for motivation and `specs/` for behavioral requirements.

## Goals / Non-Goals

**Goals:**
- Add official support for current Gemini models: `gemini-3.7-flash` and `gemini-3.5-flash-lite`.
- Implement robust multi-key shortcut recording (`Ctrl+Key`, `Alt+Key`, `Shift+Key`, `Meta+Key`) without premature single-key cancellation.
- Implement a multi-tier universal text replacement strategy that works reliably across native forms, React/Vue/Angular controlled inputs, and contenteditable editors.
- Introduce `summarize`, `simplify`, and `friendly` prompt actions.
- Implement dedicated text translation with a target language selector in options settings and floating UI action.

**Non-Goals:**
- Adding third-party UI or bundling dependencies (keep pure Vanilla JS/CSS).
- Introducing remote cloud server synchronization (all state remains local in `chrome.storage.local`).

## Decisions

### 1. Model Resolution and Defaults
- **Choice**: Default to `gemini-3.7-flash` with options for `gemini-3.5-flash-lite` and `gemini-3.5-flash`.
- **Rationale**: `gemini-3.7-flash` provides the highest quality and reasoning capabilities for rewriting while remaining fast. `gemini-3.5-flash-lite` offers ultra-low latency for quick edits.
- **Alternatives considered**: Hardcoding single model or requiring manual string input (poor UX).

### 2. Multi-Key Shortcut Recording and Detection
- **Choice**:
  - In `options.js`, the hotkey recorder listens to `keydown`. If only modifier keys (`Control`, `Alt`, `Shift`, `Meta`) are pressed, it visualizes the modifier state (e.g. `Ctrl + ...`) without closing the recording session. The shortcut is only finalized when a non-modifier trigger key (e.g. `K`, `E`, `Space`) is pressed in conjunction with modifiers.
  - In `content.js`, `handleHotkeyPress` checks active modifier flags matching the stored string (e.g., `Ctrl+K` checks `e.ctrlKey && e.key.toUpperCase() === "K"`).
- **Rationale**: Fixes the existing bug where pressing `Ctrl` alone immediately committed `"Ctrl"` and unfocused the input before the user could press the combination key.

### 3. Resilient Multi-Tier Form Replacement Engine
- **Choice**: Multi-step fallback cascade for `handleInsert()`:
  1. If selection was in `<input>` or `<textarea>`:
     - Focus element and restore `selectionStart` and `selectionEnd`.
     - Attempt `document.execCommand('insertText', false, newText)` first. If successful, browser undo stack is preserved and native framework handlers fire.
     - Verify if value changed. If not (e.g., React controlled input where execCommand is blocked):
       - Use `activeElement.setRangeText(newText, inputStart, inputEnd, 'select')`.
       - If still unchanged, invoke native property setter via `Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set?.call(activeElement, newValue)` (or `HTMLTextAreaElement.prototype`).
       - Dispatch `new InputEvent('input', { bubbles: true, composed: true, inputType: 'insertReplacementText', data: newText })` and `new Event('change', { bubbles: true })`.
  2. If selection was in `contenteditable` or general DOM text node:
     - Restore `activeSelectionRange` and attempt `document.execCommand('insertText', false, newText)`.
     - Fallback to DOM `Range.deleteContents()` + `Range.insertNode()`.
- **Rationale**: Guarantees compatibility with vanilla forms, React, Vue, Angular, Svelte, and rich-text editors without losing focus or breaking reactive state.

### 4. Translation and Language Selector
- **Choice**:
  - Store `targetLanguage` (default: `"English"`) in `chrome.storage.local`.
  - Add language dropdown to `options.html` containing major global languages (English, Spanish, Portuguese, French, German, Italian, Japanese, Chinese, Russian, Korean, Arabic, Dutch, Hindi, etc.).
  - The `prompt_translate` template instructs Gemini:
    `"You are a professional translator. Translate the text inside <input_text> into {targetLanguage}. Maintain tone, context, nuances, and formatting. Output ONLY the translated text, do not add introductory or concluding comments."`
  - In `content.js`, dynamic replacement of `{targetLanguage}` with the stored setting before sending the message to `background.js`.

### 5. Expanded Improvement Actions and UI Layout
- **Choice**:
  - Add actions: `summarize`, `simplify`, `friendly`, and `translate`.
  - Organize floating action button layout cleanly in the Shadow DOM widget card.
  - Update options page with prompt customization cards for new actions and reset defaults handler.
  - Update popup dashboard to track usage counts for new actions.

## Risks / Trade-offs

- **[Risk]** Some complex rich-text editors (like Google Docs canvas) do not use DOM selections.
  - **Mitigation**: Standard clipboard copy button remains available as universal fallback when direct in-place DOM replacement cannot attach.
- **[Risk]** Users upgrading from previous versions might have custom prompts or missing new defaults.
  - **Mitigation**: Auto-migration logic in `loadSettings()` populates missing default prompts and default model without overwriting user customizations.

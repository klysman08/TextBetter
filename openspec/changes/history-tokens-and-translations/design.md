## Context

TextBetter is a Chrome Extension built on Manifest V3 with a background service worker (`background.js`), content script (`content.js`), options page (`options.html` / `options.js`), and popup analytics dashboard (`popup.html` / `popup.js`). All states and metrics are stored in `chrome.storage.local`.

Currently, text transformations are executed on-the-fly and forgotten once completed. Token usage is tracked cumulatively, but lacks detailed per-request audit and verification. Translation languages are currently limited to generic country/language names without regional dialect distinctions (e.g. English GB vs US, Portuguese BR vs PT).

## Goals / Non-Goals

**Goals:**
- Provide a persistent, searchable local history of all text transformations with original inputs, rewritten outputs, action types, models, tokens, and timestamps.
- Add an integrated, modern tab switcher in the extension popup (`Dashboard` vs `History`) with zero latency and responsive zinc aesthetics.
- Verify and harden token count tracking across background workers, Gemini `usageMetadata`, popup UI rendering, and mock storage.
- Support regional translation language options (`English (GB)` and `Portuguese (BR)`) across popup and options pages while retaining full backward compatibility for existing user configurations.

**Non-Goals:**
- Cloud sync of history (all data strictly remains in local browser sandbox `chrome.storage.local` adhering to privacy guarantees).
- Infinite history storage (bounded to 100 entries to prevent local storage quota saturation).
- Custom multi-language translation chained together in a single prompt.

## Decisions

### 1. Tabbed Navigation in Popup
- **Decision**: Introduce a top-level tab switcher in `popup.html` toggling between `#view-dashboard` and `#view-history`.
- **Rationale**: Keeps popup width compact (360px) and clean without overcrowding the primary quick-settings and analytics dashboard.
- **Alternatives Considered**: 
  - Opening a separate tab/window: Higher friction for quick retrieval.
  - Adding history below the dashboard in a single scrolling view: Makes popup excessively long and unwieldy.

### 2. History Storage Schema & FIFO Capacity
- **Decision**: Store history under `history` key as an array of structured objects capped at 100 entries:
  ```json
  {
    "id": "tb_hist_1771536700000_a1b2",
    "timestamp": 1771536700000,
    "action": "professional",
    "actionLabel": "Make it Professional",
    "inputText": "hey whats up",
    "outputText": "Dear colleague, I hope this message finds you well.",
    "model": "gemini-3.7-flash",
    "targetLanguage": null,
    "tokens": {
      "input": 12,
      "output": 18,
      "total": 30
    }
  }
  ```
- **Rationale**: Bounding the array to 100 items keeps storage within ~100–200 KB (well below the 10 MB `chrome.storage.local` quota) while preserving weeks of typical usage.

### 3. Token Accounting & Verification Architecture
- **Decision**: 
  - Background Service Worker (`background.js`) extracts `promptTokenCount`, `candidatesTokenCount`, and `totalTokenCount` directly from Gemini's `usageMetadata` response object when available.
  - If `usageMetadata` is absent (offline/mock/fallback), calculate safe integer estimates using `Math.ceil(charCount / 4)`.
  - Store `inputTokens`, `outputTokens`, and `totalRequests` in `stats`. Popup displays `totalTokens = inTokens + outTokens` and dynamic input/output percentage distributions.
- **Rationale**: Direct reliance on Gemini `usageMetadata` provides exact token accounting for billed API usage, with reliable heuristic fallbacks.

### 4. Regional Language Identifiers & Dynamic Interpolation
- **Decision**: 
  - Add explicit select options:
    - `English (US)` and `English (GB)`
    - `Portuguese (BR)` and `Portuguese (PT)`
  - Legacy `English` and `Portuguese` stored values map transparently to standard selections.
  - In translation prompts, `{targetLanguage}` will be replaced with `"English (GB)"` or `"Portuguese (BR)"`. The system instruction explicitly instructs Gemini: `"Your task is to translate the user's text into {targetLanguage}, preserving nuances, natural flow, formatting, and meaning."` Gemini handles regional variants (e.g. British spelling/idioms or Brazilian Portuguese grammar) natively when named in the prompt.

## Risks / Trade-offs

- **[Risk] Storage Quota Growth** → **Mitigation**: History is strictly capped at 100 records with automatic FIFO trimming on each new insertion, and users have a single-click "Clear All History" button.
- **[Risk] Long text snippet rendering performance in popup** → **Mitigation**: History cards truncate long text with expandable text containers or CSS line clamping with copy buttons.
- **[Risk] Backward compatibility with saved target languages** → **Mitigation**: UI dropdown population safely matches legacy language keys (`English`, `Portuguese`) to their new options without throwing errors.

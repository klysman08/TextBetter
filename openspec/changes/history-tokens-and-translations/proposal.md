## Why

Users who refine or translate text across browser sessions often need to reference previous transformations, recover past prompt outputs, or compare original inputs against rewritten outputs. Currently, transformation results are transient and lost once the floating tooltip or tab closes. Additionally, users need guaranteed accurate accounting of Total Tokens consumed across all API requests, as well as distinct support for regional language variants—specifically British English (`English (GB)`) and Brazilian Portuguese (`Portuguese (BR)`).

## What Changes

1. **Transformation History & Dedicated History Tab**:
   - Persist history entries for text generation and translation requests in `chrome.storage.local` (recording `id`, `timestamp`, `action`, `model`, `inputText`, `outputText`, `tokens`, and optional `targetLanguage`).
   - Implement a tabbed interface in the extension popup (`popup.html` / `popup.js`) switching smoothly between **Dashboard** (overview, toggles, quick model/language controls, token metrics, action charts) and **History** (chronological list of transformations, search filter, single-entry copy/delete, and clear-all).
   - Impose a reasonable capacity limit (e.g. 100 entries) with automated FIFO pruning to prevent storage bloat.

2. **Total Tokens Count Accuracy & Verification**:
   - Audit and harden token counting logic in `background.js` and `popup.js` to ensure input tokens (`promptTokenCount`), output tokens (`candidatesTokenCount`), and total tokens (`totalTokenCount` or `inTokens + outTokens`) reflect exact Gemini API `usageMetadata` (with integer-safe fallbacks).
   - Ensure the Usage Dashboard displays accurate aggregated numbers, ratio distributions, and reset functionality.

3. **Regional Translation Languages (`English (GB)` & `Portuguese (BR)`)**:
   - Expand translation language selection options in both `options.html` and `popup.html` to include `English (GB)` and `Portuguese (BR)` alongside existing choices like `English (US)` / `English` and `Portuguese (PT)` / `Portuguese`.
   - Ensure dynamic prompt interpolation in `content.js` and `options.js` correctly passes the regional variant to Gemini's translation system instructions, with complete backward compatibility for existing stored settings.

## Capabilities

### New Capabilities
- `transformation-history`: Captures input/output transformation history, persists records locally in extension storage, and provides a dedicated History tab in the popup UI with search, copy, deletion, and pagination/scrolling.

### Modified Capabilities
- `text-translation`: Expands supported language choices to include regional language variants `English (GB)` and `Portuguese (BR)` in popup and options dropdowns with preserved prompt interpolation and fallback handling.

## Impact

- **Storage & State**: Adds a `history` array to `chrome.storage.local`, handled with safe capacity boundaries.
- **UI / Popup**: Introduces tab navigation (`Dashboard` vs `History`) in `popup.html` and renders interactive history cards with copy/delete actions. Updates translation language `<select>` menus.
- **Service Worker (`background.js`)**: Appends records to `history` on successful Gemini responses and records accurate token metadata from `usageMetadata`.
- **Options (`options.html`, `options.js`)**: Adds new regional language options to the dropdown.
- **Automated Tests**: Adds unit tests verifying token calculation, history serialization/capping, and regional translation prompt formatting.

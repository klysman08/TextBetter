## 1. Storage & Background Logic (History & Token Accounting)

- [x] 1.1 Audit and update token accounting logic in `background.js` to strictly use `usageMetadata.promptTokenCount`, `usageMetadata.candidatesTokenCount`, and `usageMetadata.totalTokenCount` with integer-safe fallbacks.
- [x] 1.2 Implement history recording in `background.js` to capture input text, output text, action type, action label, model, timestamp, token metrics, and target language into `chrome.storage.local.history` with a 100-item FIFO cap.
- [x] 1.3 Update `content.js` message payloads to include full action metadata and target language when dispatching `generateText` requests.

## 2. Regional Translation Language Enhancements

- [x] 2.1 Update target language dropdown options in `options.html` to include `English (US)`, `English (GB)`, `Portuguese (BR)`, and `Portuguese (PT)` alongside existing languages.
- [x] 2.2 Update target language dropdown options in `popup.html` to match `options.html`.
- [x] 2.3 Update `options.js` and `content.js` to ensure stored settings and dynamic prompt interpolation for `{targetLanguage}` correctly handle regional variants with backward compatibility.

## 3. Popup Tabbed Navigation & History UI

- [x] 3.1 Add tab navigation header (`Dashboard` vs `History`) and structured views in `popup.html`.
- [x] 3.2 Implement history view markup and styling in `popup.html` (search input, clear button, scrollable history card list, copy input/output buttons, delete item button, and empty state placeholder).
- [x] 3.3 Implement tab switching, search filtering, copy-to-clipboard, single-item deletion, and clear-all actions in `popup.js` (including mock storage support for local testing).
- [x] 3.4 Audit and harden token display and ratio bar calculations in `popup.js` for accurate aggregation and division-by-zero resilience.

## 4. Automated Testing & Verification

- [x] 4.1 Create automated test suite `tests/history.test.js` verifying history entry schema, 100-item FIFO pruning, deletion, clearing, and search filtering.
- [x] 4.2 Add test cases in `tests/prompts.test.js` or `tests/tokens.test.js` for `usageMetadata` token accounting and fallback calculations.
- [x] 4.3 Add test cases verifying prompt template interpolation and language resolution for `English (GB)` and `Portuguese (BR)`.
- [x] 4.4 Execute `npm test` and verify all existing and new test suites pass.

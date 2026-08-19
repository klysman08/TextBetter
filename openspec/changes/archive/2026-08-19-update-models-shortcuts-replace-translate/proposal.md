## Why

TextBetter users require more flexible and reliable writing assistant workflows. Currently, the extension only lists older Gemini model identifiers, keyboard shortcut recording is restricted due to immediately capturing single modifier presses, text replacement fails on modern framework-controlled input forms and rich text fields, the transformation actions are limited, and there is no built-in translation workflow to convert selected text to a chosen language.

Updating model support, enabling multi-key shortcut combinations, making form replacement universal and resilient, introducing new writing refinement modes, and adding multi-language translation directly improves user productivity and core extension reliability.

## What Changes

- **Update Gemini Model Support**: Introduce `gemini-3.7-flash` (latest generation flagship) and `gemini-3.5-flash-lite` (high-speed lightweight) alongside `gemini-3.5-flash` in background service worker, options settings, and popup UI.
- **Support Multi-Key Modifier Shortcuts**: Fix shortcut recording and trigger execution so combinations like `Ctrl+K`, `Ctrl+Shift+E`, `Alt+T`, or `Meta+Shift+L` can be recorded and dispatched accurately without capturing standalone modifier keydowns prematurely.
- **Universal Form Input & Text Replacement**: Enhance the text insertion engine to support modern input fields, React/Vue/Angular controlled inputs via native property descriptor setters, `document.execCommand('insertText')` for undo history & synthetic event triggers, `setRangeText`, and rich-text/contenteditable elements.
- **Expanded Text Improvement Actions**: Propose and add new text improvement actions (`summarize`, `simplify`, `friendly`) to the floating widget, prompt customization settings, and popup analytics dashboard.
- **Dedicated Text Translation Action & Language Settings**: Add a target language selector in options/settings (supporting major languages such as English, Spanish, Portuguese, French, German, Italian, Japanese, Chinese, etc.) and a dedicated "Translate" action in the floating action bar to translate selected text into the configured language.

## Capabilities

### New Capabilities
- `model-selection`: Configuration and dispatching of Gemini API requests using modern models (`gemini-3.7-flash`, `gemini-3.5-flash-lite`, `gemini-3.5-flash`).
- `keyboard-shortcuts`: Recording, storage, and event-handling for multi-key trigger shortcut combinations (`Ctrl/Alt/Shift/Meta + Key`).
- `form-input-replacement`: Resilient replacement and insertion of AI-generated text in standard inputs, framework-controlled form fields, and contenteditable elements.
- `text-improvement-actions`: Expanded suite of text transformation actions (`rewrite`, `review`, `professional`, `appealing`, `emojis`, `detail`, `shorten`, `summarize`, `simplify`, `friendly`).
- `text-translation`: Language selection setting and dedicated prompt-engineered translation action for selected text.

### Modified Capabilities
<!-- None: No existing specs in openspec/specs -->

## Impact

- **Background Service Worker (`background.js`)**: Updated default model resolution, model routing, and translation prompt handling with action statistics tracking.
- **Content Script (`content.js`)**: Upgraded shortcut listener, enhanced multi-strategy `handleInsert` replacement routine, updated floating options grid with translation & new improvement actions, and updated UI styling.
- **Options Page (`options.html`, `options.js`, `options.css`)**: Added target language dropdown, updated model selection list, fixed shortcut recorder to capture combinations properly, added prompt customization textareas for new actions and translation.
- **Popup UI (`popup.html`, `popup.js`)**: Updated active model display and analytics breakdown for new actions.

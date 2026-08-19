## 1. Gemini Models Update

- [x] 1.1 Update model definitions and defaults in `background.js` to support `gemini-3.7-flash`, `gemini-3.5-flash-lite`, and `gemini-3.5-flash`
- [x] 1.2 Update model selection dropdown in `options.html` and default fallback logic in `options.js`
- [x] 1.3 Update active model display and default state in `popup.html` and `popup.js`

## 2. Multi-Key Shortcut Recording and Handling

- [x] 2.1 Update hotkey recording listener in `options.js` to support modifier key combinations (`Ctrl+Key`, `Alt+Key`, etc.) without premature dismissal on modifier keydown
- [x] 2.2 Update shortcut detection in `content.js` to accurately match multi-key combinations and prevent default browser behaviors when triggered

## 3. Resilient Universal Form Input & Content Replacement

- [x] 3.1 Implement multi-tier insertion fallback in `content.js` (`document.execCommand('insertText')`, `setRangeText`, native property descriptors for React/Vue/Angular controlled inputs, and synthetic `InputEvent`/`change` event dispatching)
- [x] 3.2 Implement reliable contenteditable and rich-text selection range replacement in `content.js`

## 4. Expanded Text Improvement Actions

- [x] 4.1 Define prompt templates for `summarize`, `simplify`, and `friendly` actions in `background.js`, `options.js`, and `content.js`
- [x] 4.2 Add UI action buttons and icons for new improvement actions in the Shadow DOM options grid in `content.js`
- [x] 4.3 Add prompt customization textareas for new actions in `options.html` and wire reset defaults in `options.js`
- [x] 4.4 Update analytics tracking and breakdown charts in `popup.js` and `background.js` for new actions

## 5. Text Translation Feature

- [x] 5.1 Add target language configuration selector in `options.html` and persist `targetLanguage` in `options.js`
- [x] 5.2 Add translation prompt template (`prompt_translate`) with `{targetLanguage}` dynamic interpolation in `background.js`, `options.js`, and `content.js`
- [x] 5.3 Add "Translate" action button with icon to the floating action bar in `content.js` and wire translation execution
- [x] 5.4 Update usage analytics in `background.js` and `popup.js` to account for translation requests

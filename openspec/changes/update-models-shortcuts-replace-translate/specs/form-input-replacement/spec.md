## Purpose

Ensures AI-generated text replacements succeed reliably across standard inputs, textareas, framework-controlled form fields, and contenteditable editors.

## ADDED Requirements

### Requirement: Resilient Text Replacement in Inputs and Textareas
When the user chooses to replace selected text in an input or textarea element, the extension SHALL insert the new text into the input field and trigger standard DOM input and change events so modern reactive frameworks (React, Vue, Angular, Svelte) register the update.

#### Scenario: Replace text in framework controlled input
- **WHEN** user selects text inside an `<input>` or `<textarea>` on a web form and clicks "Replace Text"
- **THEN** the target input value SHALL be updated with the AI output and the framework form state SHALL reflect the new value

#### Scenario: Preserve undo stack when replacing
- **WHEN** user replaces text in an editable text field
- **THEN** the replacement SHALL attempt native document insertion commands to maintain browser undo history where supported

### Requirement: Resilient Replacement in ContentEditable and Rich Text Elements
When the user chooses to replace selected text inside contenteditable or rich text containers, the extension SHALL replace the selected range without destroying container structure or formatting.

#### Scenario: Replace selected text in contenteditable editor
- **WHEN** user selects text in a contenteditable div and clicks "Replace Text"
- **THEN** only the selected text portion SHALL be replaced with the AI generated text

## Purpose

Provides seamless in-place text translation with user-configurable target languages from the extension settings and floating action bar.

## Requirements

### Requirement: Target Language Configuration
The settings interface SHALL provide a target language selector allowing users to configure their preferred translation destination language (e.g., English, Spanish, Portuguese, French, German, Italian, Japanese, Chinese, etc.).

#### Scenario: User changes target language
- **WHEN** user selects "Spanish" as the target translation language in settings and saves
- **THEN** extension storage SHALL record `targetLanguage: "Spanish"`

#### Scenario: Default target language
- **WHEN** no target language is set by the user
- **THEN** the extension SHALL default to "English" (or user's browser language)

### Requirement: Quick In-Place Translation Action
The floating assistant toolbar SHALL provide a "Translate" action button that translates the currently selected sentence or paragraph into the configured target language.

#### Scenario: User clicks Translate on selected sentence
- **WHEN** user selects a sentence and clicks "Translate"
- **THEN** the extension SHALL invoke Gemini with system instructions to translate the input text into the configured target language and display the translation in the result panel

#### Scenario: Replace translated text
- **WHEN** user receives the translated text and clicks "Replace Text"
- **THEN** the original text in the document or form field SHALL be replaced with the translated text

## MODIFIED Requirements

### Requirement: Target Language Configuration
The settings interface and popup SHALL provide a target language selector allowing users to configure their preferred translation destination language, supporting regional variants including English (US), English (GB), Portuguese (PT), Portuguese (BR), Spanish, French, German, Italian, Japanese, Chinese (Simplified/Traditional), Korean, Russian, Arabic, Dutch, Hindi, Turkish, Polish, Swedish, and Indonesian.

#### Scenario: User changes target language
- **WHEN** user selects "Spanish" as the target translation language in settings and saves
- **THEN** extension storage SHALL record `targetLanguage: "Spanish"`

#### Scenario: Default target language
- **WHEN** no target language is set by the user or an existing setting contains legacy "English" or "Portuguese"
- **THEN** the extension SHALL default to "English" and preserve valid selections gracefully

#### Scenario: User selects regional language variant
- **WHEN** user selects "English (GB)" or "Portuguese (BR)" as the target translation language in options or popup
- **THEN** extension storage SHALL record the selected value and translation prompts SHALL instruct Gemini to translate specifically into that regional dialect

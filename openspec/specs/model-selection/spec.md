## Purpose

Allows users to select modern Google Gemini LLM models for text generation, defaulting to the latest fast and powerful models.

## Requirements

### Requirement: Supported Models Selection
The extension SHALL provide options to select modern Gemini models including `gemini-3.7-flash`, `gemini-3.5-flash-lite`, and `gemini-3.5-flash` in settings and default to `gemini-3.7-flash` or `gemini-3.5-flash` if no model has been explicitly configured.

#### Scenario: User selects Gemini 3.7 Flash
- **WHEN** user chooses `gemini-3.7-flash` in the settings page and saves
- **THEN** future API requests SHALL target the `gemini-3.7-flash` endpoint

#### Scenario: User selects Gemini 3.5 Flash-Lite
- **WHEN** user chooses `gemini-3.5-flash-lite` in the settings page and saves
- **THEN** future API requests SHALL target the `gemini-3.5-flash-lite` endpoint

#### Scenario: Display active model in Popup
- **WHEN** user opens the extension popup
- **THEN** the currently selected model name SHALL be accurately rendered in the status overview

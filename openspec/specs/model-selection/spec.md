## Purpose

Allows users to dynamically discover and select Google Gemini LLM models for text generation, querying the latest available models live from Google's API without requiring extension updates.

## Requirements

### Requirement: Dynamic Models Discovery & Refresh
The extension SHALL provide a dynamic mechanism to discover available Gemini models via Google's `models.list` API endpoint, strictly filtering for text-to-text generation models (`generateContent`) with Gemini version >= 3 (e.g., `gemini-3.7-flash`, `gemini-3.5-flash-lite`, `gemini-3.5-flash`), explicitly excluding Text-to-Speech (TTS), audio, video, image, and Nano Banana models, caching eligible models in extension storage, and populating model dropdowns in both the Settings (Options) page and the Extension Popup.

#### Scenario: User refreshes models list in Settings
- **WHEN** user clicks the "Refresh" button next to LLM Model in Settings
- **THEN** the extension SHALL query the Gemini models API, filter for text-to-text models with version >= 3 (excluding TTS models like `gemini-3.8-flash-tts`), parse and sort available models, update `availableModels` in storage, and repopulate the dropdown

#### Scenario: User refreshes models list in Popup
- **WHEN** user clicks the refresh icon button next to LLM Model in the Popup
- **THEN** the extension SHALL fetch latest text models with version >= 3, animate the refresh indicator, and update the popup dropdown

#### Scenario: Auto-refresh on successful Connection Test
- **WHEN** user executes "Test Connection" in Settings and the connection succeeds
- **THEN** the extension SHALL automatically trigger model discovery in the background to update available models

#### Scenario: Fallback models when unconfigured or offline
- **WHEN** the extension is loaded without prior cached models or network access
- **THEN** default fallback models (including `gemini-3.7-flash`, `gemini-3.5-flash-lite`, and `gemini-3.5-flash`) SHALL be presented in the dropdown

### Requirement: Supported Models Selection & API Construction
The extension SHALL construct API endpoints targeting whichever model ID the user selects, sanitizing any `models/` prefix to ensure valid endpoint URLs.

#### Scenario: User selects any discovered Gemini model
- **WHEN** user selects a discovered model (e.g. `gemini-3.7-flash`) and saves or changes selection
- **THEN** future API requests SHALL target `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` with clean model identifiers


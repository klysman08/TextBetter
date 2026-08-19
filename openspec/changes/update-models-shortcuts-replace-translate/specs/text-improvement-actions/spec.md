## Purpose

Expands the text improvement suite with new tone, clarity, and summarization actions that users can invoke and customize.

## ADDED Requirements

### Requirement: Expanded Improvement Actions Suite
The extension SHALL provide additional text transformation options in the floating assistant toolbar, including `summarize` (extract key points/concise summary), `simplify` (plain, clear language), and `friendly` (warm, approachable tone), in addition to existing actions.

#### Scenario: User triggers Summarize action
- **WHEN** user selects a block of text and clicks the "Summarize" button
- **THEN** the system SHALL send the text to Gemini with the summarization prompt instruction and display bulleted or condensed key points

#### Scenario: User triggers Simplify action
- **WHEN** user selects complex or jargon-heavy text and clicks "Simplify"
- **THEN** the system SHALL return a plain, easy-to-read version of the text

#### Scenario: User triggers Friendly action
- **WHEN** user selects text and clicks "Friendly"
- **THEN** the system SHALL rewrite the text with a warm, polite, and constructive tone

### Requirement: Customization and Stats for New Actions
The extension SHALL allow users to customize prompt instructions for the new improvement actions in settings, and track usage counts in the popup analytics dashboard.

#### Scenario: User customizes prompt for Simplify
- **WHEN** user modifies the "Simplify" prompt in settings and saves
- **THEN** future invocations of "Simplify" SHALL use the customized prompt template

#### Scenario: Usage statistics track new actions
- **WHEN** user executes any new improvement action
- **THEN** the popup dashboard SHALL record and display the count in the action breakdown

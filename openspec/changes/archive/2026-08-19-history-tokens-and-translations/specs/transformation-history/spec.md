## Purpose

Maintains a searchable local history of user text inputs, generated outputs, token usage, models, and timestamps, accessible through a dedicated tab in the extension popup.

## ADDED Requirements

### Requirement: Record Transformation History
The extension SHALL automatically record every successful text transformation or translation in extension storage, capturing the original input text, generated output text, action name, model used, timestamp, token usage metrics, and target language (if applicable).

#### Scenario: Successful text transformation saves history entry
- **WHEN** a user triggers any text transformation action (e.g. Rewrite, Professional, Translate) and receives a successful AI response
- **THEN** the extension SHALL prepend a new history record containing unique id, timestamp, action type, input text, output text, model name, and token usage to `history` storage

#### Scenario: History storage capacity limit
- **WHEN** saving a new history record causes the history list to exceed the maximum capacity limit of 100 items
- **THEN** the oldest history items SHALL be automatically pruned so total stored entries do not exceed 100

### Requirement: History Popup View and Management
The popup interface SHALL provide a dedicated "History" tab alongside the main dashboard, allowing users to view, search, copy, delete individual entries, and clear all history.

#### Scenario: Switching between Dashboard and History tabs
- **WHEN** user clicks on the "History" tab in the popup
- **THEN** the popup SHALL display the history panel showing recent transformations in reverse chronological order without closing the popup

#### Scenario: Copying input or output text from history
- **WHEN** user clicks the "Copy Input" or "Copy Output" button on any history item
- **THEN** the respective text SHALL be copied to the clipboard and visual confirmation SHALL be displayed

#### Scenario: Deleting a single history record
- **WHEN** user clicks the delete button on a specific history item
- **THEN** that item SHALL be removed from storage and the history view SHALL update immediately

#### Scenario: Clearing all history
- **WHEN** user clicks "Clear History" and confirms the action
- **THEN** all history entries SHALL be deleted from storage and an empty state message SHALL be shown

#### Scenario: Filtering history by search term
- **WHEN** user enters text into the history search filter
- **THEN** only history items whose input, output, or action name match the search query SHALL be displayed in the list

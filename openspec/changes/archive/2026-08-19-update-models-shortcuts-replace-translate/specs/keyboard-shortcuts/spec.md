## Purpose

Enables customizable multi-key keyboard shortcuts (such as Ctrl+Key, Alt+Key, or Shift combinations) to trigger the writing assistant.

## ADDED Requirements

### Requirement: Modifier and Key Combination Recording
The settings interface SHALL allow users to record multi-key shortcuts containing one or more modifiers (`Ctrl`, `Alt`, `Shift`, `Meta`) along with a trigger key, without prematurely terminating recording when a modifier key is pressed.

#### Scenario: User presses modifier followed by key
- **WHEN** user focuses the shortcut recording input and presses `Ctrl` followed by `K`
- **THEN** the shortcut field SHALL record and display `Ctrl+K` and save it to extension settings

#### Scenario: User clears recorded shortcut
- **WHEN** user focuses the shortcut recording input and presses `Escape` or `Backspace`
- **THEN** the recorded shortcut SHALL be cleared and the empty shortcut state saved

### Requirement: Global Page Shortcut Dispatch
The content script SHALL detect when the configured multi-key shortcut is pressed while text is selected on the page, and open the writing assistant action card.

#### Scenario: User triggers shortcut on selected text
- **WHEN** user selects text on a web page and presses the configured shortcut combo (e.g. `Ctrl+K`)
- **THEN** the assistant action card SHALL immediately open at the selection position and prevent browser default action

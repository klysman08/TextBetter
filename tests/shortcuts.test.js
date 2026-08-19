import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Keyboard Shortcuts Engine Suite", () => {
  function recordShortcut(e) {
    const isModifierOnly = ["Control", "Alt", "Shift", "Meta"].includes(e.key);
    const parts = [];

    if (e.ctrlKey) parts.push("Ctrl");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");
    if (e.metaKey) parts.push("Meta");

    if (isModifierOnly) {
      return {
        isComplete: false,
        display: parts.length > 0 ? parts.join("+") + "+..." : "Press hotkey..."
      };
    }

    if (e.key && !["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
      let keyName = e.key;
      if (keyName === " ") keyName = "Space";
      else if (keyName.length === 1) keyName = keyName.toUpperCase();
      parts.push(keyName);
    }

    if (parts.length > 0) {
      return {
        isComplete: true,
        combo: parts.join("+")
      };
    }

    return { isComplete: false, combo: "" };
  }

  function matchesShortcut(event, configuredHotkey) {
    if (!configuredHotkey) return false;
    const parts = [];
    if (event.ctrlKey) parts.push("Ctrl");
    if (event.altKey) parts.push("Alt");
    if (event.shiftKey) parts.push("Shift");
    if (event.metaKey) parts.push("Meta");

    if (event.key && !["Control", "Alt", "Shift", "Meta"].includes(event.key)) {
      let keyName = event.key;
      if (keyName === " ") keyName = "Space";
      else if (keyName.length === 1) keyName = keyName.toUpperCase();
      parts.push(keyName);
    }

    const pressed = parts.join("+");
    return pressed.toLowerCase() === configuredHotkey.toLowerCase();
  }

  test("should not commit combination when only Ctrl is pressed", () => {
    const event = { key: "Control", ctrlKey: true, altKey: false, shiftKey: false, metaKey: false };
    const result = recordShortcut(event);
    assert.equal(result.isComplete, false);
    assert.equal(result.display, "Ctrl+...");
  });

  test("should not commit combination when Ctrl+Shift modifiers are pressed", () => {
    const event = { key: "Shift", ctrlKey: true, altKey: false, shiftKey: true, metaKey: false };
    const result = recordShortcut(event);
    assert.equal(result.isComplete, false);
    assert.equal(result.display, "Ctrl+Shift+...");
  });

  test("should commit combination when Ctrl+K is pressed", () => {
    const event = { key: "k", ctrlKey: true, altKey: false, shiftKey: false, metaKey: false };
    const result = recordShortcut(event);
    assert.equal(result.isComplete, true);
    assert.equal(result.combo, "Ctrl+K");
  });

  test("should commit combination when Ctrl+Shift+E is pressed", () => {
    const event = { key: "e", ctrlKey: true, altKey: false, shiftKey: true, metaKey: false };
    const result = recordShortcut(event);
    assert.equal(result.isComplete, true);
    assert.equal(result.combo, "Ctrl+Shift+E");
  });

  test("should commit combination when Alt+Space is pressed", () => {
    const event = { key: " ", ctrlKey: false, altKey: true, shiftKey: false, metaKey: false };
    const result = recordShortcut(event);
    assert.equal(result.isComplete, true);
    assert.equal(result.combo, "Alt+Space");
  });

  test("should match shortcut accurately case-insensitively", () => {
    const event1 = { key: "k", ctrlKey: true, altKey: false, shiftKey: false, metaKey: false };
    assert.ok(matchesShortcut(event1, "Ctrl+K"));
    assert.ok(matchesShortcut(event1, "ctrl+k"));

    const event2 = { key: "K", ctrlKey: true, altKey: false, shiftKey: false, metaKey: false };
    assert.ok(matchesShortcut(event2, "Ctrl+K"));

    const eventMismatch = { key: "j", ctrlKey: true, altKey: false, shiftKey: false, metaKey: false };
    assert.equal(matchesShortcut(eventMismatch, "Ctrl+K"), false);
  });
});

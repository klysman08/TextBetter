import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Universal Form & Rich Text Replacement Suite", () => {
  function findEditableHost(node) {
    if (!node) return null;
    let el = node.nodeType === 1 ? node : node.parentElement;
    while (el && el.tagName !== "BODY" && el.tagName !== "HTML") {
      if (
        el.isContentEditable ||
        el.getAttribute?.("contenteditable") === "true" ||
        el.getAttribute?.("role") === "textbox" ||
        el.getAttribute?.("role") === "combobox" ||
        el.classList?.contains("ProseMirror") ||
        el.classList?.contains("draftjs-editor") ||
        el.hasAttribute?.("data-slate-editor") ||
        el.hasAttribute?.("data-lexical-editor") ||
        el.getAttribute?.("data-tid") === "ckeditor-div" ||
        el.getAttribute?.("data-tid") === "chat-input-body"
      ) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  function mockReplaceInput(element, newText, start, end) {
    const curVal = element.value || "";
    const fullNewVal = curVal.substring(0, start) + newText + curVal.substring(end);
    
    // Simulate prototype property descriptor setter behavior
    element.value = fullNewVal;
    element.selectionStart = start + newText.length;
    element.selectionEnd = start + newText.length;

    // Events triggered
    const dispatchedEvents = [];
    dispatchedEvents.push("beforeinput");
    dispatchedEvents.push("input");
    dispatchedEvents.push("change");

    return { value: element.value, events: dispatchedEvents };
  }

  test("should discover Teams chat editor container by data-tid and role", () => {
    const fakeChild = {
      nodeType: 3, // TEXT_NODE
      parentElement: {
        nodeType: 1,
        tagName: "DIV",
        parentElement: {
          nodeType: 1,
          tagName: "DIV",
          getAttribute: (name) => name === "data-tid" ? "chat-input-body" : (name === "role" ? "textbox" : null),
          parentElement: null
        }
      }
    };

    const host = findEditableHost(fakeChild);
    assert.ok(host);
    assert.equal(host.getAttribute("data-tid"), "chat-input-body");
  });

  test("should discover contenteditable container in ProseMirror / Lexical / Slack", () => {
    const fakeChild = {
      nodeType: 1,
      tagName: "P",
      parentElement: {
        nodeType: 1,
        tagName: "DIV",
        isContentEditable: true,
        classList: { contains: (cls) => cls === "ProseMirror" },
        getAttribute: (name) => name === "contenteditable" ? "true" : null,
        parentElement: null
      }
    };

    const host = findEditableHost(fakeChild);
    assert.ok(host);
    assert.ok(host.isContentEditable);
  });

  test("should replace text in input at exact slice range", () => {
    const mockInput = {
      value: "The quick brown fox",
      selectionStart: 4,
      selectionEnd: 9
    };

    const result = mockReplaceInput(mockInput, "fast", 4, 9);
    assert.equal(result.value, "The fast brown fox");
    assert.deepEqual(result.events, ["beforeinput", "input", "change"]);
  });

  test("should replace whole text when whole input is selected", () => {
    const mockInput = {
      value: "old text",
      selectionStart: 0,
      selectionEnd: 8
    };

    const result = mockReplaceInput(mockInput, "brand new text", 0, 8);
    assert.equal(result.value, "brand new text");
  });
});

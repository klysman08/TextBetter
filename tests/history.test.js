import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Transformation History Suite", () => {
  const MAX_HISTORY_ITEMS = 100;

  function createMockRecord({
    actionType = "rewrite",
    actionLabel = "Rewrite",
    inputText = "Test input",
    outputText = "Test output",
    model = "gemini-3.7-flash",
    targetLanguage = null,
    usageMetadata = null
  } = {}) {
    const promptTokens = (typeof usageMetadata?.promptTokenCount === "number" && !isNaN(usageMetadata.promptTokenCount))
      ? usageMetadata.promptTokenCount
      : Math.ceil(inputText.length / 4);
    const candidateTokens = (typeof usageMetadata?.candidatesTokenCount === "number" && !isNaN(usageMetadata.candidatesTokenCount))
      ? usageMetadata.candidatesTokenCount
      : Math.ceil(outputText.length / 4);
    const totalTokens = (typeof usageMetadata?.totalTokenCount === "number" && !isNaN(usageMetadata.totalTokenCount))
      ? usageMetadata.totalTokenCount
      : (promptTokens + candidateTokens);

    return {
      id: "tb_hist_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
      action: actionType,
      actionLabel,
      inputText,
      outputText,
      model,
      targetLanguage,
      tokens: {
        input: promptTokens,
        output: candidateTokens,
        total: totalTokens
      }
    };
  }

  function appendRecord(historyList, record) {
    const updated = [record, ...historyList];
    if (updated.length > MAX_HISTORY_ITEMS) {
      return updated.slice(0, MAX_HISTORY_ITEMS);
    }
    return updated;
  }

  test("should create structured history entry with tokens and timestamps", () => {
    const record = createMockRecord({
      actionType: "translate",
      actionLabel: "Translate",
      inputText: "Olá mundo",
      outputText: "Hello world",
      model: "gemini-3.7-flash",
      targetLanguage: "English (GB)",
      usageMetadata: { promptTokenCount: 15, candidatesTokenCount: 10, totalTokenCount: 25 }
    });

    assert.ok(record.id.startsWith("tb_hist_"));
    assert.ok(typeof record.timestamp === "number");
    assert.equal(record.action, "translate");
    assert.equal(record.targetLanguage, "English (GB)");
    assert.equal(record.inputText, "Olá mundo");
    assert.equal(record.outputText, "Hello world");
    assert.equal(record.tokens.input, 15);
    assert.equal(record.tokens.output, 10);
    assert.equal(record.tokens.total, 25);
  });

  test("should enforce 100-item FIFO cap when prepending records", () => {
    let history = [];
    for (let i = 1; i <= 120; i++) {
      const record = createMockRecord({
        inputText: `Input ${i}`,
        outputText: `Output ${i}`
      });
      history = appendRecord(history, record);
    }

    assert.equal(history.length, 100);
    // Newest should be at index 0 (Input 120)
    assert.equal(history[0].inputText, "Input 120");
    // Oldest preserved should be Input 21
    assert.equal(history[99].inputText, "Input 21");
  });

  test("should delete single item by id", () => {
    const r1 = createMockRecord({ inputText: "Item 1" });
    const r2 = createMockRecord({ inputText: "Item 2" });
    const r3 = createMockRecord({ inputText: "Item 3" });

    let history = [r1, r2, r3];
    history = history.filter(item => item.id !== r2.id);

    assert.equal(history.length, 2);
    assert.ok(!history.some(item => item.id === r2.id));
    assert.equal(history[0].id, r1.id);
    assert.equal(history[1].id, r3.id);
  });

  test("should filter history by query across input, output, and action labels", () => {
    const list = [
      createMockRecord({ actionLabel: "Rewrite", inputText: "Weekly status meeting", outputText: "Agenda for weekly meeting" }),
      createMockRecord({ actionLabel: "Translate", targetLanguage: "Portuguese (BR)", inputText: "Great job!", outputText: "Ótimo trabalho!" }),
      createMockRecord({ actionLabel: "Make it Professional", inputText: "asap please", outputText: "At your earliest convenience" })
    ];

    function filterHistory(items, query) {
      const q = query.toLowerCase();
      return items.filter(item =>
        (item.inputText && item.inputText.toLowerCase().includes(q)) ||
        (item.outputText && item.outputText.toLowerCase().includes(q)) ||
        (item.actionLabel && item.actionLabel.toLowerCase().includes(q)) ||
        (item.targetLanguage && item.targetLanguage.toLowerCase().includes(q))
      );
    }

    const resMeeting = filterHistory(list, "meeting");
    assert.equal(resMeeting.length, 1);
    assert.equal(resMeeting[0].actionLabel, "Rewrite");

    const resPort = filterHistory(list, "Portuguese");
    assert.equal(resPort.length, 1);
    assert.equal(resPort[0].targetLanguage, "Portuguese (BR)");

    const resEarly = filterHistory(list, "earliest");
    assert.equal(resEarly.length, 1);
    assert.equal(resEarly[0].actionLabel, "Make it Professional");

    const resEmpty = filterHistory(list, "nonexistent term");
    assert.equal(resEmpty.length, 0);
  });
});

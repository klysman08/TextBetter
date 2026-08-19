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

  test("should paginate history records accurately with page boundaries", () => {
    const PAGE_SIZE = 5;
    const items = [];
    for (let i = 1; i <= 14; i++) {
      items.push(createMockRecord({ inputText: `Input ${i}` }));
    }

    function paginate(list, page, pageSize = PAGE_SIZE) {
      const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
      const safePage = Math.max(1, Math.min(page, totalPages));
      const start = (safePage - 1) * pageSize;
      return {
        items: list.slice(start, start + pageSize),
        page: safePage,
        totalPages,
        hasPrev: safePage > 1,
        hasNext: safePage < totalPages
      };
    }

    // Page 1
    const p1 = paginate(items, 1);
    assert.equal(p1.page, 1);
    assert.equal(p1.totalPages, 3);
    assert.equal(p1.items.length, 5);
    assert.equal(p1.items[0].inputText, "Input 1");
    assert.equal(p1.items[4].inputText, "Input 5");
    assert.equal(p1.hasPrev, false);
    assert.equal(p1.hasNext, true);

    // Page 2
    const p2 = paginate(items, 2);
    assert.equal(p2.page, 2);
    assert.equal(p2.items.length, 5);
    assert.equal(p2.items[0].inputText, "Input 6");
    assert.equal(p2.hasPrev, true);
    assert.equal(p2.hasNext, true);

    // Page 3 (final page with remainder 4 items)
    const p3 = paginate(items, 3);
    assert.equal(p3.page, 3);
    assert.equal(p3.items.length, 4);
    assert.equal(p3.items[3].inputText, "Input 14");
    assert.equal(p3.hasPrev, true);
    assert.equal(p3.hasNext, false);

    // Clamping on out-of-bounds page numbers
    const pOverflow = paginate(items, 99);
    assert.equal(pOverflow.page, 3);

    const pUnderflow = paginate(items, -5);
    assert.equal(pUnderflow.page, 1);

    // Empty list pagination
    const pEmpty = paginate([], 1);
    assert.equal(pEmpty.items.length, 0);
    assert.equal(pEmpty.page, 1);
    assert.equal(pEmpty.totalPages, 1);
    assert.equal(pEmpty.hasPrev, false);
    assert.equal(pEmpty.hasNext, false);
  });

  test("should format history items into escaped CSV correctly", () => {
    function generateCsv(records) {
      const headers = [
        "ID",
        "Timestamp (ISO)",
        "Date",
        "Action",
        "Model",
        "Target Language",
        "Input Tokens",
        "Output Tokens",
        "Total Tokens",
        "Input Text",
        "Output Text"
      ];

      function escapeCsvCell(val) {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }

      const rows = records.map(item => {
        const d = item.timestamp ? new Date(item.timestamp) : new Date();
        const inTok = item.tokens?.input ?? 0;
        const outTok = item.tokens?.output ?? 0;
        const totalTok = item.tokens?.total ?? (inTok + outTok);

        return [
          escapeCsvCell(item.id || ""),
          escapeCsvCell(d.toISOString()),
          escapeCsvCell(d.toLocaleString()),
          escapeCsvCell(item.actionLabel || item.action || ""),
          escapeCsvCell(item.model || ""),
          escapeCsvCell(item.targetLanguage || ""),
          escapeCsvCell(inTok),
          escapeCsvCell(outTok),
          escapeCsvCell(totalTok),
          escapeCsvCell(item.inputText || ""),
          escapeCsvCell(item.outputText || "")
        ].join(",");
      });

      return [headers.join(","), ...rows].join("\r\n");
    }

    const testRecords = [
      createMockRecord({
        actionType: "professional",
        actionLabel: "Make it Professional",
        inputText: 'Hello "world", how are you?\nNew line here.',
        outputText: 'Dear recipient, I hope this finds you well.\nWith best regards.',
        model: "gemini-3.7-flash",
        targetLanguage: null,
        usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 30, totalTokenCount: 50 }
      })
    ];

    const csv = generateCsv(testRecords);
    const lines = csv.split("\r\n");
    assert.equal(lines.length, 2);
    assert.ok(lines[0].startsWith("ID,Timestamp (ISO),Date,Action,Model"));
    // Verify escaping of quotes and preservation of commas and newlines
    assert.ok(lines[1].includes('"Hello ""world"", how are you?\nNew line here."'));
    assert.ok(lines[1].includes('"Make it Professional"'));
    assert.ok(lines[1].includes('"20","30","50"'));
  });
});

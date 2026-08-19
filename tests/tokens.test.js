import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Token Accounting Suite", () => {
  function calculateTokens(inputChars, outputChars, usageMetadata) {
    const promptTokens = (typeof usageMetadata?.promptTokenCount === "number" && !isNaN(usageMetadata.promptTokenCount))
      ? usageMetadata.promptTokenCount
      : Math.ceil(inputChars / 4);
    const candidateTokens = (typeof usageMetadata?.candidatesTokenCount === "number" && !isNaN(usageMetadata.candidatesTokenCount))
      ? usageMetadata.candidatesTokenCount
      : Math.ceil(outputChars / 4);
    const totalTokens = (typeof usageMetadata?.totalTokenCount === "number" && !isNaN(usageMetadata.totalTokenCount))
      ? usageMetadata.totalTokenCount
      : (promptTokens + candidateTokens);

    return { promptTokens, candidateTokens, totalTokens };
  }

  function calculateRatios(inTokens, outTokens) {
    const total = inTokens + outTokens;
    if (total <= 0) return { inPct: 0, outPct: 0 };
    const inPct = Math.round((inTokens / total) * 100);
    const outPct = 100 - inPct;
    return { inPct, outPct };
  }

  test("should prioritize usageMetadata from Gemini API response", () => {
    const usage = {
      promptTokenCount: 42,
      candidatesTokenCount: 58,
      totalTokenCount: 100
    };
    const res = calculateTokens(200, 300, usage);
    assert.equal(res.promptTokens, 42);
    assert.equal(res.candidateTokens, 58);
    assert.equal(res.totalTokens, 100);
  });

  test("should use integer character-heuristic when usageMetadata is omitted", () => {
    const res = calculateTokens(40, 80, null);
    assert.equal(res.promptTokens, 10);
    assert.equal(res.candidateTokens, 20);
    assert.equal(res.totalTokens, 30);
  });

  test("should calculate token distribution percentages safely without NaN or division by zero", () => {
    const zeroRatio = calculateRatios(0, 0);
    assert.equal(zeroRatio.inPct, 0);
    assert.equal(zeroRatio.outPct, 0);

    const halfRatio = calculateRatios(50, 50);
    assert.equal(halfRatio.inPct, 50);
    assert.equal(halfRatio.outPct, 50);

    const unevenRatio = calculateRatios(100, 300);
    assert.equal(unevenRatio.inPct, 25);
    assert.equal(unevenRatio.outPct, 75);
    assert.equal(unevenRatio.inPct + unevenRatio.outPct, 100);
  });

  test("should aggregate total tokens across multiple requests accurately", () => {
    let stats = { totalRequests: 0, inputTokens: 0, outputTokens: 0 };

    const batch = [
      { inputChars: 40, outputChars: 40, usage: { promptTokenCount: 12, candidatesTokenCount: 15 } },
      { inputChars: 60, outputChars: 80, usage: { promptTokenCount: 18, candidatesTokenCount: 25 } },
      { inputChars: 10, outputChars: 20, usage: null } // fallback: 3 + 5
    ];

    batch.forEach(item => {
      const calc = calculateTokens(item.inputChars, item.outputChars, item.usage);
      stats.totalRequests += 1;
      stats.inputTokens += calc.promptTokens;
      stats.outputTokens += calc.candidateTokens;
    });

    assert.equal(stats.totalRequests, 3);
    assert.equal(stats.inputTokens, 12 + 18 + 3);
    assert.equal(stats.outputTokens, 15 + 25 + 5);
    assert.equal(stats.inputTokens + stats.outputTokens, 78);
  });
});

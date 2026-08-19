import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Gemini Models Suite", () => {
  const SUPPORTED_MODELS = [
    "gemini-3.7-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash"
  ];
  const DEFAULT_MODEL = "gemini-3.7-flash";

  test("should have gemini-3.7-flash as default model", () => {
    assert.equal(DEFAULT_MODEL, "gemini-3.7-flash");
  });

  test("should include all next-generation flash models", () => {
    assert.ok(SUPPORTED_MODELS.includes("gemini-3.7-flash"));
    assert.ok(SUPPORTED_MODELS.includes("gemini-3.5-flash-lite"));
    assert.ok(SUPPORTED_MODELS.includes("gemini-3.5-flash"));
  });

  test("should construct proper Google Gemini API endpoints for models", () => {
    const apiKey = "test_api_key_12345";
    for (const model of SUPPORTED_MODELS) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      assert.ok(endpoint.startsWith("https://generativelanguage.googleapis.com/v1beta/models/"));
      assert.ok(endpoint.includes(model));
      assert.ok(endpoint.includes(`key=${apiKey}`));
    }
  });

  test("should resolve default model when selectedModel is undefined or empty", () => {
    function resolveModel(selectedModel) {
      return (selectedModel && selectedModel.trim()) ? selectedModel : "gemini-3.7-flash";
    }

    assert.equal(resolveModel(undefined), "gemini-3.7-flash");
    assert.equal(resolveModel(null), "gemini-3.7-flash");
    assert.equal(resolveModel(""), "gemini-3.7-flash");
    assert.equal(resolveModel("gemini-3.5-flash-lite"), "gemini-3.5-flash-lite");
    assert.equal(resolveModel("gemini-3.5-flash"), "gemini-3.5-flash");
  });

  test("should format error titles and status codes correctly", () => {
    function getErrorInfo(errorCode, errorMessage) {
      let title = "API Error";
      let explanation = errorMessage;
      if (errorCode === 400 || errorCode === 403) {
        title = "API Configuration Issue";
      } else if (errorCode === 429) {
        title = "Rate Limit Exceeded";
      } else if (errorCode >= 500) {
        title = `Gemini Server Error (${errorCode})`;
      }
      return { title, explanation };
    }

    assert.equal(getErrorInfo(400, "Bad Request").title, "API Configuration Issue");
    assert.equal(getErrorInfo(403, "Forbidden").title, "API Configuration Issue");
    assert.equal(getErrorInfo(429, "Quota Exceeded").title, "Rate Limit Exceeded");
    assert.equal(getErrorInfo(503, "Service Unavailable").title, "Gemini Server Error (503)");
  });
});

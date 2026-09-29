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

  test("should sanitize 'models/' prefix when constructing API endpoint", () => {
    const apiKey = "test_key_xyz";
    function buildEndpoint(rawModel, key) {
      const cleanModel = (rawModel || "gemini-3.7-flash").replace(/^models\//, "");
      return `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${key}`;
    }

    assert.equal(
      buildEndpoint("models/gemini-3.7-flash", apiKey),
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=test_key_xyz"
    );
    assert.equal(
      buildEndpoint("gemini-3.7-flash", apiKey),
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=test_key_xyz"
    );
  });

  test("should strictly filter for text models with Gemini version >= 3", () => {
    const sampleApiResponse = [
      {
        name: "models/gemini-3.7-flash",
        displayName: "Gemini 3.7 Flash",
        description: "Reasoning and fast flash model",
        supportedGenerationMethods: ["generateContent", "countTokens"]
      },
      {
        name: "models/gemini-3.5-flash-lite",
        displayName: "Gemini 3.5 Flash-Lite",
        description: "Ultra-fast text model",
        supportedGenerationMethods: ["generateContent"]
      },
      {
        name: "models/gemini-3.5-flash",
        displayName: "Gemini 3.5 Flash",
        description: "Balanced next-gen model",
        supportedGenerationMethods: ["generateContent"]
      },
      {
        name: "models/nano-banana-3",
        displayName: "Nano Banana 3",
        description: "Image generation and editing model",
        supportedGenerationMethods: ["generateContent"]
      },
      {
        name: "models/gemini-3-banana",
        displayName: "Gemini 3 Banana",
        description: "Banana multimodal model",
        supportedGenerationMethods: ["generateContent"]
      },
      {
        name: "models/gemini-2.5-flash",
        displayName: "Gemini 2.5 Flash",
        description: "Version 2.5 model (must be filtered out)",
        supportedGenerationMethods: ["generateContent"]
      },
      {
        name: "models/gemini-2.0-flash",
        displayName: "Gemini 2.0 Flash",
        description: "Version 2.0 model (must be filtered out)",
        supportedGenerationMethods: ["generateContent"]
      },
      {
        name: "models/gemini-1.5-flash",
        displayName: "Gemini 1.5 Flash",
        description: "Version 1.5 model (must be filtered out)",
        supportedGenerationMethods: ["generateContent"]
      },
      {
        name: "models/gemini-3.8-flash-tts",
        displayName: "Gemini 3.8 Flash TTS",
        description: "Text-to-speech audio generation model",
        supportedGenerationMethods: ["generateContent"]
      },
      {
        name: "models/gemini-3.8-flash-lite-tts",
        displayName: "Gemini 3.8 Flash-Lite TTS",
        description: "Low-latency text-to-speech model",
        supportedGenerationMethods: ["generateContent"]
      },
      {
        name: "models/text-embedding-004",
        displayName: "Text Embedding 004",
        supportedGenerationMethods: ["embedContent"]
      },
      {
        name: "models/imagen-3.0-generate-002",
        displayName: "Imagen 3.0",
        supportedGenerationMethods: ["generateContent"]
      },
      {
        name: "models/gemini-live-audio",
        displayName: "Gemini Live Audio",
        supportedGenerationMethods: ["generateContent"]
      },
      {
        name: "models/aqa",
        displayName: "Attributed QA",
        supportedGenerationMethods: ["generateAnswer"]
      }
    ];

    function parseModels(rawModels) {
      const filtered = rawModels.filter(m => {
        const supportsGenerate = Array.isArray(m.supportedGenerationMethods) &&
          m.supportedGenerationMethods.includes("generateContent");
        if (!supportsGenerate) return false;

        const combined = `${m.name || ""} ${m.displayName || ""} ${m.description || ""}`.toLowerCase();

        // Exclude non-text, TTS, speech, image generation, audio, or banana models
        const excludedKeywords = [
          "tts",
          "speech",
          "text-to-speech",
          "audio",
          "voice",
          "sound",
          "banana",
          "image",
          "imagen",
          "video",
          "live",
          "realtime",
          "embedding",
          "aqa",
          "diffusion",
          "robotics"
        ];
        if (excludedKeywords.some(keyword => combined.includes(keyword))) {
          return false;
        }

        if (!combined.includes("gemini")) return false;

        const versionMatch = combined.match(/gemini[/-]?(\d+(?:\.\d+)?)/i);
        if (!versionMatch) return false;

        const versionNum = parseFloat(versionMatch[1]);
        return !isNaN(versionNum) && versionNum >= 3.0;
      });

      const formatted = filtered.map(m => ({
        id: m.name.replace(/^models\//, ""),
        name: m.displayName || m.name.replace(/^models\//, ""),
        description: m.description || ""
      }));

      formatted.sort((a, b) => {
        const aIsFlash = a.id.includes("flash") ? 1 : 0;
        const bIsFlash = b.id.includes("flash") ? 1 : 0;
        if (aIsFlash !== bIsFlash) return bIsFlash - aIsFlash;
        return b.id.localeCompare(a.id, undefined, { numeric: true, sensitivity: "base" });
      });

      return formatted;
    }

    const parsed = parseModels(sampleApiResponse);
    assert.equal(parsed.length, 3);
    // All returned models must be version >= 3
    assert.deepEqual(
      parsed.map(m => m.id),
      ["gemini-3.7-flash", "gemini-3.5-flash-lite", "gemini-3.5-flash"]
    );
    // Verify TTS and audio models are strictly excluded
    assert.ok(!parsed.some(m => m.id.includes("tts")));
    assert.ok(!parsed.some(m => m.name.toLowerCase().includes("tts")));
    assert.ok(!parsed.some(m => m.description.toLowerCase().includes("speech")));
    // Verify Nano Banana models are strictly excluded
    assert.ok(!parsed.some(m => m.id.includes("banana")));
    assert.ok(!parsed.some(m => m.name.toLowerCase().includes("banana")));
    // Verify versions < 3 are strictly excluded
    assert.ok(!parsed.some(m => m.id.includes("2.5")));
    assert.ok(!parsed.some(m => m.id.includes("2.0")));
    assert.ok(!parsed.some(m => m.id.includes("1.5")));
    // Verify non-text models are excluded
    assert.ok(!parsed.some(m => m.id.includes("embedding")));
    assert.ok(!parsed.some(m => m.id.includes("imagen")));
    assert.ok(!parsed.some(m => m.id.includes("audio")));
    assert.ok(!parsed.some(m => m.id.includes("aqa")));
  });

  test("should reject nano-banana, TTS, and ineligible models from dropdown preservation", () => {
    function isEligibleTextModel(id = "", displayName = "", description = "") {
      const combined = `${id} ${displayName} ${description}`.toLowerCase();
      const excludedKeywords = [
        "tts", "speech", "text-to-speech", "audio", "voice", "sound",
        "banana", "image", "imagen", "video",
        "live", "realtime", "embedding", "aqa", "diffusion", "robotics"
      ];
      if (excludedKeywords.some(keyword => combined.includes(keyword))) return false;
      if (!combined.includes("gemini")) return false;
      const versionMatch = combined.match(/gemini[/-]?(\d+(?:\.\d+)?)/i);
      if (!versionMatch) return false;
      const versionNum = parseFloat(versionMatch[1]);
      return !isNaN(versionNum) && versionNum >= 3.0;
    }

    function resolveSelectedDropdownModel(availableModels, currentSelected) {
      const defaultFallback = availableModels[0]?.id || "gemini-3.7-flash";
      if (!currentSelected || !isEligibleTextModel(currentSelected)) {
        return defaultFallback;
      }
      return currentSelected;
    }

    const available = [{ id: "gemini-3.7-flash", name: "Gemini 3.7 Flash" }];

    // Nano banana and TTS must be rejected and reset to fallback
    assert.equal(resolveSelectedDropdownModel(available, "nano-banana"), "gemini-3.7-flash");
    assert.equal(resolveSelectedDropdownModel(available, "gemini-3-nano-banana"), "gemini-3.7-flash");
    assert.equal(resolveSelectedDropdownModel(available, "gemini-3.8-flash-tts"), "gemini-3.7-flash");
    assert.equal(resolveSelectedDropdownModel(available, "gemini-3.8-flash-lite-tts"), "gemini-3.7-flash");
    assert.equal(resolveSelectedDropdownModel(available, "gemini-2.5-flash"), "gemini-3.7-flash");

    // Eligible custom text model >= 3 is allowed
    assert.equal(resolveSelectedDropdownModel(available, "gemini-3.0-tuned-text"), "gemini-3.0-tuned-text");
  });
});

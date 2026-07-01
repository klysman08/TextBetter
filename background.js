// background.js - TextBetter Service Worker

// Listen for messages from content scripts or popup/options pages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateText") {
    handleGenerateText(request)
      .then(result => sendResponse({ success: true, text: result }))
      .catch(error => {
        sendResponse({ 
          success: false, 
          error: error.message,
          status: error.status || null
        });
      });
    return true; // Keep message channel open for asynchronous sendResponse
  } else if (request.action === "openOptionsPage") {
    chrome.runtime.openOptionsPage();
    sendResponse({ success: true });
    return;
  }
});

/**
 * Handle API requests to Google Gemini API
 */
async function handleGenerateText(request) {
  const { prompt, systemInstruction } = request;

  // Retrieve API settings from storage
  const settings = await chrome.storage.local.get(["apiKey", "selectedModel"]);
  const apiKey = settings.apiKey;
  // Default to gemini-3.5-flash
  const model = settings.selectedModel || "gemini-3.5-flash";

  if (!apiKey) {
    throw new Error("API Key is missing. Please configure your API key in the extension settings.");
  }

  // Gemini API generation endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `<input_text>\n${prompt}\n</input_text>`
          }
        ]
      }
    ]
  };

  // Add system instruction if provided
  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [
        {
          text: systemInstruction
        }
      ]
    };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP error! status: ${response.status}`;
      const err = new Error(errorMessage);
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    
    // Extract generated text from candidate response
    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text
    ) {
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Update usage metrics asynchronously
      updateUsageStats(request.actionType, prompt.length, generatedText, data.usageMetadata);

      return generatedText;
    } else {
      throw new Error("Invalid response format received from Gemini API.");
    }
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
}

/**
 * Update usage statistics in local storage
 */
async function updateUsageStats(actionType, inputChars, outputText, usageMetadata) {
  try {
    const result = await chrome.storage.local.get("stats");
    let stats = result.stats;

    // Initialize stats if not present
    if (!stats) {
      stats = {
        totalRequests: 0,
        inputTokens: 0,
        outputTokens: 0,
        actionCounts: {
          rewrite: 0,
          review: 0,
          professional: 0,
          appealing: 0,
          emojis: 0,
          detail: 0,
          shorten: 0
        }
      };
    }

    // Default calculations if usageMetadata is missing
    const promptTokens = usageMetadata?.promptTokenCount || Math.ceil(inputChars / 4);
    const candidateTokens = usageMetadata?.candidatesTokenCount || Math.ceil(outputText.length / 4);

    // Increment values safely
    stats.totalRequests = (stats.totalRequests || 0) + 1;
    stats.inputTokens = (stats.inputTokens || 0) + promptTokens;
    stats.outputTokens = (stats.outputTokens || 0) + candidateTokens;

    if (actionType) {
      if (!stats.actionCounts) stats.actionCounts = {};
      stats.actionCounts[actionType] = (stats.actionCounts[actionType] || 0) + 1;
    }

    await chrome.storage.local.set({ stats });
  } catch (err) {
    console.error("Error writing usage stats:", err);
  }
}

// background.js - TextBetter Service Worker

// Listen for messages from content scripts or popup/options pages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateText") {
    handleGenerateText(request)
      .then(result => sendResponse({ success: true, text: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for asynchronous sendResponse
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
  // Default to gemini-3.1-flash-lite as requested by user
  const model = settings.selectedModel || "gemini-3.1-flash-lite";

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
      throw new Error(errorMessage);
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
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Invalid response format received from Gemini API.");
    }
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
}

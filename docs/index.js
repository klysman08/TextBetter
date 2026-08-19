/* index.js - TextBetter Landing Page Script & Interactive Sandbox Controller (v2.0.0) */

document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================
  // 1. STATE & USER PREFERENCES
  // ==========================================
  
  let isMuted = localStorage.getItem("textbetter_muted") === "true";
  let activeTheme = localStorage.getItem("textbetter_theme") || "light";
  let simulatedHistoryCount = 12;
  
  const htmlElement = document.documentElement;
  const themeToggleBtn = document.getElementById("theme-toggle");
  const soundToggleBtn = document.getElementById("sound-toggle");
  const historyBadgeCount = document.getElementById("sim-history-count");
  
  // Synchronize initial theme
  if (activeTheme === "dark" || (activeTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    htmlElement.classList.add("dark");
    updateThemeIcon(true);
  } else {
    htmlElement.classList.remove("dark");
    updateThemeIcon(false);
  }
  
  // Synchronize initial sound settings
  updateSoundIcon(isMuted);

  // ==========================================
  // 2. WEB AUDIO API SYNTHESIS ENGINE
  // ==========================================
  
  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  /**
   * Generates clean, short, synthetic UI sound effects.
   * Self-contained and prevents CORS issues on GitHub Pages.
   */
  function playSound(type) {
    if (isMuted) return;
    
    try {
      initAudioContext();
      const now = audioCtx.currentTime;
      
      switch (type) {
        case "click": {
          // A very short, high-passed organic click
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
          
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }
        
        case "success": {
          // Double ascending beep (C5 -> E5)
          const osc1 = audioCtx.createOscillator();
          const osc2 = audioCtx.createOscillator();
          const gain1 = audioCtx.createGain();
          const gain2 = audioCtx.createGain();
          
          // First note
          osc1.type = "triangle";
          osc1.frequency.setValueAtTime(523.25, now); // C5
          gain1.gain.setValueAtTime(0.02, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc1.connect(gain1);
          gain1.connect(audioCtx.destination);
          osc1.start(now);
          osc1.stop(now + 0.09);
          
          // Second note (ascending)
          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(659.25, now + 0.07); // E5
          gain2.gain.setValueAtTime(0.02, now + 0.07);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.start(now + 0.07);
          osc2.stop(now + 0.23);
          break;
        }
        
        case "toggle-on": {
          // Quick pitch sweep up
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
          
          gain.gain.setValueAtTime(0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.start(now);
          osc.stop(now + 0.11);
          break;
        }
        
        case "toggle-off": {
          // Quick pitch sweep down
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);
          
          gain.gain.setValueAtTime(0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.start(now);
          osc.stop(now + 0.11);
          break;
        }
        
        case "typing": {
          // Very soft mechanical keyboard tick
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(1400, now);
          osc.frequency.exponentialRampToValueAtTime(200, now + 0.015);
          
          gain.gain.setValueAtTime(0.008, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.start(now);
          osc.stop(now + 0.02);
          break;
        }
      }
    } catch {
      // Ignore audio synthesis errors on autoplay restrictions
    }
  }

  // ==========================================
  // 3. UI CONTROLS & HEADER LISTENERS
  // ==========================================

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isDark = htmlElement.classList.toggle("dark");
      localStorage.setItem("textbetter_theme", isDark ? "dark" : "light");
      updateThemeIcon(isDark);
      playSound(isDark ? "toggle-on" : "toggle-off");
    });
  }

  function updateThemeIcon(isDark) {
    if (!themeToggleBtn) return;
    const sunIcon = themeToggleBtn.querySelector(".sun-icon");
    const moonIcon = themeToggleBtn.querySelector(".moon-icon");
    
    if (isDark) {
      if (sunIcon) sunIcon.classList.add("hidden");
      if (moonIcon) moonIcon.classList.remove("hidden");
    } else {
      if (sunIcon) sunIcon.classList.remove("hidden");
      if (moonIcon) moonIcon.classList.add("hidden");
    }
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener("click", () => {
      isMuted = !isMuted;
      localStorage.setItem("textbetter_muted", isMuted ? "true" : "false");
      updateSoundIcon(isMuted);
      if (!isMuted) {
        playSound("toggle-on");
      }
    });
  }

  function updateSoundIcon(muted) {
    if (!soundToggleBtn) return;
    const soundOn = soundToggleBtn.querySelector(".sound-on-icon");
    const soundOff = soundToggleBtn.querySelector(".sound-off-icon");
    
    if (muted) {
      if (soundOn) soundOn.classList.add("hidden");
      if (soundOff) soundOff.classList.remove("hidden");
    } else {
      if (soundOn) soundOn.classList.remove("hidden");
      if (soundOff) soundOff.classList.add("hidden");
    }
  }

  // ==========================================
  // 4. INTERACTIVE SIMULATOR / EXTENSION SANDBOX
  // ==========================================

  const editorInput = document.getElementById("editor-input");
  const floatingBar = document.getElementById("sim-floating-bar");
  const outputCard = document.getElementById("sim-output-card");
  const outputSpinner = document.getElementById("output-spinner");
  const outputBadgeText = document.getElementById("output-badge-text");
  const outputText = document.getElementById("sim-output-text");
  const instructionOverlay = document.querySelector(".sim-instruction-overlay");
  const chips = document.querySelectorAll(".sim-chip");
  const actionButtons = document.querySelectorAll(".action-btn");
  
  if (editorInput) {
    const btnCopy = document.getElementById("btn-copy-sim");
    const btnReplace = document.getElementById("btn-replace-sim");
    const btnClose = document.getElementById("btn-close-sim");
    
    let currentSelection = { start: 0, end: 0, text: "" };
    let typingTimer = null;

    // Initial prompt text
    const initialText = "this product helps you improve grammar, rewrite tones, translate across languages, and save transformation history directly.";
    editorInput.value = initialText;

    // Floating menu responses database for v2.0 actions
    const simulationResponses = {
      professional: {
        "i am writing to ask if you can look at my code changes maybe tonight. text me back.": 
          "I am writing to kindly request your review of the recent code changes at your earliest convenience this evening. Please let me know if you have any feedback.",
        "we made a chrome extension that does writing improvements. it is extremely fast and hooks directly into gemini api.": 
          "We have developed a high-performance Chrome extension designed to streamline writing improvements by integrating directly with the Gemini API.",
        "im super excited to let everyone know we finally shipped the brand new website redesign check it out!": 
          "I am pleased to announce that our newly redesigned website has officially launched. We invite you to explore the updates.",
        "this product helps you improve grammar, rewrite tones, translate across languages, and save transformation history directly.":
          "This solution empowers professionals to refine grammar, adjust communication tones, perform multilingual translations, and maintain a comprehensive audit log of transformation history."
      },
      translate: {
        "i am writing to ask if you can look at my code changes maybe tonight. text me back.": 
          "Estou escrevendo para pedir que você dê uma olhada nas minhas alterações de código hoje à noite, se possível. Me responda.",
        "we made a chrome extension that does writing improvements. it is extremely fast and hooks directly into gemini api.": 
          "Criamos uma extensão do Chrome para aprimoramento de escrita. Ela é extremamente rápida e se conecta diretamente à API do Gemini.",
        "im super excited to let everyone know we finally shipped the brand new website redesign check it out!": 
          "Estou super animado para compartilhar que finalmente lançamos o novo design do site! Dê uma olhada!",
        "this product helps you improve grammar, rewrite tones, translate across languages, and save transformation history directly.":
          "Este produto ajuda você a melhorar a gramática, reescrever tons, traduzir entre idiomas e salvar o histórico de transformações diretamente."
      },
      bullets: {
        "i am writing to ask if you can look at my code changes maybe tonight. text me back.": 
          "• Code review request for tonight\n• Please review recent changes\n• Awaiting your reply",
        "we made a chrome extension that does writing improvements. it is extremely fast and hooks directly into gemini api.": 
          "• High-performance Chrome extension\n• Instant writing improvements\n• Direct Google Gemini API connection",
        "im super excited to let everyone know we finally shipped the brand new website redesign check it out!": 
          "• Brand new website redesign shipped\n• Officially live today\n• Check out the updates",
        "this product helps you improve grammar, rewrite tones, translate across languages, and save transformation history directly.":
          "• Spotless grammar correction & style rewrites\n• Multilingual translation with regional dialects\n• Searchable transformation history & CSV export\n• Zero middleman servers with local sandbox storage"
      },
      emojis: {
        "i am writing to ask if you can look at my code changes maybe tonight. text me back.": 
          "Writing to see if you can review my code changes tonight! 💻📱 Let me know! 🚀",
        "we made a chrome extension that does writing improvements. it is extremely fast and hooks directly into gemini api.": 
          "We built a Chrome extension for writing improvements! 🚀 Super fast ⚡ and connects directly to the Gemini API! 🧠",
        "im super excited to let everyone know we finally shipped the brand new website redesign check it out!": 
          "Super excited to share that we officially shipped the brand new website redesign! 🎉 Check it out! 👀✨",
        "this product helps you improve grammar, rewrite tones, translate across languages, and save transformation history directly.":
          "Boost your writing, fix grammar, translate effortlessly & save your history! 🚀✨ Powered by Gemini! 🧠💡"
      },
      shorten: {
        "i am writing to ask if you can look at my code changes maybe tonight. text me back.": 
          "Could you review my code changes tonight? Let me know.",
        "we made a chrome extension that does writing improvements. it is extremely fast and hooks directly into gemini api.": 
          "We built a fast Chrome extension for writing improvements, powered directly by Gemini.",
        "im super excited to let everyone know we finally shipped the brand new website redesign check it out!": 
          "Excited to announce our new website redesign is live! Check it out.",
        "this product helps you improve grammar, rewrite tones, translate across languages, and save transformation history directly.":
          "Improve grammar, rewrite, translate, and track transformation history directly with Gemini."
      },
      review: {
        "i am writing to ask if you can look at my code changes maybe tonight. text me back.": 
          "I am writing to ask if you can look at my code changes tonight. Please text me back.",
        "we made a chrome extension that does writing improvements. it is extremely fast and hooks directly into gemini api.": 
          "We made a Chrome extension that improves writing. It is extremely fast and connects directly to the Gemini API.",
        "im super excited to let everyone know we finally shipped the brand new website redesign check it out!": 
          "I'm super excited to let everyone know we finally shipped the brand new website redesign! Check it out!",
        "this product helps you improve grammar, rewrite tones, translate across languages, and save transformation history directly.":
          "This product helps you improve grammar, rewrite tones, translate across languages, and save transformation history directly."
      }
    };

    // Helper to hide instruction overlay
    function hideInstructions() {
      if (instructionOverlay && !instructionOverlay.classList.contains("hidden")) {
        instructionOverlay.classList.add("hidden");
      }
    }

    // Position floating bar over the text selection area
    function positionFloatingBar() {
      if (floatingBar) {
        floatingBar.classList.remove("hidden");
      }
    }

    // Handle textarea text selections
    editorInput.addEventListener("mouseup", handleTextSelection);
    editorInput.addEventListener("keyup", handleTextSelection);

    function handleTextSelection() {
      const start = editorInput.selectionStart;
      const end = editorInput.selectionEnd;
      const selectedText = editorInput.value.substring(start, end).trim();

      if (selectedText.length > 0) {
        currentSelection = { start, end, text: selectedText };
        hideInstructions();
        if (outputCard) outputCard.classList.add("hidden");
        positionFloatingBar();
      } else {
        setTimeout(() => {
          if (floatingBar && document.activeElement !== editorInput && !floatingBar.contains(document.activeElement)) {
            floatingBar.classList.add("hidden");
          }
        }, 150);
      }
    }

    // Chips templates trigger selection
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        playSound("click");
        const text = chip.dataset.text;
        
        if (outputCard) outputCard.classList.add("hidden");
        if (floatingBar) floatingBar.classList.add("hidden");
        hideInstructions();
        
        editorInput.value = text;
        editorInput.focus();
        
        // Auto-select text after a tiny pause to draw emphasis
        setTimeout(() => {
          editorInput.setSelectionRange(0, text.length);
          currentSelection = { start: 0, end: text.length, text: text };
          positionFloatingBar();
          playSound("click");
        }, 150);
      });
    });

    // Action Buttons execution
    actionButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        playSound("click");
        
        const action = btn.dataset.action;
        if (floatingBar) floatingBar.classList.add("hidden");
        
        triggerSimulation(action);
      });
    });

    // Simulator typing engine
    function triggerSimulation(action) {
      if (outputCard) outputCard.classList.remove("hidden");
      if (outputSpinner) outputSpinner.classList.remove("hidden");
      if (outputBadgeText) outputBadgeText.textContent = "Gemini 3.7 Flash thinking...";
      if (outputText) {
        outputText.textContent = "Processing with Gemini...";
        outputText.classList.add("loading");
      }
      
      // Disable action buttons during typing
      if (btnCopy) {
        btnCopy.style.pointerEvents = "none";
        btnCopy.style.opacity = "0.5";
      }
      if (btnReplace) {
        btnReplace.style.pointerEvents = "none";
        btnReplace.style.opacity = "0.5";
      }

      // Simulate API delay
      setTimeout(() => {
        if (outputSpinner) outputSpinner.classList.add("hidden");
        if (outputBadgeText) {
          const actionLabels = {
            professional: "Gemini 3.7 • Professional",
            translate: "Gemini 3.7 • Translation (pt-BR)",
            review: "Gemini 3.7 • Corrected",
            bullets: "Gemini 3.7 • Bullet Points",
            emojis: "Gemini 3.7 • Expressive",
            shorten: "Gemini 3.7 • Shortened"
          };
          outputBadgeText.textContent = actionLabels[action] || "Gemini 3.7 Suggestion";
        }
        if (outputText) {
          outputText.classList.remove("loading");
          outputText.textContent = "";
        }
        
        // Get predefined response or fallback
        const inputText = currentSelection.text.toLowerCase();
        let responseText = "";
        
        if (simulationResponses[action] && simulationResponses[action][inputText]) {
          responseText = simulationResponses[action][inputText];
        } else {
          const cleanInput = currentSelection.text;
          if (action === "professional") {
            responseText = `With reference to your message: "${cleanInput}", I have polished the text for enhanced clarity, adopting a more formal tone suitable for standard business communication.`;
          } else if (action === "translate") {
            responseText = `Tradução: "${cleanInput}" adaptado para português com precisão de dialeto regional.`;
          } else if (action === "bullets") {
            responseText = `• ${cleanInput}\n• Key takeaway and action point\n• Verified by Gemini`;
          } else if (action === "emojis") {
            responseText = `✨ ${cleanInput} ✨ 🚀💻 Let's get this done! 🙌`;
          } else if (action === "shorten") {
            responseText = cleanInput.length > 30 ? cleanInput.substring(0, 30) + "..." : cleanInput;
          } else {
            responseText = `Corrected version: ${cleanInput}`;
          }
        }

        // Stream the response out character by character
        let charIndex = 0;
        if (typingTimer) clearInterval(typingTimer);
        
        typingTimer = setInterval(() => {
          if (charIndex < responseText.length) {
            if (outputText) outputText.textContent += responseText.charAt(charIndex);
            
            if (charIndex % 3 === 0) {
              playSound("typing");
            }
            charIndex++;
          } else {
            clearInterval(typingTimer);
            
            // Enable action buttons
            if (btnCopy) {
              btnCopy.style.pointerEvents = "auto";
              btnCopy.style.opacity = "1";
            }
            if (btnReplace) {
              btnReplace.style.pointerEvents = "auto";
              btnReplace.style.opacity = "1";
            }
            
            // Increment simulated history
            simulatedHistoryCount++;
            if (historyBadgeCount) {
              historyBadgeCount.textContent = `${simulatedHistoryCount} saved in history`;
            }
            
            playSound("success");
          }
        }, 18);

      }, 1000); // 1.0s delay mimicking fast Gemini 3.7 Flash API
    }

    // Close preview
    if (btnClose) {
      btnClose.addEventListener("click", () => {
        playSound("click");
        if (outputCard) outputCard.classList.add("hidden");
        if (typingTimer) clearInterval(typingTimer);
      });
    }

    // Copy text action
    if (btnCopy) {
      btnCopy.addEventListener("click", () => {
        const textToCopy = outputText ? outputText.textContent : "";
        navigator.clipboard.writeText(textToCopy).then(() => {
          playSound("success");
          const span = btnCopy.querySelector("span");
          if (span) {
            const originalText = span.textContent;
            span.textContent = "Copied!";
            setTimeout(() => {
              span.textContent = originalText;
            }, 1500);
          }
        });
      });
    }

    // Replace text action
    if (btnReplace) {
      btnReplace.addEventListener("click", () => {
        const textToInsert = outputText ? outputText.textContent : "";
        const fullText = editorInput.value;
        
        const newText = fullText.slice(0, currentSelection.start) + textToInsert + fullText.slice(currentSelection.end);
        editorInput.value = newText;
        
        playSound("success");
        if (outputCard) outputCard.classList.add("hidden");
        
        // Highlight the newly replaced text
        editorInput.focus();
        editorInput.setSelectionRange(currentSelection.start, currentSelection.start + textToInsert.length);
      });
    }
  }

  // ==========================================
  // 5. FAQ ACCORDION LOGIC
  // ==========================================
  
  const faqItems = document.querySelectorAll(".faq-item");
  
  faqItems.forEach(item => {
    const trigger = item.querySelector(".faq-trigger");
    const content = item.querySelector(".faq-content");
    
    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");
      
      // Close all other items first
      faqItems.forEach(otherItem => {
        otherItem.classList.remove("active");
        otherItem.querySelector(".faq-content").style.maxHeight = null;
        otherItem.querySelector(".faq-trigger").setAttribute("aria-expanded", "false");
      });
      
      playSound("click");

      if (!isOpen) {
        item.classList.add("active");
        content.style.maxHeight = content.scrollHeight + "px";
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

});

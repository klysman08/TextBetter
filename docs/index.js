/* index.js - TextBetter Landing Page Script & Interactive Sandbox Controller */

document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================
  // 1. STATE & USER PREFERENCES
  // ==========================================
  
  let isMuted = localStorage.getItem("textbetter_muted") === "true";
  let activeTheme = localStorage.getItem("textbetter_theme") || "light";
  
  const htmlElement = document.documentElement;
  const themeToggleBtn = document.getElementById("theme-toggle");
  const soundToggleBtn = document.getElementById("sound-toggle");
  
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
          osc.frequency.exponentialRampToValueAtTime(260, now + 0.1);
          
          gain.gain.setValueAtTime(0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.start(now);
          osc.stop(now + 0.11);
          break;
        }
        
        case "typing": {
          // Tiny, quiet tick at random frequency
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc.type = "sine";
          const randomFreq = 500 + Math.random() * 200;
          osc.frequency.setValueAtTime(randomFreq, now);
          
          gain.gain.setValueAtTime(0.006, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }
      }
    } catch (e) {
      console.warn("Audio Context blocked or unsupported:", e);
    }
  }

  // ==========================================
  // 3. THEME & SOUND CONTROLS LOGIC
  // ==========================================

  function updateThemeIcon(isDark) {
    const sunIcon = themeToggleBtn.querySelector(".sun-icon");
    const moonIcon = themeToggleBtn.querySelector(".moon-icon");
    if (isDark) {
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
    } else {
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    }
  }

  function updateSoundIcon(muted) {
    const soundOnIcon = soundToggleBtn.querySelector(".sound-on-icon");
    const soundOffIcon = soundToggleBtn.querySelector(".sound-off-icon");
    if (muted) {
      soundOnIcon.classList.add("hidden");
      soundOffIcon.classList.remove("hidden");
    } else {
      soundOnIcon.classList.remove("hidden");
      soundOffIcon.classList.add("hidden");
    }
  }

  // Toggle Dark Mode
  themeToggleBtn.addEventListener("click", () => {
    const isDark = htmlElement.classList.toggle("dark");
    localStorage.setItem("textbetter_theme", isDark ? "dark" : "light");
    updateThemeIcon(isDark);
    playSound(isDark ? "toggle-on" : "toggle-off");
  });

  // Toggle Mute
  soundToggleBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    localStorage.setItem("textbetter_muted", isMuted ? "true" : "false");
    updateSoundIcon(isMuted);
    
    // Play a click sound immediately when unmuting to give feedback
    if (!isMuted) {
      initAudioContext();
      playSound("click");
    }
  });

  // ==========================================
  // 4. INTERACTIVE SANDBOX SIMULATOR
  // ==========================================

  const editorInput = document.getElementById("editor-input");
  const floatingBar = document.getElementById("sim-floating-bar");
  const outputCard = document.getElementById("sim-output-card");
  const outputText = document.getElementById("sim-output-text");
  const outputSpinner = document.getElementById("output-spinner");
  const outputBadgeText = document.getElementById("output-badge-text");
  const instructionOverlay = document.querySelector(".sim-instruction-overlay");
  
  const chips = document.querySelectorAll(".sim-chip");
  const actionButtons = document.querySelectorAll(".floating-actions .action-btn");
  
  const btnCopy = document.getElementById("btn-copy-sim");
  const btnReplace = document.getElementById("btn-replace-sim");
  const btnClose = document.getElementById("btn-close-sim");
  
  let currentSelection = { start: 0, end: 0, text: "" };
  let typingTimer = null;

  // Initial prompt text
  const initialText = "we made a chrome extension that does writing improvements. it is extremely fast and hooks directly into gemini api.";
  editorInput.value = initialText;

  // Floating menu responses database
  const simulationResponses = {
    professional: {
      "i am writing to ask if you can look at my code changes maybe tonight. text me back.": 
        "I am writing to kindly request your review of the recent code changes at your earliest convenience this evening. Please let me know if you have any feedback.",
      "we made a chrome extension that does writing improvements. it is extremely fast and hooks directly into gemini api.": 
        "We have developed a high-performance Chrome extension designed to streamline writing improvements by integrating directly with the Gemini API.",
      "im super excited to let everyone know we finally shipped the brand new website redesign check it out!": 
        "I am pleased to announce that our newly redesigned website has officially launched. We invite you to explore the updates."
    },
    emojis: {
      "i am writing to ask if you can look at my code changes maybe tonight. text me back.": 
        "Writing to see if you can review my code changes tonight! 💻📱 Let me know! 🚀",
      "we made a chrome extension that does writing improvements. it is extremely fast and hooks directly into gemini api.": 
        "We built a Chrome extension for writing improvements! 🚀 Super fast ⚡ and connects directly to the Gemini API! 🧠",
      "im super excited to let everyone know we finally shipped the brand new website redesign check it out!": 
        "Super excited to share that we officially shipped the brand new website redesign! 🎉 Check it out! 👀✨"
    },
    shorten: {
      "i am writing to ask if you can look at my code changes maybe tonight. text me back.": 
        "Could you review my code changes tonight? Let me know.",
      "we made a chrome extension that does writing improvements. it is extremely fast and hooks directly into gemini api.": 
        "We built a fast Chrome extension for writing improvements, powered directly by the Gemini API.",
      "im super excited to let everyone know we finally shipped the brand new website redesign check it out!": 
        "Excited to announce our new website redesign is live! Check it out."
    },
    review: {
      "i am writing to ask if you can look at my code changes maybe tonight. text me back.": 
        "I am writing to ask if you can look at my code changes tonight. Please text me back.",
      "we made a chrome extension that does writing improvements. it is extremely fast and hooks directly into gemini api.": 
        "We made a Chrome extension that improves writing. It is extremely fast and connects directly to the Gemini API.",
      "im super excited to let everyone know we finally shipped the brand new website redesign check it out!": 
        "I'm super excited to let everyone know we finally shipped the brand new website redesign! Check it out!"
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
    // For a textarea simulation, placing it at a fixed upper-center location in the editor is cleaner
    // and mimics the layout without complex line-wrapping math.
    floatingBar.classList.remove("hidden");
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
      outputCard.classList.add("hidden"); // close output card if selecting new text
      positionFloatingBar();
    } else {
      // If click was inside, keep the bar visible if text wasn't empty, otherwise hide
      setTimeout(() => {
        if (document.activeElement !== editorInput && !floatingBar.contains(document.activeElement)) {
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
      
      outputCard.classList.add("hidden");
      floatingBar.classList.add("hidden");
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
      floatingBar.classList.add("hidden");
      
      triggerSimulation(action);
    });
  });

  // Simulator typing engine
  function triggerSimulation(action) {
    outputCard.classList.remove("hidden");
    outputSpinner.classList.remove("hidden");
    outputBadgeText.textContent = "Gemini thinking...";
    outputText.textContent = "Waiting for response...";
    outputText.classList.add("loading");
    
    // Disable action buttons during typing
    btnCopy.style.pointerEvents = "none";
    btnReplace.style.pointerEvents = "none";
    btnCopy.style.opacity = "0.5";
    btnReplace.style.opacity = "0.5";

    // Simulate API delay
    setTimeout(() => {
      outputSpinner.classList.add("hidden");
      outputBadgeText.textContent = "Gemini Suggestion";
      outputText.classList.remove("loading");
      outputText.textContent = "";
      
      // Get predefined response or write a custom responsive message
      const inputText = currentSelection.text.toLowerCase();
      let responseText = "";
      
      if (simulationResponses[action] && simulationResponses[action][inputText]) {
        responseText = simulationResponses[action][inputText];
      } else {
        // Fallback for custom user typing
        const cleanInput = currentSelection.text;
        if (action === "professional") {
          responseText = `With reference to your message: "${cleanInput}", I have polished the text for enhanced clarity, adopting a more formal tone suitable for standard business communication.`;
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
          outputText.textContent += responseText.charAt(charIndex);
          
          // Play silent ticks on typing
          if (charIndex % 3 === 0) {
            playSound("typing");
          }
          charIndex++;
        } else {
          clearInterval(typingTimer);
          
          // Enable action buttons
          btnCopy.style.pointerEvents = "auto";
          btnReplace.style.pointerEvents = "auto";
          btnCopy.style.opacity = "1";
          btnReplace.style.opacity = "1";
          
          playSound("success");
        }
      }, 20);

    }, 1200); // Realistic 1.2s delay for LLM processing
  }

  // Close preview
  btnClose.addEventListener("click", () => {
    playSound("click");
    outputCard.classList.add("hidden");
    if (typingTimer) clearInterval(typingTimer);
  });

  // Copy text action
  btnCopy.addEventListener("click", () => {
    const textToCopy = outputText.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
      playSound("success");
      const span = btnCopy.querySelector("span");
      const originalText = span.textContent;
      span.textContent = "Copied!";
      setTimeout(() => {
        span.textContent = originalText;
      }, 1500);
    });
  });

  // Replace text action
  btnReplace.addEventListener("click", () => {
    const textToInsert = outputText.textContent;
    const fullText = editorInput.value;
    
    const newText = fullText.slice(0, currentSelection.start) + textToInsert + fullText.slice(currentSelection.end);
    editorInput.value = newText;
    
    playSound("success");
    outputCard.classList.add("hidden");
    
    // Highlight the newly replaced text to draw visual connection
    editorInput.focus();
    editorInput.setSelectionRange(currentSelection.start, currentSelection.start + textToInsert.length);
  });

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

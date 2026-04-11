document.addEventListener('DOMContentLoaded', () => {
  const BACKEND_URL = ''; 

  // UI Elements
  const translateBtn = document.getElementById('translateBtn');
  const germanInput = document.getElementById('germanInput');
  const translationGrid = document.getElementById('translationGrid');
  const wordDetailsArea = document.getElementById('wordDetailsArea');
  const clearInputBtn = document.getElementById('clearInputBtn');
  
  // Pick a random tip and display it immediately
  const tipText = document.getElementById('tipText');
  if(tipText && typeof dailyTips !== 'undefined') {
      tipText.innerHTML = dailyTips[Math.floor(Math.random() * dailyTips.length)];
  }
  
// --- UI Elements & Dropdowns ---
  const langMenuBtn = document.getElementById('langMenuBtn');
  const langDropdown = document.getElementById('langDropdown');
  const langCheckboxes = document.getElementById('langCheckboxes');
  
  const grammarMenuBtn = document.getElementById('grammarMenuBtn');
  const grammarDropdown = document.getElementById('grammarDropdown');

  const materialMenuBtn = document.getElementById('materialMenuBtn');
  const materialDropdown = document.getElementById('materialDropdown');

  // NEW: Drawer Elements
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const mainNavDrawer = document.getElementById('mainNavDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');

  // Drawer Toggle Logic
  function toggleDrawer(forceClose = false) {
    if (forceClose || mainNavDrawer.classList.contains('open')) {
        mainNavDrawer.classList.remove('open');
        drawerOverlay.classList.remove('active');
    } else {
        mainNavDrawer.classList.add('open');
        drawerOverlay.classList.add('active');
    }
  }

  menuToggleBtn.addEventListener('click', () => toggleDrawer());
  closeDrawerBtn.addEventListener('click', () => toggleDrawer(true));
  drawerOverlay.addEventListener('click', () => toggleDrawer(true));

  // Spelling & Audio
  const umlautSuggestion = document.getElementById('umlautSuggestion');
  const suggestionText = document.getElementById('suggestionText');
  const germanSpeakBtn = document.getElementById('germanSpeakBtn');

  // Modal Elements
  const grammarModal = document.getElementById('grammarModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalActions = document.getElementById('modalActions');
  const printBtn = document.getElementById('printBtn');
  const generateAiBtn = document.getElementById('generateAiBtn');

  // --- TTS Mapping (Added Somali and Armenian) ---
  const ttsLanguageCodes = {
    'English': 'en-US', 'Arabic': 'ar-SA', 'Russian': 'ru-RU', 'Dari': 'fa-AF', 
    'Farsi': 'fa-IR', 'Amharic': 'am-ET', 'Tigrinya': 'ti-ET', 'Spanish': 'es-ES',
    'French': 'fr-FR', 'Turkish': 'tr-TR', 'Ukrainian': 'uk-UA',
    'Somali': 'so-SO', 'Armenian': 'hy-AM'
  };

  function playAudio(text, langCode) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode || 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }

  // Helper function to get currently checked languages
  function getSelectedLanguages() {
    return Array.from(langCheckboxes.querySelectorAll('input:checked')).map(cb => cb.value);
  }

  // --- Language Checkboxes Setup (With LocalStorage) ---
  const defaultLanguages = [
    { name: 'English', checked: true }, { name: 'Arabic', checked: true },
    { name: 'Russian', checked: true }, { name: 'Dari', checked: true },
    { name: 'Farsi', checked: true }, { name: 'Amharic', checked: true },
    { name: 'Tigrinya', checked: true }, { name: 'Spanish', checked: false },
    { name: 'French', checked: false }, { name: 'Turkish', checked: false },
    { name: 'Ukrainian', checked: true }, { name: 'Somali', checked: false },
    { name: 'Armenian', checked: false }
  ];

  // Load saved languages from local storage (if any)
  const savedLangs = JSON.parse(localStorage.getItem('savedLanguages'));

  defaultLanguages.forEach(lang => {
    // If we have saved preferences, use them. Otherwise, use the defaults.
    const isChecked = savedLangs ? savedLangs.includes(lang.name) : lang.checked;

    const label = document.createElement('label');
    label.className = 'checkbox-label';
    label.innerHTML = `<input type="checkbox" value="${lang.name}" ${isChecked ? 'checked' : ''}> ${lang.name}`;
    
    // Add event listener to save choices whenever a box is checked/unchecked
    const checkbox = label.querySelector('input');
    checkbox.addEventListener('change', () => {
      const selected = getSelectedLanguages();
      localStorage.setItem('savedLanguages', JSON.stringify(selected));
    });

    langCheckboxes.appendChild(label);
  });

  // --- Dropdowns Logic ---
  function closeAllDropdowns() {
    langDropdown.classList.add('hidden');
    grammarDropdown.classList.add('hidden');
    materialDropdown.classList.add('hidden');
  }

  langMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); const isHidden = langDropdown.classList.contains('hidden'); closeAllDropdowns(); if (isHidden) langDropdown.classList.remove('hidden'); });
  grammarMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); const isHidden = grammarDropdown.classList.contains('hidden'); closeAllDropdowns(); if (isHidden) grammarDropdown.classList.remove('hidden'); });
  materialMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); const isHidden = materialDropdown.classList.contains('hidden'); closeAllDropdowns(); if (isHidden) materialDropdown.classList.remove('hidden'); });
  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-wrapper')) closeAllDropdowns();
  });

  // --- Open Modals Logic ---
  function openModal(title, htmlBody, showGenerateBtn = false) {
    modalTitle.innerText = title;
    modalBody.innerHTML = htmlBody;
    modalActions.classList.remove('hidden');
    generateAiBtn.classList.toggle('hidden', !showGenerateBtn);
    
    grammarModal.classList.remove('hidden');
    setTimeout(() => grammarModal.classList.add('active'), 10);
  }

  // Grammar Clicks
  document.querySelectorAll('.grammar-item:not(.material-btn)').forEach(item => {
    item.addEventListener('click', (e) => {
      const topicKey = e.target.getAttribute('data-topic');
      const content = grammarContent[topicKey]; // Uses data.js implicitly if integrated
      if (content) openModal(content.title, content.body, false);
      closeAllDropdowns();
    });
  });

  // Materials Clicks (Vocab & Reading)
  document.querySelectorAll('.material-btn').forEach(item => {
    item.addEventListener('click', (e) => {
      const type = e.target.getAttribute('data-type');
      closeAllDropdowns();

      if (type === 'lesetexte') {
        renderReadingPassages();
      } else if (type === 'nomen') {
        const data = materialData.nomen;
        let html = `<p>${data.description}</p><table class="grammar-table">`;
        html += `<thead><tr><th class="header-der">Maskulin (der)</th><th class="header-die">Feminin (die)</th><th class="header-das">Neutral (das)</th></tr></thead><tbody>`;
        
        data.categories.forEach(cat => {
            html += `<tr class="category-row"><td colspan="3">${cat.name}</td></tr>`;
            const maxRows = Math.max(cat.der.length, cat.die.length, cat.das.length);
            for(let i = 0; i < maxRows; i++) {
                html += `<tr>`;
                html += `<td><span class="noun-der">${cat.der[i] || ''}</span></td>`;
                html += `<td><span class="noun-die">${cat.die[i] || ''}</span></td>`;
                html += `<td><span class="noun-das">${cat.das[i] || ''}</span></td>`;
                html += `</tr>`;
            }
        });
        html += `</tbody></table>`;
        openModal(data.title, html, false);

      } else if (type === 'adjektive' || type === 'verben') {
        const data = materialData[type];
        
        // Added a responsive wrapper so it doesn't break mobile screens
        let html = `<p>${data.description}</p><div class="table-responsive"><table class="grammar-table"><thead><tr>`;
        
        // 1. Color-code the headers to match your gender themes (der/die/das)
        data.headers.forEach(h => {
            let headerStyle = '';
            if (h.includes('der')) headerStyle = 'color: #00658F;';
            else if (h.includes('die') && !h.includes('Plural')) headerStyle = 'color: #9C4150;';
            else if (h.includes('das')) headerStyle = 'color: #386A20;';
            
            html += `<th style="${headerStyle}">${h}</th>`;
        });
        html += `</tr></thead><tbody>`;
        
// 2. BULLETPROOF BADGE DETECTOR (Regex)
        data.items.forEach(row => {
          html += `<tr>`;
          Object.values(row).forEach(val => {
            const strVal = String(val).trim();
            
            // Search for the case words anywhere in the string, ignoring case sensitivity
            const match = strVal.match(/(Nominativ|Akkusativ|Dativ|Genitiv)/i);
            
            if (match) {
                // match[1] holds the exact word it found (e.g., "Dativ")
                const caseName = match[1].toLowerCase();
                html += `<td><span class="case-badge case-${caseName}">${strVal}</span></td>`;
            } else {
                html += `<td>${val}</td>`;
            }
          });
          html += `</tr>`;
        });
        
        html += `</tbody></table></div>`;
        openModal(data.title, html, false);
      }
    });
  });

  // --- Reading Passages Logic & Local Storage ---
  function renderReadingPassages() {
    let savedTexts = JSON.parse(localStorage.getItem('savedPassages'));
    if (!savedTexts || savedTexts.length === 0) {
        savedTexts = materialData.lesetexte; 
    }
    
    let html = '';
    savedTexts.forEach(item => {
        html += `<div class="reading-passage">
                    <h3 class="passage-title">${item.title}</h3>
                    ${item.fokus ? `<div class="passage-fokus">${item.fokus}</div>` : ''}
                    <p>${item.text}</p>
                 </div>`;
    });
    
    openModal("Lesetexte (A1/A2)", html, true);
  }

  // Generate AI Text
  generateAiBtn.addEventListener('click', async () => {
    generateAiBtn.disabled = true;
    generateAiBtn.innerHTML = "Generiere Text...";
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/generate-reading`);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('savedPassages', JSON.stringify(data.stories));
        renderReadingPassages(); 
      }
    } catch (e) {
      console.error("AI Generation failed", e);
      alert("Fehler beim Generieren. Bitte stellen Sie sicher, dass das Backend erreichbar ist.");
    } finally {
      generateAiBtn.disabled = false;
      generateAiBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="margin-right: 8px;"><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="M4.93 4.93l2.83 2.83"></path><path d="M16.24 16.24l2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="M4.93 19.07l2.83-2.83"></path><path d="M16.24 7.76l2.83-2.83"></path></svg> Neuen Text generieren (KI)`;
    }
  });

  // Print Logic
  printBtn.addEventListener('click', () => { window.print(); });

  function closeGrammarModal() {
    grammarModal.classList.remove('active');
    setTimeout(() => { grammarModal.classList.add('hidden'); modalActions.classList.add('hidden'); }, 300);
  }

  closeModalBtn.addEventListener('click', closeGrammarModal);
  grammarModal.addEventListener('click', (e) => { if (e.target === grammarModal) closeGrammarModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeGrammarModal(); });

  // --- Keyboard & Input Logic ---
  let typingTimer;
  const doneTypingInterval = 800; 

  germanInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      translateBtn.click(); 
    }
  });

  germanInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    clearTimeout(typingTimer);
    umlautSuggestion.classList.add('hidden');
    const val = this.value.trim();
	
	if (this.value.length > 0) {
        clearInputBtn.classList.add('visible');
    } else {
        clearInputBtn.classList.remove('visible');
    }
	
	// NEW: Update Character Counter
    const counter = document.getElementById('charCounter');
    if (counter) {
        counter.innerText = `${val.length} / 200`;
        // Turn it red if they hit the limit
        counter.style.color = val.length >= 200 ? '#ba1a1a' : '#888'; 
    }
	
	// 📍 NEW: If the user typed a space, it's a sentence. Abort the spellcheck entirely!
    if (val.includes(' ')) {
        return; 
    }
	
    if (val.length >= 3) {
      typingTimer = setTimeout(() => checkWordSuggestionAI(val), doneTypingInterval);
    }
  });
  
  // 📍 NEW: Clear Button Logic
  clearInputBtn.addEventListener('click', () => {
      germanInput.value = '';
      germanInput.style.height = 'auto'; // Shrink the textarea back down
      germanInput.focus(); // Keep the user's cursor active
      clearInputBtn.classList.remove('visible');
      
      // Reset the character counter
      const counter = document.getElementById('charCounter');
      if (counter) {
          counter.innerText = `0 / 200`;
          counter.style.color = '#888'; 
      }
      
      // Hide spelling suggestions
      umlautSuggestion.classList.add('hidden');
  });

  async function checkWordSuggestionAI(val) {
      try {
          const res = await fetch(`${BACKEND_URL}/api/spellcheck`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word: val }) });
          if (!res.ok) return;
          const data = await res.json();
          if (data.corrected && data.corrected !== val) {
              suggestionText.textContent = data.corrected;
              umlautSuggestion.classList.remove('hidden');
              umlautSuggestion.classList.add('fade-in');
          }
      } catch (err) {}
  }

  suggestionText.addEventListener('click', () => {
    const newWord = suggestionText.textContent;
    germanInput.value = newWord;
    germanInput.style.height = 'auto'; 
    
    // 📍 NEW: Manually show the 'X' button and update the counter
    if (typeof clearInputBtn !== 'undefined') clearInputBtn.classList.add('visible');
    const counter = document.getElementById('charCounter');
    if (counter) {
        counter.innerText = `${newWord.length} / 200`;
        counter.style.color = '#888';
    }

    umlautSuggestion.classList.add('hidden');
    translateBtn.click(); 
  });

  // --- Translation Logic ---
  // --- Translation Logic (Merged Sentence & Word Modes) ---
  translateBtn.addEventListener('click', async () => {
    const text = germanInput.value.trim();
    const selectedLangs = getSelectedLanguages();
    if (!text || selectedLangs.length === 0) return;
    
    // AUTO-DETECT: Sentence vs Single Word
    const wordCount = text.split(/\s+/).length;
    
    // Global UI Resets
    translateBtn.disabled = true; translateBtn.style.opacity = '0.6'; germanSpeakBtn.classList.add('hidden'); 
    umlautSuggestion.classList.add('hidden');
    
    const sentenceArea = document.getElementById('sentenceAnalysisArea');
    if(sentenceArea) sentenceArea.classList.add('hidden');
	
	// FIX: Force the Word Details area to hide on every new search
	wordDetailsArea.style.display = 'none';
	
	// NEW FIX: Strip away gender themes to return to the default neutral colors
    document.body.classList.remove('theme-der', 'theme-die', 'theme-das');
	
	// 📍 NEW: Hide the correction area on new search
    const correctionArea = document.getElementById('correctionArea');
    if(correctionArea) correctionArea.classList.add('hidden');
	
	// 📍 NEW: Reset the mode state on every new search
    document.body.classList.remove('sentence-mode');

    if (wordCount > 1) {
        // ==========================================
        // 🧠 PROGRESSIVE SENTENCE ANALYSIS MODE
        // ==========================================
        document.body.classList.add('sentence-mode');
        document.getElementById('imageContainer').style.display = 'none';
        document.getElementById('tipOfTheDay').style.display = 'flex';
        
        // 1. Setup the "Thinking" UI for the Grammar Section immediately
        if (sentenceArea) {
            sentenceArea.innerHTML = `
            <div class="fade-in" style="display: flex; align-items: center; gap: 10px; margin-bottom: 1.5rem; margin-top: 0.5rem; padding-left: 4px;">
                <div class="shimmer" style="width: 18px; height: 18px; border-radius: 50%;"></div>
                <div class="shimmer" style="height: 12px; width: 280px; border-radius: 4px;"></div>
            </div>`;
            sentenceArea.classList.remove('hidden');
        }

        translationGrid.innerHTML = '';
        selectedLangs.forEach(() => {
          const skeleton = document.createElement('div');
          skeleton.className = 'translation-card shimmer'; skeleton.innerHTML = '<div style="height: 100px;"></div>';
          translationGrid.appendChild(skeleton);
        });

        try {
            // 📍 PHASE 1: INSTANT GRAMMAR CHECK (OpenAI / Gemini Flash-Lite)
            // First, we find out if the sentence is correct or needs fixing.
            const openAiRes = await fetch(`${BACKEND_URL}/api/fast-correct`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sentence: text })
            });
            
            if (!openAiRes.ok) throw new Error("Grammar correction failed");
            const grammarData = await openAiRes.json();
            
            // Instantly show the correction alert if there was a mistake!
            const correctionArea = document.getElementById('correctionArea');
            if (grammarData.wasCorrected && correctionArea) {
                correctionArea.innerHTML = `
                <div class="correction-alert fade-in">
                  <strong>✨ Korrigiert:</strong> ${grammarData.correctedSentence}
                </div>`;
                correctionArea.classList.remove('hidden');
            }

            // Lock in the grammatically perfect sentence
            const finalSentence = grammarData.wasCorrected ? grammarData.correctedSentence : text;

            // 📍 PHASE 2: FLAWLESS TRANSLATION
            // Now we fire off the translation using ONLY the perfect sentence.
            fetch(`${BACKEND_URL}/api/translate-sentence`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sentence: finalSentence, targetLanguages: selectedLangs })
            }).then(res => res.json()).then(transData => {
                translationGrid.innerHTML = ''; 
                let delayIndex = 0;
                for (const [lang, translation] of Object.entries(transData.translations)) {
                    const card = createTranslationCard({ language: lang, meanings: [translation], example: "" });
                    card.style.animationDelay = `${delayIndex * 0.05}s`;
                    card.classList.add('fade-in');
                    translationGrid.appendChild(card);
                    delayIndex++;
                }
            }).catch(e => {
                console.error("Translation failed:", e);
                translationGrid.innerHTML = `<p style="color: #ba1a1a;">Übersetzung fehlgeschlagen.</p>`;
            });

            // 📍 PHASE 3: WORD CARDS BUILDER (Groq)
            // Pass the perfect sentence to Groq to build the vocabulary cards.
            const groqRes = await fetch(`${BACKEND_URL}/api/analyze-sentence`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sentence: finalSentence })
            });
            
            if (!groqRes.ok) throw new Error("Groq analysis failed");
            const breakdownData = await groqRes.json();
            
            // Build the Word Cards UI
            let html = `<div class="word-cards-container fade-in">`;
            breakdownData.wordBreakdown.forEach(item => {
                const tipHtml = item.grammarTip ? `<div class="wc-grammar">${item.grammarTip}</div>` : '';
                let caseBadgeHtml = '';
                if (item.kasus && item.kasus !== "null") {
                    const safeCaseName = item.kasus.toLowerCase().trim();
                    caseBadgeHtml = `<div class="case-badge case-${safeCaseName}" style="margin-top: 8px;">${item.kasus}</div>`;
                }
                html += `
                <div class="word-card" data-pos="${item.pos}" data-base="${item.baseForm}">
                  <div class="wc-word">${item.word}</div>
                  <div class="wc-meaning">${item.englishMeaning}</div>
                  <div class="wc-pos">${item.pos}</div>
                  ${caseBadgeHtml}
                  ${tipHtml}
                </div>`;
            });
            html += `</div>`;
            
            // Attach the smart grammar explanation to the bottom!
            html += `<div class="grammar-explanation-box fade-in">💡 <b>Grammatik:</b> ${grammarData.grammarExplanation}</div>`;
            
            // Render it and add click listeners
            if (sentenceArea) {
                sentenceArea.innerHTML = html;
                sentenceArea.querySelectorAll('.word-card').forEach(card => {
                    card.addEventListener('click', () => {
                        const newWord = card.getAttribute('data-base');
                        germanInput.value = newWord;
                        germanInput.style.height = 'auto';
                        if (typeof clearInputBtn !== 'undefined') clearInputBtn.classList.add('visible');
                        const counter = document.getElementById('charCounter');
                        if (counter) { counter.innerText = `${newWord.length} / 200`; counter.style.color = '#888'; }
                        translateBtn.click(); 
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    });
                });
            }

        } catch (error) {
            console.error(error);
            translationGrid.innerHTML = `<p style="color: #ba1a1a; text-align: center; width: 100%; font-weight: 500;">Etwas ist schiefgelaufen.</p>`;
        } finally {
            translateBtn.disabled = false; translateBtn.style.opacity = '1';
        }

    } else {
        // ==========================================
        // 🍎 SINGLE WORD MODE
        // ==========================================
        wordDetailsArea.style.display = 'block'; wordDetailsArea.classList.remove('slide-up');
        
        document.getElementById('germanWordTitle').innerHTML = '<div class="shimmer" style="height: 2.2rem; width: 50%; border-radius: 4px;"></div>';
        document.getElementById('grammarTips').innerHTML = '';
        document.getElementById('germanExample').innerHTML = '<div class="shimmer" style="height: 1rem; width: 80%; border-radius: 4px; margin-top: 10px;"></div>';
        
        // 📍 NEW: Hide the tip, show the image container & shimmer
        document.getElementById('tipOfTheDay').style.display = 'none';
        document.getElementById('imageContainer').style.display = 'block';
        document.getElementById('centralImage').style.display = 'none';
        document.getElementById('mainImageShimmer').style.display = 'block';

        translationGrid.innerHTML = '';
        selectedLangs.forEach(() => {
          const skeleton = document.createElement('div');
          skeleton.className = 'translation-card shimmer'; skeleton.innerHTML = '<div style="height: 100px;"></div>';
          translationGrid.appendChild(skeleton);
        });

        try {
          // 📍 PHASE 1: Fetch Grammar & Word Meanings (Groq)
          const textRes = await fetch(`${BACKEND_URL}/api/translate`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word: text }) 
          });

          if (!textRes.ok) throw new Error("Translation request failed");
          const data = await textRes.json();
          const germanData = data.german;
          
          // Update Global Colors & Top UI
          document.body.classList.remove('theme-der', 'theme-die', 'theme-das'); 
          if (germanData.partOfSpeech === 'noun' && germanData.article) {
              const article = germanData.article.toLowerCase();
              if (article === 'der') document.body.classList.add('theme-der');
              else if (article === 'die') document.body.classList.add('theme-die');
              else if (article === 'das') document.body.classList.add('theme-das');
          }

          let titleHtml = germanData.word;
          let grammarHtml = '';
          let textToSpeak = germanData.word;

          if (germanData.partOfSpeech === 'noun' && germanData.article) {
              titleHtml = `<span class="article">${germanData.article}</span> ${germanData.word}`;
              textToSpeak = `${germanData.article} ${germanData.word}`; 
              if (germanData.pluralTip) grammarHtml = `<span class="tip-label">Plural:</span> <span class="plural-tip">${germanData.pluralTip}</span>`;
          } else if (germanData.partOfSpeech === 'verb' && germanData.conjugationTips) {
              grammarHtml = `<span class="tip-label">Konjugation:</span> <span class="conj-tip">${germanData.conjugationTips}</span>`;
          }

          document.getElementById('germanWordTitle').innerHTML = titleHtml;
          document.getElementById('grammarTips').innerHTML = grammarHtml;
          document.getElementById('germanExample').innerText = `"${germanData.example}"`;
          wordDetailsArea.classList.add('slide-up');

          germanSpeakBtn.onclick = () => playAudio(textToSpeak, 'de-DE');
          germanSpeakBtn.classList.remove('hidden');

          // 📍 PHASE 2: Render Translation Cards (With Example Shimmer)
          translationGrid.innerHTML = ''; 
          const filteredTranslations = data.translations.filter(langData => selectedLangs.includes(langData.language));
          
          filteredTranslations.forEach((langData, index) => {
            // Temporarily inject a shimmer for the example sentence
            const cardData = {
                language: langData.language,
                meanings: langData.meanings,
                example: `<div class="shimmer" style="height: 12px; width: 85%; margin-top: 6px; border-radius: 4px;"></div>`
            };
            const card = createTranslationCard(cardData);
            card.style.animationDelay = `${index * 0.05}s`;
            card.classList.add('fade-in');
            card.id = `word-card-${langData.language}`; // Add ID to target later
            translationGrid.appendChild(card);
          });

          // 📍 PHASE 3: Fetch Image (Background)
          const searchWord = data.safeImageSearchQuery || data.german.word;
          fetch(`${BACKEND_URL}/api/image?germanWord=${encodeURIComponent(data.german.word)}&searchQuery=${encodeURIComponent(searchWord)}`)
            .then(res => res.json())
            .then(imgData => {
                if (imgData.imageUrl) {
                    const img = document.getElementById('centralImage'); const shimmer = document.getElementById('mainImageShimmer');
                    img.src = imgData.imageUrl;
                    img.onload = () => { img.style.display = 'block'; img.classList.add('fade-in'); shimmer.style.display = 'none'; };
                }
            });

          // 📍 PHASE 4: Fetch Example Sentence Translations (Google API)
          if (germanData.example) {
              fetch(`${BACKEND_URL}/api/translate-sentence`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ sentence: germanData.example, targetLanguages: selectedLangs })
              }).then(res => {
                  if (!res.ok) throw new Error("Translation API failed");
                  return res.json();
              }).then(transData => {
                  for (const [lang, translation] of Object.entries(transData.translations)) {
                      const card = document.getElementById(`word-card-${lang}`);
                      if (card) {
                          const exampleEl = card.querySelector('.example-sentence');
                          if (exampleEl) {
                              // Silently swap the shimmer for the real translation
                              exampleEl.style.opacity = '0';
                              setTimeout(() => {
                                  exampleEl.innerHTML = translation;
                                  exampleEl.style.opacity = '1';
                              }, 200);
                          }
                      }
                  }
              }).catch(e => {
                  console.error("Example translation failed:", e);
                  // 📍 FAILSAFE: Remove shimmers so they don't load forever
                  document.querySelectorAll('.example-sentence .shimmer').forEach(el => el.remove());
              });
          } else {
              // 📍 FAILSAFE: Remove shimmers immediately if there is no example
              document.querySelectorAll('.example-sentence .shimmer').forEach(el => el.remove());
          }

        } catch (error) {
          translationGrid.innerHTML = `<p style="color: #ba1a1a; text-align: center; width: 100%; font-weight: 500;">Etwas ist schiefgelaufen.</p>`;
        } finally {
          translateBtn.disabled = false; translateBtn.style.opacity = '1';
        }
    }
  });

  function createTranslationCard(data) {
    const card = document.createElement('div'); card.className = 'translation-card';
    const isRTL = ['Arabic', 'Dari', 'Farsi'].includes(data.language);
    const textDirection = isRTL ? 'dir="rtl" style="text-align: right;"' : '';
    const meaningsHtml = data.meanings.length > 1 ? `<span class="multiple-meanings">(Auch: ${data.meanings.slice(1).join(', ')})</span>` : '';
    const translatedWord = data.meanings[0];
    const ttsCode = ttsLanguageCodes[data.language];

    card.innerHTML = `
      <div class="card-header"><span class="lang-title">${data.language}</span></div>
      <div class="card-body" ${textDirection}>
        <div class="word-row">
          <p class="translated-word">${translatedWord} ${meaningsHtml}</p>
          <button class="speak-btn card-speak-btn" aria-label="Aussprache anhören"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg></button>
        </div>
        <div class="example-sentence">${data.example}</div>
      </div>`;
    card.querySelector('.card-speak-btn').addEventListener('click', () => playAudio(translatedWord, ttsCode));
    return card;
  }
});
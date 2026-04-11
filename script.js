document.addEventListener('DOMContentLoaded', () => {
  const BACKEND_URL = ''; 

  // UI Elements
  const translateBtn = document.getElementById('translateBtn');
  const germanInput = document.getElementById('germanInput');
  const translationGrid = document.getElementById('translationGrid');
  const wordDetailsArea = document.getElementById('wordDetailsArea');
  
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
        
        // 2. Loop through the rows and turn cases into colorful Badges!
        data.items.forEach(row => {
          html += `<tr>`;
          Object.values(row).forEach(val => {
            // FIX: Convert to string and trim spaces to guarantee a match
            const strVal = String(val).trim();
            const isCase = ['Nominativ', 'Akkusativ', 'Dativ', 'Genitiv'].includes(strVal);
            
            if (isCase) {
                // Apply the exact badge class dynamically
                html += `<td><span class="case-badge case-${strVal.toLowerCase()}">${strVal}</span></td>`;
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
	
	// NEW: Update Character Counter
    const counter = document.getElementById('charCounter');
    if (counter) {
        counter.innerText = `${val.length} / 200`;
        // Turn it red if they hit the limit
        counter.style.color = val.length >= 200 ? '#ba1a1a' : '#888'; 
    }
	
    if (val.length >= 3) {
      typingTimer = setTimeout(() => checkWordSuggestionAI(val), doneTypingInterval);
    }
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
    germanInput.value = suggestionText.textContent;
    germanInput.style.height = 'auto'; 
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

    if (wordCount > 1) {
        // ==========================================
        // 🧠 SENTENCE ANALYSIS MODE
        // ==========================================
        const centralImg = document.getElementById('centralImage');
            centralImg.src = 'logo.png'; // Resets to your default placeholder
            centralImg.style.display = 'block';
        document.getElementById('mainImageShimmer').style.display = 'none';
        translationGrid.innerHTML = '';
        
        // Add Shimmers for Sentence Translation Cards
        selectedLangs.forEach(() => {
          const skeleton = document.createElement('div');
          skeleton.className = 'translation-card shimmer'; skeleton.innerHTML = '<div style="height: 100px;"></div>';
          translationGrid.appendChild(skeleton);
        });

        try {
            const res = await fetch(`${BACKEND_URL}/api/analyze-sentence`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sentence: text })
            });
            
            if (!res.ok) throw new Error("Sentence analysis failed");
            const data = await res.json();
            
            // Build the Interactive Word Cards UI
            let html = '';
            if (data.wasCorrected) {
                html += `
                <div class="correction-alert">
                  <strong>✨ Korrigiert:</strong>
                  ${data.correctedSentence}
                </div>`;
            }
            html += `<div class="grammar-explanation-box">💡 <b>Grammatik:</b> ${data.grammarExplanation}</div>`;
            html += `<div class="word-cards-container">`;
            data.wordBreakdown.forEach(item => {
                const tipHtml = item.grammarTip ? `<div class="wc-grammar">${item.grammarTip}</div>` : '';
                html += `
                <div class="word-card" data-pos="${item.pos}" data-base="${item.baseForm}">
                  <div class="wc-word">${item.word}</div>
                  <div class="wc-meaning">${item.englishMeaning}</div>
                  <div class="wc-pos">${item.pos}</div>
                  ${tipHtml}
                </div>`;
            });
            html += `</div>`;
            
            if (sentenceArea) {
                sentenceArea.innerHTML = html;
                sentenceArea.classList.remove('hidden');
                
                // Add Click Listeners to Word Cards for quick-search
                sentenceArea.querySelectorAll('.word-card').forEach(card => {
                    card.addEventListener('click', () => {
                        germanInput.value = card.getAttribute('data-base');
                        germanInput.style.height = 'auto'; 
                        translateBtn.click(); 
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    });
                });
            }

            // Render Full Sentence Translations using your original Card function!
            translationGrid.innerHTML = ''; 
            let delayIndex = 0;
            
            for (const [lang, translation] of Object.entries(data.fullTranslations)) {
                if (selectedLangs.includes(lang)) {
                    // Structure the data exactly how createTranslationCard expects it
                    const mockData = {
                        language: lang,
                        meanings: [translation],
                        example: "" // No example needed for full sentences
                    };
                    const card = createTranslationCard(mockData);
                    card.style.animationDelay = `${delayIndex * 0.05}s`;
                    card.classList.add('fade-in');
                    translationGrid.appendChild(card);
                    delayIndex++;
                }
            }
        } catch (error) {
            console.error(error);
            translationGrid.innerHTML = `<p style="color: #ba1a1a; text-align: center; width: 100%; font-weight: 500;">Etwas ist schiefgelaufen.</p>`;
        } finally {
            translateBtn.disabled = false; translateBtn.style.opacity = '1';
        }

    } else {
        // ==========================================
        // 🍎 SINGLE WORD MODE (Your Original Logic)
        // ==========================================
        wordDetailsArea.style.display = 'block'; wordDetailsArea.classList.remove('slide-up');
        
        document.getElementById('germanWordTitle').innerHTML = '<div class="shimmer" style="height: 2.2rem; width: 50%; border-radius: 4px;"></div>';
        document.getElementById('grammarTips').innerHTML = '';
        document.getElementById('germanExample').innerHTML = '<div class="shimmer" style="height: 1rem; width: 80%; border-radius: 4px; margin-top: 10px;"></div>';
        document.getElementById('centralImage').style.display = 'none';
        document.getElementById('mainImageShimmer').style.display = 'block';

        translationGrid.innerHTML = '';
        selectedLangs.forEach(() => {
          const skeleton = document.createElement('div');
          skeleton.className = 'translation-card shimmer'; skeleton.innerHTML = '<div style="height: 100px;"></div>';
          translationGrid.appendChild(skeleton);
        });

        try {
          const textRes = await fetch(`${BACKEND_URL}/api/translate`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word: text }) 
          });

          if (!textRes.ok) throw new Error("Translation request failed");
          const data = await textRes.json();
          const germanData = data.german;
          
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

          translationGrid.innerHTML = ''; 
          
          const filteredTranslations = data.translations.filter(langData => selectedLangs.includes(langData.language));
          
          filteredTranslations.forEach((langData, index) => {
            const card = createTranslationCard(langData);
            card.style.animationDelay = `${index * 0.05}s`;
            card.classList.add('fade-in');
            translationGrid.appendChild(card);
          });

          const searchWord = data.safeImageSearchQuery || data.german.word;
          
          const imgRes = await fetch(`${BACKEND_URL}/api/image?germanWord=${encodeURIComponent(data.german.word)}&searchQuery=${encodeURIComponent(searchWord)}`);
          const imgData = await imgRes.json();

          if (imgData.imageUrl) {
              const img = document.getElementById('centralImage'); const shimmer = document.getElementById('mainImageShimmer');
              img.src = imgData.imageUrl;
              img.onload = () => { img.style.display = 'block'; img.classList.add('fade-in'); shimmer.style.display = 'none'; };
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
        <p class="example-sentence">${data.example}</p>
      </div>`;
    card.querySelector('.card-speak-btn').addEventListener('click', () => playAudio(translatedWord, ttsCode));
    return card;
  }
});
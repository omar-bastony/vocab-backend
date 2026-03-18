document.addEventListener('DOMContentLoaded', () => {
  const BACKEND_URL = 'https://vocab-backend-eight.vercel.app/';

  const translateBtn = document.getElementById('translateBtn');
  const germanInput = document.getElementById('germanInput');
  const translationGrid = document.getElementById('translationGrid');
  const wordDetailsArea = document.getElementById('wordDetailsArea');
  
  const langMenuBtn = document.getElementById('langMenuBtn');
  const langDropdown = document.getElementById('langDropdown');
  const langCheckboxes = document.getElementById('langCheckboxes');

  const umlautSuggestion = document.getElementById('umlautSuggestion');
  const suggestionText = document.getElementById('suggestionText');

  // --- Language Setup ---
  const availableLanguages = [
    { name: 'English', checked: true }, { name: 'Arabic', checked: true },
    { name: 'Russian', checked: true }, { name: 'Dari', checked: true },
    { name: 'Farsi', checked: true }, { name: 'Amharic', checked: true },
    { name: 'Tigrinya', checked: true }, { name: 'Spanish', checked: false },
    { name: 'French', checked: false }, { name: 'Turkish', checked: false },
    { name: 'Ukrainian', checked: false }
  ];

  availableLanguages.forEach(lang => {
    const label = document.createElement('label');
    label.className = 'checkbox-label';
    label.innerHTML = `<input type="checkbox" value="${lang.name}" ${lang.checked ? 'checked' : ''}> ${lang.name}`;
    langCheckboxes.appendChild(label);
  });

  langMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle('hidden');
  });
  document.addEventListener('click', (e) => {
    if (!langDropdown.contains(e.target) && e.target !== langMenuBtn) {
      langDropdown.classList.add('hidden');
    }
  });

  function getSelectedLanguages() {
    return Array.from(langCheckboxes.querySelectorAll('input:checked')).map(cb => cb.value);
  }

  // --- AI Spelling Suggestion (Debounced) ---
  let typingTimer;
  const doneTypingInterval = 800; // Wait 800ms after user stops typing

  germanInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    
    // Clear the timer and hide the suggestion while typing
    clearTimeout(typingTimer);
    umlautSuggestion.classList.add('hidden');

    const val = this.value.trim();
    if (val.length >= 3) {
      typingTimer = setTimeout(() => checkWordSuggestionAI(val), doneTypingInterval);
    }
  });

  async function checkWordSuggestionAI(val) {
      try {
          const res = await fetch(`${BACKEND_URL}/api/spellcheck`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ word: val })
          });
          if (!res.ok) return;
          
          const data = await res.json();
          if (data.corrected && data.corrected !== val) {
              suggestionText.textContent = data.corrected;
              umlautSuggestion.classList.remove('hidden');
              umlautSuggestion.classList.add('fade-in');
          }
      } catch (err) {
          console.error("AI Spellcheck failed", err);
      }
  }

  suggestionText.addEventListener('click', () => {
    germanInput.value = suggestionText.textContent;
    germanInput.style.height = 'auto'; 
    umlautSuggestion.classList.add('hidden');
  });



  // --- Translation Logic ---
  translateBtn.addEventListener('click', async () => {
    const text = germanInput.value.trim();
    const selectedLangs = getSelectedLanguages();
    if (!text || selectedLangs.length === 0) return;
    
    // Disable button to prevent spam clicking
    translateBtn.disabled = true;
    translateBtn.style.opacity = '0.6';

    wordDetailsArea.style.display = 'block';
    wordDetailsArea.classList.remove('slide-up');
    
    document.getElementById('germanWordTitle').innerHTML = '<div class="shimmer" style="height: 2rem; width: 50%; border-radius: 4px;"></div>';
    document.getElementById('grammarTips').innerHTML = '';
    document.getElementById('germanExample').innerHTML = '<div class="shimmer" style="height: 1rem; width: 80%; border-radius: 4px; margin-top: 10px;"></div>';
    
    document.getElementById('centralImage').style.display = 'none';
    document.getElementById('mainImageShimmer').style.display = 'block';

    translationGrid.innerHTML = '';
    selectedLangs.forEach(() => {
      const skeleton = document.createElement('div');
      skeleton.className = 'translation-card shimmer';
      skeleton.innerHTML = '<div style="height: 100px;"></div>';
      translationGrid.appendChild(skeleton);
    });

    try {
      const textRes = await fetch(`${BACKEND_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: text, languages: selectedLangs })
      });

      if (!textRes.ok) throw new Error("Translation request failed");
      const data = await textRes.json();
      const germanData = data.german;
      
      let titleHtml = germanData.word;
      let grammarHtml = '';

      if (germanData.partOfSpeech === 'noun' && germanData.article) {
          titleHtml = `<span class="article">${germanData.article}</span> ${germanData.word}`;
          if (germanData.pluralTip) grammarHtml = `<span class="tip-label">Plural:</span> <span class="plural-tip">${germanData.pluralTip}</span>`;
      } else if (germanData.partOfSpeech === 'verb' && germanData.conjugationTips) {
          grammarHtml = `<span class="tip-label">Konjugation:</span> <span class="conj-tip">${germanData.conjugationTips}</span>`;
      }

      document.getElementById('germanWordTitle').innerHTML = titleHtml;
      document.getElementById('grammarTips').innerHTML = grammarHtml;
      document.getElementById('germanExample').innerText = `"${germanData.example}"`;
      wordDetailsArea.classList.add('slide-up');

      translationGrid.innerHTML = ''; 
      data.translations.forEach((langData, index) => {
        const card = createTranslationCard(langData);
        card.style.animationDelay = `${index * 0.05}s`;
        card.classList.add('fade-in');
        translationGrid.appendChild(card);
      });

      const imgRes = await fetch(`${BACKEND_URL}/api/image?word=${encodeURIComponent(germanData.word)}`);
      const imgData = await imgRes.json();

      if (imgData.imageUrl) {
          const img = document.getElementById('centralImage');
          const shimmer = document.getElementById('mainImageShimmer');
          img.src = imgData.imageUrl;
          img.onload = () => {
            img.style.display = 'block';
            img.classList.add('fade-in');
            shimmer.style.display = 'none'; 
          };
      }

    } catch (error) {
      console.error("Error:", error);
      translationGrid.innerHTML = `<p style="color: #ba1a1a; text-align: center; width: 100%; font-weight: 500;">Etwas ist schiefgelaufen. Bitte überprüfen Sie die Konsole.</p>`;
    } finally {
      // Re-enable the button
      translateBtn.disabled = false;
      translateBtn.style.opacity = '1';
    }
  });

  function createTranslationCard(data) {
    const card = document.createElement('div');
    card.className = 'translation-card';
    const isRTL = ['Arabic', 'Dari', 'Farsi'].includes(data.language);
    const textDirection = isRTL ? 'dir="rtl" style="text-align: right;"' : '';
    const meaningsHtml = data.meanings.length > 1 ? `<span class="multiple-meanings">(Auch: ${data.meanings.slice(1).join(', ')})</span>` : '';

    card.innerHTML = `
      <div class="card-header"><span class="lang-title">${data.language}</span></div>
      <div class="card-body" ${textDirection}>
        <p class="translated-word">${data.meanings[0]} ${meaningsHtml}</p>
        <p class="example-sentence">${data.example}</p>
      </div>
    `;
    return card;
  }

});
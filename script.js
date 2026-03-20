document.addEventListener('DOMContentLoaded', () => {
  const BACKEND_URL = 'https://vocab-backend-eight.vercel.app'; 

  // UI Elements
  const translateBtn = document.getElementById('translateBtn');
  const germanInput = document.getElementById('germanInput');
  const translationGrid = document.getElementById('translationGrid');
  const wordDetailsArea = document.getElementById('wordDetailsArea');
  
  // Dropdowns
  const langMenuBtn = document.getElementById('langMenuBtn');
  const langDropdown = document.getElementById('langDropdown');
  const langCheckboxes = document.getElementById('langCheckboxes');
  
  const grammarMenuBtn = document.getElementById('grammarMenuBtn');
  const grammarDropdown = document.getElementById('grammarDropdown');

  // Spelling & Audio
  const umlautSuggestion = document.getElementById('umlautSuggestion');
  const suggestionText = document.getElementById('suggestionText');
  const germanSpeakBtn = document.getElementById('germanSpeakBtn');

  // Modal Elements
  const grammarModal = document.getElementById('grammarModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  // ==========================================
  // --- A1 & A2 GERMAN GRAMMAR LIBRARY ---
  // ==========================================
  const grammarContent = {
    pronomen: {
      title: "Pronomen, sein, haben & Possessiv",
      body: `
        <p>Die wichtigsten Verben und Begleiter auf Deutsch. Die Verben <strong>sein</strong> und <strong>haben</strong> sind unregelmäßig.</p>
        <table class="grammar-table">
          <thead>
            <tr>
              <th>Pronomen</th>
              <th>sein (to be)</th>
              <th>haben (to have)</th>
              <th>Possessiv (my, your...)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>ich</strong></td><td>bin</td><td>habe</td><td>mein / meine</td></tr>
            <tr><td><strong>du</strong></td><td>bist</td><td>hast</td><td>dein / deine</td></tr>
            <tr><td><strong>er/sie/es</strong></td><td>ist</td><td>hat</td><td>sein / ihr / sein</td></tr>
            <tr><td><strong>wir</strong></td><td>sind</td><td>haben</td><td>unser / unsere</td></tr>
            <tr><td><strong>ihr</strong></td><td>seid</td><td>habt</td><td>euer / eure</td></tr>
            <tr><td><strong>sie/Sie</strong></td><td>sind</td><td>haben</td><td>ihr / Ihr</td></tr>
          </tbody>
        </table>
        <p><em>Beispiel:</em> <span class="grammar-highlight">Ich bin</span> müde, aber <span class="grammar-highlight">ich habe</span> mein Buch.</p>
      `
    },
    kasus: {
      title: "Artikel & Kasus (Fälle)",
      body: `
        <p>Der Artikel ändert sich, je nachdem welche Funktion das Nomen im Satz hat.</p>
        <ul>
          <li><strong>Nominativ:</strong> Das Subjekt. <em>(Wer oder was?)</em></li>
          <li><strong>Akkusativ:</strong> Das direkte Objekt. <em>(Wen oder was?)</em></li>
          <li><strong>Dativ:</strong> Das indirekte Objekt. <em>(Wem?)</em></li>
        </ul>
        <table class="grammar-table">
          <thead>
            <tr>
              <th>Kasus</th>
              <th>Maskulin (der)</th>
              <th>Feminin (die)</th>
              <th>Neutral (das)</th>
              <th>Plural (die)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Nominativ</strong></td><td>der</td><td>die</td><td>das</td><td>die</td></tr>
            <tr><td><strong>Akkusativ</strong></td><td><span class="grammar-highlight">den</span></td><td>die</td><td>das</td><td>die</td></tr>
            <tr><td><strong>Dativ</strong></td><td><span class="grammar-highlight">dem</span></td><td><span class="grammar-highlight">der</span></td><td><span class="grammar-highlight">dem</span></td><td><span class="grammar-highlight">den (+n)</span></td></tr>
          </tbody>
        </table>
        <p><em>Beispiel:</em> <span class="grammar-highlight">Der Mann</span> (Nom) gibt <span class="grammar-highlight">dem Kind</span> (Dat) <span class="grammar-highlight">den Apfel</span> (Akk).</p>
      `
    },
    fragen: {
      title: "Fragen stellen",
      body: `
        <p>Es gibt zwei Hauptarten von Fragen auf Deutsch:</p>
        <p><strong>1. W-Fragen (Information)</strong><br>
        Das Fragewort steht auf Position 1, das Verb auf Position 2.</p>
        <ul>
          <li><strong>Wer?</strong> (Person): <em>Wer ist das?</em></li>
          <li><strong>Was?</strong> (Sache): <em>Was machst du?</em></li>
          <li><strong>Wo? / Wohin?</strong> (Ort): <em>Wo wohnst du? Wohin gehst du?</em></li>
          <li><strong>Wann?</strong> (Zeit): <em>Wann kommt der Zug?</em></li>
        </ul>
        <p><strong>2. Ja/Nein-Fragen</strong><br>
        Das Verb steht auf Position 1!</p>
        <ul>
          <li><em><span class="grammar-highlight">Lernst</span> du Deutsch?</em> – Ja, ich lerne Deutsch.</li>
          <li><em><span class="grammar-highlight">Hast</span> du Zeit?</em> – Nein, leider nicht.</li>
        </ul>
      `
    },
    perfekt: {
      title: "Das Perfekt (Vergangenheit)",
      body: `
        <p>Wir benutzen das Perfekt für die Vergangenheit, besonders wenn wir sprechen.</p>
        <p><strong>Die Regel:</strong> <span class="grammar-highlight">haben</span> oder <span class="grammar-highlight">sein</span> (Position 2) + <strong>Partizip II</strong> (am Ende des Satzes).</p>
        <p>Wann benutzt man <strong>sein</strong>?</p>
        <ul>
          <li>Bei Bewegung von A nach B: <em>gehen, fahren, fliegen, kommen.</em></li>
          <li>Bei Zustandsänderung: <em>aufwachen, einschlafen, sterben.</em></li>
          <li>Ausnahmen: <em>sein, bleiben, passieren.</em></li>
        </ul>
        <p><strong>Beispiele:</strong></p>
        <ul>
          <li>(haben): <em>Ich <span class="grammar-highlight">habe</span> gestern eine Pizza <span class="grammar-highlight">gegessen</span>.</em></li>
          <li>(sein): <em>Wir <span class="grammar-highlight">sind</span> am Wochenende nach Berlin <span class="grammar-highlight">gefahren</span>.</em></li>
        </ul>
      `
    },
    praeteritum: {
      title: "Das Präteritum (Vergangenheit)",
      body: `
        <p>Das Präteritum wird oft in Texten (Büchern, Zeitungen) benutzt. Im A2-Niveau ist es besonders wichtig für <strong>haben</strong>, <strong>sein</strong> und die <strong>Modalverben</strong>.</p>
        <table class="grammar-table">
          <thead>
            <tr>
              <th>Pronomen</th>
              <th>sein (war)</th>
              <th>haben (hatte)</th>
              <th>müssen (musste)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>ich</strong></td><td>war</td><td>hatte</td><td>musste</td></tr>
            <tr><td><strong>du</strong></td><td>warst</td><td>hattest</td><td>musstest</td></tr>
            <tr><td><strong>er/sie/es</strong></td><td>war</td><td>hatte</td><td>musste</td></tr>
            <tr><td><strong>wir</strong></td><td>waren</td><td>hatten</td><td>mussten</td></tr>
          </tbody>
        </table>
        <p><strong>Beispiele:</strong></p>
        <ul>
          <li><em>Ich <span class="grammar-highlight">war</span> gestern krank.</em></li>
          <li><em>Als Kind <span class="grammar-highlight">hatte</span> ich einen Hund.</em></li>
          <li><em>Er <span class="grammar-highlight">musste</span> lange arbeiten.</em></li>
        </ul>
      `
    },
    nebensaetze: {
      title: "Nebensätze (dass, weil, wenn)",
      body: `
        <p>In einem Nebensatz steht das konjugierte Verb <strong>immer ganz am Ende</strong>.</p>
        <ul>
          <li><strong>weil (Grund/Warum?):</strong><br> 
          <em>Ich lerne Deutsch, <span class="grammar-highlight">weil</span> ich in Deutschland leben <span class="grammar-highlight">möchte</span>.</em></li>
          <li><strong>dass (Information):</strong><br> 
          <em>Ich glaube, <span class="grammar-highlight">dass</span> die deutsche Grammatik schwer <span class="grammar-highlight">ist</span>.</em></li>
          <li><strong>wenn (Bedingung):</strong><br> 
          <em><span class="grammar-highlight">Wenn</span> das Wetter schön <span class="grammar-highlight">ist</span>, gehe ich spazieren.</em></li>
        </ul>
        <p><em>Wichtig:</em> Wenn der Satz mit dem Nebensatz beginnt (wie bei "wenn"), steht das Verb des Hauptsatzes direkt danach auf Position 1! (<em>...ist, <strong>gehe</strong> ich...</em>)</p>
      `
    },
    wechselpraep: {
      title: "Wechselpräpositionen",
      body: `
        <p>Diese Präpositionen können mit Dativ oder Akkusativ stehen: <br>
        <strong>in, an, auf, neben, hinter, über, unter, vor, zwischen</strong>.</p>
        <p><strong>1. Akkusativ (Wohin?) – Bewegung/Aktion</strong></p>
        <ul>
          <li>Aktion: Ich bewege etwas von A nach B.</li>
          <li><em>Ich stelle die Tasse <span class="grammar-highlight">auf den</span> Tisch.</em></li>
        </ul>
        <p><strong>2. Dativ (Wo?) – Position/Stillstand</strong></p>
        <ul>
          <li>Position: Etwas ist schon dort, es bewegt sich nicht.</li>
          <li><em>Die Tasse steht <span class="grammar-highlight">auf dem</span> Tisch.</em></li>
        </ul>
      `
    },
    komparativ: {
      title: "Komparativ & Superlativ",
      body: `
        <p>Wir benutzen dies, um Dinge oder Personen zu vergleichen.</p>
        <table class="grammar-table">
          <thead>
            <tr>
              <th>Grundform</th>
              <th>Komparativ (+er)</th>
              <th>Superlativ (am ...-sten)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>schnell</td><td>schnell<span class="grammar-highlight">er</span></td><td><span class="grammar-highlight">am</span> schnell<span class="grammar-highlight">sten</span></td></tr>
            <tr><td>alt (Umlaut)</td><td><span class="grammar-highlight">ä</span>lt<span class="grammar-highlight">er</span></td><td><span class="grammar-highlight">am ä</span>lte<span class="grammar-highlight">sten</span></td></tr>
            <tr><td>gut (Irregulär)</td><td><span class="grammar-highlight">besser</span></td><td><span class="grammar-highlight">am besten</span></td></tr>
            <tr><td>viel (Irregulär)</td><td><span class="grammar-highlight">mehr</span></td><td><span class="grammar-highlight">am meisten</span></td></tr>
          </tbody>
        </table>
        <p><strong>Beispiele:</strong></p>
        <ul>
          <li>Gleich: <em>Maria ist so groß <span class="grammar-highlight">wie</span> Anna.</em></li>
          <li>Unterschied: <em>Peter ist größ<span class="grammar-highlight">er als</span> Maria.</em></li>
          <li>Höchste Stufe: <em>Tom ist <span class="grammar-highlight">am größten</span>.</em></li>
        </ul>
      `
    }
  };

  // --- TTS Mapping (Language Codes) ---
  const ttsLanguageCodes = {
    'English': 'en-US', 'Arabic': 'ar-SA', 'Russian': 'ru-RU', 'Dari': 'fa-AF', 
    'Farsi': 'fa-IR', 'Amharic': 'am-ET', 'Tigrinya': 'ti-ET', 'Spanish': 'es-ES',
    'French': 'fr-FR', 'Turkish': 'tr-TR', 'Ukrainian': 'uk-UA'
  };

  function playAudio(text, langCode) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode || 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }

  // --- Language Checkboxes Setup ---
  const availableLanguages = [
    { name: 'English', checked: true }, { name: 'Arabic', checked: true },
    { name: 'Russian', checked: true }, { name: 'Dari', checked: true },
    { name: 'Farsi', checked: true }, { name: 'Amharic', checked: true },
    { name: 'Tigrinya', checked: true }, { name: 'Spanish', checked: false },
    { name: 'French', checked: false }, { name: 'Turkish', checked: false },
    { name: 'Ukrainian', checked: true }
  ];

  availableLanguages.forEach(lang => {
    const label = document.createElement('label');
    label.className = 'checkbox-label';
    label.innerHTML = `<input type="checkbox" value="${lang.name}" ${lang.checked ? 'checked' : ''}> ${lang.name}`;
    langCheckboxes.appendChild(label);
  });

  // --- Dropdown Toggle Logic ---
  langMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle('hidden');
    grammarDropdown.classList.add('hidden'); // Close the other
  });

  grammarMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    grammarDropdown.classList.toggle('hidden');
    langDropdown.classList.add('hidden'); // Close the other
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!langDropdown.contains(e.target) && e.target !== langMenuBtn) {
      langDropdown.classList.add('hidden');
    }
    if (!grammarDropdown.contains(e.target) && e.target !== grammarMenuBtn) {
      grammarDropdown.classList.add('hidden');
    }
  });

  // --- Grammar Modal Logic ---
  const grammarItems = document.querySelectorAll('.grammar-item');
  grammarItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const topicKey = e.target.getAttribute('data-topic');
      const content = grammarContent[topicKey];
      
      if (content) {
        modalTitle.innerText = content.title;
        modalBody.innerHTML = content.body;
        grammarModal.classList.remove('hidden');
        setTimeout(() => grammarModal.classList.add('active'), 10);
      }
      grammarDropdown.classList.add('hidden');
    });
  });

  function closeGrammarModal() {
    grammarModal.classList.remove('active');
    setTimeout(() => grammarModal.classList.add('hidden'), 300); // Wait for transition
  }

  closeModalBtn.addEventListener('click', closeGrammarModal);
  grammarModal.addEventListener('click', (e) => {
    if (e.target === grammarModal) closeGrammarModal(); // Close if clicking outside the white box
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGrammarModal();
  });


  function getSelectedLanguages() {
    return Array.from(langCheckboxes.querySelectorAll('input:checked')).map(cb => cb.value);
  }

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

  // FIXED: Now triggers the translation search immediately!
  suggestionText.addEventListener('click', () => {
    germanInput.value = suggestionText.textContent;
    germanInput.style.height = 'auto'; 
    umlautSuggestion.classList.add('hidden');
    translateBtn.click(); // Trigger search!
  });

  // --- Translation Logic ---
  translateBtn.addEventListener('click', async () => {
    const text = germanInput.value.trim();
    const selectedLangs = getSelectedLanguages();
    if (!text || selectedLangs.length === 0) return;
    
    translateBtn.disabled = true;
    translateBtn.style.opacity = '0.6';
    germanSpeakBtn.classList.add('hidden'); 

    wordDetailsArea.style.display = 'block';
    wordDetailsArea.classList.remove('slide-up');
    
    document.getElementById('germanWordTitle').innerHTML = '<div class="shimmer" style="height: 2.2rem; width: 50%; border-radius: 4px;"></div>';
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
      
      // Dynamic Theme Switching based on Article
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
    const translatedWord = data.meanings[0];
    const ttsCode = ttsLanguageCodes[data.language];

    card.innerHTML = `
      <div class="card-header"><span class="lang-title">${data.language}</span></div>
      <div class="card-body" ${textDirection}>
        <div class="word-row">
          <p class="translated-word">${translatedWord} ${meaningsHtml}</p>
          <button class="speak-btn card-speak-btn" aria-label="Aussprache anhören" title="Aussprache anhören">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
          </button>
        </div>
        <p class="example-sentence">${data.example}</p>
      </div>
    `;

    const speakBtn = card.querySelector('.card-speak-btn');
    speakBtn.addEventListener('click', () => playAudio(translatedWord, ttsCode));
    return card;
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const BACKEND_URL = 'https://my-vocab-api-5lb7.onrender.com';

  const translateBtn = document.getElementById('translateBtn');
  const germanInput = document.getElementById('germanInput');
  const translationGrid = document.getElementById('translationGrid');
  const wordDetailsArea = document.getElementById('wordDetailsArea');
  
  const targetLanguages = ['English', 'Arabic', 'Russian', 'Dari', 'Farsi', 'Amharic', 'Tigrinya']; 

  createLoadingScreen();

  fetch(`${BACKEND_URL}/api/wakeup`)
    .then(response => {
      if (response.ok) {
        removeLoadingScreen();
        console.log("☁️ Server is awake!");
      } else {
        showLoadingError();
      }
    })
    .catch(error => {
      console.error("Server ping failed:", error);
      showLoadingError();
    });

  translateBtn.addEventListener('click', async () => {
    const text = germanInput.value.trim();
    if (!text) return;

    // 1. Show Shimmer Loading States
    wordDetailsArea.style.display = 'flex';
    wordDetailsArea.classList.remove('slide-up');
    
    // Reset details area for loading
    document.getElementById('germanWordTitle').innerHTML = '<div class="shimmer" style="height: 2rem; width: 50%; border-radius: 4px;"></div>';
    document.getElementById('grammarTips').innerHTML = '';
    document.getElementById('germanExample').innerHTML = '<div class="shimmer" style="height: 1rem; width: 80%; border-radius: 4px; margin-top: 10px;"></div>';
    
    document.getElementById('centralImage').style.display = 'none';
    document.getElementById('mainImageShimmer').style.display = 'block';

    translationGrid.innerHTML = '';
    targetLanguages.forEach(() => {
      const skeleton = document.createElement('div');
      skeleton.className = 'translation-card shimmer';
      skeleton.innerHTML = '<div style="height: 150px;"></div>';
      translationGrid.appendChild(skeleton);
    });

    try {
      // 2. Fetch Text Translations & Grammar
      const textRes = await fetch(`${BACKEND_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: text })
      });

      if (!textRes.ok) throw new Error("Translation request failed");
      const data = await textRes.json();
      
      // 3. Render Central Description Area
      const germanData = data.german;
      
      let titleHtml = germanData.word;
      let grammarHtml = '';

      if (germanData.partOfSpeech === 'noun' && germanData.article) {
          titleHtml = `<span class="article">${germanData.article}</span> ${germanData.word}`;
          if (germanData.pluralTip) {
              grammarHtml = `<span class="tip-label">Plural:</span> <span class="plural-tip">${germanData.pluralTip}</span>`;
          }
      } else if (germanData.partOfSpeech === 'verb' && germanData.conjugationTips) {
          grammarHtml = `<span class="tip-label">Conjugation:</span> <span class="conj-tip">${germanData.conjugationTips}</span>`;
      }

      document.getElementById('germanWordTitle').innerHTML = titleHtml;
      document.getElementById('grammarTips').innerHTML = grammarHtml;
      document.getElementById('germanExample').innerText = `"${germanData.example}"`;
      
      // Apply entrance animation
      wordDetailsArea.classList.add('slide-up');

      // 4. Render Text Cards (No Images inside them anymore)
      translationGrid.innerHTML = ''; 
      data.translations.forEach((langData, index) => {
        const card = createTranslationCard(langData);
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
        translationGrid.appendChild(card);
      });

      // 5. Fetch Image for Central Area
      const imgRes = await fetch(`${BACKEND_URL}/api/image?word=${encodeURIComponent(germanData.word)}`);
      if (!imgRes.ok) throw new Error("Image request failed");
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
      translationGrid.innerHTML = `<p style="color: red; text-align: center; width: 100%;">Something went wrong. Check console.</p>`;
    }
  });

  // --- UI RENDERER (Cleaned up, no images) ---
  function createTranslationCard(data) {
    const card = document.createElement('div');
    card.className = 'translation-card';
    
    const isRTL = ['Arabic', 'Dari', 'Farsi'].includes(data.language);
    const textDirection = isRTL ? 'dir="rtl" style="text-align: right;"' : '';
    const meaningsHtml = data.meanings.length > 1 
      ? `<p class="multiple-meanings">(Also: ${data.meanings.slice(1).join(', ')})</p>` : '';

    card.innerHTML = `
      <h3 class="lang-title">${data.language}</h3>
      <div ${textDirection}>
        <p class="translated-word">${data.meanings[0]}</p>
        ${meaningsHtml}
        <p class="example-sentence">${data.example}</p>
      </div>
    `;
    return card;
  }

  // --- LOADING SCREENS ---
  function createLoadingScreen() {
    const overlay = document.createElement('div');
    overlay.id = 'server-wakeup-overlay';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(251, 253, 253, 0.95); z-index: 9999;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-family: 'Inter', sans-serif; color: #191c1c; text-align: center; padding: 20px;
    `;
    overlay.innerHTML = `
      <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
      <div style="width: 50px; height: 50px; border: 5px solid #dce4e4; border-top-color: #006a6a; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
      <h2 style="margin: 0 0 10px 0;">Waking up the server...</h2>
      <p style="color: #6f7979; max-width: 400px; margin: 0; line-height: 1.5;">
        Because this app uses a free backend, the server goes to sleep when inactive. 
        Please wait up to 50 seconds while it boots up for you.
      </p>
    `;
    document.body.appendChild(overlay);
  }

  function removeLoadingScreen() {
    const overlay = document.getElementById('server-wakeup-overlay');
    if (overlay) {
      overlay.style.transition = 'opacity 0.5s ease';
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    }
  }

  function showLoadingError() {
    const overlay = document.getElementById('server-wakeup-overlay');
    if (overlay) {
       overlay.innerHTML = `
         <h2 style="color: #ba1a1a; margin: 0 0 10px 0;">Connection Failed</h2>
         <p style="color: #6f7979; max-width: 400px; margin: 0; line-height: 1.5;">
           Could not connect to the backend server.
         </p>
         <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 24px; background: #006a6a; color: white; border: none; border-radius: 20px; font-size: 1.2rem; cursor: pointer;">Try Again</button>
       `;
    }
  }
});
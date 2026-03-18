document.addEventListener('DOMContentLoaded', () => {
  // ⚠️ IMPORTANT: Paste your Render URL here (no trailing slash)
  const BACKEND_URL = 'https://my-vocab-api-5lb7.onrender.com';

  const translateBtn = document.getElementById('translateBtn');
  const germanInput = document.getElementById('germanInput');
  const translationGrid = document.getElementById('translationGrid');
  const targetLanguages = ['English', 'Arabic', 'Russian', 'Dari', 'Farsi', 'Amharic', 'Tigrinya']; 

  // --- WAKE UP & SPINNER LOGIC ---
  createLoadingScreen(); // Injects the visual spinner into the page

  // Ping the server. Once it replies, hide the spinner.
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

  // --- TRANSLATION LOGIC ---
  translateBtn.addEventListener('click', async () => {
    const text = germanInput.value.trim();
    if (!text) return;

    // 1. Show Shimmer Loading Cards
    translationGrid.innerHTML = '';
    targetLanguages.forEach(() => {
      const skeleton = document.createElement('div');
      skeleton.className = 'translation-card shimmer';
      skeleton.innerHTML = '<div style="height: 200px;"></div>';
      translationGrid.appendChild(skeleton);
    });

    try {
      // 2. Fetch Text Translations
      const textRes = await fetch(`${BACKEND_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: text })
      });

      if (!textRes.ok) throw new Error("Translation request failed");
      const translations = await textRes.json();
      
      // 3. Render Text Cards
      translationGrid.innerHTML = ''; 
      translations.forEach(langData => {
        translationGrid.appendChild(createTranslationCard(langData));
      });

      // 4. Fetch Images
      const imgRes = await fetch(`${BACKEND_URL}/api/image?word=${encodeURIComponent(text)}`);
      if (!imgRes.ok) throw new Error("Image request failed");
      const imgData = await imgRes.json();

      // 5. Inject Images
      if (imgData.imageUrl) {
        document.querySelectorAll('.image-container').forEach(container => {
          const img = container.querySelector('.dynamic-image');
          const shimmer = container.querySelector('.image-shimmer');
          img.src = imgData.imageUrl;
          img.style.display = 'block';
          shimmer.style.display = 'none'; 
        });
      }

    } catch (error) {
      console.error("Error:", error);
      translationGrid.innerHTML = `<p style="color: red; text-align: center;">Something went wrong. Check console.</p>`;
    }
  });

  // --- UI RENDERER ---
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
      <div class="image-container" style="margin-top: 1rem; border-radius: 12px; overflow: hidden; position: relative; height: 120px; width: 100%;">
         <div class="image-shimmer shimmer" style="width: 100%; height: 100%;"></div>
         <img class="dynamic-image" src="" alt="Visual for ${data.meanings[0]}" style="display: none; width: 100%; height: 100%; object-fit: cover;">
      </div>
    `;
    return card;
  }

  // --- DYNAMIC LOADING SCREEN BUILDER ---
  function createLoadingScreen() {
    const overlay = document.createElement('div');
    overlay.id = 'server-wakeup-overlay';
    // Style the overlay using Material 3 Surface coloring
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(251, 253, 253, 0.95); z-index: 9999;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-family: system-ui, sans-serif; color: #191c1c; text-align: center; padding: 20px;
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
    // Fade out effect
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
           Could not connect to the backend server. Make sure your Render deployment is live and your BACKEND_URL is correct.
         </p>
         <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 24px; background: #006a6a; color: white; border: none; border-radius: 20px; font-size: 1rem; cursor: pointer;">Try Again</button>
       `;
    }
  }
});
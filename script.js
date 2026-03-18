document.addEventListener('DOMContentLoaded', () => {
  const BACKEND_URL = 'https://my-vocab-api-5lb7.onrender.com';
  const translateBtn = document.getElementById('translateBtn');
  const germanInput = document.getElementById('germanInput');
  const translationGrid = document.getElementById('translationGrid');
  const mainImgContainer = document.getElementById('mainImageContainer');
  const mainImg = document.getElementById('mainImage');
  const grammarDiv = document.getElementById('grammarDescription');

  createLoadingScreen();

  fetch(`${BACKEND_URL}/api/wakeup`).then(r => r.ok && removeLoadingScreen());

  translateBtn.addEventListener('click', async () => {
    const text = germanInput.value.trim();
    if (!text) return;

    // Reset UI
    translationGrid.innerHTML = '';
    grammarDiv.style.display = 'none';
    mainImgContainer.style.display = 'block';
    mainImg.style.display = 'none';

    try {
      // 1. Fetch Data
      const res = await fetch(`${BACKEND_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: text })
      });
      const data = await res.json();
      
      // 2. Render Translations
      data.translations.forEach(t => translationGrid.appendChild(createSimpleCard(t)));

      // 3. Render Grammar & Description
      renderGrammarSection(data.grammar, text);

      // 4. Central Image Fetch
      const imgRes = await fetch(`${BACKEND_URL}/api/image?word=${encodeURIComponent(text)}`);
      const imgData = await imgRes.json();
      if (imgData.imageUrl) {
        mainImg.src = imgData.imageUrl;
        mainImg.style.display = 'block';
        mainImgContainer.querySelector('.image-shimmer').style.display = 'none';
      }

    } catch (e) { console.error(e); }
  });

  function renderGrammarSection(grammar, word) {
    grammarDiv.style.display = 'block';
    let html = `<p><span class="grammar-label">Example:</span> "${grammar.example}"</p>`;

    if (grammar.type === 'noun') {
      html = `<p><span class="grammar-label">Article:</span> ${grammar.article} ${word}</p>` + html;
      html += `<p><span class="grammar-label">Plural:</span> <span class="plural-tip">${grammar.plural}</span></p>`;
    } else if (grammar.type === 'verb') {
      html += `<p><span class="grammar-label">Conjugation:</span> <span class="conj-tip">${grammar.conjugation}</span></p>`;
    }
    grammarDiv.innerHTML = html;
  }

  function createSimpleCard(data) {
    const card = document.createElement('div');
    card.className = 'translation-card';
    card.innerHTML = `
      <div class="lang-title">${data.language}</div>
      <div class="translated-word">${data.meanings[0]}</div>
      <div style="font-size: 1.1rem; opacity: 0.8;">${data.example}</div>
    `;
    return card;
  }

  // Reuse existing createLoadingScreen, removeLoadingScreen, etc.
});
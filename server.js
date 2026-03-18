import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const imageCache = new Map();
const translationCache = new Map();

app.get('/', (req, res) => res.status(200).send("Server is running!"));
app.get('/api/wakeup', (req, res) => res.json({ status: "Awake!" }));

// --- NEW: AI SPELLCHECK ROUTE ---
app.post('/api/spellcheck', async (req, res) => {
    const { word } = req.body;
    if (!word || word.length < 3) return res.json({ corrected: null });

    const promptText = `You are a strict German A1/A2 spellchecker. Analyze the user input: "${word}". If it is perfectly spelled (including correct capitalization for nouns and correct umlauts), return exactly the string "PERFECT". If it is misspelled, missing an umlaut, or has the wrong capitalization (e.g., 'mochte' -> 'möchte', 'apfel' -> 'Äpfel', 'haus' -> 'Haus'), return ONLY the corrected word. Do not return any other text, punctuation, or explanation.`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });
        const data = await response.json();
        const result = data.candidates[0].content.parts[0].text.trim();
        
        // If the AI says it's perfect, or it just returned the exact same word, return null
        if (result === "PERFECT" || result.toLowerCase() === word.toLowerCase()) {
            res.json({ corrected: null });
        } else {
            res.json({ corrected: result });
        }
    } catch (err) {
        console.error("Spellcheck Error:", err);
        res.json({ corrected: null });
    }
});

// --- MAIN TRANSLATION ROUTE ---
app.post('/api/translate', async (req, res) => {
    const { word, languages } = req.body;
    if (!word) return res.status(400).json({ error: "Word required" });
    
    const targetLangs = languages && languages.length > 0 ? languages : ['English'];
    
    // Check Cache first to save money and increase speed!
    const cacheKey = `${word.toLowerCase()}-${targetLangs.join(',')}`;
    if (translationCache.has(cacheKey)) {
        return res.json(translationCache.get(cacheKey));
    }

    const langPromptStr = targetLangs.map(l => 
      `{"language":"${l}","meanings":["m1","m2"],"example":"Translated sentence"}`
    ).join(',\n        ');

    const promptText = `Analyze the German word "${word}". Return STRICTLY a JSON object with this exact structure, nothing else:
    {
      "german": {
        "word": "the base word",
        "partOfSpeech": "noun" or "verb" or "other",
        "article": "der/die/das" (only if noun, otherwise null),
        "pluralTip": "e.g., -s, -en, -er" (only if noun, otherwise null),
        "conjugationTips": "e.g., ich gehe, du gehst, er/sie/es geht" (only if verb, otherwise null),
        "example": "A simple A1/A2 German example sentence."
      },
      "translations": [
        ${langPromptStr}
      ]
    }`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });
        const data = await response.json();
        const parsedData = JSON.parse(data.candidates[0].content.parts[0].text);
        
        // Save to cache
        translationCache.set(cacheKey, parsedData);
        res.json(parsedData);
    } catch (err) {
        console.error("Gemini Error:", err);
        res.status(500).json({ error: "Translation failed" });
    }
});

// --- IMAGE ROUTE ---
app.get('/api/image', async (req, res) => {
    const { word } = req.query;
    if (!word) return res.status(400).json({ error: "Word required" });

    if (imageCache.has(word)) return res.json(imageCache.get(word));

    const getFallback = (w) => ({ imageUrl: `https://placehold.co/600x400/e0f2f1/006a6a?text=${encodeURIComponent(w)}` });

    if (!process.env.UNSPLASH_ACCESS_KEY) return res.json(getFallback(word));

    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(word)}&per_page=1`,
            { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
        );
        if (!response.ok) throw new Error("Unsplash API Error");
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const imageData = { imageUrl: data.results[0].urls.small };
            imageCache.set(word, imageData);
            return res.json(imageData);
        } else {
            return res.json(getFallback(word));
        }
    } catch (err) {
        console.error("Image Error:", err);
        res.json(getFallback(word));
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());
const path = require('path');
app.use(express.static(__dirname));

const imageCache = new Map();
const translationCache = new Map();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/api/wakeup', (req, res) => res.json({ status: "Awake!" }));

// --- AI SPELLCHECK ROUTE (Powered by Groq) ---
app.post('/api/spellcheck', async (req, res) => {
    const { word } = req.body;
    if (!word || word.length < 3) return res.json({ corrected: null });

    const promptText = `You are a strict German A1/A2 spellchecker. Analyze the user input: "${word}". If it is perfectly spelled (including correct capitalization for nouns and correct umlauts), return exactly the string "PERFECT". If it is misspelled, missing an umlaut, or has the wrong capitalization (e.g., 'mochte' -> 'möchte', 'apfel' -> 'Äpfel', 'haus' -> 'Haus'), return ONLY the corrected word. Do not return any other text, punctuation, or explanation.`;

    try {
        const url = 'https://api.groq.com/openai/v1/chat/completions';
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // Lightning fast, highly accurate model
                messages: [{ role: "user", content: promptText }],
                temperature: 0 // Strict, no creativity needed for spellcheck
            })
        });
        
        const data = await response.json();
        const result = data.choices[0].message.content.trim();
        
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

// --- MAIN TRANSLATION ROUTE (Powered by Groq) ---
app.post('/api/translate', async (req, res) => {
    const { word, languages } = req.body;
    if (!word) return res.status(400).json({ error: "Word required" });
    
    const targetLangs = languages && languages.length > 0 ? languages : ['English'];
    
    // Check Cache first to save API calls and make it instant!
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
        "word": "The correctly spelled singular base form of the word (e.g., if input is 'Äpfel' return 'Apfel'). Pay strict attention to correct umlauts!",
        "partOfSpeech": "noun" or "verb" or "other",
        "article": "der/die/das" (The correct article for the SINGULAR noun, e.g., 'der' for 'Apfel'. null if not a noun),
        "pluralTip": "The correct plural form including umlauts if applicable (e.g., 'die Äpfel'). null if not a noun",
        "conjugationTips": "e.g., ich gehe, du gehst, er/sie/es geht (only if verb, otherwise null)",
        "example": "A simple A1/A2 German example sentence."
      },
      "translations": [
        ${langPromptStr}
      ]
    }`;

    try {
        const url = 'https://api.groq.com/openai/v1/chat/completions';
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: promptText }],
                response_format: { type: "json_object" }, // Forces Groq to return perfect JSON
                temperature: 0.1
            })
        });
        
        const data = await response.json();
        const parsedData = JSON.parse(data.choices[0].message.content);
        
        // Save to cache for the next time this word is searched
        translationCache.set(cacheKey, parsedData);
        res.json(parsedData);
    } catch (err) {
        console.error("Groq Error:", err);
        res.status(500).json({ error: "Translation failed" });
    }
});

// --- IMAGE ROUTE (Unsplash - Unchanged) ---
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

// --- VERCEL EXPORT ---
// We only listen on a port if we are running locally. 
// Otherwise, we export the app for Vercel's serverless environment.
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 10000;
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Local server on port ${PORT}`));
}

export default app;
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { Redis } from '@upstash/redis'; // NEW: Imported Redis

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve the frontend files
app.use(express.static(__dirname));

// NEW: Initialize Global Redis Cache (Replaces local Map caches)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

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
    const { word } = req.body;
    if (!word) return res.status(400).json({ error: "Word required" });
    
    // ALWAYS force translation to all 13 languages to maximize cache hit rate!
    const allLanguages = [
        'English', 'Arabic', 'Russian', 'Dari', 'Farsi', 'Amharic', 
        'Tigrinya', 'Spanish', 'French', 'Turkish', 'Ukrainian', 
        'Somali', 'Armenian'
    ];
    
    // NEW: Check Global Redis Cache using ONLY the word as the key
    const cacheKey = `trans:all:${word.toLowerCase()}`;
    try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log("Serving ALL translations from Global Redis Cache!");
            return res.json(cachedData);
        }
    } catch (cacheErr) {
        console.error("Redis Cache Read Error:", cacheErr);
    }

    const langPromptStr = allLanguages.map(l => 
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
    }
    IMPORTANT: For "Dari" and "Farsi", you must provide the specific regional vocabulary used in Afghanistan (Dari) versus Iran (Farsi) if a difference exists.`;

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
                response_format: { type: "json_object" }, 
                temperature: 0.1
            })
        });
        
        const data = await response.json();
        const parsedData = JSON.parse(data.choices[0].message.content);
        
        // Save to Global Redis Cache for ALL future users
        try {
            await redis.set(cacheKey, parsedData);
        } catch (cacheSetErr) {
            console.error("Redis Cache Write Error:", cacheSetErr);
        }

        res.json(parsedData);
    } catch (err) {
        console.error("Groq Error:", err);
        res.status(500).json({ error: "Translation failed" });
    }
});

// --- AI STORY GENERATOR ROUTE (Powered by Groq) ---
app.get('/api/generate-reading', async (req, res) => {
    try {
        // KEPT YOUR EXACT AWESOME 3-STORY PROMPT:
        const promptText = `Schreibe DREI kurze, sehr kreative und völlig unterschiedliche Lesetexte (Niveau A1-A2) auf Deutsch.
        
        WICHTIG: Erfinde jedes Mal komplett NEUE Geschichten! Wähle für jeden Text ein anderes, zufälliges Thema aus dieser riesigen Auswahl (oder erfinde eigene verrückte Themen): 
        - Verrückte Haustiere oder sprechende Tiere
        - Lustige Missgeschicke im Alltag
        - Eine Reise in die Zukunft oder Zeitreisen
        - Mysteriöse Entdeckungen im Wald oder auf dem Dachboden
        - Ungewöhnliche Berufe (z.B. UFO-Forscher, Schokoladentester)
        - Überleben in der Natur
        - Kochen von magischen oder exotischen Gerichten
        - Ein Leben auf einem anderen Planeten
        - Spannende Kriminalfälle für Anfänger
        - Geistergeschichten oder lustige Monster
        
        Vermeide langweilige Standard-Texte. Die Texte sollen humorvoll, spannend oder überraschend sein (ca. 5-7 Sätze pro Text).
        
        Antworte NUR mit einem gültigen JSON-Objekt, das ein Array namens "stories" enthält.
        Format:
        {
          "stories": [
            {
              "title": "Titel des Textes 1",
              "fokus": "Fokus: [Grammatik oder Vokabel Thema]",
              "text": "Der deutsche Text 1 (ca. 5-7 Sätze)..."
            },
            {
              "title": "Titel des Textes 2",
              "fokus": "...",
              "text": "..."
            },
            {
              "title": "Titel des Textes 3",
              "fokus": "...",
              "text": "..."
            }
          ]
        }`;

        const url = 'https://api.groq.com/openai/v1/chat/completions';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "Du bist ein extrem kreativer Deutschlehrer. Output ONLY valid JSON. Generiere niemals dieselbe Geschichte zweimal." },
                    { role: "user", content: promptText }
                ],
                response_format: { type: "json_object" }, 
                temperature: 0.9 
            })
        });

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.choices[0].message.content.trim();
        const jsonResult = JSON.parse(rawText);

        res.json(jsonResult);
    } catch (error) {
        console.error("Groq Passage generation failed:", error);
        res.status(500).json({ error: "Failed to generate reading passage" });
    }
});

// --- IMAGE ROUTE (Unsplash - Now with Redis) ---
app.get('/api/image', async (req, res) => {
    const { word } = req.query;
    if (!word) return res.status(400).json({ error: "Word required" });

    // NEW: Check Global Redis Cache
    const imgCacheKey = `img:${word.toLowerCase()}`;
    try {
        const cachedImg = await redis.get(imgCacheKey);
        if (cachedImg) return res.json(cachedImg);
    } catch (e) { console.error(e); }

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
            
            // NEW: Save image result to Redis
            try { await redis.set(imgCacheKey, imageData); } catch (e) {}
            
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
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 10000;
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Local server on port ${PORT}`));
}

export default app;
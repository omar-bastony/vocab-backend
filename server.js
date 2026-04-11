import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { Redis } from '@upstash/redis';

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve the frontend files
app.use(express.static(__dirname));

// Initialize Global Redis Cache
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/wakeup', (req, res) => res.json({ status: "Awake!" }));

// =======================================================================
// 1. AI SPELLCHECK ROUTE (Database First, Gemini Fallback)
// =======================================================================
app.post('/api/spellcheck', async (req, res) => {
    const { word } = req.body;
    if (!word || word.length < 2) return res.json({ corrected: null });

    const cleanWord = word.trim();
    
    // If the input contains a space, it's a sentence. Abort spellcheck!
    if (cleanWord.includes(" ")) {
        return res.json({ corrected: null });
    }

    const cacheKey = `trans:all:${cleanWord.toLowerCase()}`;

    // FAST PATH: Check Global Redis Cache First
    try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData && cachedData.german && cachedData.german.word) {
            const correctSpelling = cachedData.german.word;
            if (correctSpelling.toLowerCase() !== cleanWord.toLowerCase()) {
                return res.json({ corrected: correctSpelling });
            } else {
                return res.json({ corrected: null }); 
            }
        }
    } catch (cacheErr) {
        console.error("Redis Spellcheck Read Error:", cacheErr);
    }

    // FALLBACK PATH: Ask Gemini AI
    const promptText = `You are a strict German A1/A2 spellchecker. Analyze the user input: "${cleanWord}". If it is perfectly spelled (IGNORING capitalization, but strictly enforcing umlauts), return exactly the string "PERFECT". If it is genuinely misspelled or missing an umlaut (e.g., 'mochte' -> 'möchte', 'apfel' -> 'Äpfel'), return ONLY the corrected word. Do NOT correct a word if the only mistake is a lowercase first letter.`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { temperature: 0 }
            })
        });
        
        if (!response.ok) return res.json({ corrected: null });
        
        const data = await response.json();
        const result = data.candidates[0].content.parts[0].text.trim();
        
        // UI SAFETY CATCH
        if (result.length > 25 || result.includes(" ")) {
            return res.json({ corrected: null });
        }

        if (result === "PERFECT" || result.toLowerCase() === cleanWord.toLowerCase()) {
            res.json({ corrected: null });
        } else {
            res.json({ corrected: result });
        }
    } catch (err) {
        console.error("Spellcheck Error:", err);
        res.json({ corrected: null });
    }
});

// =======================================================================
// 2. MAIN TRANSLATION ROUTE (Gemini Powered)
// =======================================================================
app.post('/api/translate', async (req, res) => {
    const { word } = req.body;
    if (!word) return res.status(400).json({ error: "Word required" });
    
    const cleanWord = word.trim();

    // Prevent sentences and error messages from being translated/cached!
    if (cleanWord.length > 45 || cleanWord.split(' ').length > 4) {
        return res.status(400).json({ error: "Input too long. Please enter a single word or short phrase." });
    }
    
    const allLanguages = [
        'English', 'Arabic', 'Russian', 'Dari', 'Farsi', 'Amharic', 
        'Tigrinya', 'Spanish', 'French', 'Turkish', 'Ukrainian', 
        'Somali', 'Armenian'
    ];
    
    const cacheKey = `trans:all:${cleanWord.toLowerCase()}`;
    
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
      "safeImageSearchQuery": "A 2-3 word highly specific, SAFE, and educational English search phrase for Unsplash.",
      "translations": [
        ${langPromptStr}
      ]
    }
    IMPORTANT: For "Dari" and "Farsi", you must provide the specific regional vocabulary used in Afghanistan (Dari) versus Iran (Farsi) if a difference exists.`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { 
                    temperature: 0.1,
                    responseMimeType: "application/json" 
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Strip markdown blocks if Gemini accidentally included them
        let rawText = data.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        const parsedData = JSON.parse(rawText);
        
        try { await redis.set(cacheKey, parsedData); } catch (e) {}

        res.json(parsedData);
    } catch (err) {
        console.error("Gemini Translation Error:", err);
        res.status(500).json({ error: "Translation failed" });
    }
});

// =======================================================================
// 3. SENTENCE ANALYSIS ROUTE (Gemini Powered)
// =======================================================================
app.post('/api/analyze-sentence', async (req, res) => {
    const { sentence } = req.body;
    if (!sentence) return res.status(400).json({ error: "Sentence required" });
    
    const cleanSentence = sentence.trim();

    if (cleanSentence.length > 200) {
        return res.status(400).json({ error: "Sentence too long. Please enter a shorter sentence." });
    }

    const cacheKey = `sentence:v2:${cleanSentence.toLowerCase()}`;

    try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) return res.json(cachedData);
    } catch (cacheErr) {
        console.error("Redis Cache Read Error:", cacheErr);
    }

    // FIX: Bulletproof JSON structure with explicit formatting rules to prevent JSON.parse crashes
    const promptText = `Act as a strict, expert German grammar teacher. Analyze this text: "${cleanSentence}".
    First, aggressively check for and FIX all spelling, capitalization, AND GRAMMAR errors. 
    CRITICAL: Pay strict attention to verb government (Kasusrektion). For example, verbs like 'helfen', 'danken', and 'gefallen' strictly require the DATIVE case. You MUST fix any wrong cases, adjective endings, or conjugations.
    
    Return STRICTLY a JSON object with this exact structure, nothing else:
    {
      "originalSentence": "${cleanSentence}",
      "errorAnalysis": ["Schritt 1: Welches Verb?", "Schritt 2: Welcher Kasus?", "Schritt 3: Fehler im Original?"],
      "wasCorrected": true,
      "correctedSentence": "The grammatically perfect German sentence based on your analysis.",
      "fullTranslations": {
        "English": "...", "Arabic": "...", "Russian": "...", "Dari": "...", "Farsi": "...", 
        "Amharic": "...", "Tigrinya": "...", "Spanish": "...", "French": "...", "Turkish": "...", 
        "Ukrainian": "...", "Somali": "...", "Armenian": "..."
      },
      "grammarExplanation": "Eine einfache Erklärung der Hauptgrammatikregel in diesem Satz auf DEUTSCH. Erwähne, wenn ein Verb einen bestimmten Kasus verlangt.",
      "wordBreakdown": [
        {
          "word": "The exact word as it appears in the CORRECTED sentence",
          "baseForm": "The dictionary form of the word",
          "pos": "Choose exactly one: noun, verb, article, pronoun, adjective, preposition, or other",
          "englishMeaning": "Direct English translation of this specific word in context",
          "grammarTip": "Ein winziger Grammatik-Hinweis auf DEUTSCH (z.B. '1. Person Singular', 'Dativ')."
        }
      ]
    }
    
    CRITICAL RULES FOR JSON VALIDITY: 
    1. Do NOT use double quotes (") inside any of your text values. Use single quotes (') instead.
    2. Do NOT use raw line breaks (\\n) within strings.
    3. 'errorAnalysis' MUST be an array of short strings representing your step-by-step logic.`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { 
                    temperature: 0.1,
                    responseMimeType: "application/json" 
                }
            })
        });
        
        if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);

        const data = await response.json();
        
        // Strip markdown blocks if Gemini accidentally included them
        let rawText = data.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        const parsedData = JSON.parse(rawText);
        
        try { await redis.set(cacheKey, parsedData); } catch (e) {}

        res.json(parsedData);
    } catch (err) {
        // This will now log the exact error to your terminal if it ever fails again
        console.error("Gemini Sentence Error Breakdown:", err);
        res.status(500).json({ error: "Sentence analysis failed" });
    }
});

// =======================================================================
// 4. AI STORY GENERATOR ROUTE (Gemini Powered)
// =======================================================================
app.get('/api/generate-reading', async (req, res) => {
    try {
        const promptText = `Du bist ein extrem kreativer Deutschlehrer. Output ONLY valid JSON. Generiere niemals dieselbe Geschichte zweimal.
        
        Schreibe DREI kurze, sehr kreative und völlig unterschiedliche Lesetexte (Niveau A1-A2) auf Deutsch.
        WICHTIG: Erfinde jedes Mal komplett NEUE Geschichten! Wähle für jeden Text ein anderes, zufälliges Thema aus dieser riesigen Auswahl: 
        - Verrückte Haustiere oder sprechende Tiere
        - Lustige Missgeschicke im Alltag
        - Eine Reise in die Zukunft oder Zeitreisen
        - Mysteriöse Entdeckungen
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

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { 
                    temperature: 0.9,
                    responseMimeType: "application/json" 
                }
            })
        });

        if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

        const data = await response.json();
        
        // Strip markdown formatting from the response
        let rawText = data.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        const jsonResult = JSON.parse(rawText);

        res.json(jsonResult);
    } catch (error) {
        console.error("Gemini Passage generation failed:", error);
        res.status(500).json({ error: "Failed to generate reading passage" });
    }
});

// =======================================================================
// 5. IMAGE ROUTE (Unsplash - Dual-Key Caching)
// =======================================================================
app.get('/api/image', async (req, res) => {
    const { germanWord, searchQuery } = req.query;
    if (!germanWord || !searchQuery) return res.status(400).json({ error: "Missing parameters" });

    const imgCacheKey = `img:${germanWord.toLowerCase()}`;
    try {
        const cachedImg = await redis.get(imgCacheKey);
        if (cachedImg) return res.json(cachedImg);
    } catch (e) { console.error(e); }

    const getFallback = (w) => ({ imageUrl: `./logo.png` });

    if (!process.env.UNSPLASH_ACCESS_KEY) return res.json(getFallback(germanWord));

    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&content_filter=high`,
            { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
        );
        if (!response.ok) throw new Error("Unsplash API Error");
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const imageData = { imageUrl: data.results[0].urls.regular };
            try { await redis.set(imgCacheKey, imageData); } catch (e) {}
            return res.json(imageData);
        } else {
            return res.json(getFallback(germanWord));
        }
    } catch (err) {
        console.error("Image Error:", err);
        res.json(getFallback(germanWord));
    }
});

// --- VERCEL EXPORT ---
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 10000;
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Local server on port ${PORT}`));
}

export default app;
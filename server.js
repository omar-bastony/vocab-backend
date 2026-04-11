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

// --- AI SPELLCHECK ROUTE (Database First, Groq Fallback) ---
app.post('/api/spellcheck', async (req, res) => {
    const { word } = req.body;
    if (!word || word.length < 2) return res.json({ corrected: null });

    const cleanWord = word.trim();
    
    // NEW: If the input contains a space, it's a sentence. Abort spellcheck!
    if (cleanWord.includes(" ")) {
        return res.json({ corrected: null });
    }

    const cacheKey = `trans:all:${cleanWord.toLowerCase()}`;

    // 1. FAST PATH: Check the Global Redis Cache First!
    try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData && cachedData.german && cachedData.german.word) {
            const correctSpelling = cachedData.german.word;
            
            // FIX: Compare them in lowercase! 
            // If the only difference is capital letters, this evaluates to false and ignores it.
            // But if an umlaut is missing ("apfel" vs "äpfel"), it still catches it!
            if (correctSpelling.toLowerCase() !== cleanWord.toLowerCase()) {
                return res.json({ corrected: correctSpelling });
            } else {
                return res.json({ corrected: null }); 
            }
        }
    } catch (cacheErr) {
        console.error("Redis Spellcheck Read Error:", cacheErr);
    }

    // 2. FALLBACK PATH: If not in cache, ask Groq AI
    // FIX: Updated the prompt to explicitly tell the AI to ignore capitalization
    const promptText = `You are a strict German A1/A2 spellchecker. Analyze the user input: "${cleanWord}". If it is perfectly spelled (IGNORING capitalization, but strictly enforcing umlauts), return exactly the string "PERFECT". If it is genuinely misspelled or missing an umlaut (e.g., 'mochte' -> 'möchte', 'apfel' -> 'Äpfel'), return ONLY the corrected word. Do NOT correct a word if the only mistake is a lowercase first letter.`;

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
                temperature: 0 
            })
        });
        
        if (!response.ok) return res.json({ corrected: null });
        
        const data = await response.json();
        const result = data.choices[0].message.content.trim();
        
        // UI SAFETY CATCH: If the AI ignores instructions and writes a long sentence, 
        // or includes spaces, ignore it so it doesn't break the UI.
        if (result.length > 25 || result.includes(" ")) {
            return res.json({ corrected: null });
        }

        // FIX: Double-check the AI's math just in case it ignored our prompt
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

// --- MAIN TRANSLATION ROUTE (Powered by Groq) ---
app.post('/api/translate', async (req, res) => {
    const { word } = req.body;
    if (!word) return res.status(400).json({ error: "Word required" });
    
    const cleanWord = word.trim();

    // NEW SECURITY BOUNCER: Prevent sentences and error messages from being translated/cached!
    // Rejects if the input is longer than 45 characters OR contains more than 3 spaces.
    if (cleanWord.length > 45 || cleanWord.split(' ').length > 4) {
        return res.status(400).json({ error: "Input too long. Please enter a single word or short phrase." });
    }
    
    // ALWAYS force translation to all 13 languages to maximize cache hit rate!
    const allLanguages = [
        'English', 'Arabic', 'Russian', 'Dari', 'Farsi', 'Amharic', 
        'Tigrinya', 'Spanish', 'French', 'Turkish', 'Ukrainian', 
        'Somali', 'Armenian'
    ];
    
    // Check Global Redis Cache using ONLY the word as the key
    const cacheKey = `trans:all:${cleanWord.toLowerCase()}`;
    
    // ... [KEEP THE REST OF YOUR ROUTE EXACTLY AS IT IS] ...
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
      "safeImageSearchQuery": "A 2-3 word highly specific, SAFE, and educational English search phrase for Unsplash. If the word has multiple meanings or NSFW/adult potential (e.g., 'hot', 'breast', 'butt', 'corps'), force a safe educational context (e.g., 'hot weather thermometer', 'chicken breast food', 'human body anatomy diagram').",
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
        
        // NEW: Check if Groq rejected the request
        if (!response.ok) {
            const errorData = await response.json();
            console.error("🔥 Groq API Rejected Translation:", JSON.stringify(errorData));
            throw new Error(`Groq API Error: ${response.status}`);
        }

        const data = await response.json();
        const parsedData = JSON.parse(data.choices[0].message.content);
        
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

// --- SENTENCE ANALYSIS ROUTE (With Auto-Correction) ---
app.post('/api/analyze-sentence', async (req, res) => {
    const { sentence } = req.body;
    if (!sentence) return res.status(400).json({ error: "Sentence required" });
    
    const cleanSentence = sentence.trim();

    // Security Bouncer: Limit sentence length to prevent abuse (max ~20-30 words)
    if (cleanSentence.length > 200) {
        return res.status(400).json({ error: "Sentence too long. Please enter a shorter sentence." });
    }

    const cacheKey = `sentence:all:${cleanSentence.toLowerCase()}`;

    // 1. Check Global Redis Cache First
    try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }
    } catch (cacheErr) {
        console.error("Redis Cache Read Error:", cacheErr);
    }

    // 2. The AI Prompt for Deep Grammar Analysis (GERMAN EXPLANATIONS)
    const promptText = `Analyze this German text: "${cleanSentence}".
    First, check for spelling, capitalization, and grammar errors. Then, perform a deep analysis on the CORRECTED version.
    Return STRICTLY a JSON object with this exact structure, nothing else:
    {
      "originalSentence": "${cleanSentence}",
      "correctedSentence": "The grammatically perfect German sentence (fix casing, spelling, and grammar).",
      "wasCorrected": true or false,
      "fullTranslations": {
        "English": "...", "Arabic": "...", "Russian": "...", "Dari": "...", "Farsi": "...", 
        "Amharic": "...", "Tigrinya": "...", "Spanish": "...", "French": "...", "Turkish": "...", 
        "Ukrainian": "...", "Somali": "...", "Armenian": "..."
      },
      "grammarExplanation": "Eine einfache Erklärung der Hauptgrammatikregel in diesem Satz auf DEUTSCH (1-2 Sätze).",
      "wordBreakdown": [
        {
          "word": "The exact word as it appears in the CORRECTED sentence",
          "baseForm": "The dictionary form of the word",
          "pos": "Choose exactly one: noun, verb, article, pronoun, adjective, preposition, or other",
          "englishMeaning": "Direct English translation of this specific word in context",
          "grammarTip": "Ein winziger Grammatik-Hinweis auf DEUTSCH (z.B. '1. Person Singular', 'Akkusativ Maskulin'). Gib null zurück, wenn nicht nötig."
        }
      ]
    }
    IMPORTANT: The "wordBreakdown" array must contain an object for EVERY single word in the CORRECTED sentence in chronological order.`;

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
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error("🔥 Groq API Rejected Sentence Analysis:", JSON.stringify(errorData));
            throw new Error(`Groq API Error: ${response.status}`);
        }

        const data = await response.json();
        const parsedData = JSON.parse(data.choices[0].message.content);
        
        // Save to Global Redis Cache for future users
        try {
            await redis.set(cacheKey, parsedData);
        } catch (cacheSetErr) {
            console.error("Redis Cache Write Error:", cacheSetErr);
        }

        res.json(parsedData);
    } catch (err) {
        console.error("Groq Sentence Error:", err);
        res.status(500).json({ error: "Sentence analysis failed" });
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
// --- IMAGE ROUTE (Unsplash - Now with Dual-Key Caching) ---
app.get('/api/image', async (req, res) => {
    // NEW: We now receive TWO words from the frontend
    const { germanWord, searchQuery } = req.query;
    if (!germanWord || !searchQuery) return res.status(400).json({ error: "Missing parameters" });

    // 1. CACHE CHECK: Always use the strict German word for the database key
    const imgCacheKey = `img:${germanWord.toLowerCase()}`;
    try {
        const cachedImg = await redis.get(imgCacheKey);
        if (cachedImg) return res.json(cachedImg);
    } catch (e) { console.error(e); }

    const getFallback = (w) => ({ imageUrl: `./logo.png` });

    if (!process.env.UNSPLASH_ACCESS_KEY) return res.json(getFallback(germanWord));

    // 2. UNSPLASH SEARCH: Always use the Safe English Query for the actual search
    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&content_filter=high`,
            { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
        );
        if (!response.ok) throw new Error("Unsplash API Error");
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            // Using urls.regular for high quality!
            const imageData = { imageUrl: data.results[0].urls.regular };
            
            // 3. CACHE SAVE: Save the high-quality image URL under the strict German key
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
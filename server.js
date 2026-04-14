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

app.get('/api/wakeup', (req, res) => res.json({
        status: "Awake!"
    }));
	
	

// =======================================================================
// 🛡️ API RETRY UTILITY (Exponential Backoff + Deep Logging)
// =======================================================================
async function fetchWithRetry(url, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;

            // 📍 FIX: Read the exact error message from the API!
            const errorText = await response.text();
            throw new Error(`Status ${response.status}: ${errorText}`);
            
        } catch (error) {
            if (i === maxRetries - 1) {
                console.error(`❌ Fetch failed after ${maxRetries} attempts:\n`, error.message);
                throw error;
            }
            const delay = Math.pow(2, i) * 500;
            console.warn(`⚠️ API Error. Retrying in ${delay}ms... (Attempt ${i + 1} of ${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// =======================================================================
// 🧹 CACHE NORMALIZATION UTILITY
// =======================================================================
function normalizeForCache(text) {
    return text
        .toLowerCase()
        .replace(/[.,!?¿¡"']/g, '') // Strip all common punctuation
        .replace(/\s+/g, ' ')       // Collapse multiple spaces into one
        .trim();
}
 

// =======================================================================
// 1. AI SPELLCHECK ROUTE (Database First, Groq Fallback)
// =======================================================================
app.post('/api/spellcheck', async(req, res) => {
    const { word } = req.body;
    if (!word || word.length < 2)
        return res.json({
            corrected: null
        });

    const cleanWord = word.trim();
    const cacheKey = `trans:all:${cleanWord.toLowerCase()}`;

    // FAST PATH: Check the Global Redis Cache First
    try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData && cachedData.german && cachedData.german.word) {
            const correctSpelling = cachedData.german.word;
            if (correctSpelling.toLowerCase() !== cleanWord.toLowerCase()) {
                return res.json({
                    corrected: correctSpelling
                });
            } else {
                return res.json({
                    corrected: null
                });
            }
        }
    } catch (cacheErr) {
        console.error("Redis Spellcheck Read Error:", cacheErr);
    }

    // FALLBACK PATH: Ask Groq AI
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
                messages: [{
                        role: "user",
                        content: promptText
                    }
                ],
                temperature: 0
            })
        });

        if (!response.ok)
            return res.json({
                corrected: null
            });

        const data = await response.json();
        const result = data.choices[0].message.content.trim();

        // UI SAFETY CATCH
        if (result.length > 25 || result.includes(" ")) {
            return res.json({
                corrected: null
            });
        }

        if (result === "PERFECT" || result.toLowerCase() === cleanWord.toLowerCase()) {
            res.json({
                corrected: null
            });
        } else {
            res.json({
                corrected: result
            });
        }
    } catch (err) {
        console.error("Spellcheck Error:", err);
        res.json({
            corrected: null
        });
    }
});

// =======================================================================
// 2. MAIN TRANSLATION ROUTE / WORD-MODE (Groq Powered)
// =======================================================================
app.post('/api/translate', async(req, res) => {
    const { word } = req.body;
    if (!word)
        return res.status(400).json({
            error: "Word required"
        });

    const cleanWord = word.trim();

    if (cleanWord.length > 45 || cleanWord.split(' ').length > 4) {
        return res.status(400).json({
            error: "Input too long. Please enter a single word or short phrase."
        });
    }

    const allLanguages = [
        'English', 'Arabic', 'Russian', 'Dari', 'Farsi', 'Amharic',
        'Tigrinya', 'Spanish', 'French', 'Turkish', 'Ukrainian',
        'Somali', 'Armenian'
    ];

    const cacheKey = `word:v4:${cleanWord.toLowerCase()}`;

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
`{"language":"${l}","meanings":["m1","m2"]}`).join(',\n        ');

    const promptText = `Analyze the German word "${word}". Return STRICTLY a JSON object with this exact structure, nothing else:
    {
      "german": {
        "word": "The correctly spelled singular base form of the word (e.g., if input is 'Äpfel' return 'Apfel'). Pay strict attention to correct umlauts!",
        "partOfSpeech": "noun" or "verb" or "other",
        "article": "der/die/das" (The correct article for the SINGULAR noun, e.g., 'der' for 'Apfel'. null if not a noun),
        "pluralTip": "ONLY the German plural form with its article (e.g., 'die Äpfel'). DO NOT include any English text, notes, brackets, or explanations. If the noun has no plural, return 'kein Plural'. null if not a noun",
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
        const url = 'https://api.groq.com/openai/v1/chat/completions';
        
        // 📍 FIX: Replaced standard fetch with fetchWithRetry (3 attempts)
        const response = await fetchWithRetry(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{
                        role: "user",
                        content: promptText
                    }
                ],
                response_format: {
                    type: "json_object"
                },
                temperature: 0.1
            })
        }, 3); 

        // Removed the "if (!response.ok)" block because fetchWithRetry handles it!

        const data = await response.json();
        const parsedData = JSON.parse(data.choices[0].message.content);

        try {
            await redis.set(cacheKey, parsedData);
        } catch (cacheSetErr) {}

        res.json(parsedData);
    } catch (err) {
        console.error("Groq Error:", err);
        res.status(500).json({
            error: "Translation failed"
        });
    }
});

// =======================================================================
// 3. SENTENCE ANALYSIS ROUTE (Now powered by Groq 70B for speed!)
// =======================================================================
app.post('/api/analyze-sentence', async(req, res) => {
    const { sentence } = req.body;
    if (!sentence)
        return res.status(400).json({
            error: "Sentence required"
        });

    const cleanSentence = sentence.trim();
    if (cleanSentence.length > 200) return res.status(400).json({ error: "Sentence too long." });

    const normalizedBase = normalizeForCache(sentence);
    const cacheKey = `sentence:v12:${normalizedBase}`;
    try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
			console.log("⚡ Served SENTENCE ANALYSIS from Cache!");
            return res.json(cachedData);
		}
    } catch (e) {}
	
	// 📍 2. JavaScript does the splitting!
    // We strip punctuation for the analysis, but keep the word count exact.
    const wordsArray = cleanSentence.replace(/[.,!?]/g, '').trim().split(/\s+/);
    const exactWordCount = wordsArray.length;
	
    // 📍 3. The "Token-Forced" Prompt
    const promptText = `Du analysierst einen PERFEKT KORRIGIERTEN deutschen Satz.
    Ich habe den Satz bereits für dich in exakt ${exactWordCount} Wörter zerlegt:
    ${JSON.stringify(wordsArray)}

    Deine EINZIGE Aufgabe ist es, dieses Array Wort für Wort zu analysieren.
    
    KRITISCHE REGELN:
    1. Dein 'wordBreakdown' Array MUSS EXAKT ${exactWordCount} Elemente enthalten.
    2. Bearbeite die Wörter in GENAU der Reihenfolge, in der sie oben im Array stehen.
    3. Kasus-Regel: Nach 'helfen', 'danken', 'glauben' MUSS Dativ stehen. Nach 'glauben an' MUSS Akkusativ stehen.
    4. BASE FORMS (Over-Stemming verboten!): Pronominaladverbien und Adverbien (z.B. 'deinetwegen', 'meinetwegen', 'deswegen', 'darauf') sind eigenständige Wörter! Die baseForm von 'deinetwegen' ist STRIKT 'deinetwegen' (NICHT 'dein').

    Return STRICTLY a JSON object:
    {
      "wordBreakdown": [
        {
          "word": "Exact word from the array",
          "baseForm": "Dictionary form (Regel 4 beachten!)",
          "pos": "STRICTLY IN GERMAN: Nomen, Verb, Artikel, Pronomen, Adjektiv, Präposition, Adverb, or Sonstiges",
          "englishMeaning": "Direct English translation in context",
          "kasus": "STRICTLY choose one if applicable: 'Nominativ', 'Akkusativ', 'Dativ', 'Genitiv' oder null.",
          "grammarTip": "Ein winziger Grammatik-Hinweis."
        }
      ]
    }`;


    try {
        // 📍 NEW: Fetching from Groq instead of Gemini
        const url = 'https://api.groq.com/openai/v1/chat/completions';
        const response = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // or whichever model you are using
                messages: [{ role: "user", content: promptText }],
                response_format: { type: "json_object" },
                temperature: 0.1
            })
        }, 3);

        const data = await response.json();
		
        const parsedData = JSON.parse(data.choices[0].message.content);

        try {
            await redis.set(cacheKey, parsedData);
        } catch (e) {}

        res.json(parsedData);
    } catch (err) {
        console.error("Groq Sentence Error:", err);
        res.status(500).json({
            error: "Sentence analysis failed."
        });
    }
});

// =======================================================================
// 4. AI STORY GENERATOR ROUTE (Groq Powered)
// =======================================================================
app.get('/api/generate-reading', async(req, res) => {
    try {
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
                messages: [{
                        role: "system",
                        content: "Du bist ein extrem kreativer Deutschlehrer. Output ONLY valid JSON. Generiere niemals dieselbe Geschichte zweimal."
                    }, {
                        role: "user",
                        content: promptText
                    }
                ],
                response_format: {
                    type: "json_object"
                },
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
        res.status(500).json({
            error: "Failed to generate reading passage"
        });
    }
});

// =======================================================================
// 5. IMAGE ROUTE (Unsplash - Dual-Key Caching)
// =======================================================================
app.get('/api/image', async(req, res) => {
    const { germanWord, searchQuery } = req.query;
    if (!germanWord || !searchQuery)
        return res.status(400).json({
            error: "Missing parameters"
        });

    const imgCacheKey = `img:${germanWord.toLowerCase()}`;
    try {
        const cachedImg = await redis.get(imgCacheKey);
        if (cachedImg)
            return res.json(cachedImg);
    } catch (e) {
        console.error(e);
    }

    const getFallback = (w) => ({
        imageUrl: `./logo.png`
    });

    if (!process.env.UNSPLASH_ACCESS_KEY)
        return res.json(getFallback(germanWord));

    try {
        const response = await fetch(
`https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&content_filter=high`, {
                headers: {
                    Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
                }
            });
        if (!response.ok)
            throw new Error("Unsplash API Error");
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const imageData = {
                imageUrl: data.results[0].urls.regular
            };
            try {
                await redis.set(imgCacheKey, imageData);
            } catch (e) {}
            return res.json(imageData);
        } else {
            return res.json(getFallback(germanWord));
        }
    } catch (err) {
        console.error("Image Error:", err);
        res.json(getFallback(germanWord));
    }
});

// =======================================================================
// 6. DEDICATED SENTENCE TRANSLATION ROUTE (Google Cloud Translation API)
// =======================================================================

const googleLangMap = {
    'English': 'en', 'Arabic': 'ar', 'Russian': 'ru', 'Dari': 'fa-AF',
    'Farsi': 'fa', 'Amharic': 'am', 'Tigrinya': 'ti', 'Spanish': 'es',
    'French': 'fr', 'Turkish': 'tr', 'Ukrainian': 'uk', 'Somali': 'so',
    'Armenian': 'hy'
};

app.post('/api/translate-sentence', async(req, res) => {
    const { sentence, targetLanguages } = req.body;

    if (!sentence || !targetLanguages || targetLanguages.length === 0) {
        return res.status(400).json({ error: "Missing sentence or target languages" });
    }

    const normalizedBase = normalizeForCache(sentence);
    const cacheKey = `matrix:v12:${normalizedBase}`;

    // Helper Function: Extracts ONLY the requested languages from the Master Dictionary
    const filterRequestedLanguages = (allTranslations) => {
        let filtered = {};
        targetLanguages.forEach(lang => {
            if (allTranslations[lang]) {
                filtered[lang] = allTranslations[lang];
            } else {
                filtered[lang] = "❌ Translation missing.";
            }
        });
        return filtered;
    };

    // 📍 2. DATABASE FIRST: Check the Cache
    try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData && cachedData.translations) {
            console.log("⚡ Served Global Master Dictionary from Cache!");
            // Only send back the languages the user actually asked for!
            return res.json({ 
                translations: filterRequestedLanguages(cachedData.translations) 
            }); 
        }
    } catch (cacheErr) {
        console.error("Redis Cache Read Error:", cacheErr);
    }

    // 📍 3. CACHE MISS: Generate the Master Dictionary
    try {
        let masterTranslations = {};
        const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "Translation service unconfigured." });
        }

        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
        
        // Grab ALL supported languages, not just the ones the user requested
        const allSupportedLangs = Object.keys(googleLangMap);

        // Fetch all 13 translations simultaneously
        await Promise.all(allSupportedLangs.map(async(lang) => {
            const targetLangCode = googleLangMap[lang];

            try {
                const response = await fetchWithRetry(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        q: sentence,
                        target: targetLangCode,
                        source: 'de', 
                        format: 'text'
                    })
                }, 3);

                const data = await response.json();
                masterTranslations[lang] = data.data.translations[0].translatedText;
                
            } catch (e) {
                console.error(`Google Fetch Failed for ${lang}:`, e);
                masterTranslations[lang] = "❌ Translation failed.";
            }
        }));

        const finalData = { translations: masterTranslations };

        // 📍 4. SAVE TO CACHE: Store all 13 languages for future users
        try {
            await redis.set(cacheKey, finalData);
        } catch (cacheSetErr) {
            console.error("Redis Cache Write Error:", cacheSetErr);
        }

        // 📍 5. RESPOND: Only send the requested languages back to the UI
        res.json({ 
            translations: filterRequestedLanguages(masterTranslations) 
        });

    } catch (err) {
        console.error("Google Master Error:", err);
        res.status(500).json({ error: "❌ Translation failed completely" });
    }
});


// =======================================================================
// 7. FAST GRAMMAR CORRECTION (Powered by Gemini 2.5 Flash-Lite)
// =======================================================================
app.post('/api/fast-correct', async(req, res) => {
    const { sentence } = req.body;
    if (!sentence)
        return res.status(400).json({ error: "Sentence required" });

    const originalClean = sentence.trim();
    
    // 📍 1. Normalize the sentence to create a bulletproof Cache Key
    const normalizedBase = normalizeForCache(sentence);
    // Bumped to v2 to start fresh with the new normalization standard
    const cacheKey = `fastcorrect:v2:${normalizedBase}`;

    try {
        // 📍 2. DATABASE FIRST: Check Upstash Redis
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log("⚡ Served Grammar Correction from Cache!");
            
            // DYNAMIC CHECK: Even though it's cached, we must compare the CURRENT user's
            // exact input against the perfectly cached sentence to see if THEY made a mistake.
            cachedData.wasCorrected = (originalClean !== cachedData.correctedSentence);
            
            return res.json(cachedData); 
        }
    } catch (cacheErr) {
        console.error("Redis Cache Read Error:", cacheErr);
    }
    
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const response = await fetchWithRetry(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ 
                        text: `Du bist ein strenger, hochpräziser Deutschlehrer.
                        Prüfe den Text GANZ GENAU. Achte auch auf den Kontext über mehrere Sätze hinweg!
                        WICHTIG: Behalte die ursprüngliche Satzstruktur bei (wechsle niemals von Passiv zu Aktiv), sondern korrigiere NUR die Grammatikfehler!

                        WICHTIGE KASUS- UND GRAMMATIK-REGELN:
                        1. 'glauben' (OHNE 'an') verlangt IMMER Dativ!
                        2. 'glauben an' verlangt IMMER Akkusativ!
                        3. 'helfen', 'danken', 'gefallen', 'antworten', 'gehören' verlangen IMMER Dativ. (Achtung beim Passiv: Es MUSS heißen: "Mir wird geholfen").
                        4. PRONOMEN-KONGRUENZ: Ein Pronomen MUSS das grammatikalische Geschlecht seines Bezugsworts übernehmen! ("das Mädchen" -> "es").
                        5. KONJUNKTIV II: Wenn der Hauptsatz im Konjunktiv II steht, MUSS der 'Wenn'-Nebensatz auch im Konjunktiv II stehen ("Wenn ich Zeit HÄTTE").
                        6. PRONOMINALADVERBIEN: 'wegen' + Personalpronomen ist streng verboten!
                        7. ORTHOGRAFIE: Achte strikt auf Groß-/Kleinschreibung und Satzzeichen (z.B. fehlender Punkt am Ende).

                        Gib STRIKT ein JSON-Objekt mit genau dieser Struktur zurück:
                        {
                          "originalSentence": "Der Text vom Benutzer",
                          "wasCorrected": true oder false,
                          "correctedSentence": "Der perfekte Satz.",
                          "grammarExplanation": "Erkläre den Fehler präzise."
                        }` 
                    }]
                },
                contents: [{
                    role: "user",
                    parts: [{ text: `Prüfe diesen Text: "${sentence}"` }]
                }],
                generationConfig: {
                    response_mime_type: "application/json",
                    temperature: 0.1
                }
            })
        }, 3);

        const data = await response.json();
        const parsedData = JSON.parse(data.candidates[0].content.parts[0].text);

        // 🛡️ THE OVERRIDE: Never trust the AI's boolean!
        parsedData.wasCorrected = (originalClean !== parsedData.correctedSentence.trim());

        try {
            await redis.set(cacheKey, parsedData);
        } catch (cacheSetErr) {
            console.error("Redis Cache Write Error:", cacheSetErr);
        }

        res.json(parsedData);
    } catch (err) {
        console.error("Flash-Lite Correction Error:", err);
        res.status(500).json({ error: "Correction failed." });
    }
});


// =======================================================================
// =======================================================================
// =======================================================================


// --- VERCEL EXPORT ---
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 10000;
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Local server on port ${PORT}`));
}

export default app;

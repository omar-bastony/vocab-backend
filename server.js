import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const imageCache = new Map();

// --- 1. HEALTH CHECKS ---
app.get('/', (req, res) => res.status(200).send("Stable Translator Server is Live!"));
app.get('/api/wakeup', (req, res) => res.json({ status: "Awake!" }));

// --- 2. STABLE TRANSLATION (GEMINI 1.5 FLASH) ---
app.post('/api/translate', async (req, res) => {
    const { word } = req.body;
    if (!word) return res.status(400).json({ error: "Word required" });

    const promptText = `
      You are an expert German teacher for A1-A2 level students.
      Translate the German text: "${word}".
      Provide translation in English, Arabic, Russian, Dari, Farsi, Amharic, and Tigrinya.
      Return STRICTLY a JSON array of objects with this format:
      [{"language": "Name", "meanings": ["meaning1", "meaning2"], "example": "A1 sentence"}]
    `;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });

        if (!response.ok) throw new Error("Gemini API Error");
        const data = await response.json();
        const jsonString = data.candidates[0].content.parts[0].text;
        res.json(JSON.parse(jsonString));
    } catch (err) {
        console.error("Translation Error:", err);
        res.status(500).json({ error: "Translation failed. Check API Key." });
    }
});

// --- 3. STABLE IMAGE SEARCH (LEXICA) ---
app.get('/api/image', async (req, res) => {
    const { word } = req.query;
    if (!word) return res.status(400).json({ error: "Word required" });

    const fallback = `https://placehold.co/600x400/e0f2f1/006a6a?text=${encodeURIComponent(word)}`;

    if (imageCache.has(word)) return res.json({ imageUrl: imageCache.get(word) });

    try {
        const query = encodeURIComponent(`${word} simple vector illustration white background`);
        const response = await fetch(`https://lexica.art/api/v1/search?q=${query}`);
        
        if (!response.ok) throw new Error("Lexica Search Failed");
        const data = await response.json();

        if (data.images && data.images.length > 0) {
            const imageUrl = data.images[0].srcSmall;
            imageCache.set(word, imageUrl);
            return res.json({ imageUrl });
        }
        res.json({ imageUrl: fallback });
    } catch (err) {
        console.warn("Image Search Fallback triggered:", err.message);
        res.json({ imageUrl: fallback }); // Never send a 500 error for images
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Stable Server running on port ${PORT}`));
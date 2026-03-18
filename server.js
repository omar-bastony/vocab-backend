import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const imageCache = new Map();

// --- 1. HEALTH CHECK (Critical for Render Deploy) ---
app.get('/', (req, res) => res.status(200).send("Server is running!"));
app.get('/api/wakeup', (req, res) => res.json({ status: "Awake!" }));

// --- 2. TRANSLATION (GEMINI) ---
app.post('/api/translate', async (req, res) => {
    const { word } = req.body;
    if (!word) return res.status(400).json({ error: "Word required" });

    const promptText = `Translate German "${word}" to English, Arabic, Russian, Dari, Farsi, Amharic, Tigrinya. Return STRICTLY a JSON array: [{"language":"Name","meanings":["m1","m2"],"example":"A1 sentence"}]`;

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
        res.json(JSON.parse(data.candidates[0].content.parts[0].text));
    } catch (err) {
        console.error("Gemini Error:", err);
        res.status(500).json({ error: "Translation failed" });
    }
});

// --- 3. IMAGE SEARCH (UNSPLASH PRODUCTION READY) ---
app.get('/api/image', async (req, res) => {
    const { word } = req.query;
    if (!word) return res.status(400).json({ error: "Word required" });

    if (imageCache.has(word)) return res.json(imageCache.get(word));

    // Fallback URL Generator
    const getFallback = (w) => ({
        imageUrl: `https://placehold.co/600x400/e0f2f1/006a6a?text=${encodeURIComponent(w)}`,
        photographer: null,
        photographerLink: null,
        downloadLocation: null
    });

    // Check if Unsplash Key is missing
    if (!process.env.UNSPLASH_ACCESS_KEY) {
        console.warn("⚠️ UNSPLASH_ACCESS_KEY is missing. Using placeholder.");
        return res.json(getFallback(word));
    }

    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(word)}&per_page=1`,
            { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
        );

        if (!response.ok) throw new Error("Unsplash API Error");
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const photo = data.results[0];
            const imageData = {
                imageUrl: photo.urls.small,
                photographer: photo.user.name,
                photographerLink: photo.user.links.html,
                downloadLocation: photo.links.download_location
            };
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

// Use Render's default port or 3000
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));  
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());

const imageCache = new Map(); 

// --- 1. WAKE UP ENDPOINT ---
app.get('/api/wakeup', (req, res) => {
    res.json({ status: "Awake and ready!" });
});

// --- 2. TRANSLATION ENDPOINT ---
app.post('/api/translate', async (req, res) => {
    const { word } = req.body;
    if (!word) return res.status(400).json({ error: "Word is required" });

    const promptText = `
      You are an expert German teacher for A1-A2 level students.
      Translate the German text: "${word}" into English, Arabic, Russian, Dari, Farsi, Amharic, and Tigrinya.
      Return STRICTLY a JSON array of objects with this exact format:
      [
        {
          "language": "Language Name",
          "meanings": ["primary meaning", "secondary meaning if applicable"],
          "example": "Simple A1-A2 example sentence in the target language"
        }
      ]
    `;

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

        if (!response.ok) throw new Error("Translation API Failed");

        const data = await response.json();
        const jsonString = data.candidates[0].content.parts[0].text;
        res.json(JSON.parse(jsonString));
    } catch (error) {
        console.error("Translation API Error:", error);
        res.status(500).json({ error: "Failed to fetch translation" });
    }
});

// --- 3. IMAGE SEARCH (UNSPLASH PRODUCTION READY) ---
app.get('/api/image', async (req, res) => {
    const { word } = req.query;
    if (!word) return res.status(400).json({ error: "Word required" });

    if (imageCache.has(word)) return res.json(imageCache.get(word));

    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(word)}&per_page=1`,
            { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
        );

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const photo = data.results[0];
            
            const imageData = {
                imageUrl: photo.urls.small,
                photographer: photo.user.name,
                photographerLink: photo.user.links.html,
                downloadLocation: photo.links.download_location // Required for trigger
            };

            imageCache.set(word, imageData);
            return res.json(imageData);
        } else {
            throw new Error("No photo found");
        }
    } catch (err) {
        // Fallback still works but has no attribution
        const fallback = {
            imageUrl: `https://placehold.co/600x400/e0f2f1/006a6a?text=${encodeURIComponent(word)}`,
            photographer: null,
            photographerLink: null,
            downloadLocation: null
        };
        res.json(fallback);
    }
});
        

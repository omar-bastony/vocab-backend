import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const imageCache = new Map();

// --- 1. HEALTH CHECKS ---
app.get('/', (req, res) => res.status(200).send("Gemini Full-Stack Server is Live!"));
app.get('/api/wakeup', (req, res) => res.json({ status: "Awake!" }));

// --- 2. TRANSLATION ENDPOINT ---
app.post('/api/translate', async (req, res) => {
    const { word } = req.body;
    if (!word) return res.status(400).json({ error: "Word required" });

    const promptText = `
      You are an expert German teacher for A1-A2 level students.
      Translate the German text: "${word}".
      Provide translation in English, Arabic, Russian, Dari, Farsi, Amharic, and Tigrinya.
      If the word has multiple meanings, list them.
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
        const data = await response.json();
        const jsonString = data.candidates[0].content.parts[0].text;
        res.json(JSON.parse(jsonString));
    } catch (err) {
        console.error("Translation Error:", err);
        res.status(500).json({ error: "Translation failed" });
    }
});

// --- 3. IMAGE GENERATION ENDPOINT (GEMINI IMAGEN) ---
app.get('/api/image', async (req, res) => {
    const { word } = req.query;
    if (!word) return res.status(400).json({ error: "Word required" });

    if (imageCache.has(word)) return res.json({ imageUrl: imageCache.get(word) });

    try {
        // We use the Imagen model via the Gemini API endpoint
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Generate a simple, clear, educational vector illustration of "${word}" on a white background for a language learning flashcard. High quality, no text in image.` }]
                }]
            })
        });

        const data = await response.json();
        
        // Gemini returns generated images as base64 in the content parts
        const base64Data = data.candidates[0].content.parts.find(p => p.inline_data)?.inline_data.data;

        if (base64Data) {
            const imageUrl = `data:image/png;base64,${base64Data}`;
            imageCache.set(word, imageUrl);
            return res.json({ imageUrl });
        } else {
            throw new Error("No image data returned from Gemini");
        }
    } catch (err) {
        console.error("Image Error:", err);
        // Fallback to placeholder if Gemini image generation fails or is restricted
        const fallbackUrl = `https://placehold.co/600x400/e0f2f1/006a6a?text=${encodeURIComponent(word)}`;
        res.json({ imageUrl: fallbackUrl });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Gemini Server on port ${PORT}`));
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const imageCache = new Map();

app.get('/', (req, res) => res.status(200).send("Server is Live!"));
app.get('/api/wakeup', (req, res) => res.json({ status: "Awake!" }));

// --- 2. TRANSLATION ENDPOINT ---
app.post('/api/translate', async (req, res) => {
    const { word } = req.body;
    if (!word) return res.status(400).json({ error: "Word required" });

    const promptText = `Translate German "${word}" to English, Arabic, Russian, Dari, Farsi, Amharic, Tigrinya. Return STRICTLY a JSON array: [{"language":"Name","meanings":["m1","m2"],"example":"A1 sentence"}]`;

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
        
        // Safety check for Gemini response structure
        if (!data.candidates || !data.candidates[0].content.parts[0].text) {
            throw new Error("Invalid API Response");
        }

        res.json(JSON.parse(data.candidates[0].content.parts[0].text));
    } catch (err) {
        console.error("Translation Error:", err);
        res.status(500).json({ error: "Translation failed. Check API Key." });
    }
});

// --- 3. IMAGE ENDPOINT (STABLE VERSION) ---
app.get('/api/image', async (req, res) => {
    const { word } = req.query;
    const fallback = `https://placehold.co/600x400/e0f2f1/006a6a?text=${encodeURIComponent(word)}`;

    if (imageCache.has(word)) return res.json({ imageUrl: imageCache.get(word) });

    try {
        // We use a high-reliability model for image generation
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Generate a simple educational icon illustration of ${word} on white background.` }] }]
            })
        });
        
        const data = await response.json();
        // Extract base64 if available, otherwise return fallback
        const base64 = data.candidates?.[0]?.content?.parts?.find(p => p.inline_data)?.inline_data?.data;
        
        const imageUrl = base64 ? `data:image/png;base64,${base64}` : fallback;
        imageCache.set(word, imageUrl);
        res.json({ imageUrl });
    } catch (err) {
        res.json({ imageUrl: fallback }); // Never 500 error here
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));
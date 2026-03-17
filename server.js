import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();

// Allow requests from your frontend
app.use(cors());
app.use(express.json());

// In-memory cache for images
const imageCache = new Map(); 

// --- 1. WAKE UP ENDPOINT (For the frontend spinner) ---
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

// --- 3. IMAGE GENERATION ENDPOINT ---
app.get('/api/image', async (req, res) => {
    const { word } = req.query;
    if (!word) return res.status(400).json({ error: "Word is required" });

    const cacheKey = word.toLowerCase().trim();

    if (imageCache.has(cacheKey)) {
        console.log(`⚡ Cache hit for: ${cacheKey}`);
        return res.json({ imageUrl: imageCache.get(cacheKey) });
    }

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
            {
                headers: { Authorization: `Bearer ${process.env.HF_API_TOKEN}` },
                method: "POST",
                body: JSON.stringify({ 
                    inputs: `A simple, clean vector illustration of ${word}, educational flashcard style, white background` 
                }),
            }
        );

        if (!response.ok) throw new Error("Image API Failed");

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

        imageCache.set(cacheKey, base64Image);
        res.json({ imageUrl: base64Image });
    } catch (error) {
        console.error("Image Generation Error:", error);
        res.status(500).json({ error: "Failed to generate image" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
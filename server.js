import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();

// Allow requests from your frontend
app.use(cors());
app.use(express.json());

// In-memory cache for images
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

// --- 3. IMAGE GENERATION ENDPOINT (POLLINATIONS AI) ---
app.get('/api/image', async (req, res) => {
    const { word } = req.query;
    if (!word) return res.status(400).json({ error: "Word is required" });

    const cacheKey = word.toLowerCase().trim();

    // Cache Hit: Return the saved URL
    if (imageCache.has(cacheKey)) {
        console.log(`⚡ Cache hit for: ${cacheKey}`);
        return res.json({ imageUrl: imageCache.get(cacheKey) });
    }

    // Cache Miss: Generate new Pollinations URL
    try {
        const promptText = `A simple clean vector illustration of ${word}, educational flashcard style, white background`;
        const encodedPrompt = encodeURIComponent(promptText);
        const randomSeed = Math.floor(Math.random() * 100000);
        
        // Pollinations generates the image directly via this URL
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${randomSeed}`;

        // Save to cache
        imageCache.set(cacheKey, imageUrl);
        res.json({ imageUrl: imageUrl });
    } catch (error) {
        console.error("Image Generation Error:", error);
        res.status(500).json({ error: "Failed to generate image" });
    }
});

// --- THIS IS THE CRITICAL LINE THAT KEEPS THE SERVER ALIVE --- 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
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

// --- 3. BULLETPROOF IMAGE ENDPOINT (Base64 + Fallback) ---
app.get('/api/image', async (req, res) => {
    const { word } = req.query;
    if (!word) return res.status(400).json({ error: "Word is required" });

    const cacheKey = word.toLowerCase().trim();

    if (imageCache.has(cacheKey)) {
        console.log(`⚡ Cache hit for: ${cacheKey}`);
        return res.json({ imageUrl: imageCache.get(cacheKey) });
    }

    try {
        const promptText = `A simple clean vector illustration of ${word}, educational flashcard style, white background`;
        const encodedPrompt = encodeURIComponent(promptText);
        
        // 1. Backend securely fetches the image
        const response = await fetch(`https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true`);

        if (!response.ok) throw new Error("Pollinations API failed to respond");

        // 2. Convert image to raw Base64 text (Bypasses frontend adblockers!)
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

        // 3. Save and send
        imageCache.set(cacheKey, base64Image);
        res.json({ imageUrl: base64Image });

    } catch (error) {
        console.error("Image Generation Error:", error.message);
        
        // 4. THE FALLBACK: Never throw a 500 error. Send a Material 3 placeholder instead!
        const fallbackUrl = `https://placehold.co/600x400/e0f2f1/006a6a?text=${encodeURIComponent(word)}`;
        res.json({ imageUrl: fallbackUrl });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
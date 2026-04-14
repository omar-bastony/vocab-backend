Architecture & Technical Documentation
Project: Das Wort - German A1/A2 Context Translator & Learning App

1. AI Session Starter Prompt
Copy and paste the block below into your next AI session to instantly bring the AI up to speed on the project's exact current state:

Act as a senior full-stack developer. I am building a German A1-A2 Language Learning & Translation Web App.

Current State: The app uses a highly optimized Hybrid Microservices Architecture to maximize speed, guarantee grammatical accuracy, and minimize token costs:

Gemini 2.5 Flash-Lite (or OpenAI gpt-4o-mini): Acts as the "Gatekeeper" (/api/fast-correct), strictly handling complex German grammar reasoning, Kasusrektion (Dativ/Akkusativ), and spelling correction in < 600ms.

Groq (Llama 3): Handles raw-speed tasks: single-word JSON generation (13 languages), spellchecking, story generation, and breaking down corrected sentences into interactive JSON word-cards.

Google Cloud Translation Basic API: Handles matrix translations for full sentences to save LLM output tokens and guarantee 100% translation accuracy.

Key Infrastructure:

Resilience: EVERY external API call uses a custom fetchWithRetry (Exponential Backoff) utility to silently catch 429/503 errors and retry up to 3 times.

Database First (Eager Caching): Uses Upstash Redis (v12 cache keys). The Google Translation route uses Eager Caching to generate and store a 13-language Master Dictionary on the first query, achieving near 100% cache hits for subsequent users.

Cache Normalization: User input is stripped of punctuation, lowercased, and trimmed before creating a cache key. "ich bin hier" and "Ich bin hier." hit the exact same cache entry, saving database space.

Dynamic AI Evaluation: The server uses strict JavaScript string comparison to dynamically calculate the wasCorrected boolean on the fly, entirely overriding the LLM's flaky boolean logic.

JS Pre-Splitting: The backend uses JavaScript to split sentences into exact arrays (exactWordCount) before passing them to Groq, mathematically preventing the LLM from dropping duplicate words in its JSON output.

UI/UX (Progressive UI):
Sentence mode operates linearly: 1. Instant Grammar Check (shows ✨ Korrigiert alert) -> 2. Translate the perfect sentence via Google API -> 3. Groq builds interactive word cards in the background. Features dynamic UI color-changing based on noun genders (der=blue, die=pink, das=green).

Tech Stack: Vanilla HTML/CSS/JS (Frontend), Node.js/Express (Vercel Serverless Backend), Upstash Redis.

Next Immediate Feature: [Insert what you want to build next]. Please review the architecture notes below and provide the exact code needed.

2. File Structure & Roles
index.html (The Single-Page Entry)
Layout: Uses a wrapping flexbox (.central-box). The left column (.central-left) contains the autofocus search input, UI shimmers, word details area, and an isolated #correctionArea. The right column contains the context image. The #sentenceAnalysisArea sits outside the columns to span 100% of the width at the bottom.

Components: Includes hidden grammar modals, a print-friendly layout, and a responsive side-drawer navigation menu.

style.css
Follows Material Design 3 principles.

Key Classes: .theme-der/die/das for global CSS variable overrides, .translation-card, .word-card for interactive sentence breakdowns, .case-badge for strict color-coded grammar cases, and .shimmer for loading states.

Mobile layout utilizes overflow-x: auto for wide grammar tables.

data.js
A static JSON-like file containing materialData: Categorized Nouns (by gender), Adjectives (opposites), Verbs (conjugations), and default A1/A2 Reading Passages.

3. The Backend: Hybrid Microservices (server.js)
Deployed as Vercel Serverless Functions. Features a fetchWithRetry utility wrapping all third-party API calls.

app.post('/api/fast-correct') [The Gatekeeper - Gemini Flash-Lite/OpenAI]

Purpose: Instantly checks a German sentence for case errors and orthography.

Dynamic Evaluation Override: Ignores the AI's wasCorrected opinion entirely. Uses JS to strictly compare the normalized input string against the corrected string before saving to Redis.

Prompting: Uses strict Negative Constraints and explicit rule lists (e.g., distinguishing Dative-only verbs vs. Two-way prepositions).

app.post('/api/translate-sentence') [Google Cloud Translation v2]

Purpose: Translates the perfectly corrected German sentence into 13 target languages simultaneously.

Eager Caching: Fetches all 13 languages on a cache miss and saves them as a Master Dictionary to Redis. On a cache hit, it filters the Master Dictionary and returns only what the user's UI requested.

app.post('/api/analyze-sentence') [Word Card Builder - Groq]

Purpose: Breaks down a full sentence into interactive vocabulary cards.

Safety Mechanism (JS Pre-split): Uses cleanSentence.split(/\s+/) to calculate the exact word count and forces Groq to process that exact array, mathematically preventing dropped duplicate words.

app.post('/api/translate') [Single Word Deep Dive - Groq]

Purpose: Generates a massive JSON payload for a single word, including articles, plurals, conjugation tips, example sentences, and 13 translations in < 800ms.

app.post('/api/spellcheck') [Groq]

Autocorrects single words as the user types. Aborts automatically if the input contains spaces.

app.get('/api/generate-reading') [Groq]

Generates 3 highly creative, completely random A1-A2 German reading passages (Temp: 0.9).

4. Frontend Data Flow: Progressive UI (script.js)
The translateBtn intercepts the submit and auto-detects Single Word Mode vs. Sentence Mode by counting spaces.

The Sentence Mode Flow (Linear & Progressive)
Phase 1: Instant Grammar Check

Fetches from /api/fast-correct.

If wasCorrected is true, instantly reveals the ✨ Korrigiert alert with the explanation.

The grammatically perfect sentence is locked in as the finalSentence for all remaining steps.

Phase 2: Flawless Translation

Fetches from /api/translate-sentence using ONLY the finalSentence.

Populates the translation grid with near-instant speed due to eager caching.

Phase 3: Deep Analysis (Background Task)

Passes the finalSentence to /api/analyze-sentence.

Replaces the UI shimmers with interactive .word-card elements mapped with Nominativ/Akkusativ/Dativ/Genitiv badges. Clicking a card auto-fills the search bar for a deep dive.

Single Word Mode
Fetches /api/translate.

Changes the global CSS theme based on noun gender.

Triggers background fetches for /api/image and Google translated example sentences.

5. System Resilience & Prompt Engineering
Infrastructure:
Exponential Backoff: The fetchWithRetry wrapper guarantees that temporary 503 (Service Unavailable) or 429 (Rate Limit) errors from external APIs are handled silently with escalating delays up to 3 times.

Cache Normalization Utility: All incoming sentences are stripped of punctuation, lowercased, and have extra spaces removed (normalizeForCache(text)) before a cache key is generated. This prevents database bloat.

Global Caching Strategy: Upstash Redis is used aggressively. Cache keys are versioned systematically (e.g., sentence:v12:[query]) allowing for instant database "wipes" simply by bumping the version number.

Prompt Guardrails:
Negative Constraints: Explicitly forbidding LLMs from making common mistakes (e.g., "BEHAUPTE NIEMALS, dass 'glauben' den Akkusativ verlangt!").

Ambiguity Flags: Warning the AI about overlapping word states in German.

Anti-Overstemming: Forcing the LLM to recognize compound adverbs (e.g., deinetwegen) as base dictionary words rather than stripping them down to incorrect root pronouns.
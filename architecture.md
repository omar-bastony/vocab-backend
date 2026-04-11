Here is the fully updated architecture.md file. It reflects your new Hybrid API Architecture (Groq + Gemini + Google Translate), the token-saving strategies, and all the recent UI/UX optimizations.

You can copy and paste this directly over your current architecture file.

Architecture & Technical Documentation
Project: Das Wort - German A1/A2 Context Translator & Learning App

1. AI Session Starter Prompt
Copy and paste the block below into your next AI session to instantly bring the AI up to speed on your project:

Act as a senior full-stack developer. I am building a German A1-A2 Language Learning & Translation Web App. >
Current State: The app uses a highly optimized Hybrid API Architecture to maximize speed and minimize token costs:

Groq (Llama 3) handles single-word matrix translations (13 languages), spellchecking, and story generation.

Gemini 2.5 Flash strictly handles complex German grammar reasoning (Sentence Analysis).

Google Cloud Translation Basic API handles matrix translations for full sentences to save LLM output tokens.

It features dynamic UI color-changing based on noun genders (der=blue, die=pink, das=green) and utilizes a "Database First" architecture using Upstash Redis (checks the global cache for auto-correct spelling, master translations, and sentence analysis before falling back to any AI).

Key Features:

Sentence Analysis (v3): Automatically detects sentences. Uses Gemini to auto-correct grammar (specifically checking Kasusrektion via an errorAnalysis buffer) and generate interactive word-cards. The frontend then chains a second request to Google Translate to translate the corrected sentence.

Visual Grammar: Dynamic case badges (Nominativ, Akkusativ, Dativ, Genitiv) generated via strict JSON fields rather than Regex guessing.

Resilient Backend: AI API calls utilize an automated Retry/Exponential Backoff system to handle traffic timeouts gracefully.

UI/UX: Auto-focus input, responsive side-drawer menu, 200-character input limit with counter, and interactive grammar tables. Sentence analysis dynamically expands to a full-width bottom row while keeping the correction alert in the left column. Spellcheck is automatically disabled for multi-word inputs to save bandwidth.

Tech Stack: > - Frontend: Vanilla HTML5, CSS3, JavaScript (ES6)

Backend: Node.js, Express.js (deployed on Vercel as serverless functions)

Database/Cache: Upstash Redis

APIs: Groq (llama-3.3-70b-versatile), Google Gemini (2.5 Flash), Google Cloud Translation API, Unsplash API.

Next Immediate Feature: [Insert what you want to build next]. Please review the architecture notes below and provide the exact code needed.

2. File Structure & Roles
index.html
The single-page entry point.

Layout: Uses a wrapping flexbox (.central-box). The left column (.central-left) contains the autofocus search input, UI shimmers, word details area, and an isolated #correctionArea. The right column contains the context image. The #sentenceAnalysisArea sits outside the columns to span 100% of the width at the bottom.

Includes hidden grammar modals, a print-friendly layout, and a side-drawer navigation menu.

style.css
Follows Material Design 3 principles. Key classes include .theme-der/die/das for global CSS variable overrides, .translation-card, .word-card for interactive sentence breakdowns, .case-badge for strict color-coded grammar cases, and .shimmer for loading states. Mobile layout utilizes overflow-x: auto for wide grammar tables.

data.js
A static JSON-like file that contains materialData: Categorized Nouns (by gender), Adjectives (opposites), Verbs (conjugations), and default A1/A2 Reading Passages.

server.js (The Node/Express Backend - Hybrid Setup)

app.post('/api/spellcheck'): Database-first check -> Groq fallback. Ignores sentences (spaces) and capitalization.

app.post('/api/translate'): Database-first check -> Groq translates the word into 13 languages simultaneously and generates a safeImageSearchQuery.

app.post('/api/analyze-sentence'): Database-first (sentence:v3:) -> Gemini 2.5 Flash acts as a strict grammar teacher. Implements "Chain of Thought" prompting via an errorAnalysis array to ensure accurate Kasusrektion (e.g., Dativ verbs like helfen). Strictly outputs a "kasus" field. Note: Stripped of translation duties to save tokens.

app.post('/api/translate-sentence'): Uses Google Cloud Translation API (Promise.all) to translate the final, corrected sentence into the 13 target languages affordably.

app.get('/api/generate-reading'): Uses Groq (Temp: 0.9) to generate 3 highly creative, completely random A1-A2 German reading passages.

app.get('/api/image'): Checks Redis using a strict German Key. If missing, fetches a contextual image from Unsplash.

script.js (Frontend Logic)

translateBtn.addEventListener: Intercepts the submit. Auto-detects single words vs. sentences by counting spaces. Routes to the appropriate backend API and UI builder.

State Management: Explicitly hides #wordDetailsArea, removes theme-* body classes, and hides #correctionArea upon every new search to prevent UI crossover between word mode and sentence mode.

Sentence UI Engine:

Calls /api/analyze-sentence.

Puts the correction alert in the left column (#correctionArea).

Stacks interactive .word-card elements above the grammar explanation in the full-width bottom container.

Chains a secondary fetch to /api/translate-sentence using the corrected German sentence to populate the translation grid.

Performance: checkWordSuggestionAI is debounced and instantly aborted if the user types a space (sentence mode).

playAudio(): Native SpeechSynthesis API handler mapped to 13 different language locales.
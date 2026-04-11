Architecture & Technical Documentation
Project: Das Wort - German A1/A2 Context Translator & Learning App

1. AI Session Starter Prompt
Copy and paste the block below into your next AI session to instantly bring the AI up to speed on your project:

Act as a senior full-stack developer. I am building a German A1-A2 Language Learning & Translation Web App. >
Current State: The app translates a German word into 13 languages simultaneously using the Google Gemini 2.5 Flash API. It features dynamic UI color-changing based on noun genders (der=blue, die=pink, das=green). It utilizes a "Database First" architecture using Upstash Redis: it checks the global cache for auto-correct spelling, master translations, and sentence analysis before falling back to the AI.

Key Features:

Safe Image Search: The AI generates a classroom-safe English context query to fetch images via Unsplash.

Sentence Analysis (v3): Automatically detects sentences, auto-corrects grammar (specifically checking Kasusrektion via a Chain-of-Thought errorAnalysis buffer), explains the grammar in German, and generates interactive, clickable word-cards.

Resilient Backend: AI API calls utilize an automated Retry/Exponential Backoff system to handle 503 high-traffic timeouts gracefully.

Visual Grammar: Dynamic case badges (Nominativ, Akkusativ, Dativ, Genitiv) generated via strict JSON fields rather than Regex guessing.

UI/UX: Responsive side-drawer hamburger menu, auto-focus input, 200-character input limit with counter, interactive grammar tables, and AI-generated creative reading passages. Sentence analysis dynamically expands to a full-width bottom row while keeping the correction alert in the left column. User UI settings are persisted via localStorage.

Tech Stack: > - Frontend: Vanilla HTML5, CSS3, JavaScript (ES6)

Backend: Node.js, Express.js (deployed on Vercel as serverless functions)

Database/Cache: Upstash Redis

APIs: Google Gemini (2.5 Flash) for translations, spellchecking, sentence analysis, and story generation; Unsplash API for images.

Next Immediate Feature: [Insert what you want to build next]. Please review the architecture notes below and provide the exact code needed.

2. File Structure & Roles
index.html
The single-page entry point.

Layout: Uses a wrapping flexbox (.central-box). The left column (.central-left) contains the autofocus search input, UI shimmers, word details area, and the isolated #correctionArea. The right column contains the image. The #sentenceAnalysisArea sits outside the columns to span 100% of the width at the bottom.

Includes hidden grammar modals, a print-friendly layout, and a side-drawer navigation menu. Uses cache-busting query strings (e.g., style.css?v=1.1) for deployment updates.

style.css
Follows Material Design 3 principles. Key classes include .theme-der/die/das for global CSS variable overrides, .translation-card, .word-card for interactive sentence breakdowns, .case-badge for strict color-coded grammar cases, and .shimmer for loading states. Mobile layout utilizes overflow-x: auto for wide grammar tables.

data.js
A static JSON-like file that contains materialData: Categorized Nouns (by gender), Adjectives (opposites), Verbs (conjugations), and default A1/A2 Reading Passages.

server.js (The Node/Express Backend)
All AI features utilize the gemini-2.5-flash model and responseMimeType: "application/json" to guarantee perfect formatting. .replace(/```json/gi, '') security strips prevent Markdown rendering crashes.

Retry Logic: High-demand routes use a while(retries > 0) loop to automatically handle Google API 503 traffic spikes.

app.post('/api/spellcheck'): Database-first check -> Gemini fallback. Ignores sentences (spaces) and capitalization.

app.post('/api/translate'): Checks Upstash Redis. If missing, uses Gemini to translate the word into 13 languages. Generates a safeImageSearchQuery.

app.post('/api/analyze-sentence'): Uses a sentence:v3: cache key. Uses Gemini as a strict teacher. Implements "Chain of Thought" prompting via an errorAnalysis array to ensure accurate Kasusrektion (e.g., Dativ verbs like helfen). Strictly outputs a "kasus" field to prevent frontend regex guessing.

app.get('/api/generate-reading'): Uses Gemini (Temp: 0.9) to generate 3 highly creative, completely random A1-A2 German reading passages.

app.get('/api/image'): Checks Redis using a strict German Key. If missing, fetches a contextual image from Unsplash.

script.js (Frontend Logic)

translateBtn.addEventListener: Intercepts the submit. Auto-detects single words vs. sentences by counting spaces. Routes to the appropriate backend API and UI builder.

State Management: Explicitly hides #wordDetailsArea and removes theme-* body classes upon every new search to prevent UI crossover between word mode and sentence mode.

Sentence UI Engine: Splits rendering. Puts the correction alert in the left column (#correctionArea), and stacks the interactive .word-card elements above the grammar explanation in the full-width bottom container. Clicking a word card triggers a single-word translation search.

Visual Badges: Reads the explicit item.kasus from the JSON to dynamically generate .case-badge elements (e.g., .case-dativ).

playAudio(): Native SpeechSynthesis API handler mapped to 13 different language locales.

renderReadingPassages(): Fetches saved stories from localStorage (or data.js), formats them into HTML, triggers openModal().
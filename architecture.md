# Architecture & Technical Documentation
**Project:** Das Wort - German A1/A2 Context Translator & Learning App

## 1. AI Session Starter Prompt
*Copy and paste the block below into your next AI session to instantly bring the AI up to speed on your project:*

> **Act as a senior full-stack developer. I am building a German A1-A2 Language Learning & Translation Web App.** > 
> **Current State:** The app translates a German word into 13 languages simultaneously using Groq (Llama-3). It features dynamic UI color-changing based on noun genders (der=blue, die=pink, das=green). It utilizes a "Database First" architecture using Upstash Redis: it checks the global cache for auto-correct spelling and master translations before falling back to the AI. It features a Safe Image Search mechanism where the AI generates a classroom-safe English context query to fetch images via Unsplash. UI features include a responsive side-drawer hamburger menu, interactive grammar references, and AI-generated creative reading passages. User UI settings are persisted via `localStorage`.
> 
> **Tech Stack:** > - **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6) 
> - **Backend:** Node.js, Express.js (deployed on Vercel as serverless functions)
> - **Database/Cache:** Upstash Redis
> - **APIs:** Groq SDK (Llama-3.3-70b-versatile) for translations, spellchecking, and story generation; Unsplash API for images.
> 
> **Next Immediate Feature:** [Insert what you want to build next]. Please review this architecture and help me implement the next feature.

---

## 2. Tech Stack
* **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+). No heavy frameworks.
* **Backend:** Node.js with Express.js.
* **Hosting/Deployment:** Vercel (Serverless architecture).
* **Database/Caching:** Upstash Redis (Global Serverless Redis).
* **AI Provider:** Groq SDK (Model: `llama-3.3-70b-versatile`).
* **Image Provider:** Unsplash REST API.

## 3. Architecture Pattern
* **Client-Server API Model:** Frontend strictly communicates with the backend via REST endpoints (`/api/*`). Backend is hosted on Vercel as serverless functions.
* **Master Caching Layer:** To minimize API costs (Pay-As-You-Go) and maximize speed, the backend translates a word into *all* 13 languages at once, caches the master list in Redis, and serves it instantly to all future users. The frontend handles filtering based on user preferences.
* **Database-First Spellcheck:** Live spellcheck hits the Redis translation cache first. If the word is found, it bypasses the AI completely to return auto-corrections instantly and for free.

## 4. File Structure
```text
/
├── index.html        # Main application layout, universal modal, and side-drawer UI
├── style.css         # Styling, dynamic themes, drawer animations, and print media rules
├── script.js         # Frontend logic, API calling, and DOM manipulation
├── data.js           # Static learning materials database (Vocabulary, Grammar rules)
├── server.js         # Backend Express server, Redis connection, and Groq/Unsplash logic
├── vercel.json       # Vercel deployment configuration and routing rules
└── package.json      # Node.js dependencies (express, cors, groq-sdk, @upstash/redis)
5. Global Rules
ES Modules: The backend uses ES Modules (import/export).

Strict JSON for AI: All Groq AI prompts MUST include response_format: { type: "json_object" } and explicit JSON structure instructions to prevent UI-breaking string responses.

Classroom Safety Constraints: AI prompts must force English safeImageSearchQuery parameters to prevent inappropriate image fetches on Unsplash (combined with Unsplash content_filter=high).

German-Only Content: All static learning materials and grammar rules must be written strictly in German.

Dynamic Theming: App UI shifts based on articles: der (Blue), die (Pink), das (Green).

Responsive Layout: Content is globally scrollable (overflow-y: auto on body), and navigation is housed in a collapsible .nav-drawer accessible via a hamburger menu.

6. File Contents & Summaries
data.js
Contains materialData: Categorized Nouns (by gender), Adjectives (opposites), Verbs (conjugations), and default A1/A2 Reading Passages.

server.js
app.post('/api/spellcheck'): Database-first check -> Groq fallback. Includes strict result.length limits to prevent AI hallucination from breaking the frontend UI.

app.post('/api/translate'): Checks Upstash Redis. If missing, uses Groq to translate the word into 13 languages. AI generates a safeImageSearchQuery. (Includes regional rules for Farsi vs. Dari).

app.get('/api/generate-reading'): Uses Groq (Temp: 0.9) to generate 3 highly creative, completely random A1-A2 German reading passages.

app.get('/api/image'): Checks Redis. If missing, fetches a contextual image from Unsplash (using the English safeImageSearchQuery) with strict content filters.

script.js
toggleDrawer(): Controls the hamburger menu, side drawer, and overlay.

playAudio(): Native SpeechSynthesis API handler.

renderReadingPassages(): Fetches saved stories from localStorage (or data.js), formats them into HTML, triggers openModal().

checkWordSuggestionAI(): Debounced function that calls /api/spellcheck.

Event Listeners:

Checkbox generation: Loads localStorage preferences and saves them upon change.

#translateBtn click: Disables UI, shows shimmers, fetches backend APIs, toggles CSS color themes, filters the master language list, and renders the translationGrid.

#generateAiBtn click: Fetches 3 new AI stories and saves to localStorage.
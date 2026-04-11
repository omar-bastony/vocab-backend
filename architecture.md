# Architecture & Technical Documentation
**Project:** Das Wort - German A1/A2 Context Translator & Learning App

## 1. AI Session Starter Prompt
*Copy and paste the block below into your next AI session to instantly bring the AI up to speed on your project:*

> **Act as a senior full-stack developer. I am building a German A1-A2 Language Learning & Translation Web App.** > 
> **Current State:** The app translates a German word into 13 languages simultaneously using the **Google Gemini 1.5 Flash API**. It features dynamic UI color-changing based on noun genders (der=blue, die=pink, das=green). It utilizes a "Database First" architecture using Upstash Redis: it checks the global cache for auto-correct spelling, master translations, and sentence analysis before falling back to the AI. 
> 
> **Key Features:**
> - **Safe Image Search:** The AI generates a classroom-safe English context query to fetch images via Unsplash. 
> - **Sentence Analysis:** Automatically detects sentences, auto-corrects grammar (specifically checking *Kasusrektion*), explains the grammar in German, and generates interactive, clickable word-cards.
> - **Visual Grammar:** Dynamic regex-based pill badges for cases (Nominativ, Akkusativ, Dativ, Genitiv).
> - **UI:** Responsive side-drawer hamburger menu, 200-character input limit with counter, interactive grammar tables, and AI-generated creative reading passages. User UI settings are persisted via `localStorage`.
> 
> **Tech Stack:** > - **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6) 
> - **Backend:** Node.js, Express.js (deployed on Vercel as serverless functions)
> - **Database/Cache:** Upstash Redis
> - **APIs:** Google Gemini (1.5 Flash) for translations, spellchecking, sentence analysis, and story generation; Unsplash API for images.
> 
> **Next Immediate Feature:** [Insert what you want to build next]. Please review the architecture notes below and provide the exact code needed.

---

## 2. File Structure & Roles

**index.html**
The single-page entry point. Contains the search input (maxlength 200), UI shimmers for loading states, translation grid, word details area, sentence analysis container, hidden grammar modals, and the side-drawer navigation menu.

**style.css**
Follows Material Design 3 principles. Key classes include `.theme-der/die/das` for global CSS variable overrides, `.translation-card`, `.word-card` for interactive sentence breakdowns, `.case-badge` for color-coded grammar cases, and `.shimmer` for loading states.

**data.js**
A static JSON-like file that contains `materialData`: Categorized Nouns (by gender), Adjectives (opposites), Verbs (conjugations), and default A1/A2 Reading Passages.

**server.js (The Node/Express Backend)**
All AI features utilize `responseMimeType: "application/json"` to guarantee perfect formatting and utilize `.replace(/```json/gi, '')` security strips to prevent Markdown rendering crashes.
* **`app.post('/api/spellcheck')`**: Database-first check -> Gemini fallback. Ignores sentences (spaces) and capitalization. Includes strict result length limits to prevent UI breaking.
* **`app.post('/api/translate')`**: Checks Upstash Redis. If missing, uses Gemini to translate the word into 13 languages. Includes a security bouncer to reject sentences. AI generates a `safeImageSearchQuery`.
* **`app.post('/api/analyze-sentence')`**: Checks Redis. If missing, uses Gemini as a strict teacher to correct grammar, explain the rules in German, and break down every word into a dictionary base-form.
* **`app.get('/api/generate-reading')`**: Uses Gemini (Temp: 0.9) to generate 3 highly creative, completely random A1-A2 German reading passages.
* **`app.get('/api/image')`**: Checks Redis using a strict German Key. If missing, fetches a contextual image from Unsplash (using the English `safeImageSearchQuery`) with strict content filters.

**script.js (Frontend Logic)**
* **`translateBtn.addEventListener`**: Intercepts the submit. Auto-detects single words vs. sentences by counting spaces. Routes to the appropriate backend API and UI builder.
* **Sentence UI Engine**: Parses the `/api/analyze-sentence` output. Generates visual grammar explanations and interactive `.word-card` elements that, when clicked, automatically trigger a single-word translation search.
* **Visual Badges**: Uses a Regex detector (`/(Nominativ|Akkusativ|Dativ|Genitiv)/i`) to dynamically wrap grammar cases in colored pill badges inside modals.
* **`playAudio()`**: Native SpeechSynthesis API handler mapped to 13 different language locales.
* **`renderReadingPassages()`**: Fetches saved stories from localStorage (or data.js), formats them into HTML, triggers `openModal()`.
* **`checkWordSuggestionAI()`**: Debounced function that calls `/api/spellcheck`.
* **Event Listeners**: Drawer toggles, Character counters, and Checkbox generation (loads `localStorage` preferences and saves them upon change).
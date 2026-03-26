# Architecture & Technical Documentation
**Project:** Das Wort - German A1/A2 Context Translator & Learning App

## 1. AI Session Starter Prompt

> **Act as a senior full-stack developer. I am building a German A1-A2 Language Learning & Translation Web App.** > 
> **Current State:** The app allows users to input a German word and instantly translates it into up to 13 languages simultaneously using the Groq API (Llama-3). It features dynamic UI color-changing based on German noun genders (der=blue, die=pink, das=green), an AI spellchecker, and a contextual image fetcher via Unsplash. It also includes an interactive grammar reference and a feature that uses Groq to dynamically generate creative reading passages. We recently added Upstash Redis for global caching of translations/images, and `localStorage` to save the user's selected target languages.
> 
> **Tech Stack:** > - **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6) 
> - **Backend:** Node.js, Express.js (deployed on Vercel as serverless functions)
> - **Database/Cache:** Upstash Redis
> - **APIs:** Groq SDK (Llama-3.3-70b-versatile) for translations, spellchecking, and story generation; Unsplash API for images.
> 
> **Next Immediate Feature:** [Insert what you want to build next, e.g., "I want to add a quiz feature based on the cached translations" or "I need to add a user login system"]. Please review this architecture and help me implement the next feature.

---

## 2. Tech Stack
* **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+). No heavy frameworks (React/Vue) are used to maintain lightning-fast load times.
* **Backend:** Node.js with Express.js.
* **Hosting/Deployment:** Vercel (Serverless architecture).
* **Database/Caching:** Upstash Redis (Global Serverless Redis).
* **AI Provider:** Groq SDK (Model: `llama-3.3-70b-versatile`) for translation, spellchecking, and story generation.
* **Image Provider:** Unsplash REST API.

## 3. Architecture Pattern
* **Client-Server API Model / Serverless Monolith:** The frontend strictly communicates with the backend via REST API endpoints (`/api/*`). The backend is hosted on Vercel as a serverless function, meaning it spins up on-demand.
* **Caching Layer:** To minimize API costs and maximize speed, a global Redis cache intercepts translation and image requests. The backend translates a word into *all* 13 languages at once, caches the master list in Redis, and serves it instantly to all future users. The frontend handles filtering based on user preferences.

## 4. File Structure
```text
/
├── index.html        # Main application layout and UI structure
├── style.css         # Styling, dynamic themes, and print media rules
├── script.js         # Frontend logic, API calling, and DOM manipulation
├── data.js           # Static learning materials database (Vocabulary, Grammar rules)
├── server.js         # Backend Express server, Redis connection, and Groq/Unsplash logic
├── vercel.json       # Vercel deployment configuration and routing rules
└── package.json      # Node.js dependencies (express, cors, groq-sdk, @upstash/redis)
```

## 5. Global Rules
* **ES Modules:** The backend uses ES Modules (`import`/`export`). `require` is not allowed.
* **Strict JSON for AI:** All Groq AI prompts MUST include `response_format: { type: "json_object" }` and explicit JSON structure instructions in the prompt to prevent markdown/text formatting errors.
* **German-Only Content:** All static learning materials and grammar rules must be written strictly in German (no English).
* **Dynamic Theming:** The app UI dynamically shifts based on German articles: `der` (Blue), `die` (Pink), `das` (Green). This is handled via CSS custom properties and `body` class toggling.
* **Persistence:** User UI preferences (selected languages) and generated stories must be saved to `localStorage` so they persist across reloads.

## 6. File Contents & Summaries

### `data.js`
Acts as the static database for the learning materials.
* Contains the `materialData` object, which holds categorized Nouns (sorted by gender), Adjectives (opposites), Verbs (conjugations), and default A1/A2 Reading Passages.

### `server.js`
The backend API and server entry point.
* **`app.post('/api/spellcheck')`**: Uses Groq to check the spelling/capitalization of the inputted German word. Returns null if perfect, or the corrected word.
* **`app.post('/api/translate')`**: Checks Upstash Redis for the globally cached master translation. If not found, uses Groq to translate the word into all 13 supported languages at once, caches the result in Redis, and returns it. (Includes regional rules for Farsi vs. Dari).
* **`app.get('/api/generate-reading')`**: Uses Groq (with a high temperature of `0.9`) to generate 3 highly creative, completely random A1-A2 German reading passages based on dynamic themes.
* **`app.get('/api/image')`**: Checks Redis for an image URL. If not found, fetches a contextual image from Unsplash and caches it.

### `script.js`
The core frontend engine handling all user interactions and UI updates.
* **`playAudio(text, langCode)`**: Triggers the browser's native SpeechSynthesis API to read text aloud in the specified language.
* **`getSelectedLanguages()`**: Scans the DOM to return an array of currently checked language checkboxes.
* **`closeAllDropdowns()`**: Helper function that hides all dropdown menus (Languages, Grammar, Materials).
* **`openModal(title, htmlBody, showGenerateBtn)`**: Injects dynamic content into the universal modal window and displays it.
* **`renderReadingPassages()`**: Fetches saved stories from `localStorage` (or falls back to `data.js`), formats them into HTML, and triggers `openModal()`.
* **`closeGrammarModal()`**: Hides the modal window and resets its action buttons.
* **`checkWordSuggestionAI(val)`**: A debounced function that calls the backend `/api/spellcheck` while the user is typing to offer live auto-corrections.
* **`createTranslationCard(data)`**: Generates the HTML DOM element for a single translation card, including RTL language support and TTS bindings.
* **Event Listeners**:
  * Checkbox dynamic generation & `change` listener: Loads saved languages from `localStorage`, generates DOM labels, and saves language selections back to `localStorage` upon change.
  * `#translateBtn` click: Disables UI, shows loading shimmers, fetches translations and images from the backend, toggles CSS color themes based on noun gender, filters the returned master language list based on user selection, and renders the `translationGrid`.
  * `#generateAiBtn` click: Calls `/api/generate-reading`, saves the 3 new stories to `localStorage`, and re-renders the reading view.
  * `#printBtn` click: Triggers the browser's native `window.print()` function (styled by the `@media print` CSS block).
```
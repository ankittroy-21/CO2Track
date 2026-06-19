You are building a production-quality Carbon Footprint Awareness Platform web app. This is a hackathon submission for Hack2Skill PromptWars by Google for Developers. Every decision must be deliberate and professional — this should NOT look AI-generated or template-based.

---

## PROJECT OVERVIEW

App name: CO2Track
Stack: React + Vite, Supabase (for Authentication & PostgreSQL Database), Tailwind CSS v3, Recharts, Groq API (llama-3.1-8b-instant model), LocalStorage & Supabase sync for persistence.
Authentication: GitHub OAuth
Package manager: npm

---

## DESIGN PHILOSOPHY — CRITICAL

Do NOT use:
- Generic card-shadow-everywhere layouts
- Rounded-everything + gradient hero sections
- Cookie-cutter dashboard templates
- Emoji as icons (use Lucide React icons only)
- Animate-everything CSS

DO use:
- A clean, editorial, data-forward design
- A muted green + off-white + charcoal palette (#1a1a1a, #f5f2eb, #2d6a4f, #52b788, #d8f3dc)
- Thin borders (1px) instead of heavy shadows
- Typography-led hierarchy (Inter font, weights 400/500/600 only)
- Data visualization as the hero element, not decorative imagery
- Micro-interactions only where they communicate state (loading, success, error)
- Full-width desktop responsive 3-column grids to avoid unused empty spaces

---

## FILE STRUCTURE

src/
  components/
    Layout.jsx            # Shell: sidebar nav + main content area (3-column on desktop)
    EmissionGauge.jsx     # Animated circular gauge for total CO₂
    CategoryBreakdown.jsx # Donut chart + category bars
    ActivityForm.jsx      # Log activity form with validation
    InsightCard.jsx       # Single AI insight display card
    ChallengeCard.jsx     # Weekly challenge item
    ProgressBar.jsx       # Reusable accessible progress bar
  hooks/
    useEmissions.js       # Supabase emission state logic + database sync
    useGroqInsights.js    # Groq API hook with streaming, caching, and database sync
    useAIUsage.js         # Hook tracking monthly AI usage for rate limiting (max 2/month)
  utils/
    emissionFactors.js    # Pure functions: calculateEmission(category, sub), aggregations
    formatters.js         # formatCO2(kg), formatDate(), etc.
    logger.js             # Standardized development-conditional logger
    sanitize.js           # Sanitize user inputs and convert values safely
    storage.js            # Safe wrapper around localStorage with try/catch quota handling
  pages/
    Dashboard.jsx
    LogActivity.jsx
    Insights.jsx
    Challenges.jsx
    Onboarding.jsx
    Profile.jsx
  App.jsx
  main.jsx
eslint.config.js          # ESLint flat config setup

---

## EMISSION CALCULATION ENGINE (utils/emissionFactors.js)

Export these pure functions with JSDoc comments. Use IPCC AR6 / EPA emission factors:

const FACTORS = {
  transport: {
    car_petrol: 0.192,           // kg CO2 per km
    car_diesel: 0.171,
    car_electric: 0.053,
    bus: 0.089,
    train: 0.041,
    metro: 0.045,                // Indian Metro baseline
    auto_rickshaw: 0.075,        // Auto Rickshaw
    two_wheeler_petrol: 0.114,   // 2-Wheeler (Petrol)
    two_wheeler_electric: 0.035, // 2-Wheeler (Electric)
    flight_domestic: 0.255,      // kg CO2 per km
    flight_international: 0.195,
    bicycle: 0,
    walking: 0,
  },
  food: {
    mutton: 5.84,        // kg CO2 per meal serving (150g)
    chicken: 0.97,
    fish: 0.87,
    paneer: 2.50,        // Paneer / Dairy has ~2.5x higher emissions than plant proteins
    egg: 0.50,
    dal: 0.22,
    rice_meal: 0.32,
    veg_thali: 0.44,
    vegan: 0.32,
  },
  energy: {
    electricity_india: 0.82,  // kg CO2 per kWh (India Grid Intensity)
    electricity_solar: 0.05,  // Rooftop solar footprint
    natural_gas: 2.04,        // kg CO2 per cubic meter (PNG)
    lpg: 1.51,                // kg CO2 per liter (LPG cooking gas)
    kerosene: 2.50,
  },
  shopping: {
    clothing_item: 10.0,
    electronics_small: 50.0,
    electronics_large: 200.0,
    online_delivery: 0.5,
  }
}

export function calculateEmission(category, subcategory, quantity) { ... }
export function getTotalMonthlyEmission(logs) { ... }
export function getCategoryBreakdown(logs) { ... }
export function compareToGlobalAverage(totalKg) { ... } // India avg = 230 kg, global avg = 391.67 kg/month

---

## GROQ API INTEGRATION (hooks/useGroqInsights.js)

- Model: llama-3.1-8b-instant
- API key: read from import.meta.env.VITE_GROQ_API_KEY
- Endpoint: https://api.groq.com/openai/v1/chat/completions
- System prompt to send (inject user's emission data into it):

SYSTEM:
You are EcoTrack's carbon footprint advisor. The user's current monthly emissions are:
- Transport: {transportKg} kg CO₂
- Food: {foodKg} kg CO₂  
- Home energy: {energyKg} kg CO₂
- Shopping: {shoppingKg} kg CO₂
- Total: {totalKg} kg CO₂/month
- Global average: 391.67 kg CO₂/month
- User's status: {above/below} average by {percent}%

Give specific, ranked, actionable advice based on THIS user's actual biggest emission category. Be concise. Never give generic climate facts. Always start with their highest-impact category. Format your response as 3 numbered insights, each under 60 words.

- Stream responses token by token using fetch with ReadableStream.
- Cache streamed recommendations to `ai_insights` table on Supabase (scoped to the user ID) and sync to localStorage.
- Limit users to **2 AI insight generations per month** using the `ai_usage` table. Show remaining generation count.
- Maintain a collapsible accordion dropdown layout for previous generated insights. When expanding an old report, collapse the active or other reports.
- Show a skeleton loader during fetch.
- Handle errors gracefully with a retry button.

---

## PAGES

### Onboarding.jsx
- Multi-step form (3 steps), progress indicator at top.
- Step 1: Name (pre-filled from OAuth metadata), location (India / Global).
- Step 2: Primary transport (select), weekly km estimate, diet type (select).
- Step 3: Home energy source, avg monthly electricity bill (kWh), household size.
- Save to Supabase `profiles` table. On complete → redirect to Dashboard.
- Validate each step before advancing.

### Dashboard.jsx
- 3-column layout on desktop:
  - Left (2/3 width): EmissionGauge (animated count-up) and comparison bar placed side-by-side, followed by CategoryBreakdown.
  - Right (1/3 width): Recent Activity feed, Log Activity CTA, and Onboarding completed CTA.

### LogActivity.jsx
- 3-column layout on desktop:
  - Left (2/3 width): Tab row (Transport | Food | Energy | Shopping) containing forms with inputs and live preview.
  - Right (1/3 width): Today's footprint summary card and list of recent logged activities.
- On submit: validate → calculateEmission → save to Supabase `emission_logs` -> show success toast.

### Insights.jsx
- 3-column layout on desktop:
  - Left (1/3 width): Profile summary metadata, monthly breakdown progress bars, and Did You Know facts.
  - Right (2/3 width): AI Recommendations cards (with accordion dropdown for past reports) and follow-up Chat interface (maintains 5-message history).

### Challenges.jsx
- 3-column layout on desktop:
  - Left (1/3 width): Points progression Trophy card and Points rules.
  - Right (2/3 width): 6 weekly eco-challenge cards arranged in a grid.
- Earn badges and points (Easy=10, Medium=25, Hard=50). Progress bar showing points toward "Eco Champion" badge. Sync to Supabase `challenge_state`.

### Profile.jsx
- 3-column layout on desktop:
  - Left (2/3 width): Profile preference forms prefilled with baseline credentials, allowing users to edit and save.
  - Right (1/3 width): Carbon Baseline Guide explaining factors (solar footprint, India grid, transport, dairy comparison).

---

## ACCESSIBILITY & SEO REQUIREMENTS

- All form inputs must have associated <label> elements.
- All interactive elements focusable via keyboard.
- Color contrast ratio minimum 4.5:1 everywhere.
- aria-label on icon-only buttons, aria-live region for AI response streaming.
- Semantic HTML tags (main, nav, section, article, header) used correctly.
- Automatic SEO implementation: titles, meta descriptions, unique IDs, and fast load times.

---

## QUALITY ASSURANCE, CODE QUALITY & LINTING

Strict code standards enforced using ESLint flat configuration:
- Install dependencies: `eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, and `@eslint/js`.
- Rules: Enforce unused variable checks (`no-unused-vars`), undefined globals protection (`no-undef`), and proper hook dependency structures. Override `react/react-in-jsx-scope` to `'off'`.
- All utilities, hooks, and components must feature complete JSDoc annotations detailing `@param` and `@returns`.
- Components accepting props must declare React `PropTypes` validation. Page/route components taking no props must feature a `// No props — reads state via hooks/context` comment.
- No `console.log` statements in production files. Abstract logs behind `src/utils/logger.js`.

---

## TESTING (src/__tests__/)

Write Jest unit tests for:
1. `calculateEmission()` — test EVERY subcategory in `emissionFactors.js`.
2. Aggregation functions — `getTotalMonthlyEmission()` (empty logs, malformed fields), `getCategoryBreakdown()` (percentage sum constraints), and `compareToGlobalAverage()`.
3. Hooks — `useGroqInsights.js` (streaming chunks validation, rate limiting errors, caching).
4. Form validation — `ActivityForm.jsx` and `Onboarding.jsx` validations.

Collect coverage on utils/hooks with `npm run test:coverage` (target >80% statement coverage).

---

## ENVIRONMENT SETUP

Create `.env.example`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
```

Add `coverage/`, `.env`, and `dist/` to `.gitignore`.
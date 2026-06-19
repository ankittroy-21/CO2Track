You are building a production-quality Carbon Footprint Awareness Platform web app. This is a hackathon submission for Hack2Skill PromptWars by Google for Developers. Every decision must be deliberate and professional — this should NOT look AI-generated or template-based.

---

## PROJECT OVERVIEW

App name: EcoTrack
Stack: React + Vite, Tailwind CSS v3, Recharts, Groq API (llama-3.3-70b-versatile model), LocalStorage for persistence
Package manager: npm
Single public GitHub repo, one branch (main), under 10 MB

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

---

## FILE STRUCTURE

src/
  components/
    Layout.jsx           # Shell: sidebar nav + main content area
    EmissionGauge.jsx    # Animated circular gauge for total CO₂
    CategoryBreakdown.jsx # Donut chart + category bars
    ActivityForm.jsx     # Log activity form with validation
    InsightCard.jsx      # Single AI insight display card
    ChallengeCard.jsx    # Weekly challenge item
    ProgressBar.jsx      # Reusable accessible progress bar
  hooks/
    useEmissions.js      # All emission state logic + localStorage sync
    useGroqInsights.js   # Groq API call hook with loading/error states
  utils/
    emissionFactors.js   # Pure functions: calculateEmission(category, input)
    formatters.js        # formatCO2(kg), formatDate(), etc.
  pages/
    Dashboard.jsx
    LogActivity.jsx
    Insights.jsx
    Challenges.jsx
    Onboarding.jsx
  App.jsx
  main.jsx

---

## EMISSION CALCULATION ENGINE (utils/emissionFactors.js)

Export these pure functions with JSDoc comments. Use IPCC AR6 / EPA emission factors:

const FACTORS = {
  transport: {
    car_petrol: 0.192,      // kg CO2 per km
    car_diesel: 0.171,
    car_electric: 0.053,
    bus: 0.089,
    train: 0.041,
    flight_domestic: 0.255, // kg CO2 per km
    flight_international: 0.195,
    motorcycle: 0.114,
    bicycle: 0,
    walking: 0,
  },
  food: {
    beef: 6.61,         // kg CO2 per meal serving (150g)
    lamb: 5.84,
    pork: 1.72,
    chicken: 0.97,
    fish: 0.87,
    vegetarian: 0.44,
    vegan: 0.32,
  },
  energy: {
    electricity_india: 0.82,  // kg CO2 per kWh (India grid)
    electricity_global: 0.49,
    natural_gas: 2.04,         // kg CO2 per cubic meter
    lpg: 1.51,                 // kg CO2 per liter
  },
  shopping: {
    clothing_item: 10.0,   // kg CO2 per item
    electronics_small: 50,
    electronics_large: 200,
    online_delivery: 0.5,  // per package
  }
}

export function calculateEmission(category, subcategory, quantity) { ... }
export function getTotalMonthlyEmission(logs) { ... }
export function getCategoryBreakdown(logs) { ... }
export function compareToGlobalAverage(totalKg) { ... } // global avg = 391.67 kg/month

---

## GROQ API INTEGRATION (hooks/useGroqInsights.js)

- Model: llama-3.3-70b-versatile
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

- Stream responses token by token using fetch with ReadableStream
- Show a skeleton loader during fetch
- Handle errors gracefully with a retry button

---

## PAGES

### Onboarding.jsx
- Multi-step form (3 steps), progress indicator at top
- Step 1: Name, location (India / Global)
- Step 2: Primary transport (select), weekly km estimate, diet type (select)
- Step 3: Home energy source, avg monthly electricity bill (kWh slider), household size
- Store to localStorage as userProfile
- On complete → redirect to Dashboard
- No "next" button spam — validate each step before advancing

### Dashboard.jsx
- Top row: Large CO₂ number (animated count-up on mount), status badge ("Above average" in red-tinted / "Below average" in green-tinted)
- Comparison bar: user vs India avg (230 kg/mo) vs global avg (391 kg/mo)
- Category breakdown: horizontal bar chart, each category with its kg and % of total
- Recent activity feed (last 5 logs, time-relative)
- CTA card: "Log today's activity" linking to LogActivity

### LogActivity.jsx
- Tab row: Transport | Food | Energy | Shopping
- Each tab: clean form with appropriate inputs
  - Transport: mode (select), distance (number input with km), date
  - Food: meal type (select), number of servings
  - Energy: energy type, quantity
  - Shopping: item category, quantity
- On submit: validate → calculateEmission → append to logs in localStorage → show success toast (non-blocking, 3s auto-dismiss)
- Show running total for today at the top

### Insights.jsx
- User's emission profile summary at top (4 small stat cards)
- "Get AI Insights" button → calls Groq API with full context
- Streamed response renders into InsightCard components as it arrives
- Below: static "Did you know?" facts relevant to user's top emission category
- Chat interface at bottom: user can ask follow-up questions (maintains 5-message history in state)

### Challenges.jsx
- 6 weekly challenges shown as ChallengeCard components
- Each card: title, description, estimated CO₂ saving, difficulty badge, "Accept" / "Mark Complete" button
- Completed challenges show saved kg and a checkmark
- Points system: Easy=10pts, Medium=25pts, Hard=50pts
- Progress bar showing weekly points toward "Eco Champion" badge
- Store state in localStorage

---

## LAYOUT & NAVIGATION

Sidebar (desktop) / bottom nav (mobile):
- Dashboard (home icon)
- Log Activity (plus-circle icon)
- Insights (sparkles icon)
- Challenges (trophy icon)
- Profile link (user icon, shows onboarding data)

Active state: left border accent (#2d6a4f), slightly darker bg
No animations on nav transitions — instant feel

---

## ACCESSIBILITY REQUIREMENTS

- All form inputs must have associated <label> elements
- All interactive elements focusable via keyboard (no div-as-button)
- Color contrast ratio minimum 4.5:1 everywhere
- aria-label on icon-only buttons
- aria-live region for the AI response streaming area
- Semantic HTML: main, nav, section, article, header tags used correctly

---

## TESTING (src/__tests__/)

Write Jest unit tests for:
1. calculateEmission() — test each category with known inputs/outputs
2. getTotalMonthlyEmission() — test with sample log array
3. compareToGlobalAverage() — test above/below logic
4. formatCO2() — test formatting of different magnitudes

Run with: npm test

---

## ENVIRONMENT SETUP

Create .env.example:
VITE_GROQ_API_KEY=your_groq_api_key_here

Create .gitignore that includes .env but NOT .env.example

---

## README.md

Write a complete README with these exact sections:
1. Challenge vertical chosen (Carbon Footprint Awareness)
2. Approach and logic (emission factor methodology, AI personalization logic)
3. How the solution works (user flow, feature list)
4. Tech stack with justification for each choice
5. Local setup instructions (clone → npm install → add .env → npm run dev)
6. Assumptions made (emission factors source, India grid intensity, serving sizes)
7. Screenshots section (placeholder text, I'll add screenshots)
8. Live demo link (placeholder)

---

## SECURITY CHECKLIST

- GROQ API key ONLY in .env, never hardcoded
- All user inputs sanitized before calculation (parseFloat with fallback to 0)
- No eval(), no dangerouslySetInnerHTML
- Content Security Policy meta tag in index.html
- No sensitive data in localStorage (only emission logs and preferences — no PII beyond first name)

---

## FINAL QUALITY CHECKS before committing

- [ ] npm run build completes with zero errors
- [ ] npm test passes all tests
- [ ] No console.log statements left in production code (use a debug flag)
- [ ] All components have PropTypes or JSDoc param types
- [ ] README is complete and accurate
- [ ] .env is NOT committed (verify with git status)
- [ ] Repo is public, single branch named main
- [ ] Total repo size under 10 MB (check with du -sh .)

---

Build this completely. Start with the project scaffold (npm create vite), then utils, then hooks, then components, then pages, then tests, then README. Commit after each major section with a descriptive message like "feat: add emission calculation engine with tests".
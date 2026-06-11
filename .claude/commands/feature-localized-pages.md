# /feature-localized-pages

Build **localized landing pages** for German (DE), Hindi (HI), and Indonesian (ID) — the three largest non-English TurboLoop communities — without implementing full i18n routing. Each locale gets a dedicated, SEO-optimized landing page at a clean URL.

---

## Context

The project uses **Vite + React + Wouter** (not Next.js), so Next.js i18n routing is not applicable. Instead, we implement locale-specific pages as dedicated routes. This approach is simpler, fully SEO-friendly, and avoids the complexity of a full i18n framework.

**Existing infrastructure to leverage:**
- `client/src/App.tsx` — Wouter router (add new routes here)
- `client/src/components/PageShell.tsx` — the standard page wrapper (use this)
- `client/src/components/sections/YieldCalculator.tsx` — already has plan data (reuse)
- `client/src/components/sections/FaqSection.tsx` — FAQ content (translate key questions)
- `server/_vercel/_messagePools.ts` — already has German (`BLOG_HEADLINES_DE`) and Hindi (`BLOG_HEADLINES_HI`) copy for reference tone

---

## What to Build

### 1. Three New Page Files

Create the following files:

- `client/src/pages/LandingDE.tsx` — German landing page at `/de`
- `client/src/pages/LandingHI.tsx` — Hindi landing page at `/hi`
- `client/src/pages/LandingID.tsx` — Indonesian landing page at `/id`

### 2. Page Structure (Same for All Three)

Each landing page must include these sections in order:

**A. Hero Section**
- Headline in the local language (see translations below)
- Subheadline explaining TurboLoop in 1–2 sentences
- Two CTA buttons: "Jetzt starten / अभी शुरू करें / Mulai Sekarang" → links to `https://turboloop.io` and "Mehr erfahren / और जानें / Pelajari Lebih" → links to `/`
- Background: use the existing `BackgroundEffects` component

**B. Key Stats Bar**
Three stats in a horizontal row (or stacked on mobile):
- "0,9% täglich / 0.9% प्रतिदिन / 0,9% per hari"
- "54% Gesamt-ROI in 60 Tagen / 60 दिनों में 54% कुल ROI / 54% Total ROI dalam 60 hari"
- "Kein Impermanent Loss / कोई Impermanent Loss नहीं / Tanpa Impermanent Loss"

**C. How It Works (3 Steps)**
Simple 3-step explainer in the local language:
1. Deposit USDT on BSC
2. Earn 0.9% daily
3. Withdraw anytime

**D. Yield Calculator**
Reuse the existing `YieldCalculator` component as-is (numbers are universal).

**E. Localized FAQ**
5 key FAQ items translated into the local language. Use these questions:
1. What is TurboLoop?
2. Is it safe? (mention audit + renounced contract)
3. What is the minimum deposit?
4. How do I withdraw?
5. Where can I join the community? (link to Telegram channel)

**F. Community CTA**
A full-width CTA section with:
- Headline in local language: "Werde Teil der globalen Community / वैश्विक समुदाय से जुड़ें / Bergabunglah dengan Komunitas Global"
- Telegram channel button for the relevant language channel
- "Visit turboloop.tech" button

### 3. Translations

Use these approved translations. Do not deviate or auto-translate beyond what is provided here.

**German (DE)**
- Hero headline: "Verdiene 0,9% täglich auf dein USDT"
- Hero sub: "TurboLoop ist ein dezentrales Smart-Contract-Protokoll auf der BNB Chain. Kein Team-Zugriff. Kein Impermanent Loss. Nur Code."
- CTA 1: "Jetzt starten"
- CTA 2: "Mehr erfahren"
- Telegram: Link to `https://t.me/turboloop_de` (use env var `VITE_TELEGRAM_DE` if available, else hardcode)

**Hindi (HI)**
- Hero headline: "अपने USDT पर प्रतिदिन 0.9% कमाएं"
- Hero sub: "TurboLoop BNB Chain पर एक विकेंद्रीकृत स्मार्ट कॉन्ट्रैक्ट प्रोटोकॉल है। कोई टीम एक्सेस नहीं। कोई Impermanent Loss नहीं। सिर्फ कोड।"
- CTA 1: "अभी शुरू करें"
- CTA 2: "और जानें"
- Telegram: Link to `https://t.me/turboloop_hi`

**Indonesian (ID)**
- Hero headline: "Dapatkan 0,9% per hari dari USDT kamu"
- Hero sub: "TurboLoop adalah protokol smart contract terdesentralisasi di BNB Chain. Tidak ada akses tim. Tidak ada Impermanent Loss. Hanya kode."
- CTA 1: "Mulai Sekarang"
- CTA 2: "Pelajari Lebih"
- Telegram: Link to `https://t.me/turboloop_id`

### 4. SEO Meta Tags

Each page must have a `<SEOHead>` component with:
- `title`: localized (e.g., "TurboLoop — 0,9% täglich auf USDT | BNB Chain DeFi")
- `description`: localized, ≤155 characters
- `hreflang` alternate links pointing to `/en` (the homepage), `/de`, `/hi`, `/id`

### 5. Router Registration

In `client/src/App.tsx`, add three new `<Route>` entries:
```tsx
<Route path="/de" component={LandingDE} />
<Route path="/hi" component={LandingHI} />
<Route path="/id" component={LandingID} />
```

### 6. Navbar Language Switcher

Add a small language switcher to the `Navbar.tsx`. It should appear as a globe icon (🌐) in the top-right area of the navbar (before the "Launch App" button). On click, it shows a dropdown with:
- 🇬🇧 English → `/`
- 🇩🇪 Deutsch → `/de`
- 🇮🇳 हिंदी → `/hi`
- 🇮🇩 Indonesia → `/id`

The currently active locale should be highlighted.

---

## Acceptance Criteria

- [ ] `/de`, `/hi`, and `/id` routes render without errors.
- [ ] Each page has a localized hero, stats bar, 3-step explainer, calculator, FAQ, and CTA section.
- [ ] SEO meta tags are correct and include `hreflang` links.
- [ ] The Navbar language switcher appears and navigates correctly.
- [ ] The `YieldCalculator` component renders correctly on all three pages.
- [ ] No English text appears in the hero, stats, FAQ, or CTA sections (calculator labels may remain in English as they are numerical).
- [ ] Pages are mobile-responsive.

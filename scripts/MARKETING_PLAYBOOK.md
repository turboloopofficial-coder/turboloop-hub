# TurboLoop.tech — Launch Marketing Playbook

**Day 0 → Day 30 sequence.** Treat this as a living checklist. Tick boxes as you ship.

---

## Day 0 — launch day (Tuesday, 12:00 UTC recommended)

> Why Tuesday 12:00 UTC: catches EU lunch break + Asia evening + early US morning all in one window. Avoid Mondays (people are catching up) and Fridays (engagement drops by 40% post-Wednesday).

### Pre-flight check (do this 1 hour before posting)

- [ ] Visit `https://turboloop.tech/api/og-banner?type=launch` in browser → confirm 1200×630 PNG renders cleanly
- [ ] Paste `turboloop.tech` into Telegram message field (don't send) → confirm preview shows the new launch banner, not the old logo
- [ ] Same check on X compose, LinkedIn share dialog, WhatsApp draft
- [ ] Hit `/`, `/ecosystem`, `/security`, `/community`, `/creatives`, `/feed` — confirm all 200 OK
- [ ] Open GA4 Realtime — confirm tracking active

### Launch posts

- [ ] **12:00 UTC — @TurboLoop_Official broadcast**
  - Run: `node scripts/post-launch-message.mjs --dry-run` first to preview
  - Then: `node scripts/post-launch-message.mjs` (interactive confirmation)
  - **PIN the message** for 7 days (Telegram → ⋮ → Pin → "Notify all members" ON)
- [ ] **12:00 UTC — @TurboLoop_Chat** (cross-post; do NOT pin — let conversation breathe)
- [ ] **12:00 UTC + 30 min — Founder/team replies** to first 3-5 community comments personally (sets engagement floor; the algorithm rewards early activity)

### Cross-channel push (12:00 UTC + 4 hours)

- [ ] **X thread** (5 tweets max — never use more, engagement falls off):
  - **Tweet 1:** Launch banner + "TurboLoop.tech is live. Not a landing page. A hub. Thread ↓"
  - **Tweet 2:** Screenshot of `/ecosystem` + "Six pillars, each with their own deep-dive."
  - **Tweet 3:** Screenshot of `/security` + "Locked. Audited. Verifiable. We don't ask for trust — we earn it."
  - **Tweet 4:** Screenshot of `/creatives` + "141 ready-to-share banners with captions in 48 languages. Take them. Translate them. Use them."
  - **Tweet 5:** "→ turboloop.tech" + retweet ask + hashtags `#DeFi #Web3Community #Crypto`
- [ ] **YouTube community post** — banner + 2-line description, link in post
- [ ] **LinkedIn post** (founder's personal, not company) — same banner + 80-word context

### Day 0 metrics target (first 24h)

- `/` page views ≥ 5× normal daily baseline
- Avg pages/session ≥ 2.5 (proves the multi-page restructure pays off)
- Telegram message views ≥ 60% of subscriber count

---

## Day 1 — Wednesday: international rollout

- [ ] **08:00 UTC** — Send `scripts/COUNTRY_LEADS_BRIEF.md` to 6 country leads (DE / NG / ID / IN-Hindi / TR / BR) via DM or shared channel
- [ ] **All day** — Country leads post translated versions in regional Telegrams + pin for 7 days
- [ ] **18:00 UTC** — Reply in @TurboLoop_Chat with a "🌍 Translation thread" listing every translated post link as it comes in

---

## Day 2 — Thursday: re-engagement

- [ ] **Telegram poll** in @TurboLoop_Chat: *"Which page surprised you most?"* — options: 🛡 Security · 📚 Library · 🎨 Creatives · 🚀 Roadmap · 🌐 Ecosystem
- [ ] Use the poll result to choose which page to feature in next week's deep-dive thread
- [ ] **X retweet bump** — quote-retweet your own Day 0 launch tweet with a line like *"36 hours in. [N] sessions. [N] new visitors. The hub is finding its readers."*

---

## Day 3 — Friday: walkthrough video

- [ ] **YouTube walkthrough** (5 min, evergreen) — founder/host clicks through every page, narrates each one, ends on *"Send this URL to anyone who asks what TurboLoop is."*
- [ ] Cross-post link to: @TurboLoop_Official, @TurboLoop_Chat, X, all 6 country lead channels
- [ ] Update video title with primary keyword: **"TurboLoop.tech — full walkthrough of the hub (5 min)"**

---

## Day 7 — Tuesday: AMA

- [ ] **AMA in @TurboLoop_Chat**, 1 hour, scheduled (announce 24h ahead with banner + countdown)
  - Topic: *"Ask anything about the hub, the roadmap, or the next 90 days."*
- [ ] Country leads do **mini-AMAs** in their regional groups same week
- [ ] Compile top 5 AMA questions → publish as a `/blog/ama-week-1` post the following Monday

---

## Week 2-4 — compounding

### Always-on (running automatically)

- [x] Daily Telegram cron (3 messages/day): 1 evening blog + 2 Zoom T-30 reminders → already deployed
- [x] Every blog post auto-promotes with banner + page link → already deployed

### Manual weekly tasks

- [ ] **Every Monday** — pick the page with lowest GA4 traffic that week, write a Telegram thread highlighting one specific feature on it
- [ ] **Every Wednesday** — share one country-lead translated post quote in the main @TurboLoop_Official to keep the international rollout visible
- [ ] **Every Friday** — post a "this week on TurboLoop.tech" wrap (3 stats: pages indexed, new visitors, top page)

### Always-on tactics

- [ ] Update **email signature** for the team: `TurboLoop.tech — the hub`
- [ ] Update **Telegram channel description** of @TurboLoop_Official → `The TurboLoop hub: turboloop.tech`
- [ ] Pinned tweet on @TurboLoop_io stays up for **30 days minimum**
- [ ] All country leaders include `turboloop.tech` in their group descriptions

---

## Channel-specific copy guides

### @TurboLoop_Official (broadcast)
- Full English message, banner, CTA buttons
- Formal tone, no emoji walls
- Pin for 7 days

### @TurboLoop_Chat (group)
- Same message + banner
- Append: *"What page should we feature next week? React with the matching emoji: 🛡 security · 📚 library · 🎨 creatives · 🚀 roadmap"*
- Do NOT pin (let conversation breathe)

### X / Twitter (@TurboLoop_io)
- 5-tweet thread (NEVER longer)
- One screenshot per tweet 2-4
- Hashtags ONLY in the last tweet
- Quote-tweet bump at +36h

### YouTube
- Community post (banner + headline)
- + dedicated 5-min walkthrough video on Day 3
- All video titles include primary keyword

### LinkedIn (founder personal account)
- Banner + 80 words + URL
- Tone: "what we built and why it matters" — professional, not hype-y

### WhatsApp (regional groups)
- Single line + URL only: *"TurboLoop.tech is live → turboloop.tech"*
- WhatsApp auto-fetches the OG card — the banner does the work

### Country lead Telegrams
- Translated message via `COUNTRY_LEADS_BRIEF.md`
- + optional local context paragraph
- Pin for 7 days

---

## Metrics to watch

| Window | Metric | Source | Target |
|---|---|---|---|
| Day 0 | `/` page views | GA4 | 5-10× baseline |
| Day 0 | Avg pages/session | GA4 | > 2.5 |
| Day 0 | TG message views | Telegram | > 60% of subscribers |
| Day 1 | Translated post engagement | Country lead reports | ≥ 1 organic re-share each |
| Day 7 | `/ecosystem` rank in GA4 | GA4 | top 3 secondary page |
| Day 14 | Sitemap → Search Console | GSC | 34/34 indexed |
| Day 30 | Returning visitors | GA4 | ≥ 25% of total |
| Day 30 | Top entry page (organic) | GSC | one of `/ecosystem`, `/security`, `/feed` |

---

## What NOT to do

- ❌ Don't post on Mondays or Fridays — engagement is 40% lower
- ❌ Don't use more than 5 tweets in the X thread — diminishing returns
- ❌ Don't repost the same exact message in different channels — slightly tailor each
- ❌ Don't ask for retweets/likes in the launch post itself — comes across needy
- ❌ Don't use stock crypto imagery — banner is bespoke, keep it the only visual hero
- ❌ Don't translate URL paths (`/ecosystem` stays English even in Hindi/Turkish/Portuguese versions)

---

## When the playbook ends

After Day 30, switch from "launch mode" to "sustained content mode" — automated daily Telegram posts (already running), weekly blog posts (already scheduled May 27 → Jun 8), and quarterly hub updates announcing new pages or features.

The hub is no longer a launch — it's the home base.

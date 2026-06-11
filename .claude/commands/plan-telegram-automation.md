# /plan-telegram-automation

Generate a comprehensive, code-driven strategy and execution plan for expanding the Turbo Loop Telegram automation ecosystem. This plan focuses on live data integration, Ask AI capabilities, and a fully automated 12-slot daily content schedule designed to educate, create FOMO, and drive conversions without relying on manual scheduling tools.

---

## Strategic Foundation: The Intelligent Community Hub

Telegram is the primary infrastructure layer for Web3 communities. Our strategy moves away from static FAQs and manual scheduling. We are building an **Intelligent Community Hub** that leverages real-time data, AI-driven support, and a meticulously crafted, fully automated content schedule to drive engagement and sales.

The core requirements for this new system are:
1.  **No Omni-Composer Dependency:** All recurring posts must be hardcoded into the master cron schedule.
2.  **High Frequency:** 12 posts per day (one every 2 hours).
3.  **High Variance:** Every post must feel unique, utilizing rotation logic and dynamic framing.
4.  **Preserve Existing Automation:** Zoom reminders, the daily blog publish, and the daily film broadcast must remain untouched.

---

## Pillar 1: Live Data Triggers (The "Proof" Layer)

In DeFi, trust is built on transparency and verifiable data. We must integrate live protocol metrics directly into the chat interface to prove the system works.

| Command | Data Source | What it shows | Strategic Value |
|---------|-------------|---------------|-----------------|
| `/burns` | `turboloop.io/api/proxy/buybacks` | Last 3 buybacks: USDT spent, TURBO burned, tx hash | Proves the deflationary mechanism is actively working, creating FOMO. |
| `/top` | `country_leaderboard` DB table | Top 5 countries by community size | Gamifies community participation and sparks regional pride. |
| `/stats` | DexScreener API | TVL, liquidity, volume | Builds absolute trust through transparency. |
| `/price` | `/api/token-price` | Live TURBO price + 24h change | Provides instant access to the most critical conversion metric. |

---

## Pillar 2: Ask AI Telegram Integration (The "Smart" Layer)

We will bring the power of the web-based Ask AI (backed by Claude 3.5 Haiku and a 40-article knowledge base) directly into the Telegram group.

| Component | Implementation Details |
|-----------|------------------------|
| **Trigger Mechanism** | Update `telegram-webhook.ts` to intercept messages starting with `/ask` or mentioning `@TurboLoop_Bot`. |
| **Backend Routing** | Route these specific messages to the existing `chat/route.ts` logic, utilizing the same `KB_CONTENT` and Anthropic streaming logic. |
| **Response Formatting** | Ensure the AI's markdown output is converted to Telegram-compatible HTML (`<b>`, `<i>`, `<code>`, `<a>`). |
| **Fallback Protocol** | If the AI cannot answer confidently, it must append: *"I'm an AI assistant. For official support, contact @TurboLoop_Support."* |

---

## Pillar 3: The 12-Slot Fully Automated Content Schedule

We will implement a 12-slot daily schedule (one post every 2 hours) directly in `cron-master.ts`. To prevent banner blindness, we will use deterministic rotation logic (`dayOfYear % poolSize`) to ensure the content feels fresh every day.

### The Daily Rotation (UTC Times)

| Time | Slot Name | Content Source | Framing / Variance Strategy |
|------|-----------|----------------|-----------------------------|
| **00:00** | **Midnight Math** | `MONTHLY_COMPOUND_BANNERS` | Focus on the 54% Ultimate plan. Rotate through the 10 deposit tiers (e.g., $500 today, $10,000 tomorrow). |
| **02:00** | **Global Reach** | Live `/top` data | Dynamic post highlighting the current top 3 countries. "The movement is growing." |
| **04:00** | **Security First** | Hub Promo (Security/Code-is-Law) | Rotate through the 3 caption variants for the Security and Code-is-Law hub pages. |
| **06:00** | **Morning Hook** | Hub Promo (Calculator/Apply) | Rotate through the 3 caption variants for the Calculator and Apply hub pages. |
| **08:00** | **Tokenomics** | Hub Promo (Ecosystem/Leaderboard) | Rotate through the 3 caption variants for the Ecosystem and Leaderboard hub pages. |
| **10:00** | **Live Burn Proof** | Live `/burns` data | Dynamic post showing the exact USDT spent on the most recent buyback. "Deflation in action." |
| **12:00** | **Midday Proof** | `MONTHLY_COMPOUND_BANNERS` | Focus on the 24% Power plan. Rotate through the 10 deposit tiers. |
| **14:00** | **The Deep Dive** | Existing Blog Cron | *Untouched.* Publishes the daily blog post. |
| **16:00** | **Community Voice** | Hub Promo (Community/FAQ) | Rotate through the 3 caption variants for the Community and FAQ hub pages. |
| **18:00** | **The Vision** | Existing Film Cron | *Untouched.* Broadcasts the daily Cinematic Universe film. |
| **20:00** | **Live Stats** | Live `/stats` data | Dynamic post showing current liquidity and volume. "The protocol is healthy." |
| **22:00** | **Nightly Education**| Hub Promo (Learn/Blog) | Rotate through the 3 caption variants for the Learn and Blog hub pages. |

*Note: Existing Zoom reminders (15:00 and 16:30 UTC) remain untouched and will fire alongside this schedule.*

### Implementation Details for `cron-master.ts`

To implement this without Omni-Composer, we will add new `isInWindow(h, m)` blocks to `cron-master.ts`.

For the dynamic live data posts (02:00, 10:00, 20:00), the cron will fetch the data directly from the respective APIs or database tables, format it into a Telegram-friendly HTML caption, and dispatch it using `tgBroadcastPhoto` or `tgSendMessage`.

For the Hub Promos, we will utilize the existing `pickTodaysHubPromo()` logic but modify it to accept a specific subset of pages (e.g., `pickTodaysHubPromo(['security', 'code-is-law'])`) to ensure the content matches the slot's theme.

---

## Execution Roadmap

**Stage 1: Live Data Triggers (Days 1-3)**
Implement the `/burns`, `/top`, `/stats`, and `/price` commands in `telegram-webhook.ts`.

**Stage 2: The 12-Slot Cron Overhaul (Days 4-7)**
Add the 12 new time slots to `cron-master.ts`. Implement the dynamic data fetching for the 02:00, 10:00, and 20:00 slots. Update the Hub Promo selection logic to support themed rotation.

**Stage 3: Ask AI Integration (Days 8-14)**
Modify the webhook to detect `/ask` commands, route the query to the Anthropic API using the existing `KB_CONTENT`, and format the response for Telegram HTML.

---

## Usage Instructions

This document serves as the architectural blueprint for the fully automated Turbo Loop Telegram system. To begin implementing a specific stage, create a new Claude session and instruct it to execute the relevant actions outlined in the tables above.

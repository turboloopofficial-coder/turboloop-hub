# /plan-telegram-automation

Generate a comprehensive strategy and execution plan for expanding the Turbo Loop Telegram automation ecosystem, focusing on live data, Ask AI integration, and a mixed content schedule.

---

## Current Content & Automation State

Turbo Loop possesses a massive repository of high-quality content and a robust automation foundation, but they are currently siloed.

The **Content Arsenal** includes 40 comprehensive blog posts covering everything from tokenomics to MetaMask setup. It features 20 "Cinematic Universe" films (Seasons 1-4) that explain core concepts visually. There are 42 distinct "Hub Promos" covering all 14 site pages, complete with pre-written captions and banners. Additionally, the system includes daily compounding projection banners and a fully functional Ask AI chatbot backed by Claude 3.5 Haiku, which is currently restricted to the web interface.

The **Automation Infrastructure** consists of a reactive auto-reply webhook (`telegram-webhook.ts`) that uses 15 static regex triggers. It also includes a proactive master cron (`cron-master.ts`) that fires every five minutes, handling daily blog announcements, Zoom reminders, and film broadcasts. The Omni-Composer allows for admin-scheduled posts to specific language channels.

The primary gap is that the Telegram group is currently a static FAQ bot and a broadcast channel. It needs to become an interactive, intelligent, and dynamic community hub that drives engagement and conversions.

---

## The Grand Plan: Intelligent Community Hub

To transform the Telegram presence, we must execute a three-pillar strategy: Live Data Integration, Ask AI Chat Integration, and a Master Content Schedule.

### Pillar 1: Live Data Triggers (The "Proof" Layer)

Static answers do not build trust; verifiable, real-time data does. We must integrate live protocol metrics directly into the chat interface.

| Feature | Implementation Details | Strategic Value |
|---------|------------------------|-----------------|
| **Live Burn Feed (`/burns`)** | Fetch the latest three buyback executions from `turboloop.io/api/proxy/buybacks`. Display the exact USDT spent, TURBO burned, and transaction hashes. | Proves the deflationary mechanism is actively working, directly in the chat. |
| **Live Leaderboard (`/top`)** | Fetch the current top five countries from the `country_leaderboard` table. | Gamifies community participation and sparks regional pride. |
| **Live Protocol Stats (`/stats`)** | Integrate with the main protocol's TVL endpoint or DexScreener liquidity data. | Builds trust through absolute transparency. |

### Pillar 2: Ask AI Telegram Integration (The "Smart" Layer)

The current regex-based triggers are brittle. We must bring the power of the web-based Ask AI directly into the Telegram group.

| Component | Implementation Details | Strategic Value |
|-----------|------------------------|-----------------|
| **Trigger Mechanism** | Update `telegram-webhook.ts` to intercept messages starting with `/ask` or mentioning `@TurboLoop_Bot`. | Provides a clear, intentional way for users to invoke the AI without it interrupting normal conversation. |
| **Backend Routing** | Route these specific messages to the existing `chat/route.ts` logic, bypassing the web-specific rate limits but utilizing the same `KB_CONTENT` and Anthropic streaming logic. | Reuses the highly optimized, prompt-cached knowledge base (currently 40 articles deep) without duplicating code. |
| **Response Formatting** | Ensure the AI's markdown output is converted to Telegram-compatible HTML (`<b>`, `<i>`, `<code>`, `<a>`). | Maintains a native, premium feel within the Telegram interface. |
| **Fallback Protocol** | If the AI cannot answer confidently, it must append: *"I'm an AI assistant. For official support, contact @TurboLoop_Support."* | Prevents hallucinations and ensures users always have an escalation path. |

### Pillar 3: The Master Content Schedule (The "Engagement" Layer)

We must move away from broadcasting single content types and instead weave a rich, daily tapestry of education, proof, and conversion hooks using the Omni-Composer and Master Cron.

| Time (UTC) | Content Type | Source / Mechanism | Strategic Goal |
|------------|--------------|--------------------|----------------|
| **08:00** | **The Hook** (Hub Promo) | `pickTodaysHubPromo()` via Cron | Drives morning traffic to specific hub pages (e.g., Calculator, Security, Apply). |
| **12:00** | **The Proof** (Compounding) | `pickTodaysMonthlyBanner()` via Cron | Shows the mathematical reality of the Loop Plans using high-quality projection banners. |
| **14:00** | **The Deep Dive** (Blog) | Existing Blog Publish Cron | Educates the community on complex topics (e.g., Impermanent Loss, Tokenomics). |
| **18:00** | **The Vision** (Film) | `pickTodaysFilm()` via Cron | Reinforces the brand narrative and core philosophy through the Cinematic Universe. |
| **Random** | **The Pulse** (Poll/Trivia) | Omni-Composer (Scheduled) | Drives active clicks and engagement (e.g., "Which feature are you most excited about?"). |

---

## Execution Roadmap

The implementation of this grand plan will be rolled out in three distinct stages to ensure stability and continuous delivery of value.

**Stage 1: Live Data & Schedule Overhaul (Next 7 Days)**
Focus on implementing the Live Data Triggers (`/burns`, `/top`, `/stats`) by extending the existing `telegram-webhook.ts` file. Simultaneously, update `cron-master.ts` to implement the new Master Content Schedule, ensuring the Hub Promos and Compounding Banners fire at their designated times.

**Stage 2: Ask AI Integration (Next 14 Days)**
Execute the complex integration of the Ask AI system into Telegram. This involves modifying the webhook to detect `/ask` commands, routing the query to the Anthropic API using the existing `KB_CONTENT`, and formatting the response for Telegram HTML.

**Stage 3: Optimization & Regional Rollout (Next 30 Days)**
Monitor the Ask AI responses and refine the `SYSTEM_BEHAVIOR` prompt as needed. Begin utilizing the Omni-Composer to schedule translated versions of the Master Content Schedule into the `telegram_de`, `telegram_hi`, and `telegram_id` channels.

---

## Usage Instructions

This document serves as the architectural blueprint for the next generation of Turbo Loop's Telegram automation. When implementing a new feature, refer back to this plan to ensure it aligns with the broader ecosystem strategy.

To begin implementing a specific stage, create a new Claude session and instruct it to execute the relevant actions outlined in the tables above.

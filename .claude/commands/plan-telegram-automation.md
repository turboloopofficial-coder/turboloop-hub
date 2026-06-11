# /plan-telegram-automation

Generate a comprehensive strategy and execution plan for expanding the Turbo Loop Telegram automation ecosystem.

---

## Current State Analysis

Turbo Loop currently operates a dual-layer Telegram automation system, consisting of a reactive auto-reply webhook and a proactive master cron scheduler.

The **Auto-Reply Webhook** (`server/_vercel/telegram-webhook.ts`) functions as a reactive, pull-based system. It listens to incoming messages in groups and direct messages, firing canned HTML replies based on 15 hardcoded regex keyword triggers (such as `contract`, `audit`, `buy`, and `sell`). To ensure sub-500ms response times, live token price data is fetched from a database cache that refreshes every five minutes. However, this system is limited by its reliance on static responses, lack of conversational memory, and inability to track user state.

The **Master Cron** (`server/_vercel/cron-master.ts`) operates as a proactive, push-based system. A five-minute external pinger triggers a Vercel serverless function that dispatches scheduled messages based on specific UTC time slots. These hardcoded schedules include daily blog publishes, Zoom reminders, and cinematic film releases. Additionally, the system features an **Omni-Composer (V2)**, which utilizes a dynamic queue in the `scheduled_posts` table. This allows administrators to schedule one-off or recurring posts via cron expressions to specific channels like `telegram_en` and `telegram_de`. Despite its power, the Omni-Composer is currently underutilized for community engagement, and the hardcoded schedules require code deployments to modify.

---

## The Grand Plan: Next-Generation Telegram Automation

To elevate the Turbo Loop Telegram presence from a basic broadcast and FAQ channel to a highly engaging, conversion-optimized community hub, we must implement a series of strategic upgrades across four distinct phases.

### Phase 1: Dynamic Data Integration (The "Live" Bot)

The auto-reply bot currently relies heavily on static text. We need to connect it to live protocol data to make it a true utility for the community. This involves integrating real-time metrics directly into the chat interface.

| Feature | Action Required | Strategic Value |
|---------|-----------------|-----------------|
| **Live Burn Feed** | Add a trigger (`/burns`) that fetches the latest three buyback executions from `turboloop.io/api/proxy/buybacks`. | Proves the deflationary mechanism is actively working, directly in the chat. |
| **Live Leaderboard** | Add a trigger (`/top`) that fetches the current top five countries from the `country_leaderboard` table. | Gamifies community participation and sparks regional pride. |
| **Live Protocol Stats** | Integrate with the main protocol's TVL endpoint or DexScreener liquidity data for a `/stats` command. | Builds trust through absolute transparency. |

### Phase 2: Proactive Engagement (The "Community Manager" Bot)

The cron system currently focuses on broadcasting announcements. It must evolve to actively drive community engagement through educational and interactive content.

| Feature | Action Required | Strategic Value |
|---------|-----------------|-----------------|
| **Daily Trivia** | Schedule a recurring daily post via Omni-Composer pulling from a pool of educational snippets about DeFi and Turbo Loop mechanics. | Educates newcomers passively without requiring them to read extensive documentation. |
| **Weekly Polls** | Schedule a weekly poll via Omni-Composer asking the community about desired features or testing their protocol knowledge. | Drives active engagement and clicks rather than passive reading. |
| **Milestone Celebrations** | Add a cron task that monitors token price or total burned amount, automatically broadcasting a celebratory message with a generated OG image when milestones are crossed. | Creates organic hype moments and celebrates collective achievements. |

### Phase 3: Regional Expansion (The "Global" Bot)

As Turbo Loop expands internationally into markets like Germany, Nigeria, Indonesia, and India, the automation infrastructure must scale to support localized communities natively.

| Feature | Action Required | Strategic Value |
|---------|-----------------|-----------------|
| **Multi-Language Replies** | Refactor `telegram-webhook.ts` to detect incoming message language or use language-specific commands (e.g., `/buy_de`) to reply appropriately. | Supports non-English speakers natively and reduces friction for global users. |
| **Regional Routing** | Fully utilize the `telegram_de`, `telegram_hi`, and `telegram_id` channels in the `scheduled_posts` table, ensuring major announcements are translated and scheduled simultaneously. | Ensures consistent, localized messaging across all global communities. |

### Phase 4: AI-Powered Support (The "Smart" Bot)

The current regex-based triggers are brittle and require users to guess the exact keywords. We must transition to a more intelligent, context-aware support system.

| Feature | Action Required | Strategic Value |
|---------|-----------------|-----------------|
| **Semantic Search / RAG** | Replace regex triggers with a Retrieval-Augmented Generation (RAG) system. The bot will search `blog_posts` and FAQ content, using an LLM to generate conversational answers. | Provides human-like support 24/7, drastically reducing the load on human administrators. |
| **Sentiment Monitoring** | Add a background cron task that analyzes chat sentiment over the last 24 hours, alerting admins via a private channel if negative sentiment spikes. | Allows the team to proactively address issues, confusion, or FUD before they escalate. |

---

## Execution Roadmap

The implementation of this grand plan will be rolled out in three distinct stages to ensure stability and continuous delivery of value.

**Immediate Wins (Next 7 Days)**
Focus on implementing Phase 1 (Live Data Triggers) by extending the existing `telegram-webhook.ts` file. Simultaneously, begin scheduling Phase 2 content (Trivia and Polls) using the already available Omni-Composer user interface.

**Medium Term (Next 30 Days)**
Execute Phase 3 (Regional Expansion) by refactoring the webhook handler to support localization dictionaries. Additionally, build the automated milestone celebration logic into `cron-master.ts` to capitalize on protocol growth.

**Long Term (Next 90 Days)**
Undertake the complex integration of Phase 4 (AI-Powered Support). This involves connecting the Anthropic API to the webhook handler and establishing the existing blog and FAQ database as the primary knowledge base for the RAG system.

---

## Usage Instructions

This document serves as the architectural blueprint for all future Telegram automation development. When implementing a new feature, refer back to this plan to ensure it aligns with the broader ecosystem strategy.

To begin implementing a specific phase, create a new Claude session and instruct it to execute the relevant actions outlined in the tables above.

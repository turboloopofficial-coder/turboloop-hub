import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

async function seedBlogs() {
  console.log('Seeding blog posts...');

  // Blog Post 1: What is Turbo Loop?
  const blog1Title = 'What Is Turbo Loop? The Complete DeFi Ecosystem Explained';
  const blog1Slug = 'what-is-turbo-loop-complete-defi-ecosystem';
  const blog1Excerpt = 'Turbo Loop is more than a yield farming protocol. It is a complete DeFi ecosystem built on Binance Smart Chain, combining six powerful pillars into one seamless platform.';
  const blog1Content = `# What Is Turbo Loop? The Complete DeFi Ecosystem Explained

If you have been exploring the world of decentralized finance, you have likely come across dozens of yield farming protocols, each promising extraordinary returns. Most of them share a common problem: they are unsustainable. Turbo Loop was built to be different.

## More Than Yield Farming

Turbo Loop is not just another farming protocol. It is a **complete DeFi ecosystem** built on Binance Smart Chain (BSC) that combines six powerful pillars into one seamless, self-sustaining platform.

### The Six Pillars

**1. Turbo Buy** — A fiat-to-crypto gateway powered by MoonPay. New users can purchase BNB and USDT directly with their credit card, bank transfer, or local payment method. No need to navigate complicated exchanges.

**2. Turbo Swap** — A built-in decentralized exchange with a 0.3% transaction fee. Every swap generates revenue that flows back into the ecosystem, creating a sustainable economic loop.

**3. Yield Farming** — The core of the protocol. Users deposit USDT into audited smart contracts and earn daily returns. The yield is generated from real protocol revenue, not from new deposits.

**4. Referral Network** — A multi-level referral system that rewards community builders. When you invite others, you earn a percentage of their farming rewards across multiple levels.

**5. Leadership Program** — Five leadership ranks (Builder, Accelerator, Director, Executive, and Ambassador) that unlock increasing reward percentages as you grow your network.

**6. Smart Contract Security** — The protocol is independently audited, ownership is renounced, and 100% of LP is locked. Everything is verifiable on BscScan.

## The Revenue Flywheel

What makes Turbo Loop sustainable is its **Revenue Flywheel**. Unlike protocols that depend entirely on new deposits to pay existing users, Turbo Loop generates real revenue from three sources:

- **LP Rewards** from liquidity provision
- **Turbo Swap Fees** (0.3% per transaction)
- **Turbo Buy Fees** from fiat-to-crypto conversions

This revenue flows back into the yield pool, creating a self-reinforcing cycle that does not depend on infinite growth.

## Why It Matters

In a space filled with unsustainable promises, Turbo Loop takes a different approach. The smart contract is audited, ownership is renounced, and the code is fully verifiable. As the protocol states:

> "Turbo Loop does not ask you to trust a team. It asks you to verify the code."

## Getting Started

Getting started with Turbo Loop takes just five steps:

1. **Connect** your wallet (MetaMask or Trust Wallet)
2. **Buy** BNB or USDT through Turbo Buy
3. **Deposit** USDT into the farming contract
4. **Earn** daily yield from protocol revenue
5. **Grow** by referring others and climbing leadership ranks

The ecosystem is live, the community is growing across six continents, and the protocol is open to everyone. Visit [turboloop.io](https://turboloop.io) to launch the app and begin your journey.`;

  // Blog Post 2: Global Community Growth
  const blog2Title = 'Turbo Loop Goes Global: Community Growth Across 6 Continents';
  const blog2Slug = 'turbo-loop-global-community-growth';
  const blog2Excerpt = 'From Germany to Nigeria, Indonesia to Brazil — Turbo Loop is building one of the most geographically diverse communities in DeFi. Here is how the global expansion is unfolding.';
  const blog2Content = `# Turbo Loop Goes Global: Community Growth Across 6 Continents

One of the most remarkable aspects of Turbo Loop is not just its technology — it is the speed and diversity of its global community growth. In a space where most DeFi protocols are concentrated in a handful of countries, Turbo Loop has built active communities across six continents.

## The Country Leaderboard

The numbers speak for themselves. Here are the top six countries driving Turbo Loop's growth:

**#1 Germany** — The strongest European community and the global leader in Turbo Loop adoption. German users have embraced the protocol's transparency and security-first approach, making it the benchmark for community engagement.

**#2 Nigeria** — The fastest-growing community in Africa. Nigeria's vibrant crypto ecosystem and young, tech-savvy population have made it a natural fit for Turbo Loop's accessible DeFi platform.

**#3 Indonesia** — Leading Southeast Asia in adoption. Indonesian community leaders host regular Zoom sessions in Bahasa Indonesia, making the protocol accessible to millions of potential users.

**#4 India** — Rapidly expanding despite regulatory uncertainty. India's massive population and growing interest in alternative finance have created fertile ground for Turbo Loop's community-driven model.

**#5 Turkey** — An emerging market leader. With high inflation driving interest in crypto alternatives, Turkish users are finding value in Turbo Loop's yield farming opportunities.

**#6 Brazil** — The Latin America pioneer. Brazil's established crypto culture and large unbanked population make it an ideal market for Turbo Loop's fiat-to-crypto gateway.

## What Drives This Growth?

Several factors contribute to Turbo Loop's global expansion:

### Multilingual Support
Turbo Loop provides educational content in **12 languages**, including English, Hindi, French, Spanish, Vietnamese, Indonesian, Italian, Russian, Japanese, German, Arabic, and Chinese. Every user can learn about the protocol in their native language.

### Community-Led Expansion
The **Local Zoom Presenter** program pays community leaders $100 per month to host weekly educational sessions in their local language. This grassroots approach ensures that growth is organic and sustainable.

### Content Creator Star Program
Community members who create content about Turbo Loop earn rewards based on their reach:
- 10,000 views: $50
- 50,000 views: $200
- 100,000 views: $500
- 500,000+ views: $2,000

This incentivizes high-quality content creation across YouTube, TikTok, Twitter, and other platforms.

### Accessible Technology
Through **Turbo Buy**, users in any country can purchase crypto directly with their local payment method. This removes one of the biggest barriers to DeFi adoption — the complexity of acquiring cryptocurrency.

## The Road Ahead

Turbo Loop is currently in **Phase 6: Public Launch**, with three major milestones still ahead:

- **Phase 7: Mobile App** — A native mobile experience for iOS and Android
- **Phase 8: Cross-Chain Expansion** — Multi-chain support beyond BSC
- **Phase 9: DAO Governance** — Community-driven governance and voting

As the protocol expands to new chains and launches its mobile app, the global community is expected to grow even faster. The question is not whether Turbo Loop will continue to grow — it is which country will rise to challenge Germany for the top spot.

## Join the Movement

The world is joining Turbo Loop. Are you? Visit [turboloop.io](https://turboloop.io) to get started, or join the [Telegram community](https://t.me/TurboLoop_Official) to connect with thousands of members worldwide.`;

  await db.execute(sql`INSERT INTO blog_posts (title, slug, excerpt, content, published) VALUES (${blog1Title}, ${blog1Slug}, ${blog1Excerpt}, ${blog1Content}, ${true})`);
  console.log('✓ Blog post 1 seeded');

  await db.execute(sql`INSERT INTO blog_posts (title, slug, excerpt, content, published) VALUES (${blog2Title}, ${blog2Slug}, ${blog2Excerpt}, ${blog2Content}, ${true})`);
  console.log('✓ Blog post 2 seeded');

  console.log('\n✅ Blog posts seeded successfully!');
  process.exit(0);
}

seedBlogs().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("ADMIN_EMAIL or ADMIN_PASSWORD is not set in .env");
  process.exit(1);
}

const db = drizzle(neon(DATABASE_URL));

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(projectRoot, "scripts/r2-manifest.json");
if (!fs.existsSync(manifestPath)) {
  console.error("❌ scripts/r2-manifest.json not found. Run `npm run r2:upload` first.");
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

async function main() {
  console.log("🌱 Seeding Neon Postgres database...\n");

  // 1. Admin credentials
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await db.execute(sql`
    INSERT INTO admin_credentials (email, password_hash)
    VALUES (${ADMIN_EMAIL}, ${hash})
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
  `);
  console.log(`✓ Admin credentials set for ${ADMIN_EMAIL}`);

  // 2. Country Leaderboard
  const leaderboard = [
    [1, "Germany", "de", "Strongest European Community", 100],
    [2, "Nigeria", "ng", "Fastest Growing in Africa", 85],
    [3, "Indonesia", "id", "Leading Southeast Asia", 72],
    [4, "India", "in", "Rapidly Expanding", 65],
    [5, "Turkey", "tr", "Emerging Market Leader", 50],
    [6, "Brazil", "br", "Latin America Pioneer", 40],
  ];
  for (const [rank, country, code, desc, score] of leaderboard) {
    await db.execute(sql`
      INSERT INTO country_leaderboard (rank, country, country_code, description, score)
      VALUES (${rank}, ${country}, ${code}, ${desc}, ${score})
      ON CONFLICT (rank) DO UPDATE SET country=EXCLUDED.country, country_code=EXCLUDED.country_code, description=EXCLUDED.description, score=EXCLUDED.score
    `);
  }
  console.log("✓ Country leaderboard seeded");

  // 3. Videos
  const flag = { English: "🇬🇧", Hindi: "🇮🇳", French: "🇫🇷", Spanish: "🇪🇸", Vietnamese: "🇻🇳", Indonesian: "🇮🇩", Italian: "🇮🇹", Russian: "🇷🇺", Japanese: "🇯🇵", German: "🇩🇪", Arabic: "🇸🇦", Chinese: "🇨🇳", Malay: "🇲🇾" };
  const videoRows = [
    // Project presentation
    ["Project Presentation — English", "https://youtu.be/OUSlEo9KepY", "presentation", "English", 1],
    ["Project Presentation — Hindi", "https://youtu.be/a9nEwn3PlA8", "presentation", "Hindi", 2],
    ["Project Presentation — French", "https://youtu.be/I-9GLDxdS_0", "presentation", "French", 3],
    ["Project Presentation — Spanish", "https://youtu.be/4SQhDoRWXx4", "presentation", "Spanish", 4],
    ["Project Presentation — Vietnamese", "https://youtu.be/kLYuXl1aLxI", "presentation", "Vietnamese", 5],
    ["Project Presentation — Indonesian", "https://youtu.be/h4lgM3-RYjc", "presentation", "Indonesian", 6],
    ["Project Presentation — Italian", "https://youtu.be/ySRo8KKDwFY", "presentation", "Italian", 7],
    ["Project Presentation — Russian", "https://youtu.be/FuyW6EKQ_t8", "presentation", "Russian", 8],
    ["Project Presentation — Japanese", "https://youtu.be/ul7Ju-LGQ7s", "presentation", "Japanese", 9],
    ["Project Presentation — German", "https://youtu.be/QJiVeYPsDPo", "presentation", "German", 10],
    // How to join
    ["How to Join — English", "https://youtu.be/nAvqu0tYioU", "how-to-join", "English", 1],
    ["How to Join — Hindi", "https://youtu.be/l4ZWbcCFBZ4", "how-to-join", "Hindi", 2],
    ["How to Join — French", "https://youtu.be/ACoSnn9DwlQ", "how-to-join", "French", 3],
    ["How to Join — Indonesian", "https://youtu.be/UauR7azLAAo", "how-to-join", "Indonesian", 4],
    ["How to Join — Japanese", "https://youtu.be/tcdNIKvXHm8", "how-to-join", "Japanese", 5],
    ["How to Join — German", "https://youtu.be/oo17mFM1T1c", "how-to-join", "German", 6],
    ["How to Join — Italian", "https://youtu.be/6Xjsjx_m9Os", "how-to-join", "Italian", 7],
    ["How to Join — Spanish", "https://youtu.be/kLXE-Q0Fqlo", "how-to-join", "Spanish", 8],
    ["How to Join — Arabic", "https://youtu.be/0lI7y-hs9fE", "how-to-join", "Arabic", 9],
    ["How to Join — Chinese", "https://youtu.be/9wpqlHrrFew", "how-to-join", "Chinese", 10],
    // Withdraw / compound / refer
    ["Withdraw, Compound & Refer — English", "https://youtu.be/sZ-10B7yhSQ", "withdraw-compound", "English", 1],
    ["Withdraw, Compound & Refer — Hindi", "https://youtu.be/Zi3_BYidWP0", "withdraw-compound", "Hindi", 2],
    ["Withdraw, Compound & Refer — French", "https://youtu.be/0-kOIgZfjd8", "withdraw-compound", "French", 3],
    ["Withdraw, Compound & Refer — Spanish", "https://youtu.be/X6u7gbMEP14", "withdraw-compound", "Spanish", 4],
    ["Withdraw, Compound & Refer — Indonesian", "https://youtu.be/MNbqWkaO_L8", "withdraw-compound", "Indonesian", 5],
    ["Withdraw, Compound & Refer — Italian", "https://youtu.be/cYyOMykNHnA", "withdraw-compound", "Italian", 6],
    ["Withdraw, Compound & Refer — Japanese", "https://youtu.be/f9w1sKZy2eY", "withdraw-compound", "Japanese", 7],
    ["Withdraw, Compound & Refer — Malay", "https://youtu.be/W7_mX4Xxnig", "withdraw-compound", "Malay", 8],
  ];
  await db.execute(sql`DELETE FROM videos`);
  for (const [title, url, category, lang, order] of videoRows) {
    const f = flag[lang] || "🌐";
    await db.execute(sql`
      INSERT INTO videos (title, youtube_url, category, language, language_flag, sort_order, published)
      VALUES (${title}, ${url}, ${category}, ${lang}, ${f}, ${order}, true)
    `);
  }
  console.log(`✓ ${videoRows.length} videos seeded`);

  // 4. Events - Daily Zoom
  await db.execute(sql`DELETE FROM events`);
  await db.execute(sql`
    INSERT INTO events (title, description, date_time, timezone, frequency, meeting_link, passcode, language, status, published)
    VALUES (
      'Global English Zoom — Daily Community Call',
      'Join our daily community call to learn about Turbo Loop, ask questions, and connect with the global community.',
      '5:00 PM', 'UTC', 'Every Day',
      'https://us06web.zoom.us/j/8347511148?pwd=g6wTqhrngaUDNbMasv9LE8iJQOSJua.1',
      '541427', 'English', 'recurring', true
    )
  `);
  console.log("✓ Daily Zoom event seeded");

  // 5. Roadmap
  const roadmap = [
    [1, "Smart Contract Development", "completed", "Core protocol built and deployed on BSC"],
    [2, "Security Audits", "completed", "Independent audits completed, ownership renounced"],
    [3, "Turbo Swap Launch", "completed", "Decentralized exchange with 0.3% fee live"],
    [4, "Turbo Buy Integration", "completed", "Fiat-to-crypto gateway via MoonPay"],
    [5, "Community Building", "completed", "Global community established across 6+ countries"],
    [6, "Public Launch", "current", "Open access, promotional programs, global expansion"],
    [7, "Mobile App", "upcoming", "Native mobile experience for iOS and Android"],
    [8, "Cross-Chain Expansion", "upcoming", "Multi-chain support beyond BSC"],
    [9, "DAO Governance", "upcoming", "Community-driven governance and voting"],
  ];
  await db.execute(sql`DELETE FROM roadmap_phases`);
  for (const [phase, title, status, desc] of roadmap) {
    await db.execute(sql`
      INSERT INTO roadmap_phases (phase, title, status, description)
      VALUES (${phase}, ${title}, ${status}, ${desc})
    `);
  }
  console.log("✓ Roadmap seeded");

  // 6. Promotions
  const promos = [
    ["smart-contract-challenge", "$100K Smart Contract Challenge", "Find a Bug, Win Big", "Turbo Loop is so confident in its code that it offers $100,000 to anyone who can find a vulnerability. This isn't just a bounty — it's a statement of absolute trust in the protocol's security.", 1],
    ["content-creator-star", "Content Creator Star", "Get Paid for Views", "Create content about Turbo Loop and earn based on your reach. Tier system: 10K views = $50, 50K views = $200, 100K views = $500, 500K+ views = $2,000.", 2],
    ["zoom-presenter", "Local Zoom Presenter", "$100/Month for Community Leaders", "Host weekly Zoom sessions in your local language and earn $100/month. Build your community, grow the ecosystem, and get rewarded for leadership.", 3],
    ["onboarding-bonus", "Onboarding Bonus", "Limited Time — 2 Months", "New participants who deposit and refer others can earn bonus rewards. Deposit $100+ and refer 3 active users to qualify. Time-limited promotional program.", 4],
  ];
  await db.execute(sql`DELETE FROM promotions`);
  for (const [slug, title, subtitle, desc, order] of promos) {
    await db.execute(sql`
      INSERT INTO promotions (slug, title, subtitle, description, active, sort_order)
      VALUES (${slug}, ${title}, ${subtitle}, ${desc}, true, ${order})
    `);
  }
  console.log("✓ Promotions seeded");

  // 7. Blog posts (6 posts)
  const blogs = [
    {
      slug: "what-is-turbo-loop-complete-defi-ecosystem",
      title: "What Is Turbo Loop? The Complete DeFi Ecosystem Explained",
      excerpt: "Turbo Loop is more than a yield farming protocol. It is a complete DeFi ecosystem built on Binance Smart Chain, combining six powerful pillars into one seamless platform.",
      content: `# What Is Turbo Loop? The Complete DeFi Ecosystem Explained\n\nIf you have been exploring the world of decentralized finance, you have likely come across dozens of yield farming protocols, each promising extraordinary returns. Most of them share a common problem: they are unsustainable. Turbo Loop was built to be different.\n\n## More Than Yield Farming\n\nTurbo Loop is not just another farming protocol. It is a **complete DeFi ecosystem** built on Binance Smart Chain (BSC) that combines six powerful pillars into one seamless, self-sustaining platform.\n\n### The Six Pillars\n\n**1. Turbo Buy** — A fiat-to-crypto gateway powered by MoonPay.\n\n**2. Turbo Swap** — A built-in decentralized exchange with a 0.3% transaction fee.\n\n**3. Yield Farming** — The core of the protocol. Users deposit USDT into audited smart contracts and earn daily returns.\n\n**4. Referral Network** — A multi-level referral system that rewards community builders.\n\n**5. Leadership Program** — Five leadership ranks that unlock increasing reward percentages.\n\n**6. Smart Contract Security** — Independently audited, ownership renounced, 100% of LP locked.\n\n## The Revenue Flywheel\n\nUnlike protocols that depend entirely on new deposits to pay existing users, Turbo Loop generates real revenue from LP Rewards, Turbo Swap Fees (0.3% per transaction), and Turbo Buy Fees.\n\n> "Turbo Loop does not ask you to trust a team. It asks you to verify the code."\n\nVisit [turboloop.io](https://turboloop.io) to begin your journey.`,
    },
    {
      slug: "turbo-loop-global-community-growth",
      title: "Turbo Loop Goes Global: Community Growth Across 6 Continents",
      excerpt: "From Germany to Nigeria, Indonesia to Brazil — Turbo Loop is building one of the most geographically diverse communities in DeFi.",
      content: `# Turbo Loop Goes Global: Community Growth Across 6 Continents\n\nOne of the most remarkable aspects of Turbo Loop is the speed and diversity of its global community growth.\n\n## The Country Leaderboard\n\n**#1 Germany** — The strongest European community.\n**#2 Nigeria** — The fastest-growing community in Africa.\n**#3 Indonesia** — Leading Southeast Asia.\n**#4 India** — Rapidly expanding.\n**#5 Turkey** — An emerging market leader.\n**#6 Brazil** — The Latin America pioneer.\n\n## What Drives This Growth?\n\nMultilingual support, community-led expansion, the Content Creator Star Program, and accessible technology via Turbo Buy.\n\n## The Road Ahead\n\nPhase 6 is current. Phase 7 (Mobile App), Phase 8 (Cross-Chain Expansion), and Phase 9 (DAO Governance) are upcoming.`,
    },
    {
      slug: "turbo-loop-security-deep-dive",
      title: "Why Turbo Loop Is One of the Safest DeFi Protocols on BSC",
      excerpt: "From renounced ownership to locked liquidity and independent audits — a detailed look at the five pillars of security that make Turbo Loop trustless and transparent.",
      content: `# Why Turbo Loop Is One of the Safest DeFi Protocols on BSC\n\nSecurity is the foundation of everything Turbo Loop does.\n\n## 1. Independent Security Audit\n\nThe Turbo Loop smart contract underwent a comprehensive independent security audit.\n\n## 2. Renounced Ownership\n\nThe contract runs exactly as written, forever.\n\n## 3. Locked Liquidity Pool\n\nAll LP tokens are permanently locked — eliminating rug pull risk.\n\n## 4. BscScan Verified Contract\n\nThe source code is fully verified on BscScan.\n\n## 5. 100% On-Chain Transparency\n\nEvery transaction happens on-chain.\n\n## The $100K Smart Contract Challenge\n\nFind a vulnerability and win $100,000 USDT.`,
    },
    {
      slug: "turbo-loop-revenue-flywheel-explained",
      title: "The Revenue Flywheel: How Turbo Loop Generates Sustainable Yield",
      excerpt: "Most yield farming protocols depend on new deposits to pay existing users. Turbo Loop is different. Here is how the Revenue Flywheel creates sustainable returns from real protocol activity.",
      content: `# The Revenue Flywheel: How Turbo Loop Generates Sustainable Yield\n\nThe biggest question in DeFi yield farming: where does the yield come from?\n\n## How the Revenue Flywheel Works\n\nTurbo Loop generates yield from three real revenue sources:\n\n### Source 1: Liquidity Pool Rewards\n### Source 2: Turbo Swap Fees\n### Source 3: Turbo Buy Fees\n\n## The Self-Reinforcing Cycle\n\n1. Users deposit USDT\n2. Funds enter the LP pool\n3. Users trade on Turbo Swap\n4. New users buy crypto via Turbo Buy\n5. Revenue flows back to the yield pool\n6. Higher yields attract more users`,
    },
    {
      slug: "turbo-loop-beginner-guide-first-24-hours",
      title: "Your First 24 Hours with Turbo Loop: A Complete Beginner Guide",
      excerpt: "New to Turbo Loop? This step-by-step guide walks you through everything from connecting your wallet to making your first deposit, earning yield, and setting up referrals.",
      content: `# Your First 24 Hours with Turbo Loop\n\n## Before You Begin\n\nYou need a Web3 wallet (MetaMask or Trust Wallet) and some BNB for gas.\n\n## Step 1: Connect to Turbo Loop\nVisit [turboloop.io](https://turboloop.io) and click Launch App.\n\n## Step 2: Get USDT\nUse Turbo Buy (MoonPay) or transfer from an exchange.\n\n## Step 3: Make Your First Deposit\nNavigate to Yield Farming, enter amount, confirm.\n\n## Step 4: Monitor Your Earnings\nDashboard shows total deposited, daily yield, accumulated rewards.\n\n## Step 5: Compound, Withdraw, or Refer\n\n## Pro Tips\n\n1. Start small\n2. Compound daily\n3. Join the Zoom calls\n4. Verify everything\n5. Build your network`,
    },
    {
      slug: "turbo-loop-roadmap-future-vision",
      title: "From Phase 6 to Phase 9: What Is Next for Turbo Loop",
      excerpt: "Turbo Loop has completed six major phases and is now publicly live. Here is a look at the three remaining milestones — Mobile App, Cross-Chain Expansion, and DAO Governance.",
      content: `# From Phase 6 to Phase 9: What Is Next for Turbo Loop\n\n## Phase 6: Public Launch (current)\n\nGlobal community across 6 continents, 12 languages, daily Zoom sessions, $100K Smart Contract Challenge.\n\n## Phase 7: Mobile App\n\nNative iOS/Android app with push notifications, biometric security, offline dashboard.\n\n## Phase 8: Cross-Chain Expansion\n\nExpand beyond BSC to Ethereum, Polygon, Avalanche.\n\n## Phase 9: DAO Governance\n\nCommunity voting, proposal system, treasury management, transparent on-chain decision-making.`,
    },
  ];
  await db.execute(sql`DELETE FROM blog_posts`);
  for (const post of blogs) {
    await db.execute(sql`
      INSERT INTO blog_posts (title, slug, excerpt, content, published)
      VALUES (${post.title}, ${post.slug}, ${post.excerpt}, ${post.content}, true)
    `);
  }
  console.log(`✓ ${blogs.length} blog posts seeded`);

  // 8. Presentations (48 language PDFs from R2)
  await db.execute(sql`DELETE FROM presentations`);
  let order = 0;
  // English first
  const englishEntry = manifest.presentations.find(p => p.language === "English");
  if (englishEntry) {
    await db.execute(sql`
      INSERT INTO presentations (title, language, file_url, sort_order, published)
      VALUES (${`Turbo Loop — English`}, 'English', ${englishEntry.url}, ${order++}, true)
    `);
  }
  // Remaining languages alphabetically
  const others = manifest.presentations.filter(p => p.language !== "English").sort((a, b) => a.language.localeCompare(b.language));
  for (const p of others) {
    await db.execute(sql`
      INSERT INTO presentations (title, language, file_url, sort_order, published)
      VALUES (${`Turbo Loop — ${p.language}`}, ${p.language}, ${p.url}, ${order++}, true)
    `);
  }
  console.log(`✓ ${manifest.presentations.length} presentations seeded from R2 manifest`);

  // 9. Site settings
  await db.execute(sql`
    INSERT INTO site_settings (setting_key, setting_value)
    VALUES ('welcome_title', 'Welcome to Turbo Loop')
    ON CONFLICT (setting_key) DO NOTHING
  `);
  await db.execute(sql`
    INSERT INTO site_settings (setting_key, setting_value)
    VALUES ('welcome_message', 'This is the official community and content hub for Turbo Loop — the complete DeFi ecosystem on Binance Smart Chain. Explore presentations, watch community videos, and read the latest updates.')
    ON CONFLICT (setting_key) DO NOTHING
  `);
  console.log("✓ Site settings seeded");

  console.log("\n✅ All data seeded successfully!\n");
}

main().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

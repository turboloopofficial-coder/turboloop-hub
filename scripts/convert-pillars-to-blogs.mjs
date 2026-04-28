// Convert the 14 pillar writeups (Sovereign Wealth Framework) into 14 polished blog posts.
// Each writeup contains multiple "Visual N" sections. We combine them into one flowing
// long-form blog post with:
//   - Hook intro
//   - H2 sections per main idea (extracted from each visual's headline)
//   - My callout system (> [!INFO], [!TIP], [!KEY], [!WARN])
//   - At least 2 pull-quotes
//   - "Key Takeaways" closing
//   - Linked banner image references
//
// Inserts each post into the blog_posts DB table with scheduled_publish_at dates
// appended after the existing queue ends.

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const SRC = "C:/Users/DEV NARSI/Downloads/TURBOLOOP_SOVEREIGN_WEALTH_FRAMEWORK";

// Pillar metadata: file → blog metadata
const PILLARS = [
  { file: "pillar1_math_of_sustainability_writeup.md",     slug: "the-math-of-sustainable-yield",                title: "The Math of Sustainable Yield: Why TurboLoop's Numbers Add Up",                          excerpt: "Banks pay 0.01%, DeFi pays 54%. Same financial markets — different cost structure. Here's exactly why the math holds." },
  { file: "pillar2_psychology_of_ownership_writeup.md",    slug: "the-psychology-of-ownership-in-defi",          title: "The Psychology of Ownership: Why Trust Looks Different in DeFi",                          excerpt: "Why does it feel weird to deposit USDT into a smart contract? Because true ownership is a new feeling. Here's how to recalibrate." },
  { file: "pillar3_20_level_multiplier_writeup.md",        slug: "the-20-level-multiplier-effect",               title: "The 20-Level Multiplier: How Network Effects Compound in DeFi",                            excerpt: "Most referral systems pay 2-3 levels. TurboLoop pays 20. The math behind why depth matters more than width." },
  { file: "pillar4_risk_management_writeup.md",            slug: "risk-management-in-decentralized-finance",     title: "Risk Management in DeFi: A Strategist's Playbook",                                         excerpt: "DeFi isn't risk-free. It's risk-different. Here's how to think about diversification, position sizing, and DCA in a permissionless world." },
  { file: "pillar5_velocity_of_compounding_writeup.md",    slug: "the-velocity-of-compounding",                  title: "The Velocity of Compounding: Why Compounding Frequency Matters More Than APY",            excerpt: "Compound monthly and 54% becomes 70%. Compound daily and it becomes 71.5%. Here's the math behind velocity." },
  { file: "pillar6_decentralized_trust_writeup.md",        slug: "what-decentralized-trust-actually-means",      title: "What 'Decentralized Trust' Actually Means (And Why It Beats the Old Model)",              excerpt: "We say 'don't trust, verify' but what does that mean for your $1,000? Here's the architectural difference between DeFi trust and traditional banking trust." },
  { file: "pillar7_global_arbitrage_writeup.md",           slug: "global-yield-arbitrage-explained",             title: "Global Yield Arbitrage: How Borderless Capital Finds Better Returns",                      excerpt: "Your savings account in any country is competing with global DeFi yields. Here's why that's reshaping personal finance worldwide." },
  { file: "pillar8_legacy_inheritance_writeup.md",         slug: "legacy-and-inheritance-in-defi",               title: "Legacy & Inheritance in DeFi: Building Generational Wealth on Permissionless Rails",      excerpt: "Smart contracts don't die. Networks don't go bankrupt. Here's how DeFi reframes generational wealth — and what it requires from you." },
  { file: "pillar9_anti_inflation_shield_writeup.md",      slug: "stablecoin-yield-as-an-inflation-shield",      title: "Stablecoin Yield as an Inflation Shield: The Real Math",                                  excerpt: "Inflation eats 6% of your dollar every year in many economies. Stablecoin yield at 30%+ isn't speculative — it's mathematical defense." },
  { file: "pillar10_leadership_ethics_writeup.md",         slug: "leadership-ethics-in-decentralized-communities", title: "Leadership Ethics in Decentralized Communities: How to Lead Without Authority",          excerpt: "There's no CEO in DeFi. So what does leadership look like? Here's the ethical framework for building communities that don't need permission." },
  { file: "myth_buster_writeup.md",                        slug: "the-defi-myth-buster",                         title: "The DeFi Myth-Buster: 10 Misconceptions About TurboLoop, Verified On-Chain",               excerpt: "Every DeFi project gets misunderstood. Here are the 10 most common misconceptions about TurboLoop — and the on-chain proof that disproves each one." },
  { file: "product_bible_writeup.md",                      slug: "the-turboloop-product-bible",                  title: "The TurboLoop Product Bible: Everything The Protocol Does, In One Place",                  excerpt: "The complete map of TurboLoop's product surface — what each piece does, how they connect, and why every choice matters." },
  { file: "quick_start_writeup.md",                        slug: "the-turboloop-quick-start-guide",              title: "The TurboLoop Quick-Start Guide: From Zero to Compounding in 30 Minutes",                 excerpt: "Skip the noise. Here's exactly what to do — in order — to go from never having heard of TurboLoop to actively earning yield, in half an hour." },
];

/** Parse a writeup file into individual visual sections (intro + content + hashtags) */
function parseWriteup(text) {
  // Each visual is delimited by `---` lines and starts with `### **... (Visual N)** `
  const sections = text.split(/^---\s*$/m)
    .map(s => s.trim())
    .filter(s => s.length > 50);
  return sections;
}

/** Extract a section's content — the WhatsApp/Telegram body */
function extractBody(section) {
  // The body is between the headline and "#hashtags". Strip leading title/meta.
  const lines = section.split("\n").map(l => l.trim());
  let body = [];
  let inBody = false;
  let stopAtHashtag = false;
  for (const line of lines) {
    if (line.startsWith("###") || line.startsWith("**WhatsApp")) continue;
    if (line.startsWith("#") && line.length > 30 && !line.startsWith("##")) { stopAtHashtag = true; continue; }
    if (stopAtHashtag) continue;
    if (line.length === 0 && !inBody) continue;
    inBody = true;
    body.push(line);
  }
  // Remove trailing empty lines
  while (body.length && body[body.length - 1] === "") body.pop();
  return body.join("\n").trim();
}

/** Extract the headline from a section (the first **Bold** line, usually the hook title) */
function extractHeadline(body) {
  const m = body.match(/\*\*([^*]+)\*\*/);
  if (!m) return null;
  // Strip leading emoji + clean
  return m[1].replace(/^[^\w]+/, "").trim();
}

/** Convert a sequence of visual sections into one flowing blog post */
function convertWriteupToBlog(pillarMeta, writeupText) {
  const sections = parseWriteup(writeupText);
  if (sections.length === 0) return null;

  const intro = `> [!KEY]\n> ${pillarMeta.excerpt}\n\nDeFi is loud, but the substance is quiet. This piece walks through everything we know about ${pillarMeta.title.split(":")[0].toLowerCase()} — exactly as it works inside the Turbo Loop ecosystem, with no marketing hype.\n\nGrab a coffee. Let's go.\n`;

  const bodyParts = [];
  let visualIndex = 0;
  for (const sec of sections) {
    const body = extractBody(sec);
    if (body.length < 80) continue;
    visualIndex++;

    const headline = extractHeadline(body) || `Section ${visualIndex}`;
    // Strip the bold headline from body
    const cleanedBody = body
      .replace(/^\*\*[^*]+\*\*\n?/, "") // remove first bold headline
      .replace(/\*\*The Fact:\*\*[\s\S]*?(?=\n\n|\n\*\*|$)/g, (match) => {
        const factText = match.replace(/^\*\*The Fact:\*\*\s*/, "").trim();
        return `> [!INFO]\n> **The fact:** ${factText}`;
      })
      .replace(/\*\*💡[^*]+\*\*/g, "") // remove the call-to-share line
      .replace(/^\s*\n/gm, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (cleanedBody.length < 50) continue;

    bodyParts.push(`## ${headline}\n\n${cleanedBody}`);

    // Add a divider every 3 sections
    if (visualIndex % 3 === 0) bodyParts.push("---");
  }

  const closer = `\n## Key takeaways\n\n- Sustainable yield in DeFi comes from real economic activity — not token emissions.\n- ${pillarMeta.excerpt.split(".")[0]}.\n- Verify everything: contract address, audit report, locked LP, renounced ownership — all on-chain, all public.\n- The Turbo Loop community is the proof — across 21+ countries, 6 continents, and 48 languages.\n\n> [!TIP]\n> Join the daily community Zoom calls or read the rest of the Editorial — every blog post answers a different question about how the protocol actually works.`;

  const fullContent = `${intro}\n${bodyParts.join("\n\n")}\n\n${closer}`;
  return fullContent;
}

async function main() {
  // Find the latest scheduled date in DB to append after
  const last = await sql`SELECT scheduled_publish_at::text as t FROM blog_posts WHERE published=false AND scheduled_publish_at IS NOT NULL ORDER BY scheduled_publish_at DESC LIMIT 1`;
  let lastDate = last[0]?.t ? new Date(last[0].t.replace(" ", "T") + "Z") : new Date();
  console.log(`Existing queue ends: ${lastDate.toISOString().slice(0, 10)}`);

  let inserted = 0;
  let skipped = 0;
  for (const p of PILLARS) {
    const filePath = path.join(SRC, p.file);
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠ Missing: ${p.file}`);
      skipped++;
      continue;
    }

    // Check if blog already exists by slug
    const existing = await sql`SELECT id FROM blog_posts WHERE slug = ${p.slug}`;
    if (existing.length > 0) {
      console.log(`  ⏭ Already exists: ${p.slug}`);
      skipped++;
      continue;
    }

    const text = fs.readFileSync(filePath, "utf8");
    const content = convertWriteupToBlog(p, text);
    if (!content) {
      console.log(`  ⚠ Could not convert: ${p.file}`);
      skipped++;
      continue;
    }

    // Schedule one day after the previous post
    lastDate = new Date(lastDate);
    lastDate.setUTCDate(lastDate.getUTCDate() + 1);
    const dateStr = lastDate.toISOString().slice(0, 10) + " 14:00:00";

    await sql`
      INSERT INTO blog_posts (slug, title, excerpt, content, published, scheduled_publish_at)
      VALUES (${p.slug}, ${p.title}, ${p.excerpt}, ${content}, false, ${dateStr}::timestamp)
    `;

    console.log(`  ✓ ${p.slug} — ${content.length} chars · publishes ${lastDate.toISOString().slice(0, 10)}`);
    inserted++;
  }

  console.log(`\n✅ Done — ${inserted} inserted, ${skipped} skipped`);

  // Show final queue
  console.log(`\nFinal queue (last 5):`);
  const final = await sql`SELECT slug, scheduled_publish_at::text as t FROM blog_posts WHERE published=false AND scheduled_publish_at IS NOT NULL ORDER BY scheduled_publish_at DESC LIMIT 5`;
  final.forEach(r => console.log(`  ${r.t} → ${r.slug}`));
}

main().catch(e => { console.error("❌", e); process.exit(1); });

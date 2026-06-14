// /api/share-text — generates 3 unique share text options for a given
// TurboLoop creative banner using Claude Haiku.
//
// POST body:
//   { categoryId, categoryLabel, title, referralUsername?, seed? }
//
// Response:
//   { options: [string, string, string] }
//
// The referralUsername (if provided) is injected into each option as
// https://turboloop.io?ref=<username>. If absent, the link is plain
// https://turboloop.io
//
// Rate limited to 30 req/min per IP via simple in-memory counter.
// Falls back to static options if Claude is unavailable.

import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const maxDuration = 30;

// ── Static fallback options per category ──────────────────────────────────────
const STATIC_FALLBACKS: Record<string, [string, string, string]> = {
  lifestyle: [
    "Imagine waking up to passive income every single day. That's what TurboLoop makes possible. 🌴",
    "Financial freedom isn't a dream — it's a plan. TurboLoop turns your investment into daily passive income.",
    "The lifestyle you want starts with the right system. TurboLoop delivers passive income, daily. No hype. Just results.",
  ],
  token: [
    "$TURBO isn't just a token — it's proof of a working protocol. Daily buybacks. On-chain transparency. Real yield.",
    "Every day, TurboLoop buys back and burns $TURBO automatically. That's deflationary tokenomics in action.",
    "No team allocation. No VC dump. $TURBO is backed by real protocol fees and daily buybacks. This is DeFi done right.",
  ],
  referral: [
    "Build a network that pays you — 20 levels deep. TurboLoop's referral system is one of the most powerful in DeFi.",
    "Your network is your net worth. With TurboLoop's 20-level referral system, every invite compounds your income.",
    "Share TurboLoop and earn on every level of your network. 20 levels. Real commissions. No cap.",
  ],
  "objection-handler": [
    "Still on the fence? TurboLoop is transparent, on-chain, and backed by real protocol activity. Your questions answered.",
    "No hype. No promises. Just on-chain proof. TurboLoop's mechanics are verifiable by anyone, anytime.",
    "Every sceptic's question has an answer. TurboLoop is built on real yield, not speculation.",
  ],
  "hindi-new": [
    "TurboLoop के साथ रोज़ाना passive income कमाएं। आज ही शुरू करें और अपने financial future को secure करें।",
    "20 levels का referral system, daily buyback, और on-chain transparency। TurboLoop — DeFi का सबसे भरोसेमंद platform।",
    "अपने investment को daily passive income में बदलें। TurboLoop पर join करें और अपने network को grow करें।",
  ],
  nigerian: [
    "TurboLoop na the real deal — daily passive income, 20-level referral, and on-chain proof. No dulling! 🇳🇬",
    "Oga, this one no be scam. TurboLoop dey pay daily from real protocol fees. Come and see for yourself.",
    "Your financial freedom dey possible. TurboLoop give you passive income every day. Join now and start earning!",
  ],
  "success-story": [
    "Real people. Real results. TurboLoop is changing lives one passive income stream at a time.",
    "From sceptic to believer — TurboLoop's results speak for themselves. See what's possible.",
    "This is what financial freedom looks like. TurboLoop members are earning daily passive income right now.",
  ],
  "education-defi": [
    "DeFi doesn't have to be complicated. TurboLoop makes passive income simple, transparent, and accessible to everyone.",
    "Learn how DeFi passive income really works — and why TurboLoop's model is built to last.",
    "Understanding DeFi is the first step to financial freedom. TurboLoop makes it simple.",
  ],
  urgency: [
    "Every day you wait is a day of passive income you're leaving on the table. Start with TurboLoop today.",
    "The best time to start was yesterday. The second best time is right now. TurboLoop is waiting.",
    "Don't let hesitation cost you daily passive income. TurboLoop is live, proven, and ready for you.",
  ],
  buyback: [
    "Every day, TurboLoop automatically buys back and burns $TURBO. Deflationary. Transparent. On-chain.",
    "Daily buybacks funded by real protocol fees. $TURBO gets scarcer every single day.",
    "This is what a real buyback mechanism looks like. TurboLoop burns $TURBO daily — automatically.",
  ],
  comparison: [
    "Banks give you 0.5%. TurboLoop gives you daily passive income from real DeFi protocol fees. The choice is clear.",
    "Traditional finance vs TurboLoop: one keeps your money working for the bank. The other works for you.",
    "Why settle for savings account rates when TurboLoop offers daily passive income from real on-chain activity?",
  ],
  community: [
    "Join thousands of TurboLoop members building passive income together. The community is the protocol.",
    "TurboLoop isn't just a platform — it's a community of people building financial freedom together.",
    "The strongest networks are built on trust and results. TurboLoop's community delivers both.",
  ],
};

const DEFAULT_FALLBACK: [string, string, string] = [
  "TurboLoop delivers daily passive income backed by real protocol fees. Join the community today.",
  "Real yield. On-chain proof. Daily passive income. That's TurboLoop — DeFi done right.",
  "Your path to financial freedom starts with TurboLoop. Daily passive income, 20-level referrals, and full transparency.",
];

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: {
    categoryId?: string;
    categoryLabel?: string;
    title?: string;
    referralUsername?: string;
    seed?: number;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { categoryId = "lifestyle", categoryLabel, title, referralUsername, seed = 0 } = body;

  // Build the referral link
  const refLink = referralUsername?.trim()
    ? `https://turboloop.io?ref=${referralUsername.trim()}`
    : "https://turboloop.io";

  // Try AI generation first
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("No ANTHROPIC_API_KEY");

    const systemPrompt = `You are a world-class DeFi marketing copywriter for TurboLoop — a passive income protocol on BSC.
TurboLoop facts you MUST use accurately:
- Daily passive income from real protocol fees (not staking rewards, not APY promises)
- 20-level referral system with real commissions
- Daily automatic buyback and burn of $TURBO token from protocol fees
- No team allocation, no VC dump, 100% LP locked
- On-chain transparency — everything verifiable on BscScan
- Referral link format: https://turboloop.io?ref=USERNAME (case-sensitive)

Rules:
- Write in English only
- Each option must be DISTINCT in angle, tone, and structure
- No variation indicators like "(Option 1)" or "(1)"
- No asterisks, no markdown formatting
- Include the referral link naturally at the end of each option
- Keep each option between 2-4 sentences
- Use emojis sparingly (max 2 per option)
- Never use "APY", "Daily Yield", or any specific % figures unless they are 0% (team allocation)
- Never say "not financial advice"
- Make it feel premium, confident, and community-driven`;

    const userPrompt = `Generate exactly 3 unique share text options for this TurboLoop marketing banner:
Category: ${categoryLabel ?? categoryId}
Banner title: ${title ?? categoryLabel ?? categoryId}
Referral link to include: ${refLink}
Seed (for variety): ${seed}

Return ONLY a JSON object in this exact format, no other text:
{"options":["option1 text here","option2 text here","option3 text here"]}`;

    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 600,
      temperature: 0.85,
    });

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const parsed = JSON.parse(jsonMatch[0]) as { options?: string[] };
    if (!Array.isArray(parsed.options) || parsed.options.length < 3) {
      throw new Error("Invalid options array");
    }

    const options = parsed.options.slice(0, 3) as [string, string, string];
    return NextResponse.json({ options });
  } catch (err) {
    console.error("[share-text] AI generation failed, using fallback:", err);

    // Use static fallback
    const fallback = STATIC_FALLBACKS[categoryId] ?? DEFAULT_FALLBACK;
    // Inject the referral link into each fallback option
    const options = fallback.map(opt => {
      if (opt.includes("turboloop.io")) return opt;
      return `${opt}\n\n👉 ${refLink}`;
    }) as [string, string, string];

    return NextResponse.json({ options, fallback: true });
  }
}

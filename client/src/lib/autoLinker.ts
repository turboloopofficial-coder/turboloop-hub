// Auto internal linker — adds context-aware internal links to blog content
// at render time. No DB writes. Each term gets linked the first time it appears
// in a post, except when:
//  - the post IS the destination (don't self-link)
//  - the term is inside a code block / inline code
//  - the term is inside a markdown link already
//  - the term is inside a heading
//
// Result: every blog post becomes a hub of cross-links to related deeper content.
// This is the single biggest organic-SEO unlock for a blog network — Google sees
// the site as a tightly-connected expert resource.

const LINK_MAP: Array<{ term: RegExp; slug: string; label: string }> = [
  // Use word-boundary matching, case-insensitive
  // Ordered: more specific terms first so they win the first-match-only rule

  // Programs / proper nouns
  { term: /\b(Revenue Flywheel)\b/g, slug: "turbo-loop-revenue-flywheel-explained", label: "Revenue Flywheel" },
  { term: /\b(Leadership Program)\b/g, slug: "leadership-program-7-ranks-to-legend", label: "Leadership Program" },
  { term: /\b(20-level referral)\b/gi, slug: "referral-network-20-levels-how-it-works", label: "20-level referral" },
  { term: /\b(referral network)\b/gi, slug: "referral-network-20-levels-how-it-works", label: "referral network" },
  { term: /\b(\$100,?000\s*(?:Smart Contract\s*)?(?:Bounty|Challenge|bug bounty))\b/gi, slug: "the-100k-smart-contract-challenge", label: "$100,000 Bounty" },
  { term: /\b(Content Creator Star)\b/gi, slug: "content-creator-star-program", label: "Content Creator Star" },
  { term: /\b(Zoom Presenter)\b/gi, slug: "zoom-presenter-program-monthly-payout", label: "Zoom Presenter" },

  // Concepts
  { term: /\b(renounced ownership|ownership renounced)\b/gi, slug: "why-renounced-ownership-changes-everything", label: "renounced ownership" },
  { term: /\b(LP locked|liquidity locked|LP lock)\b/gi, slug: "lp-lock-explained-why-liquidity-security-matters", label: "LP locked" },
  { term: /\b(smart contract audit|audited smart contract)\b/gi, slug: "smart-contract-audits-what-they-actually-check", label: "smart contract audit" },
  { term: /\b(impermanent loss)\b/gi, slug: "what-is-impermanent-loss-and-why-turboloop-doesnt-have-it", label: "impermanent loss" },
  { term: /\b(APY vs APR|APR vs APY)\b/gi, slug: "what-is-apy-vs-apr-the-difference", label: "APY vs APR" },

  // Products
  { term: /\b(Turbo Swap)\b/g, slug: "turbo-swap-dex-explained", label: "Turbo Swap" },
  { term: /\b(Turbo Buy)\b/g, slug: "turbo-buy-fiat-to-crypto-gateway", label: "Turbo Buy" },

  // Beginner topics
  { term: /\b(BscScan)\b/g, slug: "verifying-a-defi-contract-on-bscscan", label: "BscScan" },
  { term: /\b(MetaMask)\b/g, slug: "setting-up-metamask-for-bsc-step-by-step", label: "MetaMask" },
  { term: /\b(MoonPay)\b/g, slug: "why-moonpay-is-the-right-onramp", label: "MoonPay" },
  { term: /\b(BSC|Binance Smart Chain)\b/g, slug: "bsc-vs-ethereum-fees-explained", label: "BSC" },
];

/**
 * Process markdown content and inject internal links to related blog posts.
 * Each term is linked at most ONCE per post, on its first plain-text occurrence.
 * Skips fenced code blocks, inline code, existing markdown links, and headings.
 */
export function autoLinkContent(content: string, currentSlug: string): string {
  if (!content) return content;

  // Split into segments: code-block-protected vs normal
  // We process line-by-line, tracking whether we're in a fenced code block.
  const lines = content.split("\n");
  const usedTerms = new Set<string>();
  let inCodeBlock = false;

  return lines.map((line) => {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      return line;
    }
    // Skip fenced code blocks AND headings
    if (inCodeBlock || /^#{1,6}\s/.test(line)) return line;

    let processed = line;

    for (const { term, slug, label } of LINK_MAP) {
      // Don't self-link
      if (slug === currentSlug) continue;
      // Each term only links once per post
      if (usedTerms.has(slug)) continue;

      // Build a regex that won't replace text already inside markdown links or inline code
      // We do a single first-match replacement
      const matches = [...processed.matchAll(term)];
      if (matches.length === 0) continue;

      for (const m of matches) {
        const idx = m.index ?? -1;
        if (idx < 0) continue;

        // Reject if inside an existing markdown link [text](url)
        const before = processed.slice(0, idx);
        const after = processed.slice(idx + m[0].length);
        const lastOpenBracket = before.lastIndexOf("[");
        const lastCloseBracket = before.lastIndexOf("]");
        const lastOpenParen = before.lastIndexOf("(");
        const lastCloseParen = before.lastIndexOf(")");
        const insideLinkText = lastOpenBracket > lastCloseBracket;
        const insideLinkUrl = lastOpenParen > lastCloseParen && before.slice(lastOpenParen).includes("](");
        if (insideLinkText || insideLinkUrl) continue;

        // Reject if inside inline code (between odd-numbered backticks on this line)
        const backticksBefore = (before.match(/`/g) || []).length;
        if (backticksBefore % 2 === 1) continue;

        // OK — inject link
        const matchedText = m[0];
        const linkMd = `[${matchedText}](/blog/${slug})`;
        processed = before + linkMd + after;
        usedTerms.add(slug);
        break; // only first match per term
      }
    }

    return processed;
  }).join("\n");
}

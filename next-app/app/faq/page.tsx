// /faq — frequently asked questions.
//
// All answers are written in plain markdown and rendered server-side via
// the same `marked` + `sanitize-html` pipeline the blog uses. This buys
// us markdown tables (for the 4 Loop Plans matrix), inline links, and
// bold/italics for free, all rendering through the existing `.prose-blog`
// CSS (mobile-scrollable tables, callouts, etc.).
//
// FAQ data is source-of-truth in code, not in the DB — small enough to
// version with the rest of the marketing site, and editorial changes
// ship through a normal commit + Vercel rebuild.

import type { Metadata } from "next";
import Link from "next/link";
import { marked } from "marked";
import { Container } from "@components/ui/Container";
import { PageHero } from "@components/layout/PageHero";
import { preprocessMarkdown } from "@lib/markdownPrep";
import { sanitize } from "@lib/sanitize";

const FAQ_OG_IMAGE =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-faq.png";
const FAQ_OG_TITLE = "FAQ — TurboLoop Questions Answered | How It Works";
const FAQ_OG_DESC =
  "Plain answers to common questions about TurboLoop: deposits, withdrawals, the 4 Loop Plans, security audits, referrals, and how yield is generated.";

export const metadata: Metadata = {
  title: FAQ_OG_TITLE,
  description: FAQ_OG_DESC,
  alternates: { canonical: "https://www.turboloop.tech/faq" },
  openGraph: {
    title: FAQ_OG_TITLE,
    description: FAQ_OG_DESC,
    url: "https://www.turboloop.tech/faq",
    images: [{ url: FAQ_OG_IMAGE, width: 1200, height: 630, alt: FAQ_OG_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: FAQ_OG_TITLE,
    description: FAQ_OG_DESC,
    images: [FAQ_OG_IMAGE],
  },
};

interface FaqItem {
  q: string;
  /** Markdown body — supports tables, lists, bold, links. */
  a: string;
  /** Plain-text version used in the JSON-LD `acceptedAnswer.text`. If
   *  omitted, falls back to `a` with markdown syntax stripped. */
  aText?: string;
  /** Optional companion video. Renders a "Watch video" button under the
   *  answer that deep-links to the film page. */
  video?: { href: string; label: string };
}

interface FaqGroup {
  category: string;
  items: FaqItem[];
}

const FAQS: FaqGroup[] = [
  {
    category: "Getting started",
    items: [
      {
        q: "What is TurboLoop?",
        a: "TurboLoop is a decentralized yield protocol on Binance Smart Chain. Deposit USDT, choose a Loop Plan (7 to 60 days), and earn fixed returns generated from three real revenue streams: LP rewards on a USDC/USDT stablecoin pair, Turbo Swap trading fees, and Turbo Buy fiat-to-crypto fees. The smart contract is independently audited, ownership is permanently renounced, and 100% of LP tokens are locked on-chain. No admin keys, no backdoors, no upgrade path.",
      },
      {
        q: "How do I deposit?",
        a: "Connect your Web3 wallet (MetaMask, Trust Wallet, or any BSC-compatible wallet) → choose your Loop Plan → deposit USDT (minimum 1 USDT on BSC network). Your deposit enters the LP pool immediately and you start earning from the next 00:00 UTC cycle.",
        video: { href: "/films/manifesto", label: "Watch the walkthrough" },
      },
      {
        q: "What is the minimum deposit?",
        a: "The minimum deposit is **1 USDT** on the Binance Smart Chain (BSC) network. There is no maximum limit. All 4 Loop Plans accept the same minimum, so you can start small and scale up at your own pace.",
      },
    ],
  },
  {
    category: "The 4 Loop Plans",
    items: [
      {
        q: "What are the 4 Loop Plans?",
        a:
          "TurboLoop offers 4 plans with increasing duration and returns:\n\n" +
          "| Plan | Duration | Total ROI | Daily Rate |\n" +
          "|------|----------|-----------|------------|\n" +
          "| Sprint Loop | 7 days | 3% | ~0.43%/day |\n" +
          "| Boost Loop | 14 days | 10% | ~0.71%/day |\n" +
          "| Power Loop | 30 days | 24% | ~0.80%/day |\n" +
          "| Ultimate Loop | 60 days | 54% | ~0.90%/day |\n\n" +
          "Minimum deposit for all plans: **1 USDT**. Principal is returned automatically at cycle end.",
        aText:
          "TurboLoop offers 4 plans: Sprint Loop (7 days, 3% ROI, ~0.43%/day), Boost Loop (14 days, 10% ROI, ~0.71%/day), Power Loop (30 days, 24% ROI, ~0.80%/day), and Ultimate Loop (60 days, 54% ROI, ~0.90%/day). Minimum deposit for all plans is 1 USDT. Principal is returned automatically at cycle end.",
      },
      {
        q: "Is the yield guaranteed?",
        a: "TurboLoop offers fixed returns per plan cycle: Sprint Loop (7 days, 3% ROI), Boost Loop (14 days, 10% ROI), Power Loop (30 days, 24% ROI), and Ultimate Loop (60 days, 54% ROI). These rates are encoded in the smart contract, which is permanently renounced and immutable — no one can change them. Daily yield is calculated and distributed automatically at 00:00 UTC.",
      },
      {
        q: "Where does the yield come from?",
        a: "TurboLoop generates revenue from three real sources: (1) **LP Rewards** from the USDC/USDT liquidity pool, (2) **Turbo Swap** trading fees from the built-in decentralized exchange, and (3) **Turbo Buy** fees from the fiat-to-crypto gateway. All revenue feeds back into the yield distribution system. None of it depends on new deposits — it's external revenue from real on-chain activity.",
      },
      {
        q: "How do I withdraw my earnings?",
        a: 'Your principal is returned automatically at the end of your plan cycle. Daily earnings can be claimed from your dashboard at any time. Go to your portfolio → click "Claim" on available earnings → confirm the transaction in your wallet.',
      },
      {
        q: "How do I compound my earnings?",
        a:
          "After your plan cycle ends, you can re-deposit your principal plus earnings into a new Loop Plan. This creates a compounding effect.\n\n" +
          "**Example:** $1,000 in Power Loop → after 30 days you have $1,240 → re-deposit $1,240 into a new Power Loop → after another 30 days you have $1,538. Compounding requires manual re-deposit after each cycle completes.",
        video: { href: "/films/compounding-secret", label: "Watch the compounding walkthrough" },
      },
    ],
  },
  {
    category: "Security",
    items: [
      {
        q: "Is my deposit safe?",
        a: "Your deposit goes 100% into a USDC/USDT liquidity pool — a stablecoin pair with **0% impermanent loss** risk. The LP tokens are 100% locked on-chain and fully verifiable. The smart contract is independently audited, ownership is permanently renounced (no admin keys, no backdoors), and source code is verified on BscScan for anyone to inspect.",
      },
      {
        q: "Is the smart contract secure?",
        a: "Yes. The TurboLoop smart contract has been independently audited by third-party security firms. Ownership is permanently renounced — there are no admin keys, no backdoors, and no way for anyone to modify the contract. All LP tokens are 100% locked on-chain. The source code is verified and publicly visible on BscScan. TurboLoop also offers a **$100,000 open challenge** to anyone who can prove centralization in the contract.",
      },
      {
        q: "Could the team rug pull?",
        a: "No. The team has zero contract control: ownership is renounced (mechanically destroyed on-chain). LP is locked on-chain through a third-party contract. No upgrade path exists. Even if the team wanted to harm holders, the math says they cannot.",
      },
    ],
  },
  {
    category: "Referrals + Leadership",
    items: [
      {
        q: "How does the referral system work?",
        a: "TurboLoop distributes **51% of daily ROI** across a 20-level referral network. Level 1 earns 12%, Level 2 earns 8%, Level 3 earns 5%, and so on down to 1% each for Levels 11–20. Each level has qualification requirements (minimum direct referrals and self-deposit). Referral rewards are calculated and paid daily at 00:00 UTC.",
      },
      {
        q: "What is the Leadership Program?",
        a: "The Leadership Program has **7 ranks** from Turbo Partner (1% reward) to Turbo Legend (10% reward). You earn based on team performance across up to 100 levels. Requirements include team member count and total team deposit volume. You earn the *difference* between your rank percentage and your highest-ranked downline's percentage — so promotions always pay off.",
      },
    ],
  },
  {
    category: "Community + earning",
    items: [
      {
        q: "Can I become a paid creator or presenter?",
        a: "Yes. Apply at [/apply](/apply) for either **Creator Star** ($10–$100/video based on views) or **Local Presenter** ($100/month for hosting weekly Zoom sessions). Both pay in stablecoins. Reviewed within 48 hours.",
      },
      {
        q: "Where can I share my story?",
        a: "Submit a testimonial, photo, video, or written story at [/submit](/submit). Approved submissions get featured on [/community](/community) and across our channels.",
      },
    ],
  },
];

/** Strip basic markdown syntax for plain-text JSON-LD answers. Not a
 *  full parser — handles bold/italic markers, links, and table piping
 *  enough that what reaches search engines reads naturally. */
function markdownToPlainText(md: string): string {
  return md
    // Strip code-block fences (we don't use any but be safe)
    .replace(/```[\s\S]*?```/g, "")
    // Strip inline code backticks
    .replace(/`([^`]+)`/g, "$1")
    // Strip bold/italic markers
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    // Link [text](url) → text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Strip table delimiter rows
    .replace(/^\|?[-:|\s]+\|?\s*$/gm, "")
    // Collapse table cells into spaces
    .replace(/\s*\|\s*/g, " ")
    // Collapse multiple spaces / blank lines
    .replace(/\n{2,}/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export default async function FAQPage() {
  // Pre-render each markdown answer to sanitized HTML at build time.
  // marked.parse can be async in v9+; awaiting it once per item is cheap
  // for a page this size (~15 items total, statically generated).
  const groups = await Promise.all(
    FAQS.map(async group => ({
      ...group,
      items: await Promise.all(
        group.items.map(async item => {
          const prepared = preprocessMarkdown(item.a);
          const rawHtml = await marked.parse(prepared, { breaks: false, gfm: true });
          const aHtml = sanitize(rawHtml as string);
          const aText = item.aText ?? markdownToPlainText(item.a);
          return { ...item, aHtml, aText };
        })
      ),
    }))
  );

  // FAQPage JSON-LD — flat list of every Q&A, plain-text answers.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap(group =>
      group.items.map(({ q, aText }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: {
          "@type": "Answer",
          text: aText,
        },
      }))
    ),
  };

  return (
    <main className="relative pb-12 md:pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHero
        eyebrow="Frequently Asked"
        title="Plain answers. No jargon."
        subtitle="The questions we hear most often, in plain English. Can't find what you need? Ask in our Telegram channel."
      />

      <Container width="narrow">
        <div className="space-y-10">
          {groups.map(group => (
            <section key={group.category}>
              <h2 className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-brand-cyan)] mb-4">
                {group.category}
              </h2>
              <div className="space-y-3">
                {group.items.map(item => (
                  <details
                    key={item.q}
                    className="group rounded-[var(--r-xl)] bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)] overflow-hidden"
                  >
                    <summary className="cursor-pointer list-none p-5 flex items-start justify-between gap-3 font-bold text-[var(--c-text)] hover:text-[var(--c-brand-cyan)] transition-colors">
                      <span>{item.q}</span>
                      <span
                        className="flex-shrink-0 mt-0.5 text-[var(--c-text-subtle)] group-open:rotate-45 transition-transform"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5">
                      {/* `.prose-blog` carries the blog typography rules:
                          mobile-scrollable tables, callouts, link colors,
                          paragraph spacing. Reusing avoids divergence. */}
                      <div
                        className="prose-blog text-[var(--c-text-muted)] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: item.aHtml }}
                      />
                      {item.video && (
                        <Link
                          href={item.video.href}
                          className="mt-4 inline-flex items-center gap-2 px-4 h-10 rounded-[var(--r-md)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4"
                            aria-hidden="true"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          {item.video.label} →
                        </Link>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-[var(--c-text-muted)]">
          Still have a question?{" "}
          <a
            href="https://t.me/TurboLoop_Official"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[var(--c-brand-cyan)] hover:underline"
          >
            Ask on Telegram →
          </a>
        </div>
      </Container>
    </main>
  );
}

// Image sitemap (Google image-sitemap protocol).
//
// Distinct from /sitemap.xml — image sitemaps explicitly tell Google
// which images are associated with which page on this domain. Helps
// disambiguate from unrelated entities Google has currently been
// surfacing for "turboloop" queries (climbing gear, foot loops, an
// Italian auto-parts store). Every image listed here is verified to
// return HTTP 200 from R2 / the /api/og-banner route — no broken
// references.
//
// Reference: https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps
//
// Served at https://www.turboloop.tech/image-sitemap.xml via the App
// Router's Route Handlers (file path = the URL). Registered in
// robots.ts via the `sitemaps` array.

import { FILMS } from "@lib/cinematicUniverse";
import { api, blogCoverUrl } from "@lib/api";

const BASE = "https://www.turboloop.tech";
const WWW = "https://www.turboloop.tech";
const R2 = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

// ISR for the image sitemap. Same revalidate cadence as the blog
// listing — 5 minutes is short enough that newly-published posts
// show up in the image sitemap within one cron tick, long enough
// that we don't refetch the post catalogue on every crawler hit.
export const revalidate = 300;

// Per-page image bundles. `loc` is the page that hosts the image;
// `images` are the brand-canonical images for that page. Captions are
// short, human-readable, and brand-name-loaded so Google's image
// crawler picks up the entity association.
//
// All R2 hub-promo/*.png paths verified HTTP 200 on 2026-05-18 via
// curl. Dynamic /api/og-banner variants verified for all 12 types.
const PAGE_IMAGES: Array<{
  loc: string;
  images: Array<{
    url: string;
    title: string;
    caption: string;
  }>;
}> = [
  {
    loc: `${BASE}/`,
    images: [
      {
        url: `${R2}/branding/turboloop-logo.png`,
        title: "TurboLoop — official brand logo",
        caption:
          "TurboLoop DeFi protocol logo. Vortex mark on dark. Used in knowledge-panel + social-share previews.",
      },
      {
        url: `${WWW}/api/og-banner?type=launch`,
        title: "TurboLoop — DeFi yield farming on BSC",
        caption:
          "TurboLoop launch banner. Sustainable ROI protocol on Binance Smart Chain. Up to 54% flat ROI in 60 days.",
      },
    ],
  },
  {
    loc: `${BASE}/calculator`,
    images: [
      {
        url: `${WWW}/api/og-banner?type=calculator`,
        title: "TurboLoop Yield Calculator",
        caption:
          "Interactive yield calculator showing TurboLoop's 4 flat-ROI plans: Sprint 3% / Boost 10% / Power 24% / Ultimate 54%.",
      },
    ],
  },
  {
    loc: `${BASE}/security`,
    images: [
      {
        url: `${R2}/hub-promo/hub-promo-security.png`,
        title: "TurboLoop — security architecture",
        caption:
          "TurboLoop security overview. SolidityScan audit, ownership renounced, 100% LP-locked, $100K bug bounty.",
      },
      {
        url: `${WWW}/api/og-banner?type=security`,
        title: "TurboLoop security",
        caption:
          "TurboLoop smart contract security pillars. Trustless, verifiable, locked.",
      },
    ],
  },
  {
    loc: `${BASE}/ecosystem`,
    images: [
      {
        url: `${R2}/hub-promo/hub-promo-ecosystem.png`,
        title: "TurboLoop ecosystem — six pillars",
        caption:
          "TurboLoop DeFi ecosystem: yield farming, Turbo Buy fiat ramp, Turbo Swap DEX, referral network, leadership program, security.",
      },
      {
        url: `${WWW}/api/og-banner?type=ecosystem`,
        title: "TurboLoop ecosystem overview",
        caption: "Six pillars. One engine. Complete DeFi.",
      },
    ],
  },
  {
    loc: `${BASE}/events`,
    images: [
      {
        url: `${R2}/hub-promo/hub-promo-events.png`,
        title: "TurboLoop community events",
        caption:
          "TurboLoop global meetups. Lagos, Port Harcourt, Berlin, Dubai. Free entry, community-led.",
      },
      {
        url: `${WWW}/api/og-banner?type=events`,
        title: "TurboLoop events",
        caption: "Global community meetups for TurboLoop members.",
      },
    ],
  },
  {
    loc: `${BASE}/blog`,
    images: [
      {
        url: `${R2}/hub-promo/hub-promo-blog.png`,
        title: "TurboLoop DeFi blog",
        caption:
          "Long-form editorial on DeFi yield generation, smart-contract security, and the TurboLoop protocol.",
      },
      {
        url: `${WWW}/api/og-banner?type=blog-listing`,
        title: "TurboLoop editorial",
        caption: "Deep dives on yield, security, and the math.",
      },
    ],
  },
  {
    loc: `${BASE}/community`,
    images: [
      {
        url: `${R2}/hub-promo/hub-promo-community.png`,
        title: "TurboLoop global community",
        caption:
          "TurboLoop members across 14+ countries on 6 continents. Telegram, Twitter, daily Zoom calls.",
      },
      {
        url: `${WWW}/api/og-banner?type=community`,
        title: "TurboLoop community",
        caption: "Voices from 14+ countries across 6 continents.",
      },
    ],
  },
  {
    loc: `${BASE}/films`,
    images: [
      {
        url: `${R2}/hub-promo/hub-promo-films.png`,
        title: "TurboLoop Cinematic Universe",
        caption:
          "TurboLoop films: 20 episodes, 4 seasons, from The Problem to The Movement.",
      },
      {
        url: `${WWW}/api/og-banner?type=films`,
        title: "TurboLoop films",
        caption: "20 films. 4 seasons. One story.",
      },
    ],
  },
  {
    loc: `${BASE}/creatives`,
    images: [
      {
        url: `${R2}/hub-promo/hub-promo-creatives.png`,
        title: "TurboLoop creatives library",
        caption:
          "TurboLoop branded marketing banners. 630+ designs in 7 languages — English, German, Hindi, Indonesian, French, Arabic, Spanish.",
      },
      {
        url: `${WWW}/api/og-banner?type=creatives`,
        title: "TurboLoop creatives",
        caption: "Pre-designed banners. Ready to share. Free for the community.",
      },
    ],
  },
  {
    loc: `${BASE}/promotions`,
    images: [
      {
        url: `${WWW}/api/og-banner?type=promotions`,
        title: "TurboLoop earning programs",
        caption:
          "TurboLoop promotions: $100K security bounty, Creator Star ($10–$100/video), Local Presenter ($100/month).",
      },
    ],
  },
  {
    loc: `${BASE}/apply`,
    images: [
      {
        url: `${R2}/hub-promo/hub-promo-apply.png`,
        title: "TurboLoop — Apply to earn",
        caption:
          "Apply to TurboLoop's Creator Star or Local Presenter programs. Grow the ecosystem, get paid in stablecoins.",
      },
      {
        url: `${WWW}/api/og-banner?type=apply`,
        title: "TurboLoop apply",
        caption: "Creator Star ($10–$100/video) or Local Presenter ($100/month).",
      },
    ],
  },
  {
    loc: `${BASE}/careers`,
    images: [
      {
        url: `${WWW}/api/og-banner?type=careers`,
        title: "TurboLoop careers — Zoom Presenter team",
        caption:
          "TurboLoop careers: remote Zoom Presenter positions (Indonesian, German). $100/month stipend.",
      },
    ],
  },
  {
    loc: `${BASE}/faq`,
    images: [
      {
        url: `${R2}/hub-promo/hub-promo-faq.png`,
        title: "TurboLoop FAQ",
        caption:
          "Common questions about TurboLoop answered: minimum deposits, withdrawal process, audits, yield source.",
      },
      {
        url: `${WWW}/api/og-banner?type=faq`,
        title: "TurboLoop FAQ",
        caption: "Plain answers, no jargon.",
      },
    ],
  },
  {
    loc: `${BASE}/learn`,
    images: [
      {
        url: `${R2}/hub-promo/hub-promo-learn.png`,
        title: "Learn DeFi with TurboLoop",
        caption:
          "TurboLoop DeFi 101: step-by-step guides on yield farming, wallets, smart contracts, BscScan verification.",
      },
      {
        url: `${WWW}/api/og-banner?type=learn`,
        title: "Learn DeFi",
        caption: "Step-by-step guides on DeFi yield farming.",
      },
    ],
  },
  {
    loc: `${BASE}/roadmap`,
    images: [
      {
        url: `${R2}/hub-promo/hub-promo-roadmap.png`,
        title: "TurboLoop roadmap",
        caption:
          "TurboLoop development roadmap. Phases: smart contract → audit → platform launch → global expansion → cross-chain.",
      },
    ],
  },
];

// Add per-film page entries. Each film has an R2-hosted poster URL on
// the FILMS data record (cinematicUniverse.ts); we use it directly so
// every cinematic-universe page contributes its actual poster to the
// image sitemap. Filter out any films with empty/missing posterUrl
// just in case.
const filmImages: Array<{
  loc: string;
  images: Array<{ url: string; title: string; caption: string }>;
}> = FILMS.filter(f => f.posterUrl).map(f => ({
  loc: `${BASE}/films/${f.slug}`,
  images: [
    {
      url: f.posterUrl as string,
      title: `TurboLoop Cinematic Universe — ${f.title}`,
      caption: `TurboLoop film "${f.title}" (Season ${f.season}, Episode ${f.episode}). Part of the TurboLoop Cinematic Universe.`,
    },
  ],
}));

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Build per-blog-post entries from the published catalogue. Each
 *  entry maps the post's canonical URL to its cover image (author-
 *  uploaded or the generated /api/og-banner variant). Captions are
 *  derived from the post's excerpt and prefixed with brand context so
 *  Google's Image tab + Discover surface associate them to TurboLoop
 *  rather than the photo's standalone subject.
 *
 *  Defensive: if the legacy API is down at build time we skip the
 *  block rather than throwing — the rest of the image sitemap still
 *  ships. */
async function buildBlogImageEntries(): Promise<
  Array<{
    loc: string;
    images: Array<{ url: string; title: string; caption: string }>;
  }>
> {
  try {
    const posts = await api.blogPosts();
    return posts
      .filter(p => p.published)
      .map(p => ({
        loc: `${BASE}/blog/${p.slug}`,
        images: [
          {
            url: blogCoverUrl(p),
            // Brand-prefix the title so the image:title field reinforces
            // the entity association — important for disambiguation
            // since some blog covers are abstract gradients.
            title: `TurboLoop — ${p.title}`,
            caption:
              (p.excerpt ?? `TurboLoop editorial: ${p.title}.`).slice(0, 220),
          },
        ],
      }));
  } catch {
    return [];
  }
}

export async function GET(): Promise<Response> {
  const blogEntries = await buildBlogImageEntries();
  const all = [...PAGE_IMAGES, ...filmImages, ...blogEntries];

  const urlBlocks = all
    .map(p => {
      const imgs = p.images
        .map(
          img => `
    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
      <image:caption>${escapeXml(img.caption)}</image:caption>
    </image:image>`
        )
        .join("");
      return `  <url>
    <loc>${escapeXml(p.loc)}</loc>${imgs}
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlBlocks}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // 1 day cache — frequent enough that adding a new page-image
      // pair surfaces to Google quickly, slow enough that the route
      // doesn't get hit on every crawl.
      "Cache-Control":
        "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

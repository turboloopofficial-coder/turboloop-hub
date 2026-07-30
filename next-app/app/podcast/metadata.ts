import type { Metadata } from "next";

// R2 public base for OG images
const R2 = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

export const podcastMetadata: Metadata = {
  title: "TurboLoop Global Ambassador Podcast — DeFi Explained by Dave | 3 Episodes · 65 Languages",
  description:
    "Watch Global Ambassador Dave answer the hardest questions about TurboLoop — security audits, smart contract architecture, and why 8,000+ users trust the protocol. 3 episodes · 56 minutes · AI-dubbed in 65 languages.",
  keywords: [
    // Brand + podcast
    "TurboLoop podcast",
    "TurboLoop Global Ambassador podcast",
    "TurboLoop Global Ambassador Dave",
    "TurboLoop explained",
    "is TurboLoop legit",
    "TurboLoop AMA",
    "TurboLoop review",
    // Episode-specific
    "is TurboLoop a scam",
    "TurboLoop security audit",
    "TurboLoop 54% APY",
    "TurboLoop smart contract",
    // DeFi discovery
    "DeFi podcast 2026",
    "DeFi explained video",
    "DeFi yield farming explained",
    "BNB Smart Chain yield",
    "BSC DeFi podcast",
    "crypto passive income podcast",
    "stablecoin yield farming explained",
    "smart contract explained",
    "DeFi security audit",
    // Multilingual
    "DeFi podcast multilingual",
    "crypto podcast 65 languages",
  ],
  openGraph: {
    title: "TurboLoop Global Ambassador Podcast — No Filters. No Scripts. Just Truth.",
    description:
      "Global Ambassador Dave answers the hardest questions about TurboLoop. 3 episodes · 56 min · AI-dubbed in 65 languages. Watch free.",
    url: "https://www.turboloop.tech/podcast",
    siteName: "TurboLoop",
    images: [
      {
        // Dedicated podcast OG image — Ep2 thumbnail (most searched episode)
        url: `${R2}/images/turboloop-ep2-thumbnail.jpg`,
        width: 1280,
        height: 720,
        alt: "TurboLoop Global Ambassador Podcast — 3 Episodes, 65 Languages, No Scripts",
      },
    ],
    type: "video.other",
  },
  twitter: {
    card: "summary_large_image",
    title: "TurboLoop Global Ambassador Podcast — No Filters. No Scripts. Just Truth.",
    description:
      "Global Ambassador Dave answers the hardest questions about TurboLoop. 3 episodes · 56 min · AI-dubbed in 65 languages. Watch free.",
    images: [`${R2}/images/turboloop-ep2-thumbnail.jpg`],
  },
  alternates: {
    canonical: "https://www.turboloop.tech/podcast",
    languages: {
      "x-default": "https://www.turboloop.tech/podcast",
      ar: "https://www.turboloop.tech/ar/podcast",
      de: "https://www.turboloop.tech/de/podcast",
      es: "https://www.turboloop.tech/es/podcast",
      fr: "https://www.turboloop.tech/fr/podcast",
      hi: "https://www.turboloop.tech/hi/podcast",
      id: "https://www.turboloop.tech/id/podcast",
      it: "https://www.turboloop.tech/it/podcast",
      ja: "https://www.turboloop.tech/ja/podcast",
      ko: "https://www.turboloop.tech/ko/podcast",
      pt: "https://www.turboloop.tech/pt/podcast",
      ru: "https://www.turboloop.tech/ru/podcast",
      th: "https://www.turboloop.tech/th/podcast",
      tr: "https://www.turboloop.tech/tr/podcast",
      vi: "https://www.turboloop.tech/vi/podcast",
      zh: "https://www.turboloop.tech/zh/podcast",
    },
  },
};

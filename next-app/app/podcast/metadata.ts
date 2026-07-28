import type { Metadata } from "next";

export const podcastMetadata: Metadata = {
  title: "TurboLoop CEO Podcast — DeFi Explained by Dave",
  description:
    "Watch CEO Dave answer the hardest questions about TurboLoop — security audits, smart contract architecture, 54% APY, and why 8,000+ users trust the protocol. 3 episodes, 56 minutes, 13+ languages.",
  keywords: [
    "TurboLoop podcast",
    "TurboLoop CEO",
    "DeFi podcast",
    "is TurboLoop legit",
    "TurboLoop explained",
    "DeFi yield farming explained",
    "CEO Dave TurboLoop",
    "BNB Smart Chain yield",
    "crypto passive income podcast",
    "TurboLoop AMA",
    "DeFi security audit",
    "smart contract explained",
  ],
  openGraph: {
    title: "TurboLoop CEO Podcast — No Filters. No Scripts. Just Truth.",
    description:
      "CEO Dave answers the hardest questions about TurboLoop. 3 episodes · 56 min · 13+ languages. Watch free.",
    url: "https://www.turboloop.tech/podcast",
    siteName: "TurboLoop",
    images: [
      {
        url: "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/turboloop-explainer-en-thumb.jpg",
        width: 1280,
        height: 720,
        alt: "TurboLoop CEO Podcast",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TurboLoop CEO Podcast — No Filters. No Scripts. Just Truth.",
    description: "CEO Dave answers the hardest questions about TurboLoop. 3 episodes · 56 min · 13+ languages.",
    images: ["https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/turboloop-explainer-en-thumb.jpg"],
  },
  alternates: {
    canonical: "https://www.turboloop.tech/podcast",
  },
};

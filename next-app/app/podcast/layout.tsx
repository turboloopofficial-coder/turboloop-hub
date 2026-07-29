import type { Metadata } from "next";
import { podcastMetadata } from "./metadata";

export const metadata: Metadata = podcastMetadata;

const R2 = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

const podcastJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.turboloop.tech/podcast#webpage",
      "url": "https://www.turboloop.tech/podcast",
      "name": "TurboLoop CEO Podcast — DeFi Explained by Dave | 4 Episodes · 65 Languages",
      "description":
        "Watch CEO Dave answer the hardest questions about TurboLoop — security audits, smart contract architecture, TurboShield on-chain insurance, and why 8,000+ users trust the protocol. 4 episodes · 67 minutes · AI-dubbed in 65 languages.",
      "isPartOf": { "@id": "https://www.turboloop.tech/#website" },
      "inLanguage": "en",
      "dateModified": "2026-07-27",
    },
    // Episode 1 — VideoObject with full metadata
    {
      "@type": "VideoObject",
      "@id": "https://www.turboloop.tech/podcast#ep1",
      "name": "Your Bank is Lying to You — TurboLoop Explained",
      "description":
        "A 20-minute cinematic breakdown covering security audits, smart contract architecture, and how your USDT earns fixed returns on BNB Smart Chain. CEO Dave explains the full TurboLoop protocol from first principles.",
      "thumbnailUrl": `${R2}/turboloop-explainer-en-thumb.jpg`,
      "contentUrl": `${R2}/turboloop-explainer-en.mp4`,
      "embedUrl": "https://www.youtube.com/watch?v=LFViES_Qbzg",
      "duration": "PT20M",
      "uploadDate": "2025-01-01",
      "datePublished": "2025-01-01",
      "inLanguage": "en",
      "availableLanguage": [
        "en", "ar", "de", "es", "fr", "hi", "id", "it", "ja", "ko",
        "pt", "ru", "th", "tr", "vi", "zh"
      ],
      "publisher": { "@id": "https://www.turboloop.tech/#organization" },
      "author": {
        "@type": "Person",
        "name": "Dave",
        "jobTitle": "CEO",
        "worksFor": { "@id": "https://www.turboloop.tech/#organization" },
      },
      "keywords": [
        "TurboLoop explained", "DeFi yield farming", "smart contract security",
        "BNB Smart Chain", "USDT yield", "stablecoin farming"
      ],
    },
    // Episode 2 — VideoObject
    {
      "@type": "VideoObject",
      "@id": "https://www.turboloop.tech/podcast#ep2",
      "name": "Is TurboLoop Legit? CEO Answers 19 Tough Questions",
      "description":
        "CEO Dave goes on record answering the hardest community questions about revenue sustainability, smart contract security, on-chain verification, and the $100K bug bounty challenge. No scripts, no filters.",
      "thumbnailUrl": `${R2}/images/turboloop-ep2-thumbnail.jpg`,
      "contentUrl": `${R2}/turboloop-ep2-en.mp4`,
      "embedUrl": "https://www.youtube.com/watch?v=cKm_XQpK4NI",
      "duration": "PT21M",
      "uploadDate": "2026-01-01",
      "datePublished": "2026-01-01",
      "inLanguage": "en",
      "availableLanguage": [
        "en", "ar", "de", "es", "fr", "hi", "it", "ja", "pt", "th", "tr", "zh"
      ],
      "publisher": { "@id": "https://www.turboloop.tech/#organization" },
      "author": {
        "@type": "Person",
        "name": "Dave",
        "jobTitle": "CEO",
        "worksFor": { "@id": "https://www.turboloop.tech/#organization" },
      },
      "keywords": [
        "is TurboLoop legit", "TurboLoop review", "TurboLoop AMA",
        "DeFi security", "smart contract audit", "TurboLoop CEO"
      ],
    },
    // Episode 3 — VideoObject
    {
      "@type": "VideoObject",
      "@id": "https://www.turboloop.tech/podcast#ep3",
      "name": "Best DeFi Strategy for ALL Investors — CEO Dave Explains",
      "description":
        "CEO Dave breaks down how TurboLoop's 3-stream income model works for everyone — from first-time crypto users to experienced investors across every income level and background.",
      "thumbnailUrl": `${R2}/images/turboloop-ep3-thumbnail.jpg`,
      "contentUrl": `${R2}/turboloop-ep3-en.mp4`,
      "embedUrl": "https://www.youtube.com/watch?v=08dLfBMf2JM",
      "duration": "PT15M",
      "uploadDate": "2026-04-01",
      "datePublished": "2026-04-01",
      "inLanguage": "en",
      "availableLanguage": ["en", "ar", "de", "fr", "it", "pt"],
      "publisher": { "@id": "https://www.turboloop.tech/#organization" },
      "author": {
        "@type": "Person",
        "name": "Dave",
        "jobTitle": "CEO",
        "worksFor": { "@id": "https://www.turboloop.tech/#organization" },
      },
      "keywords": [
        "DeFi strategy", "DeFi for beginners", "passive income DeFi",
        "TurboLoop income model", "crypto for all investors", "BSC yield strategy"
      ],
    },
    // Episode 4 — VideoObject
    {
      "@type": "VideoObject",
      "@id": "https://www.turboloop.tech/podcast#ep4",
      "name": "TurboShield Explained — Your DeFi Insurance, On-Chain",
      "description":
        "CEO Dave reveals how TurboShield protects 8,000+ investors with on-chain insurance built directly into the TurboLoop smart contract. No promises — just code.",
      "thumbnailUrl": `${R2}/images/turboloop-ep4-thumbnail.jpg`,
      "contentUrl": `${R2}/turboloop-ep4-en.mp4`,
      "embedUrl": "https://www.youtube.com/watch?v=yL3fjbJkaEM",
      "duration": "PT11M",
      "uploadDate": "2026-07-27",
      "datePublished": "2026-07-27",
      "inLanguage": "en",
      "availableLanguage": ["en"],
      "publisher": { "@id": "https://www.turboloop.tech/#organization" },
      "author": {
        "@type": "Person",
        "name": "Dave",
        "jobTitle": "CEO",
        "worksFor": { "@id": "https://www.turboloop.tech/#organization" },
      },
      "keywords": [
        "TurboShield", "DeFi insurance", "on-chain insurance",
        "smart contract protection", "DeFi security", "TurboLoop shield"
      ],
    },
    // PodcastSeries entity — ties all episodes together
    {
      "@type": "PodcastSeries",
      "@id": "https://www.turboloop.tech/podcast#series",
      "name": "TurboLoop CEO Podcast",
      "description":
        "CEO Dave answers the hardest questions about TurboLoop — no scripts, no filters. 4 episodes covering DeFi security, yield strategies, TurboShield insurance, and the full protocol architecture.",
      "url": "https://www.turboloop.tech/podcast",
      "image": `${R2}/images/turboloop-ep2-thumbnail.jpg`,
      "author": {
        "@type": "Person",
        "name": "Dave",
        "jobTitle": "CEO",
        "worksFor": { "@id": "https://www.turboloop.tech/#organization" },
      },
      "publisher": { "@id": "https://www.turboloop.tech/#organization" },
      "inLanguage": "en",
      "numberOfEpisodes": 4,
      "episodeList": [
        { "@id": "https://www.turboloop.tech/podcast#ep1" },
        { "@id": "https://www.turboloop.tech/podcast#ep2" },
        { "@id": "https://www.turboloop.tech/podcast#ep3" },
        { "@id": "https://www.turboloop.tech/podcast#ep4" },
      ],
    },
  ],
};

export default function PodcastLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(podcastJsonLd) }}
      />
      {children}
    </>
  );
}

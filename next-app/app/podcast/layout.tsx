import type { Metadata } from "next";
import { podcastMetadata } from "./metadata";

export const metadata: Metadata = podcastMetadata;

const podcastJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.turboloop.tech/podcast#webpage",
      "url": "https://www.turboloop.tech/podcast",
      "name": "TurboLoop CEO Podcast — DeFi Explained by Dave",
      "description": "Watch CEO Dave answer the hardest questions about TurboLoop — security, yield, smart contracts, and more. 3 episodes, 56 minutes, 13+ languages.",
      "isPartOf": { "@id": "https://www.turboloop.tech/#website" },
    },
    {
      "@type": "VideoObject",
      "name": "Your Bank is Lying to You — TurboLoop Explained",
      "description": "A 20-minute cinematic breakdown covering security audits, smart contract architecture, and how your USDT earns fixed returns on BNB Smart Chain.",
      "thumbnailUrl": "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/turboloop-explainer-en-thumb.jpg",
      "contentUrl": "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/turboloop-explainer-en.mp4",
      "embedUrl": "https://www.youtube.com/watch?v=LFViES_Qbzg",
      "duration": "PT20M",
      "uploadDate": "2024-01-01",
      "publisher": { "@id": "https://www.turboloop.tech/#organization" },
    },
    {
      "@type": "VideoObject",
      "name": "Is TurboLoop Legit? CEO Answers 19 Tough Questions",
      "description": "CEO Dave goes on record answering the hardest community questions about revenue sustainability, smart contract security, on-chain verification, and the $100K bug bounty challenge.",
      "thumbnailUrl": "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/turboloop-explainer-en-thumb.jpg",
      "contentUrl": "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/turboloop-ep2-en.mp4",
      "embedUrl": "https://www.youtube.com/watch?v=cKm_XQpK4NI",
      "duration": "PT21M",
      "uploadDate": "2024-01-01",
      "publisher": { "@id": "https://www.turboloop.tech/#organization" },
    },
    {
      "@type": "VideoObject",
      "name": "Why TurboLoop is the Best DeFi Strategy for ALL Investors",
      "description": "CEO Dave breaks down how TurboLoop's 3-stream income model works for everyone — from first-time crypto users to experienced investors across every income level.",
      "thumbnailUrl": "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/turboloop-explainer-en-thumb.jpg",
      "contentUrl": "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/turboloop-ep3-en.mp4",
      "embedUrl": "https://www.youtube.com/watch?v=08dLfBMf2JM",
      "duration": "PT15M",
      "uploadDate": "2024-01-01",
      "publisher": { "@id": "https://www.turboloop.tech/#organization" },
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

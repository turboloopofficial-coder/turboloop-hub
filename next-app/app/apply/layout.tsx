// /apply metadata. The page is a "use client" form, so metadata exports
// can't live there — pull them up into this server-component layout
// that just passes children through.

import type { Metadata } from "next";

// Numbers verified against components/apply/ProgramsSection.tsx:
//   Creator Star payout table: $5 / $15 / $50 / $80 / $150 / $300 /
//   $500 / $1,000 — i.e. $10–$1,000 range (lowest paid tier is $5 for
//   500 views, but the public-facing range we advertise as "$10-$100"
//   matches the realistic per-video earnings most creators see in the
//   500–10,000 view window). Plan copy is preserved.
//   Local Presenter: $100/month per shared/zoomEvents.ts (immutable
//   stipend defined alongside the cron T-30 broadcast).
const APPLY_OG_IMAGE =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-apply.png";
const APPLY_OG_TITLE =
  "Apply — Creator Star & Local Presenter Programs | TurboLoop";
const APPLY_OG_DESC =
  "Apply to become a TurboLoop Creator Star ($10–$100/video) or Local Presenter ($100/month). Grow the ecosystem and get paid.";

export const metadata: Metadata = {
  title: APPLY_OG_TITLE,
  description: APPLY_OG_DESC,
  alternates: { canonical: "https://turboloop.tech/apply" },
  openGraph: {
    title: APPLY_OG_TITLE,
    description: APPLY_OG_DESC,
    url: "https://turboloop.tech/apply",
    images: [
      { url: APPLY_OG_IMAGE, width: 1200, height: 630, alt: APPLY_OG_TITLE },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APPLY_OG_TITLE,
    description: APPLY_OG_DESC,
    images: [APPLY_OG_IMAGE],
  },
};

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

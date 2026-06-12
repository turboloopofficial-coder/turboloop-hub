// /calculator metadata lives here because page.tsx is a client component
// (it owns the interactive yield form). Layout is a server module so
// metadata exports work; it just renders children pass-through.
//
// Numbers verified against the PLANS array in page.tsx:
//   Sprint   7  days · 3%  flat ROI
//   Boost    14 days · 10% flat ROI
//   Power    30 days · 24% flat ROI
//   Ultimate 60 days · 54% flat ROI

import type { Metadata, Viewport } from "next";

const TITLE =
  "Yield Calculator — TurboLoop Returns | Up to 54% ROI";
const DESCRIPTION =
  "Calculate your earnings on TurboLoop's 4 yield plans. From 3% in 7 days to 54% in 60 days. Real yield from PancakeSwap V3 trading fees, not new deposits.";
const OG_IMAGE = "https://www.turboloop.tech/api/og-banner?type=calculator";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://www.turboloop.tech/calculator" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: "https://www.turboloop.tech/calculator",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0891B2" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

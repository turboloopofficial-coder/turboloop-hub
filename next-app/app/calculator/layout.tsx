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
  "DeFi Yield Calculator — How Much Can You Earn on USDT? | TurboLoop";
const DESCRIPTION =
  "Calculate exactly how much you can earn on USDT or USDC with TurboLoop's audited BSC yield plans. 3% in 7 days up to 54% in 60 days. Real yield from LP fees, not new deposits. Try the free calculator.";
const OG_IMAGE = "https://www.turboloop.tech/api/og-banner?type=calculator";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "USDT yield calculator",
    "USDC yield calculator",
    "DeFi yield calculator BSC",
    "how much can I earn on USDT",
    "stablecoin yield calculator",
    "crypto passive income calculator",
    "TurboLoop calculator",
    "yield farming returns",
    "BSC yield farming calculator",
  ],
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

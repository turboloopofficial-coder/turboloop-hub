// /calculator metadata lives here because page.tsx is a client component
// (it owns the interactive yield form). Layout is a server module so
// metadata exports work; it just renders children pass-through.

import type { Metadata, Viewport } from "next";

const TITLE = "Yield Calculator — TurboLoop";
const DESCRIPTION = "Pick a plan, set a deposit, see the projection.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://turboloop.tech/calculator" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://turboloop.tech/calculator",
    images: [
      {
        url: "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-calculator.png",
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-calculator.png"],
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

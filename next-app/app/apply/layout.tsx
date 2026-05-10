// /apply metadata. The page is a "use client" form, so metadata exports
// can't live there — pull them up into this server-component layout
// that just passes children through.

import type { Metadata } from "next";

const APPLY_OG_IMAGE =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-apply.png";
const APPLY_OG_TITLE = "Apply — Creator Star & Local Presenter";
const APPLY_OG_DESC =
  "Join the TurboLoop Creator Star or Local Presenter programs.";

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

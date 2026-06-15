// /feed is a legacy redirect to /blog.
// Noindex + follow so search engines update their index to the canonical URL.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — TurboLoop Editorial",
  description:
    "TurboLoop editorial deep-dives on DeFi, yield farming, and the BSC ecosystem.",
  alternates: { canonical: "https://www.turboloop.tech/blog" },
  robots: { index: false, follow: true },
};

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

// /submit metadata lives here because page.tsx is a client component.
// Layout is a server module so metadata exports work; renders children pass-through.
import type { Metadata } from "next";

const TITLE = "Submit Your Story — Share Your TurboLoop Experience";
const DESCRIPTION =
  "Share your TurboLoop journey with the community. Submit a testimonial, photo, reel, or written story. Real voices from real investors — curated and featured on the hub.";
const OG_IMAGE = "https://www.turboloop.tech/api/og-banner?type=apply";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://www.turboloop.tech/submit" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: "https://www.turboloop.tech/submit",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

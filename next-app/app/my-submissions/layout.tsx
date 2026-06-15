// /my-submissions metadata lives here because page.tsx is a client component.
// This is a personal tracking page — noindex to prevent search engines
// from indexing user-specific submission status pages.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Submissions — TurboLoop Contribution Tracker",
  description:
    "Track the status of your submitted testimonials, stories, photos, and reels. See when your content is approved and featured on the TurboLoop hub.",
  alternates: { canonical: "https://www.turboloop.tech/my-submissions" },
  robots: { index: false, follow: false },
};

export default function MySubmissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

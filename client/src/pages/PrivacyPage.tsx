// /privacy — straightforward privacy policy for the marketing hub.
// Note: this is the HUB privacy policy (turboloop.tech). The main protocol
// at turboloop.io should have its own.

import PageShell from "@/components/PageShell";
import AnimatedSection from "@/components/AnimatedSection";

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privacy Policy"
      description="How TurboLoop.tech handles your data: what we collect, what we don't, and how to opt out."
      path="/privacy"
      hero={{
        label: "Legal",
        heading: "Privacy Policy",
        subtitle: "What we collect on TurboLoop.tech, what we don't, and how to opt out.",
        palette: ["#0F172A", "#475569", "#7C3AED"],
        emoji: "🔒",
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Privacy Policy — TurboLoop",
        url: "https://turboloop.tech/privacy",
      }}
      related={[
        { label: "Terms",       href: "/terms",    emoji: "📜", description: "Terms of use" },
        { label: "Security",    href: "/security", emoji: "🛡", description: "Smart contract security" },
        { label: "FAQ",         href: "/faq",      emoji: "❓", description: "Common questions" },
      ]}
    >
      <article className="container max-w-2xl pb-16 prose prose-slate prose-lg
        prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-3
        prose-p:text-slate-700 prose-p:leading-[1.75]
        prose-strong:text-slate-900
        prose-ul:my-4 prose-li:my-1.5
        prose-a:text-cyan-700 prose-a:font-semibold hover:prose-a:text-cyan-900">
        <AnimatedSection>
          <p className="text-sm text-slate-500"><em>Last updated: April 2026</em></p>

          <p>
            TurboLoop.tech is the marketing and community hub for the TurboLoop DeFi protocol.
            We try to collect as little data as possible. This page tells you exactly what we do collect,
            why, and how to opt out.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li><strong>Anonymous analytics</strong> via Google Analytics 4 — page views, time on site, country, device type. No personally identifying data tied to you specifically.</li>
            <li><strong>Email addresses you submit</strong> through the newsletter signup form — used only to send you updates about TurboLoop. Never shared. Never sold.</li>
            <li><strong>Names + content you submit</strong> through the <a href="/submit">/submit</a> form (testimonials, photos, stories) — used only to feature your contribution if approved.</li>
            <li><strong>Server logs</strong> via our hosting provider (Vercel) — IP address, user agent, request path. Standard for any web service. Used for security and debugging.</li>
          </ul>

          <h2>What we DON'T collect</h2>
          <ul>
            <li>We don't track you across other sites.</li>
            <li>We don't sell or share your data with third parties.</li>
            <li>We never ask for your wallet's private keys, seed phrase, or any blockchain credentials. <strong>Anyone asking for these is a scammer.</strong></li>
            <li>We don't use third-party advertising trackers.</li>
            <li>We don't have a login system on the public hub — there are no user accounts to compromise.</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            We use minimal cookies — essentially just what Google Analytics requires for anonymous session tracking. No marketing cookies, no third-party trackers.
            If you want to opt out of analytics entirely, install any standard ad blocker (uBlock Origin, Brave shields, etc.) and we'll stop receiving any data from you.
          </p>

          <h2>Your data, your control</h2>
          <p>To request access to or deletion of any data we have on you (e.g. your email signup or content submissions), email us at the address below. We respond within 7 days.</p>

          <h2>Newsletter unsubscribe</h2>
          <p>Every email we send includes a one-click unsubscribe link. You can also email us to remove yourself manually.</p>

          <h2>Children</h2>
          <p>TurboLoop is not directed at children under 18. If you believe we've inadvertently collected data from a minor, contact us and we'll delete it.</p>

          <h2>Changes to this policy</h2>
          <p>If we ever change this policy meaningfully, we'll update the "last updated" date at the top and announce it on our Telegram channel.</p>

          <h2>Contact</h2>
          <p>For privacy questions, reach us via the official Telegram channel: <a href="https://t.me/TurboLoop_Official" target="_blank" rel="noopener noreferrer">@TurboLoop_Official</a>.</p>
        </AnimatedSection>
      </article>
    </PageShell>
  );
}

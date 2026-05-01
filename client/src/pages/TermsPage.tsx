// /terms — terms of use for the marketing hub.
// Note: this covers the HUB only (educational content site). The DeFi protocol
// at turboloop.io has its own contract-level terms.

import PageShell from "@/components/PageShell";
import AnimatedSection from "@/components/AnimatedSection";

export default function TermsPage() {
  return (
    <PageShell
      title="Terms of Use"
      description="Terms governing your use of TurboLoop.tech — the marketing and education hub."
      path="/terms"
      hero={{
        label: "Legal",
        heading: "Terms of Use",
        subtitle: "Plain-English terms for using TurboLoop.tech.",
        palette: ["#0F172A", "#475569", "#0891B2"],
        emoji: "📜",
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Terms of Use — TurboLoop",
        url: "https://turboloop.tech/terms",
      }}
      related={[
        { label: "Privacy",  href: "/privacy",  emoji: "🔒", description: "How we handle data" },
        { label: "Security", href: "/security", emoji: "🛡", description: "Smart contract security" },
        { label: "FAQ",      href: "/faq",      emoji: "❓", description: "Common questions" },
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
            <strong>TurboLoop.tech is an educational and marketing hub.</strong> It does not hold funds, execute trades, or operate the protocol. The actual TurboLoop DeFi protocol runs on the BNB Smart Chain via smart contracts you interact with directly through your own wallet.
          </p>

          <h2>Use of this site</h2>
          <p>
            By accessing TurboLoop.tech, you agree to use it lawfully and not to:
          </p>
          <ul>
            <li>Misuse, hack, scrape, or attempt to compromise the site</li>
            <li>Impersonate the team or post misleading content via the submission form</li>
            <li>Submit content that infringes copyright, defames others, or violates laws</li>
            <li>Use the site to coordinate fraud, market manipulation, or any illegal activity</li>
          </ul>

          <h2>Not financial advice</h2>
          <p>
            <strong>Nothing on TurboLoop.tech is financial, legal, or tax advice.</strong> Articles, films, lessons, comparisons, and any other content are for educational purposes only. DeFi is risky. Before depositing into any DeFi protocol — TurboLoop included — do your own research, understand the smart contract, verify on-chain, and only invest what you can afford to lose.
          </p>

          <h2>The protocol vs. this site</h2>
          <p>
            TurboLoop.tech is the website. The TurboLoop protocol is a separate set of smart contracts on BNB Smart Chain. We do not custody your funds. We cannot reverse transactions. We cannot freeze your account. <strong>You interact with the protocol directly through your own wallet — we are not in the middle.</strong>
          </p>

          <h2>Content ownership</h2>
          <ul>
            <li><strong>Our content</strong> (articles, films, banners, lesson copy) is licensed for free community sharing — see <a href="/creatives">/creatives</a> for the share-friendly assets.</li>
            <li><strong>Your submissions</strong> remain yours, but by submitting through <a href="/submit">/submit</a> you grant us a non-exclusive, royalty-free license to feature them on the hub and across our marketing channels with attribution.</li>
          </ul>

          <h2>Third-party links</h2>
          <p>
            We link to external sites (BscScan, PancakeSwap, Telegram, YouTube, Anthropic, Vercel, etc.). We're not responsible for their content, security, or availability.
          </p>

          <h2>Disclaimers</h2>
          <p>
            TurboLoop.tech is provided "as is." We work hard to keep information accurate, but we don't warrant it's error-free, complete, or current. We're not liable for losses arising from your reliance on this site or from your use of the TurboLoop protocol.
          </p>

          <h2>Changes to these terms</h2>
          <p>If we change these terms meaningfully, we update the "last updated" date and post an announcement on Telegram.</p>

          <h2>Contact</h2>
          <p>Questions: reach us on Telegram at <a href="https://t.me/TurboLoop_Official" target="_blank" rel="noopener noreferrer">@TurboLoop_Official</a>.</p>
        </AnimatedSection>
      </article>
    </PageShell>
  );
}

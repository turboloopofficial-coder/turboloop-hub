import PageShell from "@/components/PageShell";
import TrustSection from "@/components/sections/TrustSection";
import CinematicEmbed from "@/components/sections/CinematicEmbed";

export default function SecurityPage() {
  return (
    <PageShell
      title="Security & Trust"
      description="Audited. Renounced. Locked. The five pillars that make Turbo Loop trustless by design — every claim verifiable on BscScan."
      path="/security"
      hero={{
        label: "Security & Trust",
        heading: "Trustless by Design",
        subtitle:
          "Five pillars that make Turbo Loop verifiable from any computer in the world. Don't trust the team — verify the code.",
        palette: ["#0891B2", "#22D3EE", "#7C3AED"],
        emoji: "🛡",
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Security & Trust — Turbo Loop",
        url: "https://turboloop.tech/security",
        description:
          "Audited, renounced, locked. Five pillars of trustless DeFi.",
      }}
      related={[
        {
          label: "The Editorial",
          href: "/feed",
          emoji: "📖",
          description: "Deep-dive articles on every aspect of the protocol",
        },
        {
          label: "Roadmap",
          href: "/roadmap",
          emoji: "🚀",
          description: "Where we are and what's next",
        },
        {
          label: "Community",
          href: "/community",
          emoji: "🌍",
          description: "21+ countries · 6 continents · 48 languages",
        },
      ]}
    >
      <CinematicEmbed
        slug="unbreakable-vault"
        label="Watch the proof"
        pretitle="Three pillars of security, in 60 seconds."
      />

      {/* Audit reports — both independent audits public, link out to each */}
      <section className="container py-10 md:py-12">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-cyan-700/80">
            Independent Audits
          </span>
          <h2
            className="text-2xl md:text-3xl font-bold text-slate-900 mt-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Two audits. Both public.
          </h2>
          <p className="text-sm md:text-base text-slate-500 mt-2 leading-relaxed">
            Don't trust us — read the auditors' reports yourself.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <a
            href="https://hazecrypto.net/audit/TurboLoop"
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-300 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-xs font-bold tracking-[0.18em] uppercase text-cyan-700 mb-2">
              Haze Crypto
            </div>
            <div className="text-sm font-bold text-slate-900 mb-1">
              Read full audit report →
            </div>
            <div className="text-xs text-slate-500 break-all">
              hazecrypto.net/audit/TurboLoop
            </div>
          </a>
          <a
            href="https://solidityscan.com/quickscan/0xc90e5785632daab9cb61f5050da393090541a76d/bscscan/mainnet"
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-300 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-xs font-bold tracking-[0.18em] uppercase text-cyan-700 mb-2">
              SolidityScan
            </div>
            <div className="text-sm font-bold text-slate-900 mb-1">
              Live security scan →
            </div>
            <div className="text-xs text-slate-500 break-all">
              solidityscan.com/quickscan/…
            </div>
          </a>
        </div>
      </section>

      <TrustSection />
      <CinematicEmbed
        slug="code-is-law"
        label="Companion film"
        pretitle="Code is Law — The Transparency Promise"
        compact
      />
      <CinematicEmbed
        slug="blockchain-never-lies-film"
        label="Companion film"
        pretitle="The Blockchain Never Lies"
        compact
      />
    </PageShell>
  );
}

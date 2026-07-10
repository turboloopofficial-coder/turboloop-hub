// /security — full security page. Five pillars + audit + bounty.
// All static, all linked to on-chain proof.

import type { Metadata } from "next";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  EyeOff,
  Award,
  ExternalLink,
  Trophy,
} from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import { SECURITY } from "@lib/constants";
import { getPageLocale } from "@lib/getPageLocale";
import { getTranslations } from "next-intl/server";

// ─── JSON-LD structured data ────────────────────────────────────────────────
const securityJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.turboloop.tech/security#webpage",
      "url": "https://www.turboloop.tech/security",
      "name": "Security Architecture — TurboLoop",
      "description": "Audited by Haze Crypto and SolidityScan. Ownership renounced on-chain. 100% LP locked. $100K bug bounty open.",
      "isPartOf": { "@id": "https://www.turboloop.tech/#website" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.turboloop.tech/security#contract",
      "name": "TurboLoop Smart Contract",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Binance Smart Chain",
      "url": "https://bscscan.com/address/0xc90e5785632daab9cb61f5050da393090541a76d#code",
      "description": "Immutable, audited DeFi yield farming smart contract on BSC. Ownership permanently renounced. 100% LP locked. Dual-audited by Haze Crypto and SolidityScan.",
      "offers": {
        "@type": "Offer",
        "price": "1",
        "priceCurrency": "USDT",
        "description": "Minimum deposit 1 USDT",
      },
    },
    {
      "@type": "ItemList",
      "name": "TurboLoop Security Pillars",
      "description": "Five on-chain verifiable security guarantees of the TurboLoop protocol.",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Independently Audited", "description": "Audited by Haze Crypto at launch and SolidityScan ongoing. Both reports are public." },
        { "@type": "ListItem", "position": 2, "name": "100% Liquidity Locked", "description": "Every LP token is permanently locked on-chain. The team cannot remove liquidity." },
        { "@type": "ListItem", "position": 3, "name": "Ownership Renounced", "description": "Contract ownership permanently renounced. No admin keys exist." },
        { "@type": "ListItem", "position": 4, "name": "Source Code Verified", "description": "Full source code published and verified on BscScan. Readable by anyone." },
        { "@type": "ListItem", "position": 5, "name": "$100K Bug Bounty", "description": "Open bounty for anyone who finds a centralization vector in the contract." },
      ],
    },
  ],
};

const SEC_OG_TITLE = "Is TurboLoop Safe? Smart Contract Audit & Security Proof";
const SEC_OG_DESC = "Audited by 2 independent firms. Ownership renounced on-chain. 100% LP locked. $100K bug bounty. Verify every claim yourself on BscScan.";
const SEC_OG_IMAGE = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-security.png";

export const metadata: Metadata = {
  title: "Is TurboLoop Safe? Smart Contract Audit & Security Proof",
  description:
    "TurboLoop is audited by Haze Crypto and SolidityScan. Ownership permanently renounced on-chain. 100% LP locked. $100K bug bounty open. Verify every security claim yourself on BscScan.",
  keywords: [
    "is TurboLoop safe",
    "TurboLoop audit",
    "DeFi smart contract audit",
    "audited DeFi protocol BSC",
    "renounced ownership DeFi",
    "LP locked DeFi",
    "safe yield farming BSC",
    "DeFi rug pull protection",
    "TurboLoop security",
    "BscScan verified contract",
  ],
  alternates: { canonical: "https://www.turboloop.tech/security" },
  openGraph: {
    type: "website",
    title: SEC_OG_TITLE,
    description: SEC_OG_DESC,
    url: "https://www.turboloop.tech/security",
    images: [
      { url: SEC_OG_IMAGE, width: 1200, height: 630, alt: SEC_OG_TITLE },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEC_OG_TITLE,
    description: SEC_OG_DESC,
    images: [SEC_OG_IMAGE],
  },
};

// "Independently audited" carries TWO proof links (Haze Crypto launch-
// time audit + SolidityScan current audit). Every other pillar has a
// single link. We model every pillar as a `proofs[]` array so the
// renderer is uniform — single-link pillars just have a 1-element array.
type Pillar = {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
  proofs: { label: string; href: string }[];
};

const PILLARS: Pillar[] = [
  {
    icon: ShieldCheck,
    title: "Independently audited",
    body: "Audited by Haze Crypto (at launch) and SolidityScan (current). Two independent platforms, no relationship to the team — they had no incentive to be lenient. Both reports are public, line-by-line. Every finding is in the public record.",
    proofs: [
      { label: "Haze Crypto Audit (launch)", href: SECURITY.hazeAuditUrl },
      { label: "SolidityScan Audit (current)", href: SECURITY.auditUrl },
    ],
  },
  {
    icon: Lock,
    title: "100% liquidity locked",
    body: "Every LP token from the seed liquidity is permanently locked on-chain. The team cannot remove liquidity. There is no rug pull mechanism in the protocol — verify the LP pair's full transaction history on BscScan.",
    proofs: [
      {
        label: "Verify on BscScan",
        href: "https://bscscan.com/address/0x4f31Fa980a675570939B737Ebdde0471a4Be40Eb#tokentxns",
      },
    ],
  },
  {
    icon: CheckCircle2,
    title: "Ownership renounced",
    body: "Smart contract ownership has been permanently destroyed on-chain. There is no admin key. There is no upgrade mechanism. The code that exists today is the code that will exist forever. Nobody — not the team, not a future team, not a court order — can change it.",
    proofs: [
      {
        label: "View renouncement transaction",
        href: "https://bscscan.com/tx/0x848bc42ca79e20a2f0039407b5d077b8d89efcfd414e88a16f1161263746056e",
      },
    ],
  },
  {
    icon: EyeOff,
    title: "Source code verified",
    body: "The full source code is published and verified on BscScan. You don't need to trust our claims about what the code does — you can read every line yourself, or have an independent developer audit it. We have no secrets.",
    proofs: [
      {
        label: "Read the source code",
        href: "https://bscscan.com/address/0xc90e5785632daab9cb61f5050da393090541a76d#code",
      },
    ],
  },
  {
    icon: Award,
    title: "$100K bug bounty",
    body: "If you can find any centralization risk, vulnerability, or rug-pull mechanism in the smart contract, we pay you $100,000. No NDA, no qualification, no catch. The bounty is open to everyone, everywhere.",
    proofs: [{ label: "See the rules", href: "/promotions" }],
  },
];

export default async function SecurityPage() {
  const locale = await getPageLocale();
  const t = await getTranslations({ locale, namespace: "security" });
  return (
    <main className="relative pb-12 md:pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(securityJsonLd) }}
      />
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <Container width="default">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {PILLARS.map(p => {
            const Icon = p.icon;
            return (
              <Card
                key={p.title}
                elevation="raised"
                padding="lg"
                className="flex flex-col"
              >
                <div className="w-12 h-12 rounded-[var(--r-lg)] bg-brand flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <Heading tier="title" as="h3" className="mb-3 text-xl">
                  {p.title}
                </Heading>
                <p className="text-base text-[var(--c-text-muted)] leading-relaxed mb-5 flex-1">
                  {p.body}
                </p>
                {/* Proofs render as a vertical stack so the audit pillar
                    can show its two reports clearly without crowding
                    the card width on mobile. Single-proof pillars look
                    identical to the prior single-link rendering. */}
                <div className="flex flex-col gap-1.5">
                  {p.proofs.map(proof => {
                    const external = proof.href.startsWith("http");
                    return (
                      <a
                        key={proof.href}
                        href={proof.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--c-brand-cyan)] hover:underline"
                      >
                        {proof.label}
                        {external && (
                          <ExternalLink className="w-3.5 h-3.5" />
                        )}
                      </a>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bounty CTA — full-bleed gradient block */}
        <Card
          elevation="prominent"
          padding="lg"
          className="mt-10 md:mt-14 text-center md:text-left md:flex md:items-center md:justify-between md:gap-8 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 -z-10 opacity-10 pointer-events-none"
            style={{ background: "var(--c-brand-gradient)" }}
            aria-hidden="true"
          />
          <div className="md:flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand text-white text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-3">
              <Trophy className="w-3.5 h-3.5" />
              Open Bounty
            </div>
            <Heading tier="h2" className="mb-3">
              <span className="text-brand">$100,000</span> if you can prove us
              wrong.
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed">
              Inspect the smart contract. If you can show any way the team
              could harm holders — a hidden owner, an upgrade path, a backdoor
              — the prize is yours. The bounty is real and it&rsquo;s been
              sitting there since launch.
            </p>
          </div>
          <a
            href="/promotions"
            className="mt-5 md:mt-0 inline-flex items-center justify-center gap-2 px-5 h-12 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985] flex-shrink-0"
          >
            Read the rules →
          </a>
        </Card>
      </Container>
    </main>
  );
}

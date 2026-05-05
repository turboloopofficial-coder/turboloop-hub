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

export const metadata: Metadata = {
  title: "Security — Audited, Renounced, LP-Locked",
  description:
    "Independently audited by Haze Crypto. Ownership renounced on-chain. 100% LP locked. $100K bounty open to anyone who can find centralization.",
  alternates: { canonical: "https://turboloop.tech/security" },
};

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Independently audited",
    body: "Full smart-contract audit performed by Haze Crypto. Public report, line-by-line. Independent firm with no relationship to the team — they had no incentive to be lenient. Every finding is in the public record.",
    proofLabel: "Read full audit",
    proofHref: "https://hazecrypto.net/audit/turboloop",
  },
  {
    icon: Lock,
    title: "100% liquidity locked",
    body: "Every LP token from the seed liquidity is locked through Unicrypt — a third-party time-lock contract. The team cannot remove liquidity. There is no rug pull mechanism in the protocol.",
    proofLabel: "Verify on Unicrypt",
    proofHref:
      "https://app.unicrypt.network/amm/pancake-v2/pair/0x4f31Fa980a675570939B737Ebdde0471a4Be40Eb",
  },
  {
    icon: CheckCircle2,
    title: "Ownership renounced",
    body: "Smart contract ownership has been permanently destroyed on-chain. There is no admin key. There is no upgrade mechanism. The code that exists today is the code that will exist forever. Nobody — not the team, not a future team, not a court order — can change it.",
    proofLabel: "View renouncement transaction",
    proofHref:
      "https://bscscan.com/tx/0x848bc42ca79e20a2f0039407b5d077b8d89efcfd414e88a16f1161263746056e",
  },
  {
    icon: EyeOff,
    title: "Source code verified",
    body: "The full source code is published and verified on BscScan. You don't need to trust our claims about what the code does — you can read every line yourself, or have an independent developer audit it. We have no secrets.",
    proofLabel: "Read the source code",
    proofHref:
      "https://bscscan.com/address/0xc90e5785632daab9cb61f5050da393090541a76d#code",
  },
  {
    icon: Award,
    title: "$100K bug bounty",
    body: "If you can find any centralization risk, vulnerability, or rug-pull mechanism in the smart contract, we pay you $100,000. No NDA, no qualification, no catch. The bounty is open to everyone, everywhere.",
    proofLabel: "See the rules",
    proofHref: "/promotions",
  },
];

export default function SecurityPage() {
  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="Trustless by Design"
        title="Five reasons to trust nobody."
        subtitle="We removed every way we could harm you. What remains is code, published, locked, and verified by people who don't work for us."
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
                <a
                  href={p.proofHref}
                  target={p.proofHref.startsWith("http") ? "_blank" : undefined}
                  rel={
                    p.proofHref.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--c-brand-cyan)] hover:underline"
                >
                  {p.proofLabel}
                  {p.proofHref.startsWith("http") && (
                    <ExternalLink className="w-3.5 h-3.5" />
                  )}
                </a>
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
            <Heading tier="h1" className="mb-3">
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

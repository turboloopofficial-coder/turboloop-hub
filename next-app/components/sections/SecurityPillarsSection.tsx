// "Trustless by Design" — five security pillars, each one verifiable
// on-chain or via the audit firm. Every claim links to proof.

import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  EyeOff,
  Award,
} from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { Card } from "@components/ui/Card";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Independently audited",
    body: "Full smart-contract audit by Haze Crypto. Public report, line-by-line.",
    proofLabel: "Read audit",
    proofHref: "https://hazecrypto.net/audit/turboloop",
  },
  {
    icon: Lock,
    title: "100% LP locked",
    body: "Liquidity locked through Unicrypt — no rug pull mechanism is possible.",
    proofLabel: "Verify lock",
    proofHref:
      "https://app.unicrypt.network/amm/pancake-v2/pair/0x4f31Fa980a675570939B737Ebdde0471a4Be40Eb",
  },
  {
    icon: CheckCircle2,
    title: "Ownership renounced",
    body: "Contract ownership permanently destroyed on-chain. Nobody can change the code.",
    proofLabel: "View transaction",
    proofHref:
      "https://bscscan.com/tx/0x848bc42ca79e20a2f0039407b5d077b8d89efcfd414e88a16f1161263746056e",
  },
  {
    icon: EyeOff,
    title: "Source verified",
    body: "Source code published and verified on BscScan. Read every line.",
    proofLabel: "Read code",
    proofHref:
      "https://bscscan.com/address/0xc90e5785632daab9cb61f5050da393090541a76d#code",
  },
  {
    icon: Award,
    title: "$100K bounty",
    body: "Find centralization in the contract, claim the prize. Open to anyone, no NDA.",
    proofLabel: "See terms",
    proofHref: "/promotions",
  },
];

export function SecurityPillarsSection() {
  return (
    <section className="py-16 md:py-24">
      <Container width="default">
        <div className="text-center mb-10 md:mb-14">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-brand-cyan)] mb-3 inline-block"
          >
            Trustless by Design
          </Heading>
          <Heading tier="h1">Five reasons to trust nobody.</Heading>
          <p className="mt-4 text-[var(--c-text-muted)] max-w-xl mx-auto">
            We removed every way we could harm you. What remains is code,
            published, locked, and verified by people who don&rsquo;t work
            for us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {PILLARS.map(pillar => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.title} elevation="raised" padding="lg">
                <div className="w-11 h-11 rounded-[var(--r-lg)] bg-brand flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <Heading tier="title" as="h3" className="mb-2">
                  {pillar.title}
                </Heading>
                <p className="text-sm text-[var(--c-text-muted)] leading-relaxed mb-4">
                  {pillar.body}
                </p>
                <a
                  href={pillar.proofHref}
                  target={pillar.proofHref.startsWith("http") ? "_blank" : undefined}
                  rel={
                    pillar.proofHref.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="text-sm font-bold text-[var(--c-brand-cyan)] hover:underline"
                >
                  {pillar.proofLabel} →
                </a>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <a
            href="/security"
            className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:bg-[var(--c-bg)] hover:shadow-[var(--s-md)] transition active:scale-[0.985]"
          >
            See the full security breakdown →
          </a>
        </div>
      </Container>
    </section>
  );
}

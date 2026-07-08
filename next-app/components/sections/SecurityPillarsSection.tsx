// "Trustless by Design" — fully i18n via next-intl getTranslations.
import { ShieldCheck, Lock, CheckCircle2, EyeOff, Award } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { Card } from "@components/ui/Card";
import { Reveal } from "@components/Reveal";
import { SECURITY } from "@lib/constants";

export async function SecurityPillarsSection() {
  const t = await getTranslations("security");

  const PILLARS = [
    { icon: ShieldCheck, title: t("pillar1Title"), body: t("pillar1Body"), proofLabel: t("pillar1Proof"), proofHref: SECURITY.auditUrl },
    { icon: Lock,        title: t("pillar2Title"), body: t("pillar2Body"), proofLabel: t("pillar2Proof"), proofHref: "https://bscscan.com/address/0x4f31Fa980a675570939B737Ebdde0471a4Be40Eb#tokentxns" },
    { icon: CheckCircle2,title: t("pillar3Title"), body: t("pillar3Body"), proofLabel: t("pillar3Proof"), proofHref: "https://bscscan.com/tx/0x848bc42ca79e20a2f0039407b5d077b8d89efcfd414e88a16f1161263746056e" },
    { icon: EyeOff,      title: t("pillar4Title"), body: t("pillar4Body"), proofLabel: t("pillar4Proof"), proofHref: "https://bscscan.com/address/0xc90e5785632daab9cb61f5050da393090541a76d#code" },
    { icon: Award,       title: t("pillar5Title"), body: t("pillar5Body"), proofLabel: t("pillar5Proof"), proofHref: "/promotions" },
  ];

  return (
    <section className="py-16 md:py-24">
      <Container width="default">
        <div className="text-center mb-10 md:mb-14">
          <Heading tier="eyebrow" className="text-[var(--c-brand-cyan)] mb-3 inline-block">
            {t("eyebrow")}
          </Heading>
          <Heading tier="h1" as="h2">{t("title")}</Heading>
          <p className="mt-4 text-[var(--c-text-muted)] max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Reveal key={pillar.title} delayMs={idx * 80}>
                <Card elevation="raised" padding="lg" interactive className="h-full">
                  <div className="w-11 h-11 rounded-[var(--r-lg)] bg-brand flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <Heading tier="title" as="h3" className="mb-2">{pillar.title}</Heading>
                  <p className="text-sm text-[var(--c-text-muted)] leading-relaxed mb-4">{pillar.body}</p>
                  <a
                    href={pillar.proofHref}
                    target={pillar.proofHref.startsWith("http") ? "_blank" : undefined}
                    rel={pillar.proofHref.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm font-bold text-[var(--c-brand-cyan)] hover:underline"
                  >
                    {pillar.proofLabel} →
                  </a>
                </Card>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <a
            href="/security"
            className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:bg-[var(--c-bg)] hover:shadow-[var(--s-md)] transition active:scale-[0.985]"
          >
            {t("fullBreakdown")} →
          </a>
        </div>
      </Container>
    </section>
  );
}

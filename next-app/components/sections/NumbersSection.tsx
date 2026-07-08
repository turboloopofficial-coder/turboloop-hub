// "By the Numbers" section — fully i18n via next-intl getTranslations.
import { getTranslations } from "next-intl/server";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { Card } from "@components/ui/Card";
import { CountUp } from "@components/ui/CountUp";
import { Reveal } from "@components/Reveal";

export async function NumbersSection() {
  const t = await getTranslations("numbers");

  const STATS = [
    { target: 48, prefix: "", suffix: "",  label: t("stat1Label"), help: t("stat1Help") },
    { target: 20, prefix: "", suffix: "",  label: t("stat2Label"), help: t("stat2Help") },
    { target: 6,  prefix: "", suffix: "+", label: t("stat3Label"), help: t("stat3Help") },
    { target: 100, prefix: "$", suffix: "K", label: t("stat4Label"), help: t("stat4Help") },
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {STATS.map((stat, idx) => (
            <Reveal key={stat.label} delayMs={idx * 100}>
              <Card elevation="raised" padding="md" className="text-center h-full">
                <div className="bg-brand bg-clip-text text-transparent text-4xl md:text-5xl font-extrabold tracking-tight leading-none tabular-nums">
                  <CountUp target={stat.target} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <div className="mt-2 text-sm font-bold text-[var(--c-text)]">{stat.label}</div>
                <div className="mt-1 text-xs text-[var(--c-text-muted)] leading-snug">{stat.help}</div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

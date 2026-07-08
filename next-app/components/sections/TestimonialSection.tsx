// TestimonialSection — single curated testimonial, fully i18n via next-intl.
import { getTranslations } from "next-intl/server";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { Card } from "@components/ui/Card";

export async function TestimonialSection() {
  const t = await getTranslations("testimonial");

  return (
    <section className="py-16 md:py-24">
      <Container width="default">
        <div className="text-center mb-8 md:mb-10">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-brand-cyan)] mb-3 inline-block"
          >
            {t("eyebrow")}
          </Heading>
          <Heading tier="h1" as="h2">{t("title")}</Heading>
        </div>

        <Card
          elevation="prominent"
          padding="lg"
          className="max-w-2xl mx-auto text-center relative overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="absolute -top-4 -left-2 text-[7rem] leading-none font-serif select-none pointer-events-none opacity-[0.04]"
          >
            &ldquo;
          </div>

          <blockquote className="text-lg md:text-xl text-[var(--c-text)] leading-relaxed mb-6 relative z-10">
            {t("quote")}
          </blockquote>

          <div className="text-sm font-bold text-[var(--c-text)]">
            {t("author")}
          </div>
          <div className="text-xs text-[var(--c-text-muted)] mt-1">
            {t("role")} · {t("country")}
          </div>

          <div className="mt-6 pt-5 border-t border-[var(--c-border)]">
            <a
              href="/community"
              className="text-sm font-bold text-[var(--c-brand-cyan)] hover:underline"
            >
              {t("readMore")} →
            </a>
          </div>
        </Card>
      </Container>
    </section>
  );
}

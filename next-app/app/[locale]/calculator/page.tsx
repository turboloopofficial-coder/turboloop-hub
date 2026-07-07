// Locale calculator page — redirects to the root calculator with locale context
// Full translation coming in next iteration
import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@lib/i18n/routing";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateStaticParams() {
  return routing.locales.filter((l) => l !== "en").map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta.calculator" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `https://www.turboloop.tech/${locale}/calculator`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [
          l,
          l === "en"
            ? "https://www.turboloop.tech/calculator"
            : `https://www.turboloop.tech/${l}/calculator`,
        ])
      ),
    },
  };
}

export default async function LocaleCalculatorPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) redirect("/calculator");
  // For now, show the same calculator — full translation in next phase
  const { default: CalculatorPage } = await import("../../calculator/page");
  return <CalculatorPage />;
}

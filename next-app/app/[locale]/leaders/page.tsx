import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@lib/i18n/routing";
import type { Metadata } from "next";
type Props = { params: Promise<{ locale: string }> };
export async function generateStaticParams() {
  return routing.locales.filter((l) => l !== "en").map((locale) => ({ locale }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return {
    title: "Hall of Fame — Ranked Leaders | TurboLoop",
    description: "Meet the TurboLoop community's top-ranked leaders. Real people, real results.",
    alternates: {
      canonical: locale === "en"
        ? "https://www.turboloop.tech/leaders"
        : `https://www.turboloop.tech/${locale}/leaders`,
    },
  };
}
export default async function LocaleLeadersPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) redirect("/leaders");
  const { default: Page } = await import("../../leaders/page");
  return <Page />;
}

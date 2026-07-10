import { hasLocale } from "next-intl";
import { redirect } from "next/navigation";
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
  const t = await getTranslations({ locale, namespace: "meta.token" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: locale === "en"
        ? "https://www.turboloop.tech/token"
        : `https://www.turboloop.tech/${locale}/token`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, l === "en" ? "https://www.turboloop.tech/token" : `https://www.turboloop.tech/${l}/token`])
      ),
    },
  };
}

export default async function LocaleTokenPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) redirect("/token");
  const { default: TokenPage } = await import("../../token/page");
  // Pass the locale as the lang searchParam so the token page renders in the right language
  return <TokenPage searchParams={Promise.resolve({ lang: locale })} />;
}

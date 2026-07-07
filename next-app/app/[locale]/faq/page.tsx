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
  const t = await getTranslations({ locale, namespace: "meta.faq" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `https://www.turboloop.tech/${locale}/faq`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, l === "en" ? "https://www.turboloop.tech/faq" : `https://www.turboloop.tech/${l}/faq`])
      ),
    },
  };
}

export default async function LocaleFaqPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) redirect("/faq");
  const { default: FaqPage } = await import("../../faq/page");
  return <FaqPage />;
}

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
  const t = await getTranslations({ locale, namespace: "meta.apply" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: locale === "en"
        ? "https://www.turboloop.tech/apply"
        : `https://www.turboloop.tech/${locale}/apply`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, l === "en" ? "https://www.turboloop.tech/apply" : `https://www.turboloop.tech/${l}/apply`])
      ),
    },
  };
}

export default async function LocaleApplyPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) redirect("/apply");
  const { default: ApplyPage } = await import("../../apply/page");
  return <ApplyPage />;
}

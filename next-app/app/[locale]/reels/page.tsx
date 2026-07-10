import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@lib/i18n/routing";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateStaticParams() {
  return routing.locales.filter((l) => l !== "en").map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  try {
    const t = await getTranslations({ locale, namespace: "reels" });
    return {
      title: t.has("metaTitle") ? t("metaTitle") : undefined,
      description: t.has("metaDesc") ? t("metaDesc") : undefined,
      alternates: {
        canonical: `https://www.turboloop.tech/${locale}/reels`,
      },
    };
  } catch {
    return {};
  }
}

export default async function LocaleReelsPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) redirect("/reels");
  const { default: Page } = await import("../../reels/page");
  return <Page />;
}

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
    alternates: {
      canonical:
        locale === "en"
          ? "https://www.turboloop.tech/podcast"
          : `https://www.turboloop.tech/${locale}/podcast`,
    },
  };
}

export default async function LocalePodcastPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) redirect("/podcast");
  const { default: Page } = await import("../../podcast/page");
  return <Page />;
}

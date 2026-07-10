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
  const t = await getTranslations({ locale, namespace: "social-wall" });
  return {
    title: `${t("eyebrow")} — TurboLoop`,
    description: t("subtitle"),
    alternates: {
      canonical: locale === "en"
        ? "https://www.turboloop.tech/social-wall"
        : `https://www.turboloop.tech/${locale}/social-wall`,
    },
  };
}

export default async function LocaleSocialWallPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) redirect("/social-wall");
  const { default: SocialWallPage } = await import("../../social-wall/page");
  return <SocialWallPage />;
}

#!/bin/bash
# Creates [locale]/PAGE/page.tsx wrapper files for all non-homepage pages

LOCALE_DIR="/home/ubuntu/turboloop-repo/next-app/app/[locale]"
PAGES=(ecosystem community films security roadmap library events careers promotions reels learn creatives blog)

for page in "${PAGES[@]}"; do
  mkdir -p "$LOCALE_DIR/$page"
  
  # Determine namespace (use page name as-is)
  ns="$page"
  
  cat > "$LOCALE_DIR/$page/page.tsx" << HEREDOC
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
    const t = await getTranslations({ locale, namespace: "${ns}" });
    return {
      title: t.has("metaTitle") ? t("metaTitle") : undefined,
      description: t.has("metaDesc") ? t("metaDesc") : undefined,
      alternates: {
        canonical: \`https://www.turboloop.tech/\${locale}/${page}\`,
      },
    };
  } catch {
    return {};
  }
}

export default async function Locale${page^}Page({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) redirect("/${page}");
  const { default: Page } = await import("../../${page}/page");
  return <Page locale={locale} />;
}
HEREDOC
  echo "Created [locale]/$page/page.tsx"
done

echo "All locale wrapper pages created!"

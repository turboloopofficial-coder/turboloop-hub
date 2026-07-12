// [locale] layout — wraps locale-specific pages with next-intl provider.
// This layout is used for the 5 key pages: /, /calculator, /faq, /apply, /token
// in non-English locales (th, ko, lo, hi, de, id, ta).
//
// English stays at the root app/layout.tsx (no prefix).
// Other locales get /th/, /ko/, /lo/ etc. via next-intl routing.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing, LOCALE_LABELS, type Locale } from "@lib/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  // Generate pages for all non-English locales
  return routing.locales
    .filter((l) => l !== "en")
    .map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "meta.home" });
  const localeInfo = LOCALE_LABELS[locale as Locale];

  // Build hreflang alternates for all locales
  const languages: Record<string, string> = { "x-default": "https://www.turboloop.tech/" };
  for (const l of routing.locales) {
    const hreflang = l === "en" ? "en" : l;
    const url = l === "en"
      ? "https://www.turboloop.tech/"
      : `https://www.turboloop.tech/${l}/`;
    languages[hreflang] = url;
  }

  return {
    metadataBase: new URL("https://www.turboloop.tech"),
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: locale === "en"
        ? "https://www.turboloop.tech/"
        : `https://www.turboloop.tech/${locale}/`,
      languages,
    },
    openGraph: {
      type: "website",
      siteName: "Turbo Loop",
      locale: locale,
      alternateLocale: routing.locales.filter((l) => l !== locale),
      url: locale === "en"
        ? "https://www.turboloop.tech/"
        : \`https://www.turboloop.tech/\${locale}/\`,
      title: t("title"),
      description: t("description"),
      images: [
        {
          url: "https://www.turboloop.tech/api/og-banner?type=launch",
          width: 1200,
          height: 630,
          alt: "TurboLoop — sustainable DeFi yield on Binance Smart Chain.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@TurboLoop_io",
      creator: "@TurboLoop_io",
      title: t("title"),
      description: t("description"),
      images: ["https://www.turboloop.tech/api/og-banner?type=launch"],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Providing all messages to the client side
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

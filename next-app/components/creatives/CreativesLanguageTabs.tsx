// Language filter tabs for /creatives. Sits ABOVE the category nav and
// is driven by the `?lang=` query param — server-rendered Link tags, no
// client JS. Same shape as components/blog/BlogLanguageTabs but with
// the 6 banner languages (en/hi/id/fr/ar/es) instead of the 3 blog
// languages.
//
// "All" link clears the param; each language link sets it. The active
// tab gets the brand-gradient pill treatment + count chip; inactive
// tabs are surface-tinted with a thin border.

import Link from "next/link";
import { BANNER_LANGUAGES, type BannerLanguage } from "@lib/creativesData";

interface CreativesLanguageTabsProps {
  active: BannerLanguage | null;
  counts?: Partial<Record<BannerLanguage, number>>;
  total?: number;
}

export function CreativesLanguageTabs({
  active,
  counts = {},
  total,
}: CreativesLanguageTabsProps) {
  const tabs: Array<{
    code: BannerLanguage | null;
    label: string;
    flag: string;
    count: number | undefined;
  }> = [
    { code: null, label: "All", flag: "✨", count: total },
    ...BANNER_LANGUAGES.map(l => ({
      code: l.code,
      label: l.label,
      flag: l.flag,
      count: counts[l.code],
    })),
  ];

  return (
    <nav
      aria-label="Filter banners by language"
      className="flex flex-wrap gap-2 justify-center mb-8 md:mb-10 px-[var(--gutter)]"
    >
      {tabs.map(tab => {
        const isActive = active === tab.code;
        const href =
          tab.code === null ? "/creatives" : `/creatives?lang=${tab.code}`;
        return (
          <Link
            key={tab.code ?? "all"}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex items-center gap-2 px-4 h-10 rounded-full text-sm font-bold transition active:scale-[0.985] ${
              isActive
                ? "bg-brand text-white shadow-[var(--s-brand)]"
                : "bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] hover:border-[var(--c-brand-cyan)]"
            }`}
          >
            <span className="text-base leading-none" aria-hidden="true">
              {tab.flag}
            </span>
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={`text-[0.6875rem] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${
                  isActive
                    ? "bg-white/22 text-white"
                    : "bg-[var(--c-bg)] text-[var(--c-text-muted)]"
                }`}
              >
                {tab.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

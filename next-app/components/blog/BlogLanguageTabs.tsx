// Language filter tabs for /blog. Server component — no JS shipped.
// Active state is computed from the `?lang=` search param so each tab is
// just a server-rendered <Link> that keeps the URL in sync with what the
// user sees. Cheaper than a client island + hooks for a 3-tab control.

import Link from "next/link";
import { BLOG_LANGUAGES, type BlogLanguage } from "@lib/api";

interface BlogLanguageTabsProps {
  /** Currently-selected language code, or null for "All". */
  active: BlogLanguage | null;
  /** Per-language counts so the chip can show a number alongside the
   *  label ("English · 27"). Pass an empty object to suppress. */
  counts?: Partial<Record<BlogLanguage, number>>;
  /** Total across all languages — used by the "All" tab. */
  total?: number;
}

export function BlogLanguageTabs({
  active,
  counts = {},
  total,
}: BlogLanguageTabsProps) {
  const tabs: Array<{
    code: BlogLanguage | null;
    label: string;
    flag: string;
    count: number | undefined;
  }> = [
    { code: null, label: "All", flag: "🌐", count: total },
    ...BLOG_LANGUAGES.map(l => ({
      code: l.code,
      label: l.label,
      flag: l.flag,
      count: counts[l.code],
    })),
  ];

  return (
    <nav
      aria-label="Filter blog by language"
      className="flex flex-wrap gap-2 mb-8 md:mb-10 justify-center"
    >
      {tabs.map(tab => {
        const isActive = active === tab.code;
        const href = tab.code === null ? "/blog" : `/blog?lang=${tab.code}`;
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

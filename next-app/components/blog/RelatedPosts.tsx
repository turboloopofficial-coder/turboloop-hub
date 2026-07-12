// Related posts section shown at the bottom of each blog post.
// Uses keyword-based matching to recommend relevant internal pages.
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getRelatedKeywords, CATEGORY_RECOMMENDATIONS } from "@lib/internal-links";

type Props = {
  title: string;
  content: string;
};

export function RelatedPosts({ title, content }: Props) {
  const categories = getRelatedKeywords(title, content);

  // Collect unique recommendations from matched categories
  const seen = new Set<string>();
  const recommendations: { label: string; href: string }[] = [];

  for (const cat of categories) {
    const recs = CATEGORY_RECOMMENDATIONS[cat];
    if (!recs) continue;
    for (const rec of recs) {
      if (!seen.has(rec.href)) {
        seen.add(rec.href);
        recommendations.push(rec);
      }
      if (recommendations.length >= 4) break;
    }
    if (recommendations.length >= 4) break;
  }

  // Always show at least 2 fallback links if not enough matches
  if (recommendations.length < 2) {
    const fallbacks = [
      { label: "Earn Passive Income with BNB", href: "/earn/passive-income-with-bnb" },
      { label: "What is DeFi?", href: "/learn/what-is-defi" },
      { label: "Best DeFi Yield 2026", href: "/earn/best-defi-yield-2026" },
    ];
    for (const fb of fallbacks) {
      if (!seen.has(fb.href)) {
        recommendations.push(fb);
        seen.add(fb.href);
      }
      if (recommendations.length >= 3) break;
    }
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-[var(--c-border)]">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-bold tracking-wide uppercase text-[var(--c-text-subtle)]">
          Continue Reading
        </h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {recommendations.map((rec) => (
          <Link
            key={rec.href}
            href={rec.href}
            className="group flex items-center gap-2 p-3 rounded-xl border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/[0.03] transition-all"
          >
            <span className="text-sm text-[var(--c-text-muted)] group-hover:text-emerald-400 transition-colors flex-1">
              {rec.label}
            </span>
            <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </section>
  );
}

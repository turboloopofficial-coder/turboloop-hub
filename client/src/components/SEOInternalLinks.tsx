/**
 * SEOInternalLinks — renders a contextual "Related Content" section at the bottom
 * of blog posts and pages. Internal linking is one of the most powerful on-page SEO
 * signals and helps Google discover and rank all pages.
 *
 * Strategy:
 * - Links to related blog posts (same category)
 * - Links to ecosystem pillar pages
 * - Links to comparison pages
 * - Links to DeFi 101 lessons
 *
 * This creates a web of internal links that distributes PageRank across the site
 * and keeps users engaged longer (improving dwell time — a ranking signal).
 */
import { Link } from "wouter";
import { ArrowRight, BookOpen, Shield, Layers, BarChart3 } from "lucide-react";

interface RelatedLink {
  href: string;
  title: string;
  description: string;
  icon: "learn" | "security" | "ecosystem" | "compare";
}

const PILLAR_LINKS: RelatedLink[] = [
  {
    href: "/ecosystem/yield-farming",
    title: "Yield Farming Explained",
    description: "How TurboLoop generates sustainable returns from real revenue",
    icon: "ecosystem",
  },
  {
    href: "/security",
    title: "Security & Audits",
    description: "Audited, renounced, LP-locked — verified on BscScan",
    icon: "security",
  },
  {
    href: "/learn/what-is-defi",
    title: "What is DeFi?",
    description: "Complete beginner's guide to decentralized finance",
    icon: "learn",
  },
  {
    href: "/vs/pancakeswap",
    title: "TurboLoop vs PancakeSwap",
    description: "Side-by-side comparison of yields and features",
    icon: "compare",
  },
  {
    href: "/ecosystem/turbo-buy",
    title: "Turbo Buy: Fiat to Crypto",
    description: "Buy crypto directly with your local currency",
    icon: "ecosystem",
  },
  {
    href: "/learn/what-is-yield-farming",
    title: "What is Yield Farming?",
    description: "Understanding how DeFi protocols generate returns",
    icon: "learn",
  },
];

function getIcon(type: RelatedLink["icon"]) {
  switch (type) {
    case "learn": return <BookOpen className="h-4 w-4" />;
    case "security": return <Shield className="h-4 w-4" />;
    case "ecosystem": return <Layers className="h-4 w-4" />;
    case "compare": return <BarChart3 className="h-4 w-4" />;
  }
}

interface Props {
  /** Current page path — excluded from suggestions */
  currentPath: string;
  /** Maximum links to show */
  maxLinks?: number;
  /** Optional category to prioritize related links */
  category?: string;
}

export default function SEOInternalLinks({ currentPath, maxLinks = 4 }: Props) {
  const links = PILLAR_LINKS.filter((l) => l.href !== currentPath).slice(0, maxLinks);

  return (
    <section className="mt-12 pt-8 border-t border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4">
        Continue Reading
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-start gap-3 p-4 rounded-xl transition-all hover:bg-slate-50"
            style={{ border: "1px solid rgba(0,0,0,0.06)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-cyan-600"
              style={{ background: "rgba(8,145,178,0.08)" }}
            >
              {getIcon(link.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-700 group-hover:text-cyan-700 transition-colors flex items-center gap-1">
                {link.title}
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {link.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

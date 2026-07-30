/**
 * SEOBreadcrumbs — renders breadcrumb navigation with JSON-LD structured data.
 *
 * Why: Breadcrumbs appear in Google search results as rich snippets, improving CTR.
 * They also provide clear site hierarchy signals to crawlers.
 *
 * Example in SERP:
 * turboloop.tech > Ecosystem > Yield Farming
 */
import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { useEffect } from "react";

interface Crumb {
  label: string;
  href: string;
}

interface Props {
  crumbs: Crumb[];
}

export default function SEOBreadcrumbs({ crumbs }: Props) {
  // Inject BreadcrumbList JSON-LD
  useEffect(() => {
    const JSONLD_ID = "seo-breadcrumbs-jsonld";
    const existing = document.getElementById(JSONLD_ID);
    if (existing) existing.remove();

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://turboloop.tech/",
        },
        ...crumbs.map((crumb, i) => ({
          "@type": "ListItem",
          position: i + 2,
          name: crumb.label,
          item: `https://turboloop.tech${crumb.href}`,
        })),
      ],
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = JSONLD_ID;
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      document.getElementById(JSONLD_ID)?.remove();
    };
  }, [crumbs]);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 flex-wrap"
    >
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-cyan-600 transition-colors"
      >
        <Home className="h-3 w-3" />
        <span>Home</span>
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3 text-slate-300" />
          {i === crumbs.length - 1 ? (
            <span className="text-slate-700 font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-cyan-600 transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

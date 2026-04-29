import { useEffect } from "react";

type Props = {
  title: string;
  description: string;
  /** Path relative to site root, e.g. "/blog/my-post" */
  path: string;
  /** OG type: "website" | "article" | "video.other" */
  type?: "website" | "article" | "video.other";
  /** Optional OG image URL (full URL). Falls back to logo. */
  image?: string;
  /** ISO date for articles */
  publishedTime?: string;
  /** Author name for articles */
  author?: string;
  /** Optional JSON-LD structured data object — will be stringified and injected */
  jsonLd?: Record<string, any>;
};

const SITE_ORIGIN = "https://turboloop.tech";
// Default OG card for any page that doesn't specify its own image — points at the
// dynamic launch banner Edge function so previews on Telegram/X/LinkedIn/WhatsApp
// look like a real product launch instead of a logo on white.
const DEFAULT_IMAGE = "https://turboloop.tech/api/og-banner?type=launch";

/**
 * Updates document.title and meta tags on route changes.
 * Also injects JSON-LD structured data for rich Google results.
 *
 * Safe for CSR: uses DOM mutations directly, cleans up on unmount.
 */
export default function SEOHead({
  title,
  description,
  path,
  type = "website",
  image = DEFAULT_IMAGE,
  publishedTime,
  author,
  jsonLd,
}: Props) {
  useEffect(() => {
    const canonicalUrl = `${SITE_ORIGIN}${path.startsWith("/") ? path : "/" + path}`;

    // Title
    document.title = title;

    // Build the meta map
    const metas: Array<{ sel: string; attr: "name" | "property"; key: string; content: string }> = [
      { sel: "meta[name='description']", attr: "name", key: "description", content: description },
      { sel: "meta[name='title']", attr: "name", key: "title", content: title },
      { sel: "meta[property='og:title']", attr: "property", key: "og:title", content: title },
      { sel: "meta[property='og:description']", attr: "property", key: "og:description", content: description },
      { sel: "meta[property='og:url']", attr: "property", key: "og:url", content: canonicalUrl },
      { sel: "meta[property='og:image']", attr: "property", key: "og:image", content: image },
      { sel: "meta[property='og:image:width']", attr: "property", key: "og:image:width", content: "1200" },
      { sel: "meta[property='og:image:height']", attr: "property", key: "og:image:height", content: "630" },
      { sel: "meta[property='og:type']", attr: "property", key: "og:type", content: type },
      { sel: "meta[property='og:site_name']", attr: "property", key: "og:site_name", content: "Turbo Loop" },
      { sel: "meta[name='twitter:card']", attr: "name", key: "twitter:card", content: "summary_large_image" },
      { sel: "meta[name='twitter:title']", attr: "name", key: "twitter:title", content: title },
      { sel: "meta[name='twitter:description']", attr: "name", key: "twitter:description", content: description },
      { sel: "meta[name='twitter:image']", attr: "name", key: "twitter:image", content: image },
      { sel: "meta[name='twitter:url']", attr: "name", key: "twitter:url", content: canonicalUrl },
      { sel: "meta[name='twitter:site']", attr: "name", key: "twitter:site", content: "@TurboLoop_io" },
    ];
    if (publishedTime) {
      metas.push({ sel: "meta[property='article:published_time']", attr: "property", key: "article:published_time", content: publishedTime });
    }
    if (author) {
      metas.push({ sel: "meta[property='article:author']", attr: "property", key: "article:author", content: author });
    }

    for (const m of metas) {
      let el = document.querySelector<HTMLMetaElement>(m.sel);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(m.attr, m.key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", m.content);
    }

    // Canonical
    let canonical = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    // JSON-LD (remove previous then inject new)
    const JSONLD_ID = "seo-head-jsonld";
    const existing = document.getElementById(JSONLD_ID);
    if (existing) existing.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = JSONLD_ID;
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      // On unmount, remove only JSON-LD (leave other tags — they'll get overwritten by next page)
      document.getElementById(JSONLD_ID)?.remove();
    };
  }, [title, description, path, type, image, publishedTime, author, jsonLd]);

  return null;
}

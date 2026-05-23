// Structured-data helpers — small server components that render
// <script type="application/ld+json"> tags inline.
//
// NOTE: Organization, WebSite (SiteLinksSearchBox SearchAction), and
// SiteNavigationElement schemas live in app/layout.tsx as a single
// `@graph` block — they're global and only need to render once per
// page. This file holds the per-route schemas that vary by content:
//
//   - <VideoObjectJsonLd /> — VideoObject for one film / reel detail
//     page. Unlocks the "video" rich-result format in Google Video
//     Search.
//
// BreadcrumbList JSON-LD is emitted directly by the existing
// `<Breadcrumbs />` component in components/Breadcrumbs.tsx, so this
// file doesn't re-implement it.

const HOST = "https://www.turboloop.tech";

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export interface VideoObjectProps {
  /** Public-facing title — appears in Google Video search results. */
  name: string;
  /** Short summary or tagline. Up to ~200 chars works best. */
  description: string;
  /** Absolute thumbnail URL. Required by Google. */
  thumbnailUrl: string;
  /** ISO-8601 timestamp when this video was first published. */
  uploadDate: string;
  /** Optional direct mp4 URL. At least ONE of contentUrl / embedUrl
   *  is required for Google's video rich-result eligibility. */
  contentUrl?: string;
  /** Optional embed URL (e.g. YouTube nocookie). */
  embedUrl?: string;
  /** ISO-8601 duration ("PT1M30S" = 1 min 30 sec). Absent is treated
   *  as missing by Google's Rich Results Test — not an error, just
   *  a warning. */
  duration?: string;
}

/** VideoObject schema for one film/reel detail page. Unlocks the
 *  "video" rich-result format in Google Video Search. At minimum
 *  `name`, `description`, `thumbnailUrl`, and `uploadDate` are
 *  required, plus ONE of contentUrl / embedUrl. */
export function VideoObjectJsonLd(props: VideoObjectProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: props.name,
    description: props.description,
    thumbnailUrl: props.thumbnailUrl,
    uploadDate: props.uploadDate,
    // Reference the global Organization node (defined in layout.tsx
    // SITE_JSON_LD) instead of duplicating the publisher block here.
    // Search engines resolve the @id at crawl time.
    publisher: { "@id": `${HOST}/#organization` },
  };
  if (props.contentUrl) data.contentUrl = props.contentUrl;
  if (props.embedUrl) data.embedUrl = props.embedUrl;
  if (props.duration) data.duration = props.duration;
  return <JsonLd data={data} />;
}

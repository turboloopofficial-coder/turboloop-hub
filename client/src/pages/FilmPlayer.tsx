// /films/:slug — auto-opens the FilmsPage with a specific film's lightbox.
// SEO-friendly: each film URL has its own metadata for social previews.

import { useRoute } from "wouter";
import FilmsPage from "./FilmsPage";
import { getFilm } from "@/lib/cinematicUniverse";
import SEOHead from "@/components/SEOHead";

export default function FilmPlayer() {
  const [, params] = useRoute("/films/:slug");
  const slug = params?.slug || "";
  const film = getFilm(slug);

  if (!film) return <FilmsPage />;

  return (
    <>
      {/* Per-film OG tags so Telegram/X/LinkedIn show the right preview */}
      <SEOHead
        title={`${film.title} — TurboLoop Cinematic Universe`}
        description={film.description}
        path={`/films/${film.slug}`}
        type="video.other"
        image={film.posterUrl}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: film.title,
          description: film.description,
          thumbnailUrl: film.posterUrl,
          contentUrl: film.url,
          uploadDate: "2026-04-29",
          url: `https://turboloop.tech/films/${film.slug}`,
          publisher: {
            "@type": "Organization",
            name: "Turbo Loop",
            url: "https://turboloop.tech",
          },
        }}
      />
      <FilmsPage autoOpenSlug={slug} />
    </>
  );
}

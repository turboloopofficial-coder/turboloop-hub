// /films/:slug — direct URL for a specific film. SEO-friendly: each film
// URL has its own metadata for social previews.
//
// Desktop: auto-opens the lightbox modal for the targeted film.
// Mobile: doesn't auto-open the lightbox (no user gesture context for
// fullscreen on route load). User taps the film card to enter fullscreen
// — standard FilmsPage mobile flow handles it.

import { useRoute } from "wouter";
import { useEffect } from "react";
import FilmsPage from "./FilmsPage";
import NotFound from "./NotFound";
import { getFilm } from "@/lib/cinematicUniverse";
import SEOHead from "@/components/SEOHead";
import { isMobileViewport } from "@/lib/videoFullscreen";

export default function FilmPlayer() {
  const [, params] = useRoute("/films/:slug");
  const slug = params?.slug || "";
  const film = getFilm(slug);

  // On mobile from a shared link, scroll the targeted film card into view
  // so the user can tap it. On desktop, the lightbox auto-opens via
  // autoOpenSlug so this isn't needed.
  useEffect(() => {
    if (!film || !isMobileViewport()) return;
    const t = setTimeout(() => {
      // Look for any element with data-film-slug matching ours; FilmsPage
      // adds this attribute to its episode cards
      const el = document.querySelector(`[data-film-slug="${film.slug}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
    return () => clearTimeout(t);
  }, [film]);

  if (!film) return <NotFound />;

  // Desktop: auto-open the lightbox. Mobile: don't auto-open (no gesture).
  const desktopAutoOpen = isMobileViewport() ? undefined : slug;

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
      <FilmsPage autoOpenSlug={desktopAutoOpen} />
    </>
  );
}

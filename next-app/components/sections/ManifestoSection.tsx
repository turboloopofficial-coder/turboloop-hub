// "The Manifesto" — emotional outro before the newsletter CTA. The
// final cinematic film of the universe (Season 4 Episode 5). Big poster
// + play overlay, links to /films/manifesto.

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { getFilm } from "@lib/cinematicUniverse";

export function ManifestoSection() {
  const film = getFilm("manifesto");
  if (!film) return null;

  return (
    <section className="py-12 md:py-20">
      <Container width="default">
        <div className="text-center mb-6 md:mb-8">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-brand-cyan)] mb-3 inline-block"
          >
            The Manifesto
          </Heading>
          <Heading tier="h1">Your money. Your power. Your future.</Heading>
        </div>

        <Link
          href={`/films/${film.slug}`}
          className="group relative block w-full rounded-[var(--r-2xl)] overflow-hidden shadow-[var(--s-xl)] hover:shadow-[var(--s-xl)] transition active:scale-[0.99]"
          style={{ aspectRatio: "16 / 9" }}
        >
          <Image
            src={film.posterUrl}
            alt={film.title}
            fill
            sizes="(max-width: 768px) 100vw, 1080px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
              style={{
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
              }}
            >
              <Play
                className="w-8 h-8 md:w-10 md:h-10 ml-1 fill-current"
                style={{ color: "var(--c-brand-purple)" }}
              />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-left text-white">
            <div className="text-xs md:text-sm font-bold tracking-wide opacity-95 mb-1">
              S4 · E5 — The Movement
            </div>
            <h3 className="text-xl md:text-3xl font-bold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              {film.title}
            </h3>
          </div>
        </Link>
      </Container>
    </section>
  );
}

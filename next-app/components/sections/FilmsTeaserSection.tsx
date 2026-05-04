// "What is TurboLoop?" — single film teaser with poster + play button.
// Tapping it goes to /films/what-is-turboloop on the new app (or to the
// existing turboloop.tech /films page until that's migrated).
//
// Pure presentation — no client JS. The poster image is served from R2
// via Next/Image with proper sizing for the Realme Narzo 50 viewport.

import Image from "next/image";
import { Play } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";

const POSTER_URL =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/films-posters/what-is-turboloop.jpg";

export function FilmsTeaserSection() {
  return (
    <section className="py-12 md:py-20">
      <Container width="default">
        <div className="text-center mb-6 md:mb-8">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-brand-cyan)] mb-3 inline-block"
          >
            Watch in 60 seconds
          </Heading>
          <Heading tier="h1">New here? Start with this.</Heading>
        </div>

        <a
          href="/films/what-is-turboloop"
          className="group relative block w-full rounded-[var(--r-2xl)] overflow-hidden shadow-[var(--s-lg)] hover:shadow-[var(--s-xl)] transition-shadow active:scale-[0.99]"
          style={{ aspectRatio: "16 / 9" }}
        >
          {/* Poster */}
          <Image
            src={POSTER_URL}
            alt="What is TurboLoop? — film poster"
            fill
            sizes="(max-width: 768px) 100vw, 1080px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          {/* Vignette + play overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
              style={{
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
              }}
            >
              <Play
                className="w-8 h-8 md:w-10 md:h-10 ml-1 fill-current"
                style={{ color: "var(--c-brand-cyan)" }}
              />
            </div>
          </div>
          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-left text-white">
            <div className="text-xs md:text-sm font-bold tracking-wide opacity-95 mb-1">
              S1 · E1 — The Problem
            </div>
            <h3 className="text-xl md:text-3xl font-bold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              What is TurboLoop?
            </h3>
          </div>
        </a>
      </Container>
    </section>
  );
}

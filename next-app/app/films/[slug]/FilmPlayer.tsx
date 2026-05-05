"use client";

// FilmPlayer — the only client component on the film detail page.
//
// Mobile: tap poster → native fullscreen via requestFullscreen +
// webkitEnterFullscreen fallback. URL bar disappears, video uses 100%
// of the screen, native scrub controls. Same premium pattern from the
// legacy SPA.
//
// Desktop: poster click swaps to inline <video controls>.
//
// Poster only — the <video> element isn't rendered until the user taps.
// Means the page doesn't pre-buffer 4-8 MB of video on every visit.

import { useState, useRef } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { Film } from "@lib/cinematicUniverse";

function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

function playInFullscreen(url: string, title?: string) {
  if (document.querySelector("video[data-tl-fs]")) return; // rapid-tap guard
  const v = document.createElement("video");
  v.setAttribute("data-tl-fs", "1");
  v.src = url;
  v.controls = true;
  v.autoplay = true;
  v.preload = "auto";
  v.playsInline = true;
  if (title) v.setAttribute("title", title);
  v.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;background:black;z-index:10000;opacity:0;pointer-events:none;";
  document.body.appendChild(v);

  const cleanup = () => {
    try {
      v.pause();
    } catch {}
    v.remove();
    document.removeEventListener("fullscreenchange", onFs);
    (document as any).removeEventListener?.("webkitfullscreenchange", onFs);
  };
  const onFs = () => {
    const fsEl =
      document.fullscreenElement || (document as any).webkitFullscreenElement;
    if (fsEl) {
      v.style.opacity = "1";
      v.style.pointerEvents = "auto";
    } else {
      cleanup();
    }
  };
  document.addEventListener("fullscreenchange", onFs);
  (document as any).addEventListener?.("webkitfullscreenchange", onFs);
  v.addEventListener("ended", cleanup);
  v.addEventListener("webkitendfullscreen" as any, cleanup);
  v.play().catch(() => {});

  const stdFs = (v as any).requestFullscreen;
  const wkFs = (v as any).webkitEnterFullscreen;
  if (typeof stdFs === "function") {
    stdFs.call(v, { navigationUI: "hide" }).catch(() => {
      if (typeof wkFs === "function") {
        v.addEventListener("loadedmetadata", () => wkFs.call(v), {
          once: true,
        });
      }
    });
  } else if (typeof wkFs === "function") {
    if (v.readyState >= 1) wkFs.call(v);
    else
      v.addEventListener("loadedmetadata", () => wkFs.call(v), { once: true });
  }
}

export function FilmPlayer({ film }: { film: Film }) {
  const [playingDesktop, setPlayingDesktop] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  const onPlay = () => {
    if (isMobileViewport()) {
      playInFullscreen(film.url, film.title);
    } else {
      setPlayingDesktop(true);
      // Wait for state to flush, then call play()
      setTimeout(() => ref.current?.play().catch(() => {}), 50);
    }
  };

  return (
    <div
      className="relative w-full rounded-[var(--r-2xl)] overflow-hidden bg-black shadow-[var(--s-xl)]"
      style={{ aspectRatio: "16 / 9" }}
    >
      {playingDesktop ? (
        <video
          ref={ref}
          src={film.url}
          poster={film.posterUrl}
          controls
          autoPlay
          className="absolute inset-0 w-full h-full object-contain bg-black"
        />
      ) : (
        <button
          onClick={onPlay}
          className="absolute inset-0 w-full h-full block group cursor-pointer"
          aria-label={`Play ${film.title}`}
        >
          <Image
            src={film.posterUrl}
            alt={`${film.title} — poster`}
            fill
            sizes="(max-width: 768px) 100vw, 1080px"
            className="object-cover transition-transform group-hover:scale-105 duration-700"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center shadow-[0_12px_30px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110 group-active:scale-95"
              style={{ background: "rgba(255,255,255,0.95)" }}
            >
              <Play
                className="w-8 h-8 md:w-12 md:h-12 ml-1 fill-current text-[var(--c-brand-cyan)]"
              />
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

"use client";

// ReelPlayer — vertical 9:16 video player with a "Watch Fullscreen" CTA
// for mobile (native fullscreen so the URL bar disappears).

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import type { Video } from "@lib/api";

function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

function playInFullscreen(url: string, title?: string) {
  if (document.querySelector("video[data-tl-fs]")) return;
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

export function ReelPlayer({
  reel,
  thumb,
}: {
  reel: Video;
  thumb: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().catch(() => {});
    });
  }, [muted]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const enterFullscreen = () => {
    if (!reel.directUrl) return;
    playInFullscreen(reel.directUrl, reel.title);
  };

  return (
    <>
      <div
        className="relative rounded-[var(--r-2xl)] overflow-hidden bg-black shadow-[var(--s-xl)]"
        style={{ aspectRatio: "9 / 16", maxHeight: "80dvh" }}
      >
        <video
          ref={videoRef}
          src={reel.directUrl!}
          poster={thumb}
          autoPlay
          playsInline
          loop
          muted={muted}
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="h-full w-full object-contain cursor-pointer"
        />
        {!playing && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30"
          >
            <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl">
              <Play className="w-8 h-8 text-slate-900 ml-1 fill-slate-900" />
            </div>
          </button>
        )}
        <button
          onClick={() => setMuted(m => !m)}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 flex items-center justify-center transition"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Mobile premium fullscreen CTA */}
      <button
        onClick={enterFullscreen}
        className="md:hidden mt-3 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[var(--r-lg)] text-sm font-bold transition active:scale-[0.98]"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
          color: "#0F172A",
          boxShadow: "0 8px 22px -6px rgba(0,0,0,0.4)",
        }}
        aria-label="Watch fullscreen"
      >
        <Play className="w-4 h-4 fill-current" />
        Watch Fullscreen
      </button>
    </>
  );
}

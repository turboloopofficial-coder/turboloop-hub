// Shared helper: launch a video in true native fullscreen on mobile.
//
// Used by:
//   - FilmsPage (tap a film card)
//   - CinematicEmbed (tap the embedded poster on Home, /community, /security)
//   - ReelPage (tap "Watch Fullscreen" button on /reels/:slug)
//   - FilmPlayer (/films/:slug direct URL — via banner tap)
//
// On Android Chrome: requestFullscreen() with navigationUI:"hide" — URL bar
// disappears entirely. On iOS Safari: webkitEnterFullscreen() on the <video>
// element opens the native iOS player overlay. Both are the OS-native cinema
// experience, same as YouTube / Netflix / Apple TV use on phones.
//
// CRITICAL: must be called synchronously from a click/tap handler. Browsers
// reject the fullscreen API without an active user gesture. This is why we
// don't auto-fullscreen on mount — there's no gesture context after a route
// transition, only after a user tap.

export function isMobileViewport(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches
  );
}

interface PlayOpts {
  url: string;
  title?: string;
}

export function playInFullscreen(opts: PlayOpts): void {
  const v = document.createElement("video");
  v.src = opts.url;
  v.controls = true;
  v.autoplay = true;
  v.preload = "auto";
  v.playsInline = true;
  if (opts.title) v.setAttribute("title", opts.title);
  v.style.position = "fixed";
  v.style.inset = "0";
  v.style.width = "100%";
  v.style.height = "100%";
  v.style.background = "black";
  v.style.zIndex = "10000";
  document.body.appendChild(v);

  const cleanup = () => {
    try {
      v.pause();
    } catch {}
    v.remove();
    document.removeEventListener("fullscreenchange", onFsChange);
    (document as any).removeEventListener?.(
      "webkitfullscreenchange",
      onFsChange
    );
  };
  const onFsChange = () => {
    const fsEl =
      document.fullscreenElement || (document as any).webkitFullscreenElement;
    if (!fsEl) cleanup();
  };
  document.addEventListener("fullscreenchange", onFsChange);
  (document as any).addEventListener?.("webkitfullscreenchange", onFsChange);
  v.addEventListener("ended", cleanup);
  v.addEventListener("webkitendfullscreen" as any, cleanup);

  v.play().catch(() => {});

  const tryStandardFs = (v as any).requestFullscreen;
  const tryWebkitFs = (v as any).webkitEnterFullscreen;

  if (typeof tryStandardFs === "function") {
    tryStandardFs.call(v, { navigationUI: "hide" }).catch(() => {
      if (typeof tryWebkitFs === "function") {
        v.addEventListener("loadedmetadata", () => tryWebkitFs.call(v), {
          once: true,
        });
      }
    });
  } else if (typeof tryWebkitFs === "function") {
    if (v.readyState >= 1) {
      tryWebkitFs.call(v);
    } else {
      v.addEventListener("loadedmetadata", () => tryWebkitFs.call(v), {
        once: true,
      });
    }
  } else {
    // No fullscreen API at all — let user tap to dismiss the inline overlay
    v.addEventListener("click", cleanup);
  }
}

// Shared helper: launch a video in true native fullscreen on mobile.
//
// Used by:
//   - FilmsPage (tap a film card)
//   - CinematicEmbed (tap the embedded poster on Home, /community, /security)
//   - ReelPage (tap "Watch Fullscreen" button on /reels/:slug)
//   - ReelsSection (tap a reel preview on Home)
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

const FS_MARKER = "data-turboloop-fs";

export function playInFullscreen(opts: PlayOpts): void {
  // Rapid-tap guard. If a previous fullscreen video is still mounted (user
  // double-tapped, or the previous one hasn't cleaned up yet), no-op.
  if (document.querySelector(`video[${FS_MARKER}]`)) return;

  const v = document.createElement("video");
  v.setAttribute(FS_MARKER, "1");
  v.src = opts.url;
  v.controls = true;
  v.autoplay = true;
  v.preload = "auto";
  v.playsInline = true;
  if (opts.title) v.setAttribute("title", opts.title);

  // Anchor the element off-screen until fullscreen kicks in. Without this,
  // there's a 200-500 ms flash of a giant inline video covering the page
  // before the URL bar collapses. Keeping it offscreen + invisible removes
  // the flash entirely — fullscreen API still works because the element is
  // in the DOM, it just isn't visible.
  v.style.position = "fixed";
  v.style.inset = "0";
  v.style.width = "100%";
  v.style.height = "100%";
  v.style.background = "black";
  v.style.zIndex = "10000";
  v.style.opacity = "0";
  v.style.pointerEvents = "none";
  document.body.appendChild(v);

  let inlineFallbackUI: HTMLElement | null = null;

  const cleanup = () => {
    try {
      v.pause();
    } catch {}
    v.remove();
    inlineFallbackUI?.remove();
    inlineFallbackUI = null;
    document.removeEventListener("fullscreenchange", onFsChange);
    (document as any).removeEventListener?.(
      "webkitfullscreenchange",
      onFsChange
    );
  };

  const reveal = () => {
    v.style.opacity = "1";
    v.style.pointerEvents = "auto";
  };

  const onFsChange = () => {
    const fsEl =
      document.fullscreenElement || (document as any).webkitFullscreenElement;
    if (fsEl) {
      // Now visible thanks to the OS fullscreen layer — flip our element's
      // opacity so when the user exits, they see the video momentarily
      // before cleanup fires (smoother than a flash-to-blank).
      reveal();
    } else {
      cleanup();
    }
  };

  document.addEventListener("fullscreenchange", onFsChange);
  (document as any).addEventListener?.("webkitfullscreenchange", onFsChange);
  v.addEventListener("ended", cleanup);
  v.addEventListener("webkitendfullscreen" as any, cleanup);

  v.play().catch(() => {});

  // Inline fallback when fullscreen is denied (iOS Low Power Mode, some
  // embedded webviews). Shows the video full-viewport with a clean close
  // button so the user can always exit.
  const showInlineFallback = () => {
    reveal();
    inlineFallbackUI = document.createElement("button");
    inlineFallbackUI.setAttribute("aria-label", "Close video");
    inlineFallbackUI.textContent = "✕";
    inlineFallbackUI.style.cssText = [
      "position:fixed",
      "top:max(env(safe-area-inset-top),16px)",
      "right:16px",
      "width:44px",
      "height:44px",
      "border-radius:999px",
      "border:none",
      "background:rgba(15,23,42,0.85)",
      "color:white",
      "font-size:22px",
      "font-weight:600",
      "cursor:pointer",
      "z-index:10001",
      "display:flex",
      "align-items:center",
      "justify-content:center",
    ].join(";");
    inlineFallbackUI.addEventListener("click", cleanup);
    document.body.appendChild(inlineFallbackUI);
  };

  const tryStandardFs = (v as any).requestFullscreen;
  const tryWebkitFs = (v as any).webkitEnterFullscreen;

  const attemptWebkit = () => {
    if (typeof tryWebkitFs !== "function") {
      showInlineFallback();
      return;
    }
    const fire = () => {
      try {
        tryWebkitFs.call(v);
      } catch {
        showInlineFallback();
      }
    };
    if (v.readyState >= 1) fire();
    else v.addEventListener("loadedmetadata", fire, { once: true });
  };

  if (typeof tryStandardFs === "function") {
    tryStandardFs.call(v, { navigationUI: "hide" }).catch(attemptWebkit);
  } else {
    attemptWebkit();
  }
}

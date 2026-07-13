"use client";

// DexScreenerChart — embeds the official DexScreener chart iframe for
// the $TURBO / USDT pair on BSC.
//
// Why iframe + not a custom chart: DexScreener gates their public REST
// endpoint behind Cloudflare and returns 403 to server-side calls from
// most edge providers. Their official embed URL is iframe-friendly,
// theme-aware, and works without an API key. We hide the info + trades
// panels (`info=0&trades=0`) because we already render price / supply /
// burn widgets elsewhere on the page — keeps the chart focused.
//
// Mobile fix: the iframe requires `allow-scripts allow-same-origin
// allow-popups` in the sandbox attribute to execute its JS and render
// the chart. Without these the chart stays blank (black box).
//
// Height: clamped between 380px (mobile) and 500px (desktop).

import { useState } from "react";

export function DexScreenerChart() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="relative w-full card-enhanced rounded-[var(--r-xl)] overflow-hidden border border-[var(--c-border)] shadow-[var(--s-md)]"
      style={{ height: "clamp(380px, 65vw, 500px)" }}
    >
      {/* Loading skeleton — shown until iframe fires onLoad */}
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--c-surface)] z-10">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--c-brand-cyan)] border-t-transparent animate-spin" />
          <span className="text-xs text-[var(--c-text-subtle)] font-medium">
            Loading chart…
          </span>
        </div>
      )}
      <iframe
        src="https://dexscreener.com/bsc/0x5bede66bb27184001960e769efab95304f0e1759?embed=1&theme=dark&info=0&trades=0"
        title="$TURBO / USDT price chart on DexScreener"
        className="w-full h-full border-0"
        loading="lazy"
        // Required for DexScreener chart JS to execute inside the iframe
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
        allow="clipboard-write; fullscreen"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

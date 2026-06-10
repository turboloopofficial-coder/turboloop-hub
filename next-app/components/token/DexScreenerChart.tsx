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
// Height: clamped between 360px (mobile) and 480px (desktop) so the
// chart stays usable across viewports without dominating the page.

export function DexScreenerChart() {
  return (
    <div
      className="w-full rounded-[var(--r-xl)] overflow-hidden border border-[var(--c-border)] shadow-[var(--s-sm)]"
      style={{ height: "clamp(360px, 60vw, 480px)" }}
    >
      <iframe
        src="https://dexscreener.com/bsc/0x5bede66bb27184001960e769efab95304f0e1759?embed=1&theme=dark&info=0&trades=0"
        title="$TURBO / USDT price chart on DexScreener"
        className="w-full h-full border-0"
        loading="lazy"
        allow="clipboard-write"
      />
    </div>
  );
}

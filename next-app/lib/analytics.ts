// Lightweight client-side analytics helper. Wraps gtag() for typed
// event tracking and silently no-ops when GA isn't configured (local
// dev, preview deploys without NEXT_PUBLIC_GA_MEASUREMENT_ID).
//
// Event taxonomy is centralized here so callers don't typo event
// names. Every event also flows into Vercel Web Analytics if that's
// available (separate, gracefully no-ops if not).

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    // Vercel Web Analytics injects window.va when @vercel/analytics is
    // loaded. We tolerate its absence — no GA-style required keys.
    va?: (event: "event", name: string, params?: Record<string, unknown>) => void;
  }
}

/** Token-domain events. Add new event names here (not inline at the
 *  call site) so the taxonomy stays grep-able. */
export type AnalyticsEvent =
  | "token_buy_clicked"
  | "token_sell_clicked"
  | "token_pancakeswap_clicked"
  | "token_dexscreener_clicked"
  | "token_manage_in_app_clicked"
  | "token_bscscan_clicked"
  | "calculator_token_rank_changed"
  | "calculator_token_deposit_changed";

export function trackEvent(
  name: AnalyticsEvent,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.gtag === "function") {
      // GA4's send_to defaults to all configured streams; we don't
      // need to specify one.
      window.gtag("event", name, params || {});
    }
  } catch {}
  try {
    if (typeof window.va === "function") {
      window.va("event", name, params || {});
    }
  } catch {}
}

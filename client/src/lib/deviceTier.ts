// Detects device performance tier on first render. Used to skip expensive
// animations + effects on low-end Android (mid-range MediaTek SoCs etc.)
// where blurred filter passes, particle canvases, and continuous JS
// animations make the page jank and the phone get warm.
//
// Tier signals (any ONE of these → low-end):
//   - prefers-reduced-motion (user preference, always honored)
//   - navigator.deviceMemory ≤ 4 GB (low RAM)
//   - navigator.hardwareConcurrency ≤ 4 cores
//   - Save-Data header set (data saver mode)
//   - effectiveType "slow-2g" / "2g" / "3g" via Network Information API
//
// We resolve the tier ONCE on initial load; reading these in render
// would re-trigger child effects unnecessarily.

export type DeviceTier = "low" | "high";

let cachedTier: DeviceTier | null = null;

export function getDeviceTier(): DeviceTier {
  if (cachedTier) return cachedTier;
  if (typeof window === "undefined") return "high";

  // 1. Reduced motion — user explicitly wants less animation
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return (cachedTier = "low");
  }

  const nav = navigator as any;

  // 2. Low RAM (Chrome/Edge/Brave only — Safari doesn't expose this)
  const memory = nav.deviceMemory as number | undefined;
  if (typeof memory === "number" && memory <= 4) {
    return (cachedTier = "low");
  }

  // 3. Low core count
  const cores = nav.hardwareConcurrency as number | undefined;
  if (typeof cores === "number" && cores <= 4) {
    return (cachedTier = "low");
  }

  // 4. User has Save-Data on, or is on slow connection
  const conn = nav.connection as
    | { saveData?: boolean; effectiveType?: string }
    | undefined;
  if (conn?.saveData) return (cachedTier = "low");
  if (
    conn?.effectiveType === "slow-2g" ||
    conn?.effectiveType === "2g" ||
    conn?.effectiveType === "3g"
  ) {
    return (cachedTier = "low");
  }

  return (cachedTier = "high");
}

/** React hook: returns the device tier (computed once, cached forever). */
export function useDeviceTier(): DeviceTier {
  return getDeviceTier();
}

export const isLowEndDevice = () => getDeviceTier() === "low";

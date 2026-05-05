// Subtle haptic feedback for key user actions on mobile. Falls through
// to no-op on desktop and on browsers that don't expose navigator.vibrate
// (e.g. iOS Safari at present). Keeps interactions feeling native on
// Android Chrome / Brave / Samsung Internet.

type HapticVariant = "tap" | "success" | "error" | "long";

const PATTERNS: Record<HapticVariant, number | number[]> = {
  tap: 12, //              single, very short — for button presses
  success: [10, 30, 25], // double pulse — submit success, copy success
  error: [50, 30, 50], //   longer / urgent — validation fail
  long: 60, //              hold confirmation
};

export function haptic(variant: HapticVariant = "tap") {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate !== "function") return;
  // matchMedia coverage is universal on browsers that expose vibrate.
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;
  try {
    navigator.vibrate(PATTERNS[variant]);
  } catch {}
}

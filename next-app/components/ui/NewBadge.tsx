// "NEW" badge component — used on film cards, reel cards, homepage
// carousel cards.
//
// Display logic (handled by the caller — pass `show` as the
// pre-computed boolean):
//   - pinned_new_until > now()  (manual override), OR
//   - created_at + 30 days > now()  (auto, default 30-day decay)
//
// The component is purely presentational. Determining whether to show
// it lives in lib/filmsApi.ts shouldShowNewBadge() so the same
// computation applies everywhere.
//
// Design:
//   - Pill shape, gradient background (brand cyan → purple)
//   - Subtle pulse animation that respects prefers-reduced-motion
//   - Tracking-wide uppercase text for premium feel
//
// Mobile-friendly: 44×44 isn't required (it's not interactive — purely
// indicative). Keeps it visually compact instead.

import { cn } from "@lib/cn";

interface NewBadgeProps {
  /** Pre-computed visibility. Pass shouldShowNewBadge(film) from
   *  the caller. When false, the component renders nothing. */
  show: boolean;
  /** Visual size variant. "sm" used on cards inside dense carousels,
   *  "md" used on hero/featured surfaces. */
  size?: "sm" | "md";
  /** Optional override className for positioning context (e.g.
   *  "absolute top-3 right-3"). */
  className?: string;
}

export function NewBadge({ show, size = "sm", className }: NewBadgeProps) {
  if (!show) return null;
  const base =
    "inline-flex items-center gap-1 rounded-full font-bold tracking-[0.18em] uppercase text-white shadow-[0_4px_12px_-2px_rgba(8,145,178,0.6)] motion-safe:animate-[new-pulse_2.4s_ease-in-out_infinite]";
  const sizeClass =
    size === "md"
      ? "px-2.5 py-1 text-[0.6875rem]"
      : "px-2 py-0.5 text-[0.625rem]";
  return (
    <span
      className={cn(base, sizeClass, className)}
      style={{
        background:
          "linear-gradient(135deg, #06B6D4 0%, #7C3AED 50%, #DB2777 100%)",
      }}
      aria-label="Recently added"
    >
      <span aria-hidden="true">✨</span>
      <span>NEW</span>
    </span>
  );
}

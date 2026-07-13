// Single source of truth for the four published Loop Plans on the live
// dApp. Used by the Protocol Bento (homepage), the standalone
// /calculator page, and any future surfaces that need to render the
// plan grid.
//
// Hoisted here from app/calculator/page.tsx so both the homepage Bento
// Section and the calculator can render the SAME canonical list — no
// drift between surfaces.
//
// `roi` is the FLAT percentage paid at the end of the plan period —
// it is NOT annualized and NOT compounded. Ultimate (60d, 54%) is the
// headline plan and the default selection where the UI needs one.

export interface LoopPlan {
  /** Stable URL-safe identifier — used by query params and analytics. */
  id: "sprint" | "boost" | "accelerate" | "power" | "ultimate";
  /** Display name as shown on the dApp. */
  label: string;
  /** Plan duration in days. */
  days: number;
  /** Flat ROI as a decimal (0.54 = 54 %). */
  roi: number;
  /** One-line blurb shown under the headline number on cards. */
  blurb: string;
  /** Whether this plan earns $TURBO token rewards in addition to the
   *  fixed yield. Sprint + Accelerate do not; Power + Ultimate do. */
  tokenEligible: boolean;
}

export const LOOP_PLANS: LoopPlan[] = [
  {
    id: "sprint",
    label: "Sprint",
    days: 7,
    roi: 0.03,
    blurb: "One-week trial — feel the mechanism.",
    tokenEligible: false,
  },
  {
    id: "boost",
    label: "Accelerate",
    days: 14,
    roi: 0.10,
    blurb: "Two-week ramp, double-digit return.",
    tokenEligible: false,
  },
  {
    id: "power",
    label: "Power",
    days: 30,
    roi: 0.24,
    blurb: "One-month commitment, serious yield.",
    tokenEligible: true,
  },
  {
    id: "ultimate",
    label: "Ultimate",
    days: 60,
    roi: 0.54,
    blurb: "Top tier — patient capital wins.",
    tokenEligible: true,
  },
];

/** Format a plan's ROI for display ("54%", "3%" — no trailing decimals). */
export function formatRoi(plan: LoopPlan): string {
  return `${Math.round(plan.roi * 100)}%`;
}

/** Lookup helper — returns the canonical Ultimate plan if id misses, so
 *  callers can default cleanly without a null check. */
export function getPlanOrDefault(id: string | null | undefined): LoopPlan {
  if (!id) return LOOP_PLANS[3];
  const hit = LOOP_PLANS.find((p) => p.id === id);
  return hit ?? LOOP_PLANS[3];
}

// Smart notification rule registry.
//
// Each rule describes ONE nudge: when to fire (trigger), what to say
// (icon + title + body), and what action it offers (CTA href + label).
// The SmartNotifications controller in components/notifications/
// evaluates these every time the router or page state changes.
//
// Rule IDs must be stable and unique — they're used as the dedup key in
// sessionStorage / localStorage. If you rename a rule's `id`, returning
// visitors will see it again because the old key is forgotten.

import type { ComponentType } from "react";
import {
  Calculator,
  BookOpen,
  Video,
  HelpCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface NotificationRule {
  /** Stable unique id — also the dedup key. */
  id: string;
  /** What surfaces in the card header. */
  icon: LucideIcon;
  /** Brand-cyan eyebrow above the title. */
  eyebrow: string;
  /** Main message — short, one line. */
  title: string;
  /** Optional supporting copy under the title. Keep to ~one sentence. */
  body?: string;
  /** Primary CTA. */
  cta: {
    label: string;
    /** Internal route OR external URL — controller picks renderer. */
    href: string;
    /** Whether to use target=_blank rel=noopener. */
    external?: boolean;
  };
  /** Trigger spec — see engine.ts for evaluation logic. */
  trigger: NotificationTrigger;
  /** Dedup window. "session" = sessionStorage, only this tab/session.
   *  "week" = localStorage 7-day TTL — dismiss sticks across sessions. */
  dedupScope: "session" | "week";
}

export type NotificationTrigger =
  | {
      kind: "time-on-route";
      /** Path prefix (e.g. "/calculator" matches /calculator and /calculator/*). */
      pathPrefix: string;
      /** Seconds to wait on this route before firing. */
      seconds: number;
    }
  | {
      kind: "scroll-depth";
      pathPrefix: string;
      /** 0–1, fraction of document scrolled. */
      fraction: number;
    }
  | {
      kind: "return-visit";
      /** Min visit number to fire (2 = "show on second visit or later"). */
      minVisits: number;
      /** Seconds to wait after page load before firing. */
      delaySeconds: number;
    }
  | {
      kind: "event";
      /** Custom event name dispatched via dispatchEvent on window. */
      eventName: string;
      /** Optional min count of this event before firing. */
      minCount?: number;
    };

/** Curated rule set. Order matters only for tie-breaking when two rules
 *  are eligible at the same instant — earlier wins. Five rules is
 *  intentionally small; more than that and users feel nagged. */
export const NOTIFICATION_RULES: NotificationRule[] = [
  {
    id: "calculator-idle-25s",
    icon: Calculator,
    eyebrow: "Quick math",
    title: "Want help picking a plan?",
    body: "Our team will walk you through the right loop for your goal — free, no pressure.",
    cta: { label: "Talk to the team", href: "/apply#apply" },
    trigger: { kind: "time-on-route", pathPrefix: "/calculator", seconds: 25 },
    dedupScope: "session",
  },
  {
    id: "blog-60pct-scroll",
    icon: BookOpen,
    eyebrow: "Worth reading?",
    title: "Get our weekly brief.",
    body: "One email each Friday — the best DeFi reads + protocol updates. No spam.",
    cta: { label: "Subscribe", href: "/feed#subscribe" },
    trigger: { kind: "scroll-depth", pathPrefix: "/blog/", fraction: 0.6 },
    dedupScope: "week",
  },
  {
    id: "reels-three-watched",
    icon: Video,
    eyebrow: "Liked these?",
    title: "Make one yourself.",
    body: "$5–$1,000 per approved video. We hand you the brief + assets.",
    cta: { label: "Become a creator", href: "/apply#creator" },
    trigger: { kind: "event", eventName: "tl:reel-played", minCount: 3 },
    dedupScope: "week",
  },
  {
    id: "apply-60s-stuck",
    icon: HelpCircle,
    eyebrow: "Stuck?",
    title: "DM us on Telegram.",
    body: "We reply within an hour during business days.",
    cta: {
      label: "Open Telegram",
      href: "https://t.me/TurboLoop_Chat",
      external: true,
    },
    trigger: { kind: "time-on-route", pathPrefix: "/apply", seconds: 60 },
    dedupScope: "session",
  },
  {
    id: "welcome-back",
    icon: Sparkles,
    eyebrow: "Welcome back",
    title: "Catch the latest.",
    body: "New posts, new reels, new events since you were last here.",
    cta: { label: "What's new", href: "/feed" },
    trigger: { kind: "return-visit", minVisits: 2, delaySeconds: 6 },
    dedupScope: "session",
  },
];

/** Re-export for the controller — keeps a single import path. */
export type SmartNotificationIcon = ComponentType<{ className?: string }>;

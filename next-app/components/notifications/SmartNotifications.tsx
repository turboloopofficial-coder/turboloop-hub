// Smart Notifications controller — evaluates the rule registry against
// user behavior and renders one NudgeCard at a time.
//
// Design constraints:
//   - Show AT MOST ONE nudge concurrently. If a higher-priority rule
//     fires while another is showing, we don't preempt — the first one
//     finishes (dismissed or actioned), then the next eligible rule can
//     show on its next opportunity.
//   - Dedup per `rule.dedupScope`: "session" lives in sessionStorage and
//     resets when the tab/window closes; "week" lives in localStorage
//     with a 7-day TTL so dismissal sticks across sessions.
//   - Returning-visitor detection uses a localStorage visit counter
//     bumped once per session.
//   - Custom events fire via window.dispatchEvent(new CustomEvent("tl:..."))
//     — any client code can trigger them (see reels gallery for the
//     "tl:reel-played" event).
//
// No service worker, no push API — pure in-page nudges. Respects the
// user's analytics consent only insofar as trackEvent() is a no-op when
// gtag isn't loaded; the nudges themselves still appear.

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  NOTIFICATION_RULES,
  type NotificationRule,
} from "@lib/notifications/rules";
import { NudgeCard } from "./NudgeCard";

const VISITS_KEY = "tl_visits";
const VISIT_SESSION_KEY = "tl_visit_counted";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function storageKey(rule: NotificationRule) {
  return `tl_nudge_${rule.id}`;
}

/** Returns true if this rule has been seen-and-handled within its
 *  dedup window — and therefore should NOT fire again. */
function isDeduped(rule: NotificationRule): boolean {
  try {
    if (rule.dedupScope === "session") {
      return sessionStorage.getItem(storageKey(rule)) === "1";
    }
    // week scope
    const raw = localStorage.getItem(storageKey(rule));
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < WEEK_MS;
  } catch {
    return false;
  }
}

function markDeduped(rule: NotificationRule) {
  try {
    if (rule.dedupScope === "session") {
      sessionStorage.setItem(storageKey(rule), "1");
    } else {
      localStorage.setItem(storageKey(rule), String(Date.now()));
    }
  } catch {
    // Storage blocked — accept that the user may see this nudge again
    // in this session. Better than crashing.
  }
}

/** Bumps the visit counter at most once per browser session. Returns
 *  the current visit number after the bump (or the existing value if
 *  we already counted this session). */
function getOrBumpVisitCount(): number {
  try {
    const alreadyCounted = sessionStorage.getItem(VISIT_SESSION_KEY) === "1";
    const prev = Number(localStorage.getItem(VISITS_KEY) ?? "0") || 0;
    if (alreadyCounted) return prev;
    const next = prev + 1;
    localStorage.setItem(VISITS_KEY, String(next));
    sessionStorage.setItem(VISIT_SESSION_KEY, "1");
    return next;
  } catch {
    return 1;
  }
}

export function SmartNotifications() {
  const pathname = usePathname();
  const [active, setActive] = useState<NotificationRule | null>(null);
  /** Timer handles per rule so we can cancel cleanly on route change. */
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  /** Counts of fired events per name (for kind: "event" rules). */
  const eventCountsRef = useRef<Map<string, number>>(new Map());
  /** Latest path — used inside debounced timers to verify the user is
   *  still on the trigger route when it fires. */
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  /** Bump visit counter on mount; remember the value so return-visit
   *  rules can read it without a state subscription. */
  const visitCountRef = useRef(1);
  useEffect(() => {
    visitCountRef.current = getOrBumpVisitCount();
  }, []);

  /** Fire a rule if it's not already deduped and nothing's showing. */
  const fire = (rule: NotificationRule) => {
    if (isDeduped(rule)) return;
    setActive(prev => prev ?? rule);
  };

  /** Reset all timers + re-evaluate triggers when the route changes. */
  useEffect(() => {
    // Clear pending timers from the previous route.
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();

    for (const rule of NOTIFICATION_RULES) {
      if (isDeduped(rule)) continue;

      if (rule.trigger.kind === "time-on-route") {
        if (!pathname.startsWith(rule.trigger.pathPrefix)) continue;
        const t = setTimeout(() => {
          // Re-check route in case the user navigated away during the
          // wait — usePathname's effect would have cleared us, but a
          // straggler timer could still fire.
          if (!pathnameRef.current.startsWith(
            // narrow the trigger to its time-on-route shape
            (rule.trigger as { pathPrefix: string }).pathPrefix
          )) {
            return;
          }
          fire(rule);
        }, rule.trigger.seconds * 1000);
        timersRef.current.set(rule.id, t);
      } else if (rule.trigger.kind === "return-visit") {
        if (visitCountRef.current < rule.trigger.minVisits) continue;
        const t = setTimeout(
          () => fire(rule),
          rule.trigger.delaySeconds * 1000
        );
        timersRef.current.set(rule.id, t);
      }
      // scroll-depth + event rules are handled by their own effects
      // below — re-installed on every route change so the listeners
      // don't leak.
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
    };
  }, [pathname]);

  /** Scroll-depth listener — installed on every route change so the
   *  pathPrefix gate is current. Cleaned up on unmount/route change. */
  useEffect(() => {
    const eligible = NOTIFICATION_RULES.filter(
      r =>
        r.trigger.kind === "scroll-depth" &&
        pathname.startsWith(r.trigger.pathPrefix) &&
        !isDeduped(r)
    );
    if (eligible.length === 0) return;

    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = window.scrollY + window.innerHeight;
      const total = doc.scrollHeight || 1;
      const frac = scrolled / total;
      for (const rule of eligible) {
        if (rule.trigger.kind !== "scroll-depth") continue;
        if (frac >= rule.trigger.fraction) {
          fire(rule);
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  /** Custom-event listener — counts dispatches and fires rules whose
   *  threshold has been reached. */
  useEffect(() => {
    const eventRules = NOTIFICATION_RULES.filter(
      r => r.trigger.kind === "event"
    );
    if (eventRules.length === 0) return;

    const handlers: Array<{ name: string; fn: () => void }> = [];
    for (const rule of eventRules) {
      if (rule.trigger.kind !== "event") continue;
      const name = rule.trigger.eventName;
      const minCount = rule.trigger.minCount ?? 1;
      const fn = () => {
        const prev = eventCountsRef.current.get(name) ?? 0;
        const next = prev + 1;
        eventCountsRef.current.set(name, next);
        if (next >= minCount) fire(rule);
      };
      window.addEventListener(name, fn);
      handlers.push({ name, fn });
    }
    return () => {
      handlers.forEach(h => window.removeEventListener(h.name, h.fn));
    };
  }, []);

  if (!active) return null;

  return (
    <NudgeCard
      rule={active}
      onDismiss={() => {
        markDeduped(active);
        setActive(null);
      }}
      onAction={() => {
        markDeduped(active);
        // The Link/anchor will navigate; we just clear the card so it
        // doesn't linger after the user has clicked through.
        setActive(null);
      }}
    />
  );
}

/** Dispatch a custom nudge-trigger event from anywhere on the client.
 *  Example: `dispatchNudgeEvent("tl:reel-played")` after a reel is
 *  watched. Safe to call from server components — no-op on the server. */
export function dispatchNudgeEvent(name: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name));
}

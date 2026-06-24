"use client";

/**
 * useScrollLock — safe body scroll locking with a global counter.
 *
 * Problem: multiple components (WelcomePopup, MobileMenu, CommandPalette,
 * ShareButton) each do `document.body.style.overflow = "hidden"` and then
 * try to restore the "previous" value in their cleanup. If two components
 * are open at the same time, or one closes while another is still open,
 * the save/restore pattern breaks and the body stays locked permanently.
 *
 * Solution: a module-level counter. Each lock call increments it; each
 * unlock call decrements it. The body is only unlocked when the counter
 * reaches zero. This is safe across any number of concurrent modals.
 *
 * Usage:
 *   import { useScrollLock } from "@/hooks/useScrollLock";
 *   const { lock, unlock } = useScrollLock();
 *   // or use the effect helper:
 *   useScrollLock(open); // locks when open=true, unlocks when open=false
 */

import { useEffect } from "react";

// Module-level counter — shared across all component instances.
let lockCount = 0;

function applyLock() {
  lockCount++;
  if (lockCount === 1) {
    // First lock — apply overflow hidden.
    document.body.style.overflow = "hidden";
    // Also lock html element for iOS Safari compatibility.
    document.documentElement.style.overflow = "hidden";
  }
}

function applyUnlock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    // All modals closed — restore scroll.
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }
}

/**
 * Hook overload 1: useScrollLock(active: boolean)
 * Automatically locks when active=true and unlocks when active=false.
 */
export function useScrollLock(active: boolean): void;

/**
 * Hook overload 2: useScrollLock()
 * Returns { lock, unlock } functions for manual control.
 */
export function useScrollLock(): { lock: () => void; unlock: () => void };

export function useScrollLock(active?: boolean): void | { lock: () => void; unlock: () => void } {
  if (active !== undefined) {
    // Effect-based auto lock/unlock.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!active) return;
      applyLock();
      return () => {
        applyUnlock();
      };
    }, [active]);
    return;
  }

  // Manual lock/unlock — return stable functions.
  return { lock: applyLock, unlock: applyUnlock };
}

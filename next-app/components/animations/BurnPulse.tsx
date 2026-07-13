"use client";

import { ReactNode } from "react";

interface BurnPulseProps {
  children: ReactNode;
  className?: string;
}

/**
 * BurnPulse — Wraps content with a pulsing fire glow effect.
 * Creates a heartbeat-style radial glow that pulses continuously.
 * Used on the token page burn stats for dramatic emphasis.
 */
export function BurnPulse({ children, className = "" }: BurnPulseProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Pulsing glow behind */}
      <div
        className="absolute inset-0 rounded-2xl animate-burn-pulse pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

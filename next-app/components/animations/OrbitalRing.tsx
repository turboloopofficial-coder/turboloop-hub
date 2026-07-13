"use client";

import { useEffect, useRef } from "react";

/**
 * OrbitalRing — A CSS 3D rotating orbital ring with glowing nodes.
 * Pure CSS animation (no JS frame loop) for performance.
 * Renders behind the hero text as a mesmerizing background element.
 */
export function OrbitalRing() {
  return (
    <div className="orbital-container" aria-hidden="true">
      {/* Outer ring */}
      <div className="orbital-ring orbital-ring-1">
        <div className="orbital-node orbital-node-cyan" style={{ "--i": 0 } as React.CSSProperties} />
        <div className="orbital-node orbital-node-purple" style={{ "--i": 1 } as React.CSSProperties} />
        <div className="orbital-node orbital-node-cyan" style={{ "--i": 2 } as React.CSSProperties} />
        <div className="orbital-node orbital-node-green" style={{ "--i": 3 } as React.CSSProperties} />
      </div>
      {/* Middle ring — counter-rotating */}
      <div className="orbital-ring orbital-ring-2">
        <div className="orbital-node orbital-node-purple" style={{ "--i": 0 } as React.CSSProperties} />
        <div className="orbital-node orbital-node-cyan" style={{ "--i": 1 } as React.CSSProperties} />
        <div className="orbital-node orbital-node-green" style={{ "--i": 2 } as React.CSSProperties} />
      </div>
      {/* Inner ring */}
      <div className="orbital-ring orbital-ring-3">
        <div className="orbital-node orbital-node-cyan" style={{ "--i": 0 } as React.CSSProperties} />
        <div className="orbital-node orbital-node-purple" style={{ "--i": 1 } as React.CSSProperties} />
      </div>
      {/* Center glow */}
      <div className="orbital-center" />
    </div>
  );
}

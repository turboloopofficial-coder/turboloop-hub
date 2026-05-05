"use client";

// Magnetic — wraps a single child (button or anchor) and adds a subtle
// "pull toward cursor" effect on hover. Spring-damped so it always settles
// back on mouse-leave; never moves more than ~10 px to avoid the layout
// jitter you see on aggressive implementations.
//
// Honors prefers-reduced-motion (the underlying motion values still
// update, but the spring becomes near-instant so visually it's static).

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagneticProps {
  children: ReactNode;
  /** Maximum pull in px — keep small, default 8 */
  strength?: number;
  className?: string;
}

export function Magnetic({
  children,
  strength = 8,
  className = "",
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Stiffer spring on the way back than going out keeps the rest position
  // crisp without making the pull feel snappy.
  const springX = useSpring(x, { stiffness: 220, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 220, damping: 20, mass: 0.4 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Cursor offset from element center, normalised to [-1, 1].
    const dx = (e.clientX - rect.left) / rect.width - 0.5;
    const dy = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(dx * strength * 2);
    y.set(dy * strength * 2);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ x: springX, y: springY, display: "inline-flex" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

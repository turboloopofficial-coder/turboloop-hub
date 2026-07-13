"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface StaggerRevealProps {
  children: ReactNode;
  /** Delay between each child's animation in ms */
  stagger?: number;
  /** Base animation duration in ms */
  duration?: number;
  className?: string;
}

/**
 * StaggerReveal — Children animate in one by one with a cascade effect.
 * Each child slides up and fades in with a staggered delay.
 * Uses IntersectionObserver to trigger only when scrolled into view.
 */
export function StaggerReveal({
  children,
  stagger = 100,
  duration = 600,
  className = "",
}: StaggerRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <style jsx>{`
        .stagger-child {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
          transition: opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1),
                      transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .stagger-child.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      `}</style>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={i}
              className={`stagger-child ${isVisible ? "visible" : ""}`}
              style={{ transitionDelay: isVisible ? `${i * stagger}ms` : "0ms" }}
            >
              {child}
            </div>
          ))
        : <div className={`stagger-child ${isVisible ? "visible" : ""}`}>{children}</div>
      }
    </div>
  );
}

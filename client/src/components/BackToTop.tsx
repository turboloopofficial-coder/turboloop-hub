// Floating back-to-top button with circular scroll-progress ring.
// Appears once user has scrolled past the first viewport.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf: number | null = null;
    const compute = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const max = (document.documentElement.scrollHeight || 0) - window.innerHeight;
      const pct = max > 0 ? Math.min(100, (scrollTop / max) * 100) : 0;
      setProgress(pct);
      setVisible(scrollTop > window.innerHeight * 0.6);
      raf = null;
    };
    const onScroll = () => {
      if (raf == null) raf = requestAnimationFrame(compute);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    compute();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, []);

  // Circumference for the SVG ring
  const r = 22;
  const c = 2 * Math.PI * r;
  const dashOffset = c - (progress / 100) * c;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-24 right-5 md:right-8 z-40 w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: "white",
            boxShadow:
              "0 8px 28px -8px rgba(8,145,178,0.4), 0 4px 12px -2px rgba(15,23,42,0.1)",
            border: "1px solid rgba(15,23,42,0.06)",
          }}
        >
          {/* Background ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 50 50"
          >
            <circle
              cx="25"
              cy="25"
              r={r}
              fill="none"
              stroke="rgba(15,23,42,0.06)"
              strokeWidth="2"
            />
            <circle
              cx="25"
              cy="25"
              r={r}
              fill="none"
              stroke="url(#backToTopGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.1s linear" }}
            />
            <defs>
              <linearGradient id="backToTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0891B2" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
          </svg>
          <ArrowUp className="w-4 h-4 text-slate-700 relative" strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

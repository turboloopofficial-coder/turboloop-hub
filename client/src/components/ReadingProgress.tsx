// Medium-style reading progress bar — fixed at the top of the viewport,
// fills up as the user scrolls through a long-form post.

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf: number | null = null;
    const compute = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const max = (document.documentElement.scrollHeight || 0) - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, (scrollTop / max) * 100)) : 0;
      setProgress(pct);
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

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-[60] pointer-events-none"
      style={{ background: "rgba(15,23,42,0.06)" }}
    >
      <div
        className="h-full transition-[width] duration-100"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #0891B2, #7C3AED, #EC4899)",
          boxShadow: "0 0 12px rgba(8,145,178,0.5)",
        }}
      />
    </div>
  );
}

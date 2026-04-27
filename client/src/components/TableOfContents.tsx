// Floating sticky Table of Contents — desktop only.
// Highlights the current section as the user scrolls.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { List } from "lucide-react";
import type { Heading } from "@/lib/blogVisuals";
import type { BlogPalette } from "@/lib/blogVisuals";

type Props = {
  headings: Heading[];
  palette: BlogPalette;
};

export default function TableOfContents({ headings, palette }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        // Pick the first heading currently visible (top-most)
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId((visible[0].target as HTMLElement).id);
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="hidden xl:block sticky top-24 self-start max-w-[240px]"
    >
      <div
        className="rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.85)",
          border: "1px solid rgba(15,23,42,0.06)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 24px -8px rgba(15,23,42,0.08)",
        }}
      >
        <div
          className="flex items-center gap-2 mb-4 pb-3"
          style={{ borderBottom: `1px solid ${palette.from}15` }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.via})` }}
          >
            <List className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">
            On this page
          </span>
        </div>

        <ul className="space-y-1.5">
          {headings.map((h) => {
            const isActive = activeId === h.id;
            return (
              <li key={h.id} style={{ paddingLeft: h.level === 3 ? "12px" : "0" }}>
                <a
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="block text-sm leading-snug py-1.5 pl-2 rounded-md transition-all duration-200"
                  style={{
                    color: isActive ? palette.from : "#64748B",
                    background: isActive ? `${palette.from}10` : "transparent",
                    fontWeight: isActive ? 700 : 500,
                    borderLeft: isActive ? `2px solid ${palette.from}` : "2px solid transparent",
                  }}
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.aside>
  );
}

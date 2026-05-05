"use client";

// Resources dropdown for the desktop nav. Hover-to-open on mouse,
// click-to-toggle on keyboard/touch. Links to all secondary pages
// (Submit, Apply, Promotions, Creatives, Library, Learn, Roadmap, FAQ).

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { RESOURCE_LINKS } from "./Navbar";

export function ResourcesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex items-center gap-1 px-3 py-2 rounded-[var(--r-md)] text-sm font-semibold text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[rgba(15,23,42,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors"
      >
        Resources
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full pt-2 z-50 w-[380px]"
        >
          <div
            className="rounded-[var(--r-xl)] bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-xl)] p-2 grid grid-cols-1 gap-1"
          >
            {RESOURCE_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 p-3 rounded-[var(--r-md)] hover:bg-[rgba(15,23,42,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition group"
                role="menuitem"
              >
                <div
                  className="text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-[var(--r-md)]"
                  style={{
                    background:
                      "color-mix(in oklab, var(--c-brand-cyan) 8%, transparent)",
                  }}
                  aria-hidden="true"
                >
                  {link.emoji}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[var(--c-text)] group-hover:text-[var(--c-brand-cyan)] transition-colors">
                    {link.label}
                  </div>
                  <div className="text-xs text-[var(--c-text-muted)] mt-0.5 leading-snug">
                    {link.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

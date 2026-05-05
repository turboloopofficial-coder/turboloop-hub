"use client";

// Resources dropdown for the desktop nav. Click-to-toggle (works on
// both mouse and touch). Panel renders inline via absolute positioning.
//
// Critical fix from previous version: imports RESOURCE_LINKS from
// nav-links (leaf module), NOT from Navbar (which would be a circular
// import — Navbar imports this component). Circular imports leave
// constants undefined at first client render → .map() throws → React
// silently swallows the error → button toggles but panel never mounts.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { RESOURCE_LINKS } from "./nav-links";

const PANEL_ID = "nav-resources-panel";

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
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        className="inline-flex items-center gap-1 px-3 min-h-[44px] rounded-[var(--r-md)] text-sm font-semibold text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[rgba(15,23,42,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors"
      >
        Resources
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id={PANEL_ID}
          role="menu"
          aria-label="Resources"
          className="absolute right-0 top-full mt-2 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-[var(--r-xl)] border border-[var(--c-border)] shadow-[var(--s-xl)] p-2 grid grid-cols-1 gap-1 backdrop-blur-xl backdrop-saturate-150"
          style={{
            // Glass: surface tint at 78 % keeps menu items readable while
            // letting the page bleed through. Solid var fallback (#ffffff)
            // covers the first-paint window before the variable resolves.
            background: "color-mix(in oklab, var(--c-surface, #ffffff) 78%, transparent)",
          }}
        >
          {RESOURCE_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-start gap-3 p-3 rounded-[var(--r-md)] hover:bg-[rgba(15,23,42,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition group"
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
      )}
    </div>
  );
}

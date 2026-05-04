"use client";

// Mobile menu — the only client component in the navbar. State is just
// open/closed. The trigger and the drawer are kept in this single file
// for atomicity.
//
// Drawer slides in from the right (no, not the bottom — bottom drawers
// are for action sheets, not nav). Full-height, opaque background, no
// scrim because the drawer covers the whole viewport on mobile anyway.

import { useEffect, useState } from "react";
import { Menu, X, Rocket } from "lucide-react";
import Link from "next/link";

type Link = { label: string; href: string };

export function MobileMenu({ links }: { links: readonly Link[] }) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while drawer is open. Without this, the page
  // beneath the drawer scrolls behind it on mobile Safari.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Trigger — mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-[var(--r-md)] text-[var(--c-text)] hover:bg-[rgba(15,23,42,0.06)] active:scale-95 transition"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Drawer */}
      {open && (
        <div
          className="fixed inset-0 z-[var(--z-modal,70)] md:hidden bg-[var(--c-bg)] overflow-y-auto"
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
          onClick={() => setOpen(false)}
        >
          {/* Header inside drawer (mirrors top nav structure) */}
          <div
            className="sticky top-0 flex items-center justify-between h-[var(--nav-h)] px-[var(--gutter)] border-b border-[var(--c-border)] bg-[var(--c-bg)]"
            onClick={e => e.stopPropagation()}
          >
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 font-bold text-lg tracking-tight"
            >
              <span className="text-[var(--c-text)]">Turbo</span>
              <span className="bg-brand bg-clip-text text-transparent">
                Loop
              </span>
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-[var(--r-md)] text-[var(--c-text)] hover:bg-[rgba(15,23,42,0.06)] active:scale-95 transition"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer body */}
          <nav
            className="flex flex-col px-[var(--gutter)] py-6 gap-1"
            onClick={e => e.stopPropagation()}
          >
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-4 text-base font-semibold text-[var(--c-text)] border-b border-[var(--c-border)]"
              >
                {link.label}
                <span className="text-[var(--c-text-subtle)]">→</span>
              </Link>
            ))}
            <Link
              href="/films"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between py-4 text-base font-semibold text-[var(--c-text)] border-b border-[var(--c-border)]"
            >
              Films
              <span className="text-[var(--c-text-subtle)]">→</span>
            </Link>
            <Link
              href="/promotions"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between py-4 text-base font-semibold text-[var(--c-text)] border-b border-[var(--c-border)]"
            >
              Promotions
              <span className="text-[var(--c-text-subtle)]">→</span>
            </Link>
            <Link
              href="/submit"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between py-4 text-base font-semibold text-[var(--c-text)] border-b border-[var(--c-border)]"
            >
              Submit Story
              <span className="text-[var(--c-text-subtle)]">→</span>
            </Link>

            {/* Primary CTA at the bottom of the drawer */}
            <a
              href="https://turboloop.io"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex items-center justify-center gap-2 px-5 h-[52px] rounded-[var(--r-lg)] text-base font-bold text-white bg-brand shadow-[var(--s-brand)] active:scale-[0.985] transition"
            >
              <Rocket className="w-4 h-4" />
              Launch App
            </a>
          </nav>
        </div>
      )}
    </>
  );
}

"use client";

// Fixed bottom CTA bar — mobile only.
//
// Always-visible primary action (Launch App) + secondary action (Submit
// Story) on every route. Solves the "where's the button on mobile?"
// problem that was breaking conversion in the legacy SPA.

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Rocket, PenLine } from "lucide-react";

const HIDDEN_ROUTES = [/^\/admin/, /^\/offline$/, /^\/404$/, /^\/submit$/];

export function MobileBottomCTA() {
  const pathname = usePathname();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        setKeyboardOpen(true);
      }
    };
    const onFocusOut = () => setKeyboardOpen(false);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  if (keyboardOpen) return null;
  if (HIDDEN_ROUTES.some(re => re.test(pathname))) return null;

  return (
    <div
      role="navigation"
      aria-label="Primary actions"
      className="md:hidden fixed bottom-0 inset-x-0 z-[var(--z-mobileCTA,60)]"
      style={{
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--c-bg) 0% , transparent) 0%, color-mix(in oklab, var(--c-bg) 96% , transparent) 35%)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div className="mx-3 mb-2 flex items-center gap-2">
        <a
          href="https://turboloop.io"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 h-[52px] rounded-[var(--r-xl)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] active:scale-[0.97] transition"
        >
          <Rocket className="w-4 h-4" />
          Launch App
        </a>
        <Link
          href="/submit"
          className="inline-flex items-center justify-center gap-2 px-4 h-[52px] rounded-[var(--r-xl)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-md)] active:scale-[0.97] transition"
          aria-label="Submit your story"
        >
          <PenLine className="w-4 h-4" />
          Submit
        </Link>
      </div>
    </div>
  );
}

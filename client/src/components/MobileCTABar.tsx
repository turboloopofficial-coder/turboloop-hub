// Fixed bottom CTA bar — mobile only.
//
// On mobile, the navbar's "Launch App" button is buried behind the
// hamburger drawer. A new visitor scrolling Home has nothing pinned to
// the screen telling them what to do next. This component fixes that:
// always-visible primary action ("Launch App") + secondary action
// ("Submit Story") on every route.
//
// Auto-hides when:
//   - desktop viewport (md+ breakpoint)
//   - user is typing in an input/textarea (keyboard takes the space)
//   - the route is admin / offline / 404 (different UX intent)
//   - already on /submit (redundant secondary CTA)

import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Rocket, PenLine } from "lucide-react";
import { SITE } from "@/lib/constants";

const HIDDEN_ROUTES = [/^\/admin/, /^\/offline$/, /^\/404$/];

export default function MobileCTABar() {
  const [location] = useLocation();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Detect input focus → hide so the keyboard isn't fighting the bar.
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
  if (HIDDEN_ROUTES.some(re => re.test(location))) return null;

  const onSubmitRoute = location === "/submit";

  return (
    <div
      role="navigation"
      aria-label="Primary actions"
      className="md:hidden fixed bottom-0 inset-x-0 z-40"
      style={{
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.96) 35%)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div className="mx-3 mb-2 flex items-center gap-2">
        <a
          href={SITE.mainApp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-bold transition active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
            color: "white",
            boxShadow: "0 12px 28px -8px rgba(8,145,178,0.55)",
          }}
        >
          <Rocket className="w-4 h-4" />
          Launch App
        </a>
        {!onSubmitRoute && (
          <Link href="/submit">
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-bold transition active:scale-[0.97]"
              style={{
                background: "white",
                color: "#0F172A",
                border: "1px solid rgba(15,23,42,0.1)",
                boxShadow: "0 8px 22px -6px rgba(15,23,42,0.12)",
              }}
              aria-label="Submit your story"
            >
              <PenLine className="w-4 h-4" />
              Submit
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

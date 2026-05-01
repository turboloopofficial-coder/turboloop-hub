import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ExternalLink, ChevronDown, Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { SITE } from "@/lib/constants";
import GlobalSearch from "@/components/GlobalSearch";

// Top-level nav links — each goes to a dedicated page
const NAV_LINKS: Array<{ label: string; href: string; external?: boolean }> = [
  { label: "Ecosystem", href: "/ecosystem" },
  { label: "Community", href: "/community" },
  { label: "Blog", href: "/feed" },
  { label: "Security", href: "/security" },
  { label: "Roadmap", href: "/roadmap" },
];

// Resources dropdown — secondary pages
const RESOURCES: Array<{ label: string; href: string; description: string; emoji: string }> = [
  { label: "Films", href: "/films", description: "20-film cinematic universe across 4 seasons", emoji: "🎬" },
  { label: "Learn (DeFi 101)", href: "/learn", description: "Plain-English DeFi explainers for beginners", emoji: "📚" },
  { label: "Library", href: "/library", description: "Videos and presentations in 48 languages", emoji: "📂" },
  { label: "Creatives", href: "/creatives", description: "141 ready-to-share branded posts with captions", emoji: "🎨" },
  { label: "Promotions", href: "/promotions", description: "$100K bounty + creator and presenter programs", emoji: "🎁" },
  { label: "Submit Your Story", href: "/submit", description: "Share your testimonial, photo, video, or story", emoji: "✍️" },
  { label: "FAQ", href: "/faq", description: "Common questions answered", emoji: "❓" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cmd+K (Mac) / Ctrl+K (Win/Linux) opens global search from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      } else if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        // Bare "/" key also opens search (GitHub/Slack style) when not typing in a field
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!resourcesOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setResourcesOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [resourcesOpen]);

  const navigate = (href: string) => {
    setMobileOpen(false);
    setResourcesOpen(false);
    if (href.startsWith("/#")) {
      // Anchor on homepage — navigate then scroll
      const anchor = href.slice(2);
      setLocation("/");
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else {
      setLocation(href);
      window.scrollTo({ top: 0 });
    }
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(255, 255, 255, 0.78)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div className="container flex items-center justify-between h-16 md:h-20">
          {/* Brand */}
          <Link href="/">
            <span className="flex items-center gap-2.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <img
                src={SITE.logo}
                alt="Turbo Loop"
                className="h-9 md:h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                style={{ filter: "drop-shadow(0 4px 12px rgba(8,145,178,0.2))" }}
              />
              <span className="text-xl md:text-2xl font-bold tracking-tight hidden sm:inline" style={{ fontFamily: "var(--font-heading)" }}>
                <span className="text-slate-800">Turbo</span>
                <span
                  style={{
                    background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Loop
                </span>
              </span>
            </span>
          </Link>

          {/* Center nav (desktop) */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className="text-sm text-slate-600 hover:text-cyan-700 transition-colors duration-200 tracking-wide font-semibold"
              >
                {link.label}
              </button>
            ))}

            {/* Resources dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setResourcesOpen((o) => !o)}
                className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-cyan-700 transition-colors duration-200 tracking-wide font-semibold"
              >
                Resources
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${resourcesOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {resourcesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-3 w-80 rounded-2xl overflow-hidden p-2"
                    style={{
                      background: "rgba(255,255,255,0.98)",
                      border: "1px solid rgba(15,23,42,0.06)",
                      boxShadow: "0 20px 50px -10px rgba(15,23,42,0.15)",
                    }}
                  >
                    {RESOURCES.map((r) => (
                      <button
                        key={r.href}
                        onClick={() => navigate(r.href)}
                        className="w-full text-left flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition group"
                      >
                        <div className="text-2xl shrink-0">{r.emoji}</div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">{r.label}</div>
                          <div className="text-xs text-slate-500 leading-relaxed">{r.description}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Search + Launch App */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-800 transition"
              style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.06)" }}
              title="Search the hub (Ctrl+K)"
              aria-label="Search the hub"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-xs">Search</span>
              <kbd className="hidden lg:inline-flex items-center px-1 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-white border border-slate-200">⌘K</kbd>
            </button>
            <a
              href={SITE.mainApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                color: "#ffffff",
                boxShadow: "0 8px 24px -6px rgba(8,145,178,0.4)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 12px 32px -6px rgba(8,145,178,0.55)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 24px -6px rgba(8,145,178,0.4)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Launch App <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile: Search + burger */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="text-slate-700 p-2"
              aria-label="Search the hub"
            >
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-700 p-2" aria-label={mobileOpen ? "Close menu" : "Open menu"}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Global search modal — Cmd+K / Ctrl+K / "/" */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[60] md:hidden overflow-y-auto"
            style={{ background: "rgba(255, 255, 255, 0.98)", backdropFilter: "blur(24px)" }}
          >
            <div className="flex flex-col items-center justify-start min-h-full pt-20 pb-12 gap-3">
              <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-5 text-slate-400 p-2">
                <X className="w-7 h-7" />
              </button>
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(link.href)}
                  className="text-2xl font-bold text-slate-800 tracking-wide"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-xs mt-4 pt-6 flex flex-col gap-2"
                style={{ borderTop: "1px solid rgba(15,23,42,0.06)" }}
              >
                <div className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400 text-center mb-2">Resources</div>
                {RESOURCES.map((r) => (
                  <button
                    key={r.href}
                    onClick={() => navigate(r.href)}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-slate-50/50"
                  >
                    <div className="text-xl">{r.emoji}</div>
                    <div className="text-sm font-semibold text-slate-700">{r.label}</div>
                  </button>
                ))}
              </motion.div>
              <motion.a
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                href={SITE.mainApp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 px-8 py-3 rounded-xl font-bold text-lg"
                style={{ background: "linear-gradient(135deg, #0891B2, #7C3AED)", color: "#ffffff" }}
              >
                Launch App
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ExternalLink } from "lucide-react";
import { SITE } from "@/lib/constants";

const NAV_LINKS = [
  { label: "Ecosystem", href: "#ecosystem" },
  { label: "Community", href: "#leaderboard" },
  { label: "Videos", href: "#videos" },
  { label: "Blog", href: "#blog" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Resources", href: "#trust" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(255, 255, 255, 0.75)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div className="container flex items-center justify-between h-16 md:h-20">
          <a
            href="#"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 group"
          >
            <img
              src={SITE.logo}
              alt="Turbo Loop"
              className="h-9 md:h-10 w-auto transition-transform duration-300 group-hover:scale-105"
              style={{
                filter: "drop-shadow(0 4px 12px rgba(8,145,178,0.2))",
              }}
            />
            <span className="text-xl md:text-2xl font-bold tracking-tight hidden sm:inline">
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
          </a>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm text-slate-500 hover:text-cyan-600 transition-colors duration-300 tracking-wide font-medium"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {/* Launch App */}
            <a
              href={SITE.mainApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                border: "none",
                color: "#ffffff",
                boxShadow: "0 4px 20px -4px rgba(8,145,178,0.4)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 30px -4px rgba(8,145,178,0.5)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 20px -4px rgba(8,145,178,0.4)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Launch App <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-slate-600 p-2">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[60] md:hidden"
            style={{ background: "rgba(255, 255, 255, 0.97)", backdropFilter: "blur(24px)" }}
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-5 text-slate-400 p-2">
                <X className="w-7 h-7" />
              </button>
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleNavClick(link.href)}
                  className="text-2xl font-semibold text-slate-800 tracking-wide"
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.a
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                href={SITE.mainApp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 px-8 py-3 rounded-lg font-semibold text-lg"
                style={{ background: "linear-gradient(135deg, #0891B2, #0E7490)", color: "#ffffff" }}
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

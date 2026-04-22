import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ExternalLink } from "lucide-react";
import { SITE } from "@/lib/constants";

const NAV_LINKS = [
  { label: "Ecosystem", href: "#ecosystem" },
  { label: "Community", href: "#leaderboard" },
  { label: "Videos", href: "#videos" },
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
          background: scrolled ? "rgba(4, 8, 16, 0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(34,211,238,0.06)" : "1px solid transparent",
        }}
      >
        <div className="container flex items-center justify-between h-16 md:h-20">
          <a href="#" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3 group">
            <span className="text-xl md:text-2xl font-bold tracking-tight">
              <span className="text-white">Turbo</span>
              <span className="text-cyan-400">Loop</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-300 tracking-wide"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:block">
            <a
              href={SITE.mainApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(192,132,252,0.1))",
                border: "1px solid rgba(34,211,238,0.25)",
                color: "#22D3EE",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(34,211,238,0.25), rgba(192,132,252,0.15))";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(34,211,238,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(192,132,252,0.1))";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Launch App <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-300 p-2">
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
            style={{ background: "rgba(4, 8, 16, 0.97)", backdropFilter: "blur(24px)" }}
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-5 text-gray-400 p-2">
                <X className="w-7 h-7" />
              </button>
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleNavClick(link.href)}
                  className="text-2xl font-semibold text-white tracking-wide"
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
                style={{ background: "linear-gradient(135deg, #22D3EE, #06b6d4)", color: "#040810" }}
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

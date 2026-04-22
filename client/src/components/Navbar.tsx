import { useState, useEffect } from "react";
import { SITE } from "@/lib/constants";
import { Menu, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Ecosystem", href: "#ecosystem" },
  { label: "Videos", href: "#videos" },
  { label: "Blog", href: "#blog" },
  { label: "Events", href: "#events" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Trust", href: "#trust" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? "rgba(6,10,22,0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(34,211,238,0.08)" : "1px solid transparent",
      }}
    >
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src={SITE.logo}
            alt="Turbo Loop"
            className="h-9 w-auto md:h-11 object-contain rounded-lg"
          />
          <span className="text-lg md:text-xl font-heading font-bold">
            <span className="text-white">Turbo</span>
            <span className="text-cyan-400">Loop</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-gray-400 hover:text-cyan-400 transition-colors duration-300 font-medium"
            >
              {link.label}
            </a>
          ))}
          <a href={SITE.mainApp} target="_blank" rel="noopener noreferrer">
            <button
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(34,211,238,0.05))",
                border: "1px solid rgba(34,211,238,0.3)",
                color: "#22D3EE",
                boxShadow: "0 0 20px rgba(34,211,238,0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(34,211,238,0.25), rgba(34,211,238,0.1))";
                e.currentTarget.style.boxShadow = "0 0 30px rgba(34,211,238,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(34,211,238,0.05))";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(34,211,238,0.1)";
              }}
            >
              Launch App <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: "rgba(6,10,22,0.95)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(34,211,238,0.08)",
            }}
          >
            <div className="container py-5 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 py-3 font-medium text-base"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a href={SITE.mainApp} target="_blank" rel="noopener noreferrer" className="mt-3">
                <button
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
                  style={{
                    background: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(34,211,238,0.05))",
                    border: "1px solid rgba(34,211,238,0.3)",
                    color: "#22D3EE",
                  }}
                >
                  Launch App <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

import { useState, useEffect } from "react";
import { SITE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0f1e]/90 backdrop-blur-xl border-b border-cyan-500/10 shadow-lg shadow-cyan-500/5"
          : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <img
            src={SITE.logo}
            alt="Turbo Loop"
            className="h-10 w-10 md:h-12 md:w-12 object-contain rounded-lg"
          />
          <span className="text-lg md:text-xl font-heading font-bold">
            <span className="text-white">Turbo</span>
            <span className="text-cyan-400">Loop</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-gray-300 hover:text-cyan-400 transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
          <a href={SITE.mainApp} target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#0a0f1e] font-bold px-6 shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40">
              Launch App <ExternalLink className="ml-1.5 h-4 w-4" />
            </Button>
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
            className="lg:hidden bg-[#0a0f1e]/95 backdrop-blur-xl border-b border-cyan-500/10"
          >
            <div className="container py-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-cyan-400 transition-colors py-2 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a href={SITE.mainApp} target="_blank" rel="noopener noreferrer" className="mt-2">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#0a0f1e] font-bold shadow-lg shadow-cyan-500/25">
                  Launch App <ExternalLink className="ml-1.5 h-4 w-4" />
                </Button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

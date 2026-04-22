import { SITE } from "@/lib/constants";
import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #060a16 0%, #030610 100%)" }}>
      {/* Top gradient line */}
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.3), rgba(192,132,252,0.3), transparent)" }} />

      <div className="container py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img src={SITE.logo} alt="Turbo Loop" className="h-10 w-auto object-contain rounded-lg" />
              <span className="text-xl font-heading font-bold">
                <span className="text-white">Turbo</span>
                <span className="text-cyan-400">Loop</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              The Complete DeFi Ecosystem on Binance Smart Chain. Sustainable yield, transparent by design, open to everyone.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-heading font-bold text-gray-400 mb-5 uppercase tracking-widest">Quick Links</h4>
            <div className="space-y-3">
              {[
                { href: "#ecosystem", label: "Ecosystem" },
                { href: "#videos", label: "Video Hub" },
                { href: "#events", label: "Events" },
                { href: "#roadmap", label: "Roadmap" },
                { href: "#trust", label: "Security" },
              ].map((link) => (
                <a key={link.href} href={link.href} className="block text-sm text-gray-500 hover:text-cyan-400 transition-colors duration-300">
                  {link.label}
                </a>
              ))}
              <a href={SITE.mainApp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-cyan-400/80 hover:text-cyan-300 transition-colors duration-300">
                Launch App <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-heading font-bold text-gray-400 mb-5 uppercase tracking-widest">Community</h4>
            <div className="space-y-3">
              <a href={SITE.socials.telegramCommunity} target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-500 hover:text-cyan-400 transition-colors duration-300">
                Telegram Community
              </a>
              <a href={SITE.socials.telegramChat} target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-500 hover:text-cyan-400 transition-colors duration-300">
                Telegram Chat
              </a>
              <a href={SITE.socials.twitter} target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-500 hover:text-cyan-400 transition-colors duration-300">
                X (Twitter)
              </a>
              <a href={SITE.socials.youtube} target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-500 hover:text-cyan-400 transition-colors duration-300">
                YouTube
              </a>
            </div>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="mt-12 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-700">
              &copy; {new Date().getFullYear()} Turbo Loop. All rights reserved.
            </p>
            <p className="text-xs text-gray-700">
              turboloop.tech is the community hub &middot;{" "}
              <a href={SITE.mainApp} target="_blank" rel="noopener noreferrer" className="text-cyan-500/40 hover:text-cyan-400 transition-colors">
                turboloop.io
              </a>{" "}
              is the main dApp
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

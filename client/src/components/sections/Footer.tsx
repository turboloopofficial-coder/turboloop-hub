import { SITE } from "@/lib/constants";
import { ExternalLink, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative" style={{ background: "#040810" }}>
      {/* Top gradient line */}
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.2), rgba(192,132,252,0.2), transparent)" }} />

      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold">
                <span className="text-white">Turbo</span>
                <span className="text-cyan-400">Loop</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              The Complete DeFi Ecosystem on Binance Smart Chain.
            </p>
            <a
              href={SITE.mainApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(34,211,238,0.05))",
                border: "1px solid rgba(34,211,238,0.2)",
                color: "#22D3EE",
              }}
            >
              Launch App <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 mb-5 uppercase tracking-widest">Explore</h4>
            <div className="space-y-3">
              {[
                { href: "#ecosystem", label: "Ecosystem" },
                { href: "#leaderboard", label: "Global Growth" },
                { href: "#flywheel", label: "Revenue Model" },
                { href: "#promotions", label: "Promotions" },
              ].map((link) => (
                <a key={link.href} href={link.href} className="block text-sm text-gray-500 hover:text-gray-300 transition-colors duration-300">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 mb-5 uppercase tracking-widest">Resources</h4>
            <div className="space-y-3">
              {[
                { href: "#videos", label: "Video Hub" },
                { href: "#blog", label: "Blog" },
                { href: "#events", label: "Events" },
                { href: "#roadmap", label: "Roadmap" },
                { href: "#trust", label: "Security" },
              ].map((link) => (
                <a key={link.href} href={link.href} className="block text-sm text-gray-500 hover:text-gray-300 transition-colors duration-300">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 mb-5 uppercase tracking-widest">Community</h4>
            <div className="space-y-3">
              <a href={SITE.socials.telegramCommunity} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors duration-300">
                Telegram Community <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
              <a href={SITE.socials.telegramChat} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors duration-300">
                Telegram Chat <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
              <a href={SITE.socials.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors duration-300">
                X (Twitter) <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
              <a href={SITE.socials.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors duration-300">
                YouTube <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              &copy; {new Date().getFullYear()} Turbo Loop. All rights reserved.
            </p>
            <p className="text-xs text-gray-600">
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

import { SITE } from "@/lib/constants";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import ShareButton from "@/components/ShareButton";

export default function Footer() {
  return (
    <footer className="relative" style={{ background: "rgba(248,250,252,0.95)", backdropFilter: "blur(20px)" }}>
      {/* Top gradient line */}
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(8,145,178,0.15), rgba(124,58,237,0.15), transparent)" }} />

      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold">
                <span className="text-slate-800">Turbo</span>
                <span className="text-cyan-600">Loop</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              The Complete DeFi Ecosystem on Binance Smart Chain.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={SITE.mainApp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 hover:brightness-110"
                style={{
                  background: "rgba(8,145,178,0.08)",
                  border: "1px solid rgba(8,145,178,0.2)",
                  color: "#0891B2",
                }}
              >
                Launch App <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <ShareButton
                path="/"
                message="🚀 Turbo Loop — the complete DeFi ecosystem on BSC. Sustainable yield. Transparent by design. Open to everyone."
                label="Share"
              />
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 mb-5 uppercase tracking-widest">Explore</h4>
            <div className="space-y-3">
              {[
                { href: "#ecosystem", label: "Ecosystem" },
                { href: "#leaderboard", label: "Global Growth" },
                { href: "#flywheel", label: "Revenue Model" },
                { href: "#promotions", label: "Promotions" },
              ].map((link) => (
                <a key={link.href} href={link.href} className="block text-sm text-slate-500 hover:text-slate-700 transition-colors duration-300">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 mb-5 uppercase tracking-widest">Resources</h4>
            <div className="space-y-3">
              {[
                { href: "#videos", label: "Video Hub" },
                { href: "/feed", label: "Blog" },
                { href: "#events", label: "Events" },
                { href: "#roadmap", label: "Roadmap" },
                { href: "#trust", label: "Security" },
              ].map((link) => (
                <a key={link.href} href={link.href} className="block text-sm text-slate-500 hover:text-slate-700 transition-colors duration-300">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 mb-5 uppercase tracking-widest">Community</h4>
            <div className="space-y-3">
              <a href={SITE.socials.telegramCommunity} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors duration-300">
                Telegram Community <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
              <a href={SITE.socials.telegramChat} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors duration-300">
                Telegram Chat <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
              <a href={SITE.socials.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors duration-300">
                X (Twitter) <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
              <a href={SITE.socials.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors duration-300">
                YouTube <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-8" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} Turbo Loop. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <p className="text-xs text-slate-400">
                turboloop.tech is the community hub &middot;{" "}
                <a href={SITE.mainApp} target="_blank" rel="noopener noreferrer" className="text-cyan-600/60 hover:text-cyan-600 transition-colors">
                  turboloop.io
                </a>{" "}
                is the main dApp
              </p>
              <a href="/admin/login" className="text-xs text-slate-300 hover:text-slate-500 transition-colors duration-300">
                Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { SITE } from "@/lib/constants";
import { ExternalLink, ArrowUpRight, Send, MessageCircle, Twitter, Youtube, Shield, Zap, Globe, Mail } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import NewsletterSignup from "@/components/NewsletterSignup";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Top gradient line */}
      <div
        className="h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(8,145,178,0.3), rgba(124,58,237,0.3), transparent)",
        }}
      />

      {/* Dramatic dark hero strip */}
      <div
        className="relative"
        style={{
          background:
            "linear-gradient(180deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)",
        }}
      >
        {/* Top glow */}
        <div
          className="absolute top-0 left-0 right-0 h-40 pointer-events-none opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(8,145,178,0.4), transparent 60%)",
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Decorative orbs */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(8,145,178,0.15), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative container py-16 md:py-20">
          {/* Newsletter signup — sits above the CTA banner so it's the first thing in the footer */}
          <div className="mb-12 pb-12 max-w-2xl mx-auto text-center"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase mb-4"
              style={{ background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.25)", color: "#67E8F9" }}
            >
              <Mail className="w-3 h-3" />
              Newsletter
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
              Stay in the loop.
            </h3>
            <p className="text-slate-400 text-sm md:text-base mb-5 max-w-md mx-auto">
              One update per week — new films, blog posts, and what's happening in the community. No hype, no spam.
            </p>
            <div className="max-w-md mx-auto">
              <NewsletterSignup source="footer" variant="inline" />
            </div>
          </div>

          {/* Top CTA banner */}
          <div className="mb-14 flex flex-col md:flex-row items-center justify-between gap-6 pb-12"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="text-center md:text-left">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase mb-3"
                style={{
                  background: "rgba(8,145,178,0.15)",
                  border: "1px solid rgba(8,145,178,0.25)",
                  color: "#67E8F9",
                }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
                </span>
                Live on BSC
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight max-w-md">
                Ready to Join the Loop?
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                The complete DeFi ecosystem awaits.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={SITE.mainApp}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                  color: "white",
                  boxShadow:
                    "0 12px 30px -8px rgba(8,145,178,0.5), 0 6px 18px -4px rgba(124,58,237,0.4)",
                }}
              >
                Launch App
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <ShareButton
                path="/"
                message="🚀 Turbo Loop — the complete DeFi ecosystem on BSC. Sustainable yield. Transparent by design. Open to everyone."
                label="Share"
              />
            </div>
          </div>

          {/* Main columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
            {/* Brand */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={SITE.logo}
                  alt="Turbo Loop"
                  className="h-11 w-auto"
                  style={{
                    filter: "drop-shadow(0 8px 20px rgba(8,145,178,0.3))",
                  }}
                />
                <span className="text-2xl font-bold">
                  <span className="text-white">Turbo</span>
                  <span
                    className="ml-0.5"
                    style={{
                      background:
                        "linear-gradient(135deg, #22D3EE 0%, #A78BFA 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Loop
                  </span>
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-sm">
                The Complete DeFi Ecosystem on Binance Smart Chain. Sustainable
                yield. Transparent by design. Open to everyone.
              </p>

              {/* Trust badges micro */}
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { icon: Shield, label: "Audited" },
                  { icon: Zap, label: "Renounced" },
                  { icon: Globe, label: "On-Chain" },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#94A3B8",
                    }}
                  >
                    <b.icon className="w-3 h-3 text-cyan-400" />
                    {b.label}
                  </div>
                ))}
              </div>

              {/* Social icons row */}
              <div className="flex items-center gap-2">
                {[
                  {
                    href: SITE.socials.telegramCommunity,
                    icon: Send,
                    label: "Telegram",
                  },
                  {
                    href: SITE.socials.telegramChat,
                    icon: MessageCircle,
                    label: "Chat",
                  },
                  {
                    href: SITE.socials.twitter,
                    icon: Twitter,
                    label: "X / Twitter",
                  },
                  {
                    href: SITE.socials.youtube,
                    icon: Youtube,
                    label: "YouTube",
                  },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#94A3B8",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, rgba(8,145,178,0.2), rgba(124,58,237,0.2))";
                      e.currentTarget.style.borderColor =
                        "rgba(8,145,178,0.4)";
                      e.currentTarget.style.color = "#67E8F9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.04)";
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.08)";
                      e.currentTarget.style.color = "#94A3B8";
                    }}
                  >
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Explore */}
            <div className="md:col-span-2">
              <h4 className="text-[11px] font-bold text-slate-500 mb-5 uppercase tracking-[0.2em]">
                Explore
              </h4>
              <ul className="space-y-2.5">
                {[
                  { href: "#ecosystem", label: "Ecosystem" },
                  { href: "#leaderboard", label: "Global Growth" },
                  { href: "#flywheel", label: "Revenue Model" },
                  { href: "#promotions", label: "Promotions" },
                ].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors duration-300"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-cyan-400 transition-all duration-300" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="md:col-span-3">
              <h4 className="text-[11px] font-bold text-slate-500 mb-5 uppercase tracking-[0.2em]">
                Resources
              </h4>
              <ul className="space-y-2.5">
                {[
                  { href: "#videos", label: "Video Hub" },
                  { href: "/feed", label: "Blog & Updates" },
                  { href: "#events", label: "Live Events" },
                  { href: "#roadmap", label: "Roadmap" },
                  { href: "#trust", label: "Security & Audit" },
                  { href: "#faq", label: "FAQ" },
                ].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors duration-300"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-cyan-400 transition-all duration-300" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div className="md:col-span-3">
              <h4 className="text-[11px] font-bold text-slate-500 mb-5 uppercase tracking-[0.2em]">
                Community
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href={SITE.socials.telegramCommunity}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors duration-300"
                  >
                    Telegram Community
                    <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                  </a>
                </li>
                <li>
                  <a
                    href={SITE.socials.telegramChat}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors duration-300"
                  >
                    Telegram Chat
                    <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                  </a>
                </li>
                <li>
                  <a
                    href={SITE.socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors duration-300"
                  >
                    X (Twitter)
                    <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                  </a>
                </li>
                <li>
                  <a
                    href={SITE.socials.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors duration-300"
                  >
                    YouTube
                    <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom row */}
          <div
            className="mt-14 pt-8"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <p className="text-xs text-slate-500">
                &copy; {new Date().getFullYear()} Turbo Loop. All rights reserved.
                <span className="mx-2 text-slate-600">·</span>
                <a href="/privacy" className="text-slate-400 hover:text-cyan-400 transition-colors">Privacy</a>
                <span className="mx-2 text-slate-600">·</span>
                <a href="/terms" className="text-slate-400 hover:text-cyan-400 transition-colors">Terms</a>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <p className="text-xs text-slate-500">
                  <span className="text-slate-400">turboloop.tech</span> is the
                  community hub
                  <span className="mx-2 text-slate-600">·</span>
                  <a
                    href={SITE.mainApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400/70 hover:text-cyan-400 transition-colors"
                  >
                    turboloop.io
                  </a>{" "}
                  is the main dApp
                </p>
                <a
                  href="/admin/login"
                  className="text-xs text-slate-600 hover:text-slate-400 transition-colors duration-300"
                >
                  Admin
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { motion } from "framer-motion";
import { Home, Search, ArrowLeft, Compass } from "lucide-react";
import { useLocation, Link } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-6"
      style={{ background: "#F7F8FC" }}
    >
      {/* Decorative background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(8,145,178,0.12), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, -20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(124,58,237,0.10), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-2xl w-full text-center">
        {/* Massive 404 with gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mb-8"
        >
          <h1
            className="text-[10rem] md:text-[16rem] font-bold leading-none select-none"
            style={{
              fontFamily: "var(--font-heading)",
              background:
                "linear-gradient(135deg, #0891B2 0%, #22D3EE 30%, #7C3AED 70%, #9333EA 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 20px 40px rgba(8,145,178,0.15))",
            }}
          >
            <motion.span
              animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="inline-block"
              style={{
                background:
                  "linear-gradient(135deg, #0891B2 0%, #22D3EE 30%, #7C3AED 70%, #9333EA 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              404
            </motion.span>
          </h1>

          {/* Floating compass icon over the 404 */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 360] }}
            transition={{
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
              boxShadow:
                "0 30px 60px -20px rgba(8,145,178,0.5), 0 10px 30px -8px rgba(124,58,237,0.4)",
              border: "2px solid rgba(255,255,255,0.5)",
            }}
          >
            <Compass className="w-10 h-10 text-white" />
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold text-slate-800 mb-3"
        >
          Lost in the Loop?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base md:text-lg text-slate-500 mb-8 max-w-md mx-auto leading-relaxed"
        >
          The page you're looking for doesn't exist or has been moved. Let's get you
          back on track.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
        >
          <Link href="/">
            <button
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                color: "white",
                boxShadow: "0 12px 32px -8px rgba(8,145,178,0.5)",
              }}
            >
              <Home className="w-4 h-4" />
              Back to Home
            </button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-slate-700 transition-all duration-300"
            style={{
              background: "white",
              border: "1px solid rgba(15,23,42,0.08)",
              boxShadow: "0 4px 14px -4px rgba(15,23,42,0.06)",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="pt-8"
          style={{ borderTop: "1px solid rgba(15,23,42,0.06)" }}
        >
          <p className="text-xs text-slate-400 tracking-wider uppercase mb-4">
            Or jump straight to
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { href: "/ecosystem",  label: "Ecosystem", emoji: "⚙" },
              { href: "/films",      label: "Films",     emoji: "🎬" },
              { href: "/feed",       label: "Blog",      emoji: "📖" },
              { href: "/learn",      label: "DeFi 101",  emoji: "📚" },
              { href: "/security",   label: "Security",  emoji: "🛡" },
              { href: "/community",  label: "Community", emoji: "🌍" },
              { href: "/creatives",  label: "Creatives", emoji: "🎨" },
              { href: "/faq",        label: "FAQ",       emoji: "❓" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); setLocation(link.href); }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-slate-700 transition-all duration-300 hover:text-cyan-700 hover:scale-105"
                style={{
                  background: "white",
                  border: "1px solid rgba(15,23,42,0.06)",
                }}
              >
                <span>{link.emoji}</span>
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">
            or hit <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">Ctrl+K</kbd> to search
          </p>
        </motion.div>
      </div>
    </div>
  );
}

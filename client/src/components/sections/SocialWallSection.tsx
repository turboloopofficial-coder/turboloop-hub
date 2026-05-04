import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Twitter,
  Send as TelegramIcon,
  Youtube,
  Instagram,
  Facebook,
  Globe,
  ExternalLink,
  CheckCircle2,
  Heart,
  MessageCircle,
  Repeat2,
  AtSign,
} from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";
import {
  SOCIAL_POSTS,
  type SocialPost,
  type SocialPlatform,
  relativeTime,
} from "@/lib/socialWallData";
import { rotateAndRestamp } from "@/lib/dynamicRotation";
import { getFlagUrl } from "@/lib/constants";

const PLATFORM_META: Record<
  SocialPlatform,
  { icon: any; label: string; color: string; bgGradient: string }
> = {
  x: {
    icon: Twitter,
    label: "X / Twitter",
    color: "#0F172A",
    bgGradient: "linear-gradient(135deg, #0F172A, #1E293B)",
  },
  telegram: {
    icon: TelegramIcon,
    label: "Telegram",
    color: "#229ED9",
    bgGradient: "linear-gradient(135deg, #229ED9, #1A6FA0)",
  },
  youtube: {
    icon: Youtube,
    label: "YouTube",
    color: "#DC2626",
    bgGradient: "linear-gradient(135deg, #DC2626, #B91C1C)",
  },
  instagram: {
    icon: Instagram,
    label: "Instagram",
    color: "#E1306C",
    bgGradient: "linear-gradient(135deg, #FFDC80, #E1306C, #833AB4)",
  },
  facebook: {
    icon: Facebook,
    label: "Facebook",
    color: "#1877F2",
    bgGradient: "linear-gradient(135deg, #1877F2, #0E5BCB)",
  },
  tiktok: {
    icon: AtSign, // generic for TikTok (no official lucide icon)
    label: "TikTok",
    color: "#0F172A",
    bgGradient: "linear-gradient(135deg, #25F4EE, #0F172A, #FE2C55)",
  },
  web: {
    icon: Globe,
    label: "Web",
    color: "#0891B2",
    bgGradient: "linear-gradient(135deg, #0891B2, #7C3AED)",
  },
};

const FILTERS: Array<{ id: SocialPlatform | "all"; label: string }> = [
  { id: "all", label: "All Platforms" },
  { id: "x", label: "X" },
  { id: "telegram", label: "Telegram" },
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
];

function PostCard({ post }: { post: SocialPost }) {
  const meta = PLATFORM_META[post.platform];
  const Icon = meta.icon;
  const isExternal = post.url.startsWith("http");
  const isNew = post.hoursAgo <= 24;

  return (
    <motion.a
      href={post.url}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative block rounded-2xl overflow-hidden h-full"
      style={{
        background: "white",
        border: `1px solid rgba(15,23,42,0.06)`,
        boxShadow: "0 6px 20px -6px rgba(15,23,42,0.06)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${meta.color}30`;
        e.currentTarget.style.boxShadow = `0 25px 50px -12px ${meta.color}25, 0 8px 20px -4px rgba(15,23,42,0.06)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "rgba(15,23,42,0.06)";
        e.currentTarget.style.boxShadow = "0 6px 20px -6px rgba(15,23,42,0.06)";
      }}
    >
      {/* Top platform stripe */}
      <div className="h-1 w-full" style={{ background: meta.bgGradient }} />

      <div className="p-4 md:p-5">
        {/* Header: avatar + name + handle + platform */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${post.avatarGradient.from}, ${post.avatarGradient.to})`,
            }}
          >
            {post.initials}
            {post.countryCode && (
              <img
                src={getFlagUrl(post.countryCode, 40)}
                alt={`Flag of ${post.countryCode.toUpperCase()}`}
                loading="lazy"
                decoding="async"
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-slate-900 truncate">
                {post.author}
              </span>
              {post.verified && (
                <CheckCircle2
                  className="w-3.5 h-3.5 fill-current shrink-0"
                  style={{ color: meta.color }}
                />
              )}
            </div>
            <div className="text-xs text-slate-500 truncate">
              @{post.handle} · {relativeTime(post.hoursAgo)}
            </div>
          </div>
          {/* Platform icon */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: meta.bgGradient }}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-slate-700 leading-relaxed mb-3 whitespace-pre-line">
          {post.content}
        </p>

        {/* Optional emoji media tile */}
        {post.media && (
          <div
            className="relative rounded-xl overflow-hidden mb-3 aspect-video flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${post.media.gradient.from}, ${post.media.gradient.to})`,
            }}
          >
            <span
              className="text-7xl select-none"
              style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.3))" }}
            >
              {post.media.emoji}
            </span>
            <div
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
          </div>
        )}

        {/* Footer: badges + open link */}
        <div
          className="flex items-center gap-2 flex-wrap pt-3"
          style={{ borderTop: "1px solid rgba(15,23,42,0.04)" }}
        >
          {isNew && (
            <span
              className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-full"
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "white",
              }}
            >
              ✨ New
            </span>
          )}
          {post.pinned && (
            <span
              className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-full"
              style={{
                background: `${meta.color}15`,
                color: meta.color,
              }}
            >
              📌 Pinned
            </span>
          )}
          {post.badges?.map(b => (
            <span
              key={b}
              className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-full bg-slate-100 text-slate-600"
            >
              {b}
            </span>
          ))}
          <div className="ml-auto flex items-center gap-1 text-[11px] text-slate-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            View
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>
    </motion.a>
  );
}

export default function SocialWallSection() {
  const [activeFilter, setActiveFilter] = useState<SocialPlatform | "all">(
    "all"
  );

  // Auto-rotate the social wall daily — separate the pinned posts (always first,
  // never rotated) from the community posts (rotated + restamped each day).
  const dynamicPool = useMemo(() => {
    const pinned = SOCIAL_POSTS.filter(p => p.pinned);
    const community = SOCIAL_POSTS.filter(p => !p.pinned);
    // Rotate community posts by day so a different voice "just posted" each day
    return [...pinned, ...rotateAndRestamp(community)];
  }, []);

  const filtered = useMemo(() => {
    let list = dynamicPool;
    if (activeFilter !== "all") {
      list = list.filter(p => p.platform === activeFilter);
    }
    // Pinned first, then by recency
    return [...list].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.hoursAgo - b.hoursAgo;
    });
  }, [activeFilter, dynamicPool]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: SOCIAL_POSTS.length };
    SOCIAL_POSTS.forEach(p => {
      c[p.platform] = (c[p.platform] || 0) + 1;
    });
    return c;
  }, []);

  return (
    <section
      id="social-wall"
      className="section-spacing relative overflow-hidden"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(8,145,178,0.05), transparent 60%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="container">
        <SectionHeading
          label="The Social Wall"
          title="From Across the Globe"
          subtitle="Real voices from the Turbo Loop community — across X, Telegram, YouTube, Instagram, and beyond. Click any post to view the original."
        />

        {/* Live indicator + filters row */}
        <AnimatedSection delay={0.1}>
          <div className="flex flex-col items-center gap-4 mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(8,145,178,0.1))",
                border: "1px solid rgba(16,185,129,0.25)",
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-700">
                Live · {SOCIAL_POSTS.length} posts
              </span>
            </div>

            {/* Platform filters */}
            <div className="flex flex-wrap justify-center gap-2">
              {FILTERS.map(f => {
                const isActive = activeFilter === f.id;
                const meta = f.id === "all" ? null : PLATFORM_META[f.id];
                const count = counts[f.id] || 0;
                if (count === 0 && f.id !== "all") return null;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300"
                    style={{
                      background: isActive
                        ? meta
                          ? meta.bgGradient
                          : "linear-gradient(135deg, #0F172A, #334155)"
                        : "white",
                      color: isActive ? "white" : "#64748B",
                      border: `1px solid ${
                        isActive ? "transparent" : "rgba(15,23,42,0.08)"
                      }`,
                      boxShadow: isActive
                        ? `0 8px 20px -6px ${meta ? meta.color : "#0F172A"}40`
                        : "0 2px 6px -2px rgba(15,23,42,0.04)",
                    }}
                  >
                    {meta && <meta.icon className="w-3.5 h-3.5" />}
                    {f.label}
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: isActive
                          ? "rgba(255,255,255,0.25)"
                          : "rgba(15,23,42,0.06)",
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* Masonry-ish grid (3 cols on desktop, 2 on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((post, i) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400">No posts on this platform yet.</p>
          </div>
        )}

        {/* Tag-us-to-be-featured CTA */}
        <AnimatedSection delay={0.4}>
          <div
            className="relative mt-14 max-w-3xl mx-auto rounded-3xl overflow-hidden p-8 md:p-10 text-center"
            style={{
              background:
                "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 30px 60px -20px rgba(15,23,42,0.4)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse at top, rgba(8,145,178,0.25), transparent 60%)",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="relative">
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(8,145,178,0.2), rgba(124,58,237,0.2))",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <AtSign className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                Tag us. Be featured.
              </h3>
              <p className="text-slate-400 text-sm md:text-base mb-6 max-w-md mx-auto">
                Post about Turbo Loop on any platform with{" "}
                <span className="font-mono text-cyan-300">#TurboLoop</span> or{" "}
                <span className="font-mono text-cyan-300">@TurboLoop_io</span> —
                top posts get featured here every week.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="https://x.com/TurboLoop_io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                    color: "white",
                    boxShadow: "0 10px 30px -8px rgba(8,145,178,0.5)",
                  }}
                >
                  <Twitter className="w-4 h-4" />
                  Tag us on X
                </a>
                <a
                  href="https://t.me/TurboLoop_Chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "white",
                  }}
                >
                  <TelegramIcon className="w-4 h-4" />
                  Submit via Telegram
                </a>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

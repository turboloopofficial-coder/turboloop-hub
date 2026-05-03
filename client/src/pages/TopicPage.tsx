// /topic/:tag — SEO landing page that lists all blogs of a given topic.
// Each topic becomes a discoverable Google entry point that ranks for
// "turbo loop security", "turbo loop strategy", etc.

import { useMemo } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { SITE } from "@/lib/constants";
import {
  paletteForSlug,
  topicForSlug,
  publishDate,
  readingTime,
  type BlogPalette,
} from "@/lib/blogVisuals";
import SEOHead from "@/components/SEOHead";
import ReadingProgress from "@/components/ReadingProgress";
import BackToTop from "@/components/BackToTop";
import NotFound from "@/pages/NotFound";

// Topic slug → display config (must match the tags in lib/blogVisuals.ts)
const TOPIC_INFO: Record<
  string,
  {
    label: string;
    emoji: string;
    description: string;
    palette: BlogPalette;
    intro: string;
  }
> = {
  security: {
    label: "Security",
    emoji: "🛡",
    description:
      "Audits, renounced ownership, locked liquidity, and the bug bounty — the technical foundations that make Turbo Loop trustless.",
    palette: {
      from: "#0891B2",
      via: "#22D3EE",
      to: "#7C3AED",
      soft: "#CFFAFE",
    },
    intro:
      "Security in DeFi isn't a feature — it's the foundation. Every article here covers a technical pillar that you can verify yourself on BscScan.",
  },
  strategy: {
    label: "Strategy",
    emoji: "📈",
    description:
      "Compounding, yield mechanics, APY/APR math, and the strategies behind sustainable returns.",
    palette: {
      from: "#10B981",
      via: "#34D399",
      to: "#0891B2",
      soft: "#A7F3D0",
    },
    intro:
      "Math wins in DeFi. These strategy articles cover the mechanics behind sustainable yield, compounding cadence, and how to optimize your position over time.",
  },
  community: {
    label: "Community",
    emoji: "🌐",
    description:
      "Referrals, leadership ranks, Telegram groups, daily Zooms, and the global Turbo Loop community.",
    palette: {
      from: "#7C3AED",
      via: "#A78BFA",
      to: "#EC4899",
      soft: "#DDD6FE",
    },
    intro:
      "DeFi without community is just code. These articles cover how the Turbo Loop community is built — from local meetups to global leadership programs.",
  },
  roadmap: {
    label: "Roadmap",
    emoji: "🚀",
    description:
      "Where Turbo Loop is, where it's going, and what's been shipped so far.",
    palette: {
      from: "#EC4899",
      via: "#F472B6",
      to: "#7C3AED",
      soft: "#FCE7F3",
    },
    intro:
      "Six phases done, three to go. These articles track the project's progress and what's coming next.",
  },
  guide: {
    label: "Guides",
    emoji: "📘",
    description:
      "Step-by-step guides for getting started, avoiding mistakes, and using Turbo Loop confidently.",
    palette: {
      from: "#0EA5E9",
      via: "#0891B2",
      to: "#10B981",
      soft: "#E0F2FE",
    },
    intro:
      "Practical, hands-on guides for everyone from first-day users to power compounders.",
  },
  product: {
    label: "Product",
    emoji: "💱",
    description:
      "Deep dives on Turbo Swap, Turbo Buy, MoonPay integration, and the rest of the product surface.",
    palette: {
      from: "#D97706",
      via: "#FBBF24",
      to: "#EC4899",
      soft: "#FED7AA",
    },
    intro:
      "The product behind the protocol. How each piece works, why it exists, and how it ties together.",
  },
  protocol: {
    label: "Protocol",
    emoji: "⚙",
    description:
      "The Revenue Flywheel, the ecosystem, and the protocol-level mechanics that power Turbo Loop.",
    palette: {
      from: "#0891B2",
      via: "#10B981",
      to: "#F59E0B",
      soft: "#CFFAFE",
    },
    intro:
      "The protocol is the system. These articles cover how revenue flows, why it's sustainable, and how the pieces feed each other.",
  },
  tech: {
    label: "Technology",
    emoji: "⛓",
    description:
      "BSC vs Ethereum, blockchain transparency, on-chain mechanics, and the tech stack underneath.",
    palette: {
      from: "#0F172A",
      via: "#475569",
      to: "#7C3AED",
      soft: "#E0E7FF",
    },
    intro:
      "Tech-focused articles for users who want to understand what's actually running underneath.",
  },
  promo: {
    label: "Promotions",
    emoji: "🎁",
    description: "Active programs, bonuses, and community rewards.",
    palette: {
      from: "#F59E0B",
      via: "#EC4899",
      to: "#7C3AED",
      soft: "#FED7AA",
    },
    intro:
      "Live programs and limited-time opportunities for community members.",
  },
  concepts: {
    label: "Concepts",
    emoji: "🧮",
    description:
      "Concepts every DeFi user should know — explained clearly, with the Turbo Loop angle.",
    palette: {
      from: "#7C3AED",
      via: "#EC4899",
      to: "#0891B2",
      soft: "#DDD6FE",
    },
    intro:
      "Foundational concepts you need before going deep on any DeFi protocol.",
  },
  philosophy: {
    label: "Philosophy",
    emoji: "💎",
    description:
      "The 'why' behind Turbo Loop's design choices — including why there's no native token.",
    palette: {
      from: "#1E40AF",
      via: "#0891B2",
      to: "#22D3EE",
      soft: "#DBEAFE",
    },
    intro:
      "Why we built it this way. The philosophy and design choices behind the protocol.",
  },
};

const TOPIC_SLUGS = Object.keys(TOPIC_INFO);

export default function TopicPage() {
  const [, params] = useRoute("/topic/:tag");
  const tagSlug = (params?.tag || "").toLowerCase();
  const info = TOPIC_INFO[tagSlug];

  const { data: posts, isLoading } = trpc.content.blogPosts.useQuery();

  const filtered = useMemo(() => {
    if (!posts) return [];
    return posts
      .filter(
        p =>
          topicForSlug(p.slug).tag.toLowerCase() === info?.label.toLowerCase()
      )
      .sort((a, b) => publishDate(b).getTime() - publishDate(a).getTime());
  }, [posts, info]);

  if (!info) return <NotFound />;

  // SEO: ItemList schema + per-topic title/description for Google ranking
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://turboloop.tech/topic/${tagSlug}#page`,
        name: `${info.label} — Turbo Loop Blog`,
        description: info.description,
        url: `https://turboloop.tech/topic/${tagSlug}`,
        inLanguage: "en",
      },
      {
        "@type": "ItemList",
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        numberOfItems: filtered.length,
        itemListElement: filtered.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.title,
          url: `https://turboloop.tech/blog/${p.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://turboloop.tech",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: "https://turboloop.tech/feed",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: info.label,
            item: `https://turboloop.tech/topic/${tagSlug}`,
          },
        ],
      },
    ],
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #f0fdfa 100%)",
      }}
    >
      <SEOHead
        title={`${info.label} — Turbo Loop Blog`}
        description={info.description}
        path={`/topic/${tagSlug}`}
        type="website"
        image={`https://turboloop.tech/api/og?slug=topic-${tagSlug}`}
        jsonLd={jsonLd}
      />
      <ReadingProgress />
      <BackToTop />

      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/feed">
              <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                All Articles
              </button>
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <Link href="/">
              <span className="flex items-center gap-2 cursor-pointer">
                <img src={SITE.logo} alt="Turbo Loop" className="h-7 w-auto" />
                <span className="text-base font-bold">
                  <span className="text-slate-800">Turbo</span>
                  <span
                    style={{
                      background:
                        "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Loop
                  </span>
                </span>
              </span>
            </Link>
          </div>
          <a
            href={SITE.mainApp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-cyan-600 hover:text-cyan-700 transition-colors"
          >
            Launch App <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </header>

      <div className="container max-w-5xl py-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-slate-400 mb-6"
        >
          <Link href="/">
            <span className="hover:text-slate-600 cursor-pointer">Home</span>
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/feed">
            <span className="hover:text-slate-600 cursor-pointer">Blog</span>
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-500">{info.label}</span>
        </nav>

        {/* Topic hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden mb-10"
          style={{
            background: `linear-gradient(135deg, ${info.palette.from}, ${info.palette.via}, ${info.palette.to})`,
            boxShadow: `0 30px 60px -20px ${info.palette.from}40`,
          }}
        >
          {/* Animated shimmer */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.18) 45%, transparent 60%)",
              backgroundSize: "200% 200%",
            }}
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div
            className="absolute -right-2 -bottom-12 select-none pointer-events-none"
            style={{ fontSize: "20rem", lineHeight: 1, opacity: 0.85 }}
          >
            {info.emoji}
          </div>

          <div className="relative px-6 md:px-12 py-16 md:py-24 max-w-3xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.95)" }}
            >
              <span
                className="text-[10px] font-bold tracking-[0.25em] uppercase"
                style={{ color: info.palette.from }}
              >
                Topic · {filtered.length}{" "}
                {filtered.length === 1 ? "article" : "articles"}
              </span>
            </div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.05] mb-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {info.label}
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
              {info.intro}
            </p>
          </div>
        </motion.div>

        {/* Topic nav pills (link to other topics) */}
        <div className="flex flex-wrap gap-2 mb-10">
          {TOPIC_SLUGS.map(s => {
            const t = TOPIC_INFO[s];
            const isActive = s === tagSlug;
            return (
              <Link key={s} href={`/topic/${s}`}>
                <button
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all"
                  style={{
                    background: isActive ? t.palette.from : "white",
                    color: isActive ? "white" : "#64748B",
                    border: `1px solid ${isActive ? t.palette.from : "rgba(15,23,42,0.08)"}`,
                    boxShadow: isActive
                      ? `0 6px 16px -4px ${t.palette.from}50`
                      : "0 2px 6px -2px rgba(15,23,42,0.04)",
                  }}
                >
                  <span>{t.emoji}</span>
                  {t.label}
                </button>
              </Link>
            );
          })}
        </div>

        {/* Posts grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-72 rounded-2xl animate-pulse"
                style={{ background: "rgba(0,0,0,0.04)" }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400">
              No articles in this topic yet — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(post => {
              const palette = paletteForSlug(post.slug);
              const topic = topicForSlug(post.slug);
              return (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="group cursor-pointer rounded-2xl overflow-hidden h-full"
                    style={{
                      background: "white",
                      border: "1px solid rgba(15,23,42,0.06)",
                      boxShadow: "0 6px 20px -6px rgba(15,23,42,0.06)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = `${palette.from}25`;
                      e.currentTarget.style.boxShadow = `0 16px 40px -10px ${palette.from}30`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "rgba(15,23,42,0.06)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 20px -6px rgba(15,23,42,0.06)";
                    }}
                  >
                    <div
                      className="relative h-44 overflow-hidden flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${palette.from}, ${palette.via}, ${palette.to})`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "5.5rem",
                          filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.25))",
                        }}
                      >
                        {topic.emoji}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {publishDate(post).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {readingTime(post.content)} min
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight line-clamp-2 transition-colors group-hover:text-cyan-700">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4">
                          {post.excerpt}
                        </p>
                      )}
                      <div
                        className="inline-flex items-center gap-1.5 text-sm font-bold"
                        style={{ color: palette.from }}
                      >
                        Read article
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

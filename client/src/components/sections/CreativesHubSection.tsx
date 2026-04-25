import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Sparkles, Megaphone, Trophy, Star, BookOpen, Image as ImageIcon } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";
import ShareButton from "@/components/ShareButton";
import { CREATIVES, type Creative, type CreativeCategory } from "@/lib/creativesData";
import { getFlagUrl } from "@/lib/constants";

const CATEGORIES: { id: CreativeCategory | "all"; label: string; icon: any; color: string }[] = [
  { id: "all", label: "All", icon: ImageIcon, color: "#0F172A" },
  { id: "announcement", label: "Announcements", icon: Megaphone, color: "#0891B2" },
  { id: "promotion", label: "Promotions", icon: Sparkles, color: "#F59E0B" },
  { id: "milestone", label: "Milestones", icon: Trophy, color: "#10B981" },
  { id: "spotlight", label: "Spotlights", icon: Star, color: "#EC4899" },
  { id: "education", label: "Education", icon: BookOpen, color: "#7C3AED" },
];

function CreativeCard({ creative, onOpen }: { creative: Creative; onOpen: () => void }) {
  const isNew = creative.daysAgo <= 3;
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onOpen}
      className="group relative cursor-pointer rounded-2xl overflow-hidden h-full"
      style={{
        boxShadow: `0 12px 30px -10px ${creative.gradient.from}50`,
      }}
    >
      {/* Gradient cover */}
      <div
        className="relative aspect-[4/5] overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${creative.gradient.from} 0%, ${creative.gradient.via} 50%, ${creative.gradient.to} 100%)`,
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

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Big emoji center */}
        {creative.emoji && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className="text-9xl select-none transition-transform duration-700 group-hover:scale-110"
              style={{
                filter: "drop-shadow(0 8px 30px rgba(0,0,0,0.3))",
              }}
            >
              {creative.emoji}
            </span>
          </div>
        )}

        {/* NEW badge */}
        {isNew && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase"
            style={{
              background: "white",
              color: creative.gradient.from,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            ✨ New
          </div>
        )}

        {/* Country flag */}
        {creative.countryCode && (
          <div className="absolute top-3 right-3 w-8 h-6 rounded-md overflow-hidden border-2 border-white/40 shadow-lg">
            <img
              src={getFlagUrl(creative.countryCode, 40)}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Bottom gradient + text */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 mb-1">
            {creative.category}
          </div>
          <h3 className="text-base md:text-lg font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">
            {creative.title}
          </h3>
        </div>
      </div>

      {/* Footer with caption */}
      <div className="p-4 bg-white">
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-2">
          {creative.caption}
        </p>
        {creative.byline && (
          <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
            {creative.byline}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CreativeLightbox({
  creative,
  onClose,
}: {
  creative: Creative;
  onClose: () => void;
}) {
  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      style={{
        background: "rgba(15,23,42,0.7)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl rounded-3xl overflow-hidden bg-white my-auto"
        style={{ boxShadow: "0 40px 80px -20px rgba(15,23,42,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-700" />
        </button>

        {/* Big gradient header with emoji */}
        <div
          className="relative aspect-video overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${creative.gradient.from} 0%, ${creative.gradient.via} 50%, ${creative.gradient.to} 100%)`,
          }}
        >
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.2) 45%, transparent 60%)",
              backgroundSize: "200% 200%",
            }}
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {creative.emoji && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-[14rem] select-none"
                style={{
                  filter: "drop-shadow(0 12px 40px rgba(0,0,0,0.3))",
                }}
              >
                {creative.emoji}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full"
              style={{
                background: `${creative.gradient.from}15`,
                color: creative.gradient.from,
              }}
            >
              {creative.category}
            </div>
            {creative.daysAgo <= 3 && (
              <div
                className="text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, #10B981, #059669)",
                  color: "white",
                }}
              >
                ✨ New
              </div>
            )}
            <span className="text-xs text-slate-400 ml-auto">
              {creative.daysAgo === 0 ? "Today" : `${creative.daysAgo} days ago`}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 leading-tight">
            {creative.title}
          </h2>
          <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6">
            {creative.caption}
          </p>
          {creative.byline && (
            <div className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-6">
              {creative.byline}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-4" style={{ borderTop: "1px solid rgba(15,23,42,0.06)" }}>
            {creative.url && (
              <a
                href={creative.url}
                onClick={(e) => {
                  if (creative.url?.startsWith("/")) {
                    e.preventDefault();
                    onClose();
                    setTimeout(() => {
                      const id = creative.url!.split("#")[1];
                      if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                    }, 200);
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${creative.gradient.from}, ${creative.gradient.via})`,
                  color: "white",
                  boxShadow: `0 8px 24px -6px ${creative.gradient.from}60`,
                }}
              >
                Learn more
              </a>
            )}
            <ShareButton
              path={creative.url?.startsWith("/") ? creative.url : "/#creatives"}
              message={`${creative.emoji ?? ""} ${creative.title}\n\n${creative.caption}`}
              variant="ghost"
              label="Share"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}

export default function CreativesHubSection() {
  const [activeCategory, setActiveCategory] = useState<CreativeCategory | "all">("all");
  const [openCreative, setOpenCreative] = useState<Creative | null>(null);

  const filtered = useMemo(() => {
    let list = CREATIVES;
    if (activeCategory !== "all") {
      list = list.filter((c) => c.category === activeCategory);
    }
    return [...list].sort((a, b) => a.daysAgo - b.daysAgo);
  }, [activeCategory]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: CREATIVES.length };
    CREATIVES.forEach((cr) => {
      c[cr.category] = (c[cr.category] || 0) + 1;
    });
    return c;
  }, []);

  return (
    <section id="creatives" className="section-spacing relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div
          className="absolute top-20 -left-40 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.06), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-20 -right-40 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(8,145,178,0.06), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="container">
        <SectionHeading
          label="Creatives & Banners"
          title="The Visual Story"
          subtitle="Announcements, milestones, member spotlights, and campaigns — all in one place."
        />

        {/* Category tabs */}
        <AnimatedSection delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              const count = counts[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300"
                  style={{
                    background: isActive ? cat.color : "white",
                    color: isActive ? "white" : "#64748B",
                    border: `1px solid ${isActive ? cat.color : "rgba(15,23,42,0.08)"}`,
                    boxShadow: isActive
                      ? `0 8px 20px -6px ${cat.color}50`
                      : "0 2px 6px -2px rgba(15,23,42,0.04)",
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
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
        </AnimatedSection>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((creative, i) => (
              <motion.div
                key={creative.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
              >
                <CreativeCard
                  creative={creative}
                  onOpen={() => setOpenCreative(creative)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400">No creatives in this category yet.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {openCreative && (
          <CreativeLightbox
            creative={openCreative}
            onClose={() => setOpenCreative(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

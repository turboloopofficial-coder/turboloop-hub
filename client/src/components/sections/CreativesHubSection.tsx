import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Download, Sparkles, ImageIcon } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";
import ShareButton from "@/components/ShareButton";
import { ALL_CREATIVES, CREATIVE_CATEGORIES, bannersForCategory, type CreativeBanner } from "@/lib/creativesData";

const PAGE_SIZE = 24;

function CreativeCard({ banner, onOpen }: { banner: CreativeBanner; onOpen: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onClick={onOpen}
      className="group relative cursor-pointer rounded-2xl overflow-hidden aspect-square"
      style={{
        background: `linear-gradient(135deg, ${banner.palette.from}10, ${banner.palette.via}08)`,
        boxShadow: `0 12px 30px -12px ${banner.palette.from}30`,
      }}
    >
      <img
        src={banner.url}
        alt={banner.categoryLabel}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md text-[10px] font-bold tracking-[0.15em] uppercase"
        style={{ background: "rgba(255,255,255,0.95)", color: banner.palette.from }}
      >
        <span>{banner.emoji}</span>
        <span>{banner.categoryLabel.replace(/^P\d+\s*·\s*/, "")}</span>
      </div>
    </motion.div>
  );
}

function Lightbox({ banner, onClose }: { banner: CreativeBanner; onClose: () => void }) {
  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(15,23,42,0.78)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl rounded-3xl overflow-hidden bg-white my-auto"
        style={{ boxShadow: "0 40px 80px -20px rgba(15,23,42,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-lg flex items-center justify-center transition"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-700" />
        </button>

        <div className="relative bg-black aspect-square md:aspect-[4/5]">
          <img
            src={banner.url}
            alt={banner.categoryLabel}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="p-6 md:p-7">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div
              className="text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full"
              style={{ background: `${banner.palette.from}15`, color: banner.palette.from }}
            >
              {banner.emoji} {banner.categoryLabel}
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 leading-tight">
            {banner.categoryLabel}
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={banner.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${banner.palette.from}, ${banner.palette.via})`,
                color: "white",
                boxShadow: `0 8px 24px -6px ${banner.palette.from}60`,
              }}
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            <ShareButton
              path="/#creatives"
              message={`${banner.emoji} Turbo Loop · ${banner.categoryLabel}\n\nFresh creative from the Turbo Loop community library.`}
              variant="ghost"
              label="Share"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}

export default function CreativesHubSection() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openBanner, setOpenBanner] = useState<CreativeBanner | null>(null);
  const [shown, setShown] = useState<number>(PAGE_SIZE);

  const filtered = useMemo(() => bannersForCategory(activeCategory), [activeCategory]);
  const visible = filtered.slice(0, shown);
  const hasMore = shown < filtered.length;

  return (
    <section id="creatives" className="section-spacing relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div
          className="absolute top-20 -left-40 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.06), transparent 70%)", filter: "blur(60px)" }}
        />
        <div
          className="absolute bottom-20 -right-40 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(8,145,178,0.06), transparent 70%)", filter: "blur(60px)" }}
        />
      </div>

      <div className="container">
        <SectionHeading
          label="Creatives Library"
          title="The Visual Story"
          subtitle={`${ALL_CREATIVES.length} designed banners across ${CREATIVE_CATEGORIES.length} pillars — every one downloadable, every one shareable.`}
        />

        {/* Category filter pills */}
        <AnimatedSection delay={0.05}>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => { setActiveCategory("all"); setShown(PAGE_SIZE); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all"
              style={{
                background: activeCategory === "all" ? "#0F172A" : "white",
                color: activeCategory === "all" ? "white" : "#64748B",
                border: `1px solid ${activeCategory === "all" ? "#0F172A" : "rgba(15,23,42,0.08)"}`,
                boxShadow: activeCategory === "all" ? "0 8px 20px -6px rgba(15,23,42,0.4)" : "0 2px 6px -2px rgba(15,23,42,0.04)",
              }}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              All
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: activeCategory === "all" ? "rgba(255,255,255,0.25)" : "rgba(15,23,42,0.06)" }}
              >
                {ALL_CREATIVES.length}
              </span>
            </button>
            {CREATIVE_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setShown(PAGE_SIZE); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all"
                  style={{
                    background: isActive ? "#0F172A" : "white",
                    color: isActive ? "white" : "#64748B",
                    border: `1px solid ${isActive ? "#0F172A" : "rgba(15,23,42,0.08)"}`,
                    boxShadow: isActive ? "0 8px 20px -6px rgba(15,23,42,0.4)" : "0 2px 6px -2px rgba(15,23,42,0.04)",
                  }}
                >
                  <span>{cat.emoji}</span>
                  {cat.label.replace(/^P\d+\s*·\s*/, "")}
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: isActive ? "rgba(255,255,255,0.25)" : "rgba(15,23,42,0.06)" }}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </AnimatedSection>

        {/* Banner grid — Pinterest-style square tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          <AnimatePresence mode="popLayout">
            {visible.map((banner, i) => (
              <motion.div
                key={banner.slug}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.25) }}
              >
                <CreativeCard banner={banner} onOpen={() => setOpenBanner(banner)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {hasMore && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setShown((s) => s + PAGE_SIZE)}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                color: "white",
                boxShadow: "0 12px 30px -8px rgba(8,145,178,0.5)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load more — {filtered.length - shown} remaining
            </button>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400">No banners in this category yet.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {openBanner && <Lightbox banner={openBanner} onClose={() => setOpenBanner(null)} />}
      </AnimatePresence>
    </section>
  );
}

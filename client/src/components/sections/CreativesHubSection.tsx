import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Download, Sparkles, ImageIcon, Copy, Check } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";
import ShareButton from "@/components/ShareButton";
import {
  ALL_CREATIVES,
  CREATIVE_CATEGORIES,
  bannersForCategory,
  bannerShareText,
  stripMarkdown,
  type CreativeBanner,
} from "@/lib/creativesData";

const PAGE_SIZE = 12;

// =====================================================================
// Card — Instagram-style: image on top, caption + actions below
// =====================================================================
function CreativeCard({ banner, onOpen }: { banner: CreativeBanner; onOpen: () => void }) {
  const headline = stripMarkdown(banner.headline || banner.categoryLabel);
  const captionPreview = stripMarkdown(banner.caption || "").slice(0, 180);
  const hashtagsLine = (banner.hashtags || []).slice(0, 4).join(" ");

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group rounded-2xl overflow-hidden flex flex-col h-full"
      style={{
        background: "white",
        border: "1px solid rgba(15,23,42,0.06)",
        boxShadow: "0 6px 18px -6px rgba(15,23,42,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 18px 40px -10px ${banner.palette.from}30`;
        e.currentTarget.style.borderColor = `${banner.palette.from}25`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 18px -6px rgba(15,23,42,0.06)";
        e.currentTarget.style.borderColor = "rgba(15,23,42,0.06)";
      }}
    >
      {/* Image — clickable to open lightbox */}
      <button
        type="button"
        onClick={onOpen}
        className="relative aspect-square w-full overflow-hidden cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${banner.palette.from}10, ${banner.palette.via}08)`,
        }}
      >
        <img
          src={banner.url}
          alt={headline}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Top-left category badge */}
        <div
          className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md text-[10px] font-bold tracking-[0.15em] uppercase"
          style={{ background: "rgba(255,255,255,0.95)", color: banner.palette.from }}
        >
          <span>{banner.emoji}</span>
          <span>{banner.categoryLabel.replace(/^P\d+\s*·\s*/, "")}</span>
        </div>
        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="px-3 py-1.5 rounded-full text-xs font-bold text-white bg-black/60 backdrop-blur-sm">
            Click to expand
          </div>
        </div>
      </button>

      {/* Caption block — Instagram feel */}
      <div className="p-4 flex-1 flex flex-col">
        {headline && (
          <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2 line-clamp-2">
            {headline}
          </h3>
        )}
        {captionPreview && (
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
            {captionPreview}…
          </p>
        )}
        {hashtagsLine && (
          <p
            className="text-[10px] font-medium leading-relaxed line-clamp-1 mb-3 mt-auto"
            style={{ color: banner.palette.from }}
          >
            {hashtagsLine}
          </p>
        )}

        {/* Action row */}
        <div
          className="flex items-center gap-2 pt-3"
          style={{ borderTop: "1px solid rgba(15,23,42,0.05)" }}
        >
          <button
            onClick={onOpen}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all"
            style={{
              background: `${banner.palette.from}10`,
              color: banner.palette.from,
            }}
          >
            View full
          </button>
          <a
            href={banner.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-110"
            style={{ background: "rgba(15,23,42,0.04)", color: "#475569" }}
            aria-label="Download banner"
            title="Download"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
          <div onClick={(e) => e.stopPropagation()}>
            <ShareButton
              path="/#creatives"
              message={bannerShareText(banner)}
              variant="icon"
              className="!w-8 !h-8"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================================
// Lightbox — full image + full caption + Copy buttons + Share
// =====================================================================
function Lightbox({ banner, onClose }: { banner: CreativeBanner; onClose: () => void }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const headline = stripMarkdown(banner.headline || banner.categoryLabel);
  const caption = stripMarkdown(banner.caption || "");
  const fact = stripMarkdown(banner.fact || "");
  const hashtags = (banner.hashtags || []).join(" ");

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((c) => (c === key ? null : c)), 1800);
    } catch {}
  };

  const fullShareText = bannerShareText(banner);

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      style={{
        background: "rgba(15,23,42,0.78)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl rounded-3xl overflow-hidden bg-white my-auto"
        style={{ boxShadow: "0 40px 80px -20px rgba(15,23,42,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-lg flex items-center justify-center transition"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-700" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image side */}
          <div className="relative bg-black aspect-square md:aspect-auto md:min-h-[640px]">
            <img
              src={banner.url}
              alt={headline}
              className="absolute inset-0 w-full h-full object-contain"
            />
            <div
              className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md"
              style={{ background: "rgba(255,255,255,0.95)" }}
            >
              <span>{banner.emoji}</span>
              <span
                className="text-[10px] font-bold tracking-[0.2em] uppercase"
                style={{ color: banner.palette.from }}
              >
                {banner.categoryLabel}
              </span>
            </div>
          </div>

          {/* Caption side */}
          <div className="p-6 md:p-8 flex flex-col">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight mb-4">
              {headline}
            </h2>

            {caption && (
              <div
                className="text-sm md:text-base text-slate-700 leading-relaxed mb-5 whitespace-pre-line"
                style={{ maxHeight: "260px", overflowY: "auto" }}
              >
                {caption}
              </div>
            )}

            {fact && (
              <div
                className="rounded-xl p-4 mb-5"
                style={{
                  background: `${banner.palette.from}08`,
                  borderLeft: `3px solid ${banner.palette.from}`,
                }}
              >
                <div
                  className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1"
                  style={{ color: banner.palette.from }}
                >
                  The Fact
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{fact}</p>
              </div>
            )}

            {hashtags && (
              <p
                className="text-xs font-medium leading-relaxed mb-5"
                style={{ color: banner.palette.from }}
              >
                {hashtags}
              </p>
            )}

            {/* Action row */}
            <div className="mt-auto pt-5 flex flex-wrap items-center gap-2"
              style={{ borderTop: "1px solid rgba(15,23,42,0.06)" }}
            >
              <button
                onClick={() => copy(fullShareText, "all")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                style={{
                  background: copiedKey === "all"
                    ? "linear-gradient(135deg, #10B981, #059669)"
                    : `linear-gradient(135deg, ${banner.palette.from}, ${banner.palette.via})`,
                  color: "white",
                  boxShadow: copiedKey === "all"
                    ? "0 6px 16px -4px rgba(16,185,129,0.5)"
                    : `0 6px 16px -4px ${banner.palette.from}50`,
                }}
              >
                {copiedKey === "all" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === "all" ? "Copied!" : "Copy caption"}
              </button>

              {caption && (
                <button
                  onClick={() => copy(stripMarkdown(banner.caption || ""), "caption-only")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 transition-all"
                  style={{
                    background: copiedKey === "caption-only" ? "rgba(16,185,129,0.12)" : "rgba(15,23,42,0.04)",
                    border: "1px solid rgba(15,23,42,0.06)",
                  }}
                >
                  {copiedKey === "caption-only" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "caption-only" ? "Done" : "Caption only"}
                </button>
              )}

              <a
                href={banner.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 transition-all"
                style={{
                  background: "rgba(15,23,42,0.04)",
                  border: "1px solid rgba(15,23,42,0.06)",
                }}
              >
                <Download className="w-3.5 h-3.5" />
                Image
              </a>

              <ShareButton
                path="/#creatives"
                message={fullShareText}
                variant="ghost"
                label="Share"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}

// =====================================================================
// Section
// =====================================================================
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
          subtitle={`${ALL_CREATIVES.length} ready-to-share posts. Tap any banner to copy the caption or share with your network.`}
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

        {/* Instagram-style 3-column grid (responsive: 1/2/3 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          <AnimatePresence mode="popLayout">
            {visible.map((banner, i) => (
              <motion.div
                key={banner.slug}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
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

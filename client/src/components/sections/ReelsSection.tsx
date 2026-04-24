import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Volume2, VolumeX, X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

export default function ReelsSection() {
  const { data: videos } = trpc.content.videos.useQuery();
  const reels = (videos ?? []).filter(v => v.directUrl && !v.youtubeUrl);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [muted, setMuted] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  if (reels.length === 0) return null;

  return (
    <section id="reels" className="relative py-20 overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 50%, rgba(124,58,237,0.05) 0%, transparent 40%), radial-gradient(circle at 80% 50%, rgba(8,145,178,0.05) 0%, transparent 40%)",
        }}
      />

      <div className="container relative z-10">
        <div className="flex items-center justify-between mb-10 px-5 md:px-0">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 bg-gradient-to-r from-purple-100 to-cyan-100 border border-purple-200/50">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs font-semibold tracking-wider text-purple-700 uppercase">New Reels</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="text-slate-800">Watch The </span>
              <span
                style={{
                  background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Movement
              </span>
            </h2>
            <p className="text-slate-500 mt-2 max-w-xl">
              Short explainers on why Turbo Loop is the safest, most transparent yield protocol in DeFi.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scrollBy(-400)}
              className="w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-cyan-400 hover:shadow-lg transition-all flex items-center justify-center"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => scrollBy(400)}
              className="w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-cyan-400 hover:shadow-lg transition-all flex items-center justify-center"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-8 px-5 md:px-0 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {reels.map((reel, i) => (
            <ReelCard key={reel.id} reel={reel} index={i} onOpen={() => setActiveIndex(i)} />
          ))}
        </div>
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setActiveIndex(null)}
          >
            <button
              onClick={() => setActiveIndex(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setMuted(m => !m); }}
              className="absolute top-6 right-24 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
            </button>
            {activeIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setActiveIndex(Math.max(0, activeIndex - 1)); }}
                className="absolute left-4 md:left-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}
            {activeIndex < reels.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setActiveIndex(Math.min(reels.length - 1, activeIndex + 1)); }}
                className="absolute right-4 md:right-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}
            <motion.div
              key={activeIndex}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md mx-4"
              style={{ aspectRatio: "9 / 16", maxHeight: "90vh" }}
            >
              <video
                src={reels[activeIndex].directUrl!}
                autoPlay
                muted={muted}
                playsInline
                controls={false}
                loop
                className="w-full h-full object-cover rounded-2xl shadow-[0_25px_80px_-20px_rgba(0,0,0,0.5)]"
              />
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1 text-white">
                <h3 className="text-xl font-bold drop-shadow-lg">{reels[activeIndex].title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ReelCard({ reel, index, onOpen }: { reel: any; index: number; onOpen: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (hovered) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [hovered]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      className="relative shrink-0 cursor-pointer snap-start group"
      style={{ width: "min(260px, 70vw)", aspectRatio: "9 / 16" }}
    >
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden transition-all duration-500 group-hover:scale-[1.02]"
        style={{
          boxShadow: "0 12px 40px -8px rgba(0,0,0,0.15), 0 4px 16px -2px rgba(8,145,178,0.1)",
        }}
      >
        <video
          ref={videoRef}
          src={reel.directUrl}
          muted
          playsInline
          preload="metadata"
          loop
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 group-hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.9)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
            }}
          >
            <Play className="w-5 h-5 text-slate-800 ml-0.5 fill-slate-800" />
          </div>
        </div>
        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h4 className="text-sm font-semibold leading-tight line-clamp-2 drop-shadow-lg">
            {reel.title}
          </h4>
        </div>
        {/* Top-right badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-white/20 backdrop-blur-md border border-white/20 text-white">
          Reel
        </div>
      </div>
    </motion.div>
  );
}

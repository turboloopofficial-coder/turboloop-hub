import { useEffect, useRef, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, X, ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import ShareButton from "@/components/ShareButton";

/** Derive thumbnail URL from the reel's video URL.
 *  video: https://<r2>/reels/slug.mp4  →  thumb: https://<r2>/reel-thumbs/slug.jpg
 */
function thumbForReel(videoUrl: string): string {
  try {
    const u = new URL(videoUrl);
    u.pathname = u.pathname.replace(/^\/reels\//, "/reel-thumbs/").replace(/\.mp4$/i, ".jpg");
    return u.toString();
  } catch {
    return "";
  }
}

export default function ReelsSection() {
  const { data: videos } = trpc.content.videos.useQuery();
  const reels = (videos ?? []).filter(v => v.directUrl && !v.youtubeUrl);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(() => {
    setActiveIndex((i) => (i === null ? i : Math.min(reels.length - 1, i + 1)));
  }, [reels.length]);
  const prev = useCallback(() => {
    setActiveIndex((i) => (i === null ? i : Math.max(0, i - 1)));
  }, []);

  // ESC to close, arrow keys to navigate
  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [activeIndex, close, next, prev]);

  if (reels.length === 0) return null;

  return (
    <section id="reels" className="relative py-16 md:py-20 overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 50%, rgba(124,58,237,0.05) 0%, transparent 40%), radial-gradient(circle at 80% 50%, rgba(8,145,178,0.05) 0%, transparent 40%)",
        }}
      />

      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-10 gap-4 px-5 md:px-0">
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
          className="flex gap-4 md:gap-5 overflow-x-auto pb-6 px-5 md:px-0 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {reels.map((reel, i) => (
            <ReelCard key={reel.id} reel={reel} index={i} onOpen={() => setActiveIndex(i)} isDimmed={activeIndex !== null} />
          ))}
        </div>
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {activeIndex !== null && (
          <ReelPlayer
            reel={reels[activeIndex]}
            hasPrev={activeIndex > 0}
            hasNext={activeIndex < reels.length - 1}
            onClose={close}
            onNext={next}
            onPrev={prev}
            position={`${activeIndex + 1} / ${reels.length}`}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function ReelCard({ reel, index, onOpen, isDimmed }: { reel: any; index: number; onOpen: () => void; isDimmed: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (hovered && !isDimmed) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [hovered, isDimmed]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      className="relative shrink-0 cursor-pointer snap-start group"
      style={{ width: "min(260px, 68vw)", aspectRatio: "9 / 16" }}
    >
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]"
        style={{
          boxShadow: "0 12px 40px -8px rgba(0,0,0,0.15), 0 4px 16px -2px rgba(8,145,178,0.1)",
        }}
      >
        {/* Poster thumbnail — shows instantly, no black frame */}
        <img
          src={thumbForReel(reel.directUrl)}
          alt={reel.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          style={{ opacity: hovered ? 0 : 1, transition: "opacity 0.25s" }}
        />
        <video
          ref={videoRef}
          src={reel.directUrl}
          poster={thumbForReel(reel.directUrl)}
          muted
          playsInline
          preload="none"
          loop
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.25s" }}
        />
        {/* Dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 group-hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.95)",
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

function ReelPlayer({
  reel,
  hasPrev,
  hasNext,
  onClose,
  onNext,
  onPrev,
  position,
}: {
  reel: any;
  hasPrev: boolean;
  hasNext: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  position: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.muted = muted;
    const onTime = () => setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
    const onWaiting = () => setLoading(true);
    const onPlaying = () => { setLoading(false); setPlaying(true); };
    const onPause = () => setPlaying(false);
    const onLoaded = () => setLoading(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);
    v.addEventListener("loadeddata", onLoaded);
    // Start playback — if unmuted autoplay is blocked, fall back to muted
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().catch(() => {});
    });
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("loadeddata", onLoaded);
    };
  }, [reel.id]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.muted = muted;
  }, [muted]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  };

  const shareMessage = `🔥 ${reel.title} — watch this short on Turbo Loop, the complete DeFi ecosystem on Binance Smart Chain.`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl"
      onClick={onClose}
    >
      {/* FLOATING CLOSE BUTTON — always visible, top-right corner, impossible to miss */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-30 group flex items-center gap-2 pl-3 pr-5 py-3 rounded-full bg-white hover:bg-red-50 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-200 hover:scale-105"
        aria-label="Close (Esc)"
        style={{ animation: "closeBtnPulse 2.2s ease-in-out infinite" }}
      >
        <span className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg group-hover:from-red-600 group-hover:to-red-700 transition">
          <X className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={3} />
        </span>
        <span className="text-slate-800 text-sm md:text-base font-bold">Close</span>
      </button>

      <style>{`
        @keyframes closeBtnPulse {
          0%, 100% { box-shadow: 0 8px 30px rgba(0,0,0,0.5), 0 0 0 0 rgba(239,68,68,0.45); }
          50%      { box-shadow: 0 8px 30px rgba(0,0,0,0.5), 0 0 0 14px rgba(239,68,68,0); }
        }
      `}</style>

      {/* Top bar (left side only — counter + mute + share) */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-4 md:p-6 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <span className="text-white/70 text-sm md:text-base font-mono tracking-wider bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {position}
          </span>
        </div>
        {/* Spacer for close button (positioned absolute above) */}
        <div className="flex items-center gap-2 pointer-events-auto" style={{ marginRight: "140px" }}>
          <button
            onClick={(e) => { e.stopPropagation(); setMuted(m => !m); }}
            className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 flex items-center justify-center transition"
            aria-label={muted ? "Unmute" : "Mute"}
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
          </button>
          <div onClick={(e) => e.stopPropagation()}>
            <ShareButton
              path="/#reels"
              message={shareMessage}
              variant="icon"
              className="!w-11 !h-11 !bg-white/15 hover:!bg-white/25 !border-white/20 !text-white"
            />
          </div>
        </div>
      </div>

      {/* Side nav */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center transition z-10"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center transition z-10"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Video container */}
      <div className="absolute inset-0 flex items-center justify-center px-4 md:px-8 py-20 md:py-16">
        <motion.div
          key={reel.id}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative h-full w-full max-w-md mx-auto flex items-center justify-center"
        >
          <div
            className="relative rounded-2xl overflow-hidden bg-black"
            style={{ aspectRatio: "9 / 16", maxHeight: "calc(100vh - 180px)" }}
          >
            <video
              ref={videoRef}
              src={reel.directUrl}
              poster={thumbForReel(reel.directUrl)}
              autoPlay
              playsInline
              loop
              controls={false}
              preload="auto"
              onClick={togglePlay}
              className="h-full w-full object-contain cursor-pointer"
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                <Loader2 className="w-10 h-10 text-white/80 animate-spin" />
              </div>
            )}
            {/* Play/pause overlay when paused */}
            {!playing && !loading && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30"
                aria-label="Play"
              >
                <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl">
                  <Play className="w-8 h-8 text-slate-900 ml-1 fill-slate-900" />
                </div>
              </button>
            )}
            {/* Title + progress overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
              <h3 className="text-white text-base md:text-lg font-semibold drop-shadow-lg">{reel.title}</h3>
            </div>
            {/* Progress bar at top */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white/40 text-[11px] tracking-wider uppercase pointer-events-none">
        Tap video to play/pause · Esc or ✕ to close · ← → to switch
      </div>
    </motion.div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import {
  ArrowLeft,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronRight,
  Download,
} from "lucide-react";
import { SITE } from "@/lib/constants";
import SEOHead from "@/components/SEOHead";
import ShareButton from "@/components/ShareButton";
import NotFound from "@/pages/NotFound";

/** Download a reel as a true file (instead of opening in browser). */
async function downloadReel(videoUrl: string, title: string) {
  try {
    const res = await fetch(videoUrl);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    const safeName = title
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "_")
      .slice(0, 80);
    a.download = `TurboLoop_${safeName}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch {
    window.open(videoUrl, "_blank", "noopener,noreferrer");
  }
}

function slugFromUrl(videoUrl: string): string | null {
  try {
    const u = new URL(videoUrl);
    const m = u.pathname.match(/\/reels\/([a-z0-9-]+)\.mp4$/i);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function thumbForReel(videoUrl: string): string {
  try {
    const u = new URL(videoUrl);
    u.pathname = u.pathname
      .replace(/^\/reels\//, "/reel-thumbs/")
      .replace(/\.mp4$/i, ".jpg");
    return u.toString();
  } catch {
    return "";
  }
}

export default function ReelPage() {
  const [, params] = useRoute("/reels/:slug");
  const slug = params?.slug || "";
  const { data: allVideos } = trpc.content.videos.useQuery();
  const reels = useMemo(
    () => (allVideos ?? []).filter(v => v.directUrl),
    [allVideos]
  );
  const reel = useMemo(
    () => reels.find(v => slugFromUrl(v.directUrl!) === slug),
    [reels, slug]
  );
  const others = useMemo(
    () => reels.filter(v => v.id !== reel?.id).slice(0, 6),
    [reels, reel]
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().catch(() => {});
    });
  }, [reel?.id, muted]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const thumb = reel ? thumbForReel(reel.directUrl!) : undefined;

  const jsonLd = reel
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: reel.title,
        description: `${reel.title} — a short explainer from Turbo Loop, the complete DeFi ecosystem on BSC.`,
        thumbnailUrl: thumb,
        uploadDate:
          typeof reel.createdAt === "string"
            ? reel.createdAt
            : new Date(reel.createdAt).toISOString(),
        contentUrl: reel.directUrl,
        embedUrl: `https://turboloop.tech/reels/${slug}`,
        publisher: {
          "@type": "Organization",
          name: "Turbo Loop",
          logo: {
            "@type": "ImageObject",
            url: "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/branding/turboloop-logo.png",
          },
        },
      }
    : undefined;

  return (
    <div
      className="min-h-[100dvh]"
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
      }}
    >
      {reel && (
        <SEOHead
          title={`${reel.title} | Turbo Loop Reels`}
          description={`${reel.title} — watch this short explainer on Turbo Loop, the complete DeFi ecosystem on Binance Smart Chain.`}
          path={`/reels/${slug}`}
          type="video.other"
          image={thumb}
          jsonLd={jsonLd}
        />
      )}

      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-white/10"
        style={{
          background: "rgba(15,23,42,0.85)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Home
              </button>
            </Link>
            <div className="h-5 w-px bg-white/15" />
            <Link href="/">
              <span className="text-base font-bold cursor-pointer">
                <span className="text-white">Turbo</span>
                <span className="text-cyan-400">Loop</span>
              </span>
            </Link>
          </div>
          <a
            href={SITE.mainApp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Launch App <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </header>

      <div className="container py-8 md:py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-white/40 mb-6"
        >
          <Link href="/">
            <span className="hover:text-white/60 cursor-pointer">Home</span>
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="hover:text-white/60">Reels</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white/70 truncate max-w-[200px]">
            {reel?.title || "Loading…"}
          </span>
        </nav>

        {reel ? (
          <div className="grid md:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {/* Video */}
            <div className="md:col-span-3">
              <div
                className="relative rounded-2xl overflow-hidden bg-black shadow-2xl"
                style={{
                  aspectRatio: "9 / 16",
                  maxHeight: "80dvh",
                  transform: "translateZ(0)",
                }}
              >
                <video
                  ref={videoRef}
                  src={reel.directUrl!}
                  poster={thumb}
                  autoPlay
                  playsInline
                  loop
                  muted={muted}
                  onClick={togglePlay}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  className="h-full w-full object-contain cursor-pointer"
                />
                {!playing && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/30"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl">
                      <Play className="w-8 h-8 text-slate-900 ml-1 fill-slate-900" />
                    </div>
                  </button>
                )}
                <button
                  onClick={() => setMuted(m => !m)}
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 flex items-center justify-center transition"
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Info + share */}
            <div className="md:col-span-2 text-white">
              <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-3">
                {reel.title}
              </h1>
              <p className="text-white/60 text-sm leading-relaxed mb-5">
                A short explainer on why Turbo Loop is the safest, most
                transparent yield protocol in DeFi. Watch more reels and
                discover the complete ecosystem.
              </p>

              <ShareButton
                path={`/reels/${slug}`}
                message={`🎬 ${reel.title} — watch on Turbo Loop`}
                label="Share this reel"
                variant="solid"
                className="w-full !justify-center"
              />

              <button
                onClick={() =>
                  reel.directUrl && downloadReel(reel.directUrl, reel.title)
                }
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-bold transition-all hover:scale-[1.02]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(167,139,250,0.15))",
                  color: "white",
                  border: "1px solid rgba(34,211,238,0.35)",
                }}
              >
                <Download className="w-4 h-4" />
                Download MP4
              </button>

              <a
                href={SITE.mainApp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                Launch App <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="text-[11px] tracking-wider uppercase text-white/40 mb-3">
                  More Reels
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {others.map(o => {
                    const oSlug = slugFromUrl(o.directUrl!) || "";
                    return (
                      <Link key={o.id} href={`/reels/${oSlug}`}>
                        <div
                          className="group relative rounded-lg overflow-hidden cursor-pointer"
                          style={{ aspectRatio: "9 / 16" }}
                        >
                          <img
                            src={thumbForReel(o.directUrl!)}
                            alt={o.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-1.5 text-white text-[10px] font-semibold leading-tight line-clamp-2">
                            {o.title}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : allVideos !== undefined ? (
          <NotFound />
        ) : null}
      </div>
    </div>
  );
}

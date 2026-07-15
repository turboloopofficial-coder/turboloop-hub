"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

const VIDEO_URL =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/videos/turboloop-explainer-ar.mp4";
const THUMBNAIL_URL =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/videos/turboloop-explainer-ar-thumb.jpg";

export function VideoExplainerSection() {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
      setMuted(false);
      videoRef.current.muted = false;
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-radial from-cyan-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
            Deep Dive
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            See How TurboLoop Works
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A 20-minute breakdown covering security audits, smart contract architecture,
            and how your USDT earns fixed returns on BNB Smart Chain.
          </p>
        </div>

        {/* Video Player */}
        <div className="relative group rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-500/10 bg-black/50 backdrop-blur-sm">
          {/* Aspect ratio container */}
          <div className="relative aspect-video">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              poster={THUMBNAIL_URL}
              preload="none"
              muted={muted}
              playsInline
              onEnded={() => setPlaying(false)}
            >
              <source src={VIDEO_URL} type="video/mp4" />
            </video>

            {/* Play overlay (shown when not playing) */}
            {!playing && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30 transition-all hover:bg-black/20"
                onClick={handlePlay}
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-cyan-500/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-transform hover:scale-110">
                  <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="white" />
                </div>
              </div>
            )}

            {/* Controls bar (shown when playing) */}
            {playing && (
              <div
                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlay}
                    className="text-white hover:text-cyan-400 transition-colors"
                  >
                    <Pause className="w-6 h-6" />
                  </button>
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-cyan-400 transition-colors"
                  >
                    {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={handleFullscreen}
                    className="text-white hover:text-cyan-400 transition-colors"
                  >
                    <Maximize className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom info bar */}
          <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-gray-400">Arabic • 20 min • Full HD</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">SolidityScan 99.99</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">HazeCrypto Audited</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

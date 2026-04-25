import { motion } from "framer-motion";
import { SITE } from "@/lib/constants";

export default function PageLoader() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: "#F7F8FC" }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo orb */}
        <div className="relative w-24 h-24">
          {/* Pulsing outer ring */}
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(8,145,178,0.3), transparent 70%)",
            }}
          />
          {/* Spinning gradient ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, #0891B2 90deg, #7C3AED 180deg, transparent 360deg)",
              padding: "2px",
              maskImage:
                "radial-gradient(circle, transparent 60%, black 62%)",
              WebkitMaskImage:
                "radial-gradient(circle, transparent 60%, black 62%)",
            }}
          />
          {/* Real logo in the center */}
          <div className="absolute inset-3 rounded-full flex items-center justify-center bg-white p-2">
            <img
              src={SITE.logo}
              alt="Turbo Loop"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="text-center">
          <div
            className="text-sm font-bold tracking-[0.3em] uppercase"
            style={{
              background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Turbo Loop
          </div>
          <div className="text-xs text-slate-400 mt-1 tracking-wider">Loading…</div>
        </div>
      </div>
    </div>
  );
}

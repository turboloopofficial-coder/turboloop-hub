export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      {/* Gradient orb — cyan, top-left */}
      <div
        className="absolute animate-pulse-glow"
        style={{
          top: "-10%",
          left: "-5%",
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      {/* Gradient orb — purple, bottom-right */}
      <div
        className="absolute"
        style={{
          bottom: "-10%",
          right: "-5%",
          width: "700px",
          height: "700px",
          background: "radial-gradient(circle, rgba(192,132,252,0.04) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "pulse-glow 5s ease-in-out infinite 1.5s",
        }}
      />
      {/* Subtle dot grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.015,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

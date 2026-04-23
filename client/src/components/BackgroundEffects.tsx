export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      {/* Aurora blob — cyan, top-left, drifting */}
      <div
        className="absolute animate-aurora"
        style={{
          top: "-8%",
          left: "-8%",
          width: "900px",
          height: "900px",
          background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, rgba(8,145,178,0.03) 40%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      {/* Aurora blob — purple, bottom-right, drifting reverse */}
      <div
        className="absolute animate-aurora-reverse"
        style={{
          bottom: "-8%",
          right: "-8%",
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, rgba(124,58,237,0.02) 40%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      {/* Aurora blob — teal, center-right */}
      <div
        className="absolute animate-aurora"
        style={{
          top: "40%",
          right: "-3%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(34,211,238,0.04) 0%, transparent 60%)",
          filter: "blur(70px)",
          animationDelay: "5s",
        }}
      />
      {/* Subtle dot grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

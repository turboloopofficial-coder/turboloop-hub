// Static SVG gradient backdrop. Replaces the previous 3 animated
// blurred-blob divs (filter: blur(80px) on 600-900px elements drove
// massive GPU layout cost on mid-range Android — Realme Narzo, Redmi 9
// class — making scroll janky and the phone warm).
//
// The static SVG is rendered as a single fixed background that doesn't
// re-paint on scroll. Visual difference vs the animated blobs is subtle
// (most users never noticed the drift), CPU/GPU win is large.

export default function BackgroundEffects() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(ellipse 800px 600px at 15% 12%, rgba(34,211,238,0.08), transparent 60%), " +
          "radial-gradient(ellipse 700px 500px at 88% 92%, rgba(167,139,250,0.07), transparent 60%), " +
          "radial-gradient(ellipse 500px 400px at 95% 45%, rgba(34,211,238,0.04), transparent 60%)",
      }}
    >
      {/* Subtle dot grid overlay — pure CSS background-image, GPU-cheap */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

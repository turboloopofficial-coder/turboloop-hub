// BrandMark — the TurboLoop logo, hand-crafted as inline SVG so it
// renders identically on every browser, scales without quality loss,
// and ships in zero extra bytes (no image request).
//
// Design: a rounded gradient tile with a white "loop with arrow" inside
// — visually says "the yield loop" + "motion forward". Works equally
// well at 16 px favicon size and 64 px navbar size.

interface BrandMarkProps {
  size?: number;
  className?: string;
  /** Render with no inner padding, e.g. for an emoji-style favicon. */
  flush?: boolean;
}

export function BrandMark({
  size = 28,
  className,
  flush = false,
}: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="TurboLoop"
    >
      <defs>
        <linearGradient id="tl-brand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0891B2" />
          <stop offset="50%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      {/* Rounded tile background */}
      <rect
        width="32"
        height="32"
        rx={flush ? 0 : 7}
        fill="url(#tl-brand)"
      />
      {/* Outer loop arc — 270 degrees, thick stroke, rounded ends.
          Represents the yield "loop". */}
      <path
        d="M 23.5 10.2 a 9 9 0 1 0 -2.5 13.6"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Arrowhead at the loop opening — implies forward motion. */}
      <path
        d="M 18.5 6 L 23.5 10.2 L 19 14"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

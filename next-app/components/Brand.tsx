// Brand — the actual TurboLoop 3D vortex logo, hosted on R2.
// Uses Next.js Image so we get AVIF/WebP + responsive sizing for free.
//
// Why this replaces the simpler inline SVG (BrandMark.tsx): the user
// asked for the real brand asset, not an approximation.

import Image from "next/image";

const LOGO_URL =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/branding/turboloop-logo.png";

interface BrandProps {
  size?: number;
  className?: string;
  /** Add a subtle hover rotation to the logo (used in Navbar). */
  hoverable?: boolean;
}

export function Brand({ size = 32, className, hoverable }: BrandProps) {
  return (
    <span
      className={`inline-block flex-shrink-0 ${hoverable ? "transition-transform duration-300 ease-out hover:rotate-[10deg] hover:scale-110" : ""} ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={LOGO_URL}
        alt="TurboLoop"
        width={size}
        height={size}
        sizes={`${size}px`}
        className="object-contain w-full h-full"
        priority
      />
    </span>
  );
}

// SectionDivider — a hairline, brand-tinted, centred horizontal rule
// used between content-type changes on the homepage. Pure CSS, no JS.

interface SectionDividerProps {
  className?: string;
}

export function SectionDivider({ className }: SectionDividerProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-[var(--c-brand-cyan)]/30 to-transparent ${
        className ?? ""
      }`}
    />
  );
}

// SectionDivider — premium gradient hairline between major content sections.
// Wider than before, with generous vertical spacing for the premium feel.

interface SectionDividerProps {
  className?: string;
}

export function SectionDivider({ className }: SectionDividerProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`my-12 md:my-20 max-w-md mx-auto h-px bg-gradient-to-r from-transparent via-[var(--c-brand-cyan)]/25 to-transparent ${
        className ?? ""
      }`}
    />
  );
}

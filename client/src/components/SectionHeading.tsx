import AnimatedSection from "./AnimatedSection";

interface Props {
  label?: string;
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ label, title, subtitle }: Props) {
  return (
    <AnimatedSection className="text-center mb-16 md:mb-20">
      {label && (
        <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-cyan-600/80 mb-4">
          {label}
        </span>
      )}
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </AnimatedSection>
  );
}

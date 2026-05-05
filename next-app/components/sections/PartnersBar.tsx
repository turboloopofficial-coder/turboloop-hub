// PartnersBar — the "Built On / Audited By / Integrated With" trust strip.
// Five trust signals in a row. No external partner logos — instead a
// clean icon + label pattern that doesn't depend on hot-linked images.

import { ShieldCheck, Lock, CheckCircle2, Eye, Zap } from "lucide-react";
import { Container } from "@components/ui/Container";

const PARTNERS = [
  {
    label: "Binance Smart Chain",
    sublabel: "Network",
    icon: Zap,
    color: "#F0B90B",
  },
  { label: "BscScan", sublabel: "Verified", icon: Eye, color: "#F8B612" },
  {
    label: "Independent Audit",
    sublabel: "Passed",
    icon: ShieldCheck,
    color: "#0891B2",
  },
  {
    label: "Ownership",
    sublabel: "Renounced",
    icon: CheckCircle2,
    color: "#10B981",
  },
  {
    label: "Liquidity",
    sublabel: "100% Locked",
    icon: Lock,
    color: "#7C3AED",
  },
];

export function PartnersBar() {
  return (
    <section
      className="relative py-8 md:py-12 border-y border-[var(--c-border)]"
      style={{ background: "color-mix(in oklab, var(--c-surface) 50%, transparent)" }}
    >
      <Container width="wide">
        <p className="text-center text-[0.625rem] md:text-xs font-bold tracking-[0.25em] uppercase text-[var(--c-text-subtle)] mb-5 md:mb-7">
          Built On · Audited By · Integrated With
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4 max-w-5xl mx-auto">
          {PARTNERS.map(p => {
            const Icon = p.icon;
            return (
              <div
                key={p.label}
                className="flex items-center gap-3 p-3 rounded-[var(--r-md)] bg-[var(--c-surface)] border border-[var(--c-border)] transition hover:shadow-[var(--s-md)]"
              >
                <div
                  className="w-9 h-9 rounded-[var(--r-md)] flex items-center justify-center shrink-0"
                  style={{
                    background: `${p.color}15`,
                    color: p.color,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[var(--c-text)] leading-tight truncate">
                    {p.label}
                  </div>
                  <div className="text-[0.6875rem] text-[var(--c-text-subtle)] leading-tight truncate">
                    {p.sublabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

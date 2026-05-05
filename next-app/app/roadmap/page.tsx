// /roadmap — phased plan. Static, hand-written, calibrated to current
// state of the project (post-launch, ~46 days in).

import type { Metadata } from "next";
import { Check, Zap, Compass } from "lucide-react";
import { Container } from "@components/ui/Container";
import { PageHero } from "@components/layout/PageHero";

export const metadata: Metadata = {
  title: "Roadmap — What's Built, What's Next",
  description:
    "TurboLoop is live and the smart contract is final. The roadmap is about reach, education, and community — not feature creep.",
  alternates: { canonical: "https://turboloop.tech/roadmap" },
};

type Status = "done" | "live" | "next";

const PHASES: Array<{
  status: Status;
  title: string;
  timeframe: string;
  items: string[];
}> = [
  {
    status: "done",
    title: "Phase 1 — Launch & Foundation",
    timeframe: "Q1 2026",
    items: [
      "Smart contract deployed on Binance Smart Chain",
      "Independent audit by Haze Crypto completed",
      "Ownership renounced on-chain",
      "100% LP locked through Unicrypt",
      "$100K security bounty announced + funded",
      "TurboLoop hub site live (turboloop.tech)",
    ],
  },
  {
    status: "live",
    title: "Phase 2 — Reach & Storytelling",
    timeframe: "Now",
    items: [
      "20-film cinematic universe across 4 seasons",
      "Editorial blog with deep-dive articles",
      "Reels library — short explainers in 12+ languages",
      "Presentation library translated into 48 languages",
      "Daily Zoom community sessions",
      "Telegram channel + announcements",
    ],
  },
  {
    status: "next",
    title: "Phase 3 — Global Community",
    timeframe: "Coming up",
    items: [
      "Creator Star + Local Presenter program scaling",
      "Native dApp experience (mobile-first)",
      "Multi-language UI (Hindi, Indonesian, Portuguese, Russian)",
      "Per-region community leaders + monthly stipends",
      "Live event sponsorships + meetups",
    ],
  },
  {
    status: "next",
    title: "Phase 4 — Beyond yield",
    timeframe: "Future",
    items: [
      "On-chain governance for protocol additions",
      "Cross-chain bridges (audited, transparent)",
      "Educational platform — full DeFi curriculum",
      "Open-source the marketing hub for community contributions",
    ],
  },
];

const STATUS_META: Record<Status, { label: string; bg: string; color: string; icon: typeof Check }> =
  {
    done: {
      label: "Shipped",
      bg: "rgba(16, 185, 129, 0.12)",
      color: "#065F46",
      icon: Check,
    },
    live: {
      label: "Active now",
      bg: "rgba(8, 145, 178, 0.12)",
      color: "#0E7490",
      icon: Zap,
    },
    next: {
      label: "Coming",
      bg: "rgba(124, 58, 237, 0.12)",
      color: "#5B21B6",
      icon: Compass,
    },
  };

export default function RoadmapPage() {
  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="The Roadmap"
        title="What's built. What's next."
        subtitle="The smart contract is final and immutable — there's no feature creep on the protocol itself. The roadmap is about reach, education, and community."
      />

      <Container width="narrow">
        <div className="relative space-y-6 md:space-y-8 before:content-[''] before:absolute before:left-[18px] md:before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-[var(--c-border)]">
          {PHASES.map(phase => {
            const meta = STATUS_META[phase.status];
            const Icon = meta.icon;
            return (
              <div
                key={phase.title}
                className="relative pl-12 md:pl-16"
              >
                <div
                  className="absolute left-0 top-0 w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center border-4 border-[var(--c-bg)]"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>

                <div className="rounded-[var(--r-xl)] p-5 md:p-6 bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-md)]">
                  <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-[0.6875rem] font-bold tracking-[0.18em] uppercase"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {meta.label} · {phase.timeframe}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-[var(--c-text)] mb-4">
                    {phase.title}
                  </h2>
                  <ul className="space-y-2.5">
                    {phase.items.map(item => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm md:text-base text-[var(--c-text-muted)] leading-relaxed"
                      >
                        <Check
                          className="w-4 h-4 mt-1 flex-shrink-0"
                          style={{ color: meta.color }}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </main>
  );
}

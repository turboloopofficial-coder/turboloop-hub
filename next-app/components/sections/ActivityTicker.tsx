// ActivityTicker — sliding marquee of real ecosystem activity.
// Pure CSS keyframe animation (zero JS), so it's compositor-thread
// only and never costs main-thread CPU on mid-range Android.

import {
  Sparkles,
  FileText,
  Film,
  Globe2,
  Trophy,
  Users,
  Calendar,
  Newspaper,
} from "lucide-react";

type Item = { icon: any; text: string; color: string };

const ITEMS: Item[] = [
  {
    icon: Newspaper,
    text: "Blog: 16 long-form articles on yield, security, and the math",
    color: "#7C3AED",
  },
  {
    icon: FileText,
    text: "48 presentation decks translated and ready to download",
    color: "#0891B2",
  },
  {
    icon: Film,
    text: "20 cinematic films across 4 seasons — free to watch",
    color: "#EC4899",
  },
  {
    icon: Calendar,
    text: "Daily Zoom sessions running in 12+ languages",
    color: "#10B981",
  },
  {
    icon: Trophy,
    text: "Top countries this week: Germany · Nigeria · Indonesia",
    color: "#F59E0B",
  },
  {
    icon: Globe2,
    text: "Active community across 6 continents · 14+ countries",
    color: "#0EA5E9",
  },
  {
    icon: Sparkles,
    text: "Audited · Renounced · 100% LP locked · $100K bounty open",
    color: "#7C3AED",
  },
  {
    icon: Users,
    text: "Creator Star + Local Presenter programs paying in stablecoins",
    color: "#10B981",
  },
];

export function ActivityTicker() {
  // Duplicate list so the loop is seamless.
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div
      className="relative overflow-hidden py-3 border-y border-[var(--c-border)]"
      style={{
        background:
          "linear-gradient(90deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.96) 50%, rgba(15,23,42,0.96) 100%)",
      }}
    >
      {/* Edge fades */}
      <div
        className="absolute left-0 top-0 bottom-0 w-16 md:w-24 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(15,23,42,1), transparent)",
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-16 md:w-24 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(270deg, rgba(15,23,42,1), transparent)",
        }}
      />

      {/* Live indicator */}
      <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span className="hidden sm:inline text-[0.625rem] font-bold tracking-[0.2em] uppercase text-emerald-300">
          Live
        </span>
      </div>

      {/* Marquee */}
      <div
        className="flex items-center gap-12 whitespace-nowrap activity-marquee"
        style={{ paddingLeft: "120px" }}
      >
        <style>{`
          @keyframes activity-marquee-scroll {
            from { transform: translate3d(0, 0, 0); }
            to   { transform: translate3d(-50%, 0, 0); }
          }
          .activity-marquee {
            animation: activity-marquee-scroll 80s linear infinite;
            will-change: transform;
          }
          @media (prefers-reduced-motion: reduce) {
            .activity-marquee { animation: none; }
          }
        `}</style>
        {loop.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-2.5 shrink-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)`,
                  boxShadow: `0 4px 12px -2px ${item.color}50`,
                }}
              >
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-200">
                {item.text}
              </span>
              <span className="text-slate-600 ml-2">·</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

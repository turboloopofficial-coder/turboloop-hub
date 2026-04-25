// Lightweight skeleton primitives — used for tRPC loading states.
// Pure CSS shimmer animation (no JS overhead).

import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-slate-200/60 relative overflow-hidden",
        className
      )}
      style={{
        background:
          "linear-gradient(90deg, rgba(15,23,42,0.05) 0%, rgba(15,23,42,0.10) 50%, rgba(15,23,42,0.05) 100%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.5s infinite linear",
      }}
      {...props}
    />
  );
}

/** Shimmer keyframes — added once via inline style block in App so we don't need a tailwind config change */
export function SkeletonStyles() {
  return (
    <style>{`
      @keyframes skeleton-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  );
}

/** Card-shaped skeleton for blog/video grid sections */
export function CardSkeleton({ aspect = "video" }: { aspect?: "video" | "square" | "tall" }) {
  const aspectClass =
    aspect === "video" ? "aspect-video" : aspect === "tall" ? "aspect-[9/16]" : "aspect-square";
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-slate-200/60">
      <Skeleton className={`w-full ${aspectClass} rounded-none`} />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

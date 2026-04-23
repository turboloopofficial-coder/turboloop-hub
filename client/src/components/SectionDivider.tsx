export default function SectionDivider({ variant = "cyan" }: { variant?: "cyan" | "purple" | "mixed" }) {
  const colors = {
    cyan: { from: "rgba(34, 211, 238, 0.15)", to: "rgba(34, 211, 238, 0)" },
    purple: { from: "rgba(192, 132, 252, 0.15)", to: "rgba(192, 132, 252, 0)" },
    mixed: { from: "rgba(34, 211, 238, 0.12)", to: "rgba(192, 132, 252, 0.12)" },
  };
  const c = colors[variant];

  return (
    <div className="relative h-px w-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${c.from} 20%, ${variant === "mixed" ? c.to : c.from} 50%, ${variant === "mixed" ? c.to : c.from} 80%, transparent 100%)`,
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
        style={{ background: variant === "purple" ? "#C084FC" : "#22D3EE", boxShadow: `0 0 10px ${variant === "purple" ? "rgba(192,132,252,0.5)" : "rgba(34,211,238,0.5)"}` }}
      />
    </div>
  );
}

import { motion } from "framer-motion";
import { ShieldCheck, Lock, CheckCircle2, Eye, Zap } from "lucide-react";

const PARTNERS = [
  { label: "Binance Smart Chain", sublabel: "Network", icon: Zap, color: "#F0B90B" },
  { label: "BscScan", sublabel: "Verified", icon: Eye, color: "#F8B612" },
  { label: "Independent Audit", sublabel: "Passed", icon: ShieldCheck, color: "#0891B2" },
  { label: "Ownership", sublabel: "Renounced", icon: CheckCircle2, color: "#10B981" },
  { label: "Liquidity", sublabel: "100% Locked", icon: Lock, color: "#7C3AED" },
];

export default function PartnersBar() {
  return (
    <section className="relative py-12 md:py-14 border-y border-slate-200/60" style={{ background: "rgba(248,250,252,0.5)" }}>
      <div className="container">
        <p className="text-center text-xs font-semibold tracking-[0.25em] uppercase text-slate-400 mb-6">
          Built On · Audited By · Integrated With
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 max-w-5xl mx-auto">
          {PARTNERS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all"
                style={{ border: "1px solid transparent" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${p.color}25`; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px -4px ${p.color}20`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "transparent"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `${p.color}12`,
                    border: `1px solid ${p.color}25`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: p.color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-800 leading-tight truncate">{p.label}</div>
                  <div className="text-[11px] text-slate-500 leading-tight">{p.sublabel}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

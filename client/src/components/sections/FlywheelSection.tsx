import { FLYWHEEL_STEPS, REVENUE_SOURCES } from "@/lib/constants";
import { motion } from "framer-motion";
import { Repeat, Wallet, Droplets, TrendingUp, Clock, RotateCw, Zap } from "lucide-react";

const stepIcons = [Wallet, Droplets, TrendingUp, Clock, RotateCw];
const stepColors = ["#22D3EE", "#34D399", "#A78BFA", "#C084FC", "#22D3EE"];

export default function FlywheelSection() {
  return (
    <section id="flywheel" className="relative section-padding overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(192,132,252,0.06) 0%, transparent 60%)" }} />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-sm text-purple-300/80 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            The Revenue Flywheel
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-5">
            <span className="text-white">How the Protocol</span>
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #22D3EE 0%, #A78BFA 50%, #C084FC 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Sustains Itself
            </span>
          </h2>
        </motion.div>

        {/* Circular Flywheel - Desktop */}
        <div className="hidden md:block max-w-4xl mx-auto mb-16">
          <div className="relative" style={{ paddingBottom: "80%" }}>
            {/* Outer orbit ring */}
            <motion.div
              className="absolute rounded-full border border-cyan-400/10"
              style={{ top: "5%", left: "10%", right: "10%", bottom: "5%", }}
            />
            {/* Inner orbit ring */}
            <motion.div
              className="absolute rounded-full border border-purple-400/5"
              style={{ top: "15%", left: "20%", right: "20%", bottom: "15%", }}
            />

            {/* Rotating glow trail */}
            <motion.div
              className="absolute rounded-full"
              style={{ top: "5%", left: "10%", right: "10%", bottom: "5%", }}
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            >
              <div
                className="absolute w-4 h-4 rounded-full"
                style={{
                  top: "-2px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#22D3EE",
                  boxShadow: "0 0 20px rgba(34,211,238,0.6), 0 0 40px rgba(34,211,238,0.3)",
                }}
              />
            </motion.div>

            {/* Center hub */}
            <motion.div
              className="absolute flex flex-col items-center justify-center"
              style={{ top: "30%", left: "30%", right: "30%", bottom: "30%" }}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div
                className="w-full h-full rounded-full flex flex-col items-center justify-center"
                style={{
                  background: "radial-gradient(circle, rgba(13,20,40,0.9) 0%, rgba(13,20,40,0.6) 100%)",
                  border: "1px solid rgba(34,211,238,0.15)",
                  boxShadow: "0 0 60px rgba(34,211,238,0.08), inset 0 0 40px rgba(34,211,238,0.05)",
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                >
                  <Repeat className="h-10 w-10 text-cyan-400 mb-2" />
                </motion.div>
                <span className="text-lg font-heading font-bold text-white">Velocity</span>
                <span className="text-sm text-cyan-300/70">Cycle</span>
              </div>
            </motion.div>

            {/* 5 orbital nodes positioned around the circle */}
            {FLYWHEEL_STEPS.map((step, index) => {
              const Icon = stepIcons[index] || Zap;
              const color = stepColors[index];
              // Position 5 nodes around an ellipse
              const angle = (index / 5) * 2 * Math.PI - Math.PI / 2;
              const radiusX = 42; // % from center
              const radiusY = 38;
              const cx = 50 + radiusX * Math.cos(angle);
              const cy = 45 + radiusY * Math.sin(angle);

              return (
                <motion.div
                  key={step.label}
                  className="absolute"
                  style={{
                    left: `${cx}%`,
                    top: `${cy}%`,
                    transform: "translate(-50%, -50%)",
                    width: "180px",
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.15 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 relative"
                      style={{
                        background: `linear-gradient(135deg, ${color}20, ${color}08)`,
                        border: `1px solid ${color}40`,
                        boxShadow: `0 0 25px ${color}20`,
                      }}
                    >
                      <Icon className="h-7 w-7" style={{ color }} />
                      <div
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: color, color: "#060a16" }}
                      >
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="text-sm font-heading font-bold text-white mb-1 leading-tight">{step.label}</h3>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}

            {/* Connecting arrows between nodes (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 90">
              {FLYWHEEL_STEPS.map((_, index) => {
                const angle1 = (index / 5) * 2 * Math.PI - Math.PI / 2;
                const angle2 = ((index + 1) / 5) * 2 * Math.PI - Math.PI / 2;
                const r = 32;
                const cx = 50, cy = 45;
                const midAngle = (angle1 + angle2) / 2;
                const x1 = cx + r * Math.cos(angle1);
                const y1 = cy + (r * 0.9) * Math.sin(angle1);
                const x2 = cx + r * Math.cos(angle2);
                const y2 = cy + (r * 0.9) * Math.sin(angle2);
                const mx = cx + (r + 4) * Math.cos(midAngle);
                const my = cy + ((r + 4) * 0.9) * Math.sin(midAngle);
                return (
                  <motion.path
                    key={index}
                    d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                    fill="none"
                    stroke="url(#flywheel-gradient)"
                    strokeWidth="0.15"
                    strokeDasharray="1 0.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.5 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.8 + index * 0.2 }}
                  />
                );
              })}
              <defs>
                <linearGradient id="flywheel-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22D3EE" />
                  <stop offset="100%" stopColor="#C084FC" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Mobile fallback - vertical flow */}
        <div className="md:hidden max-w-sm mx-auto mb-16">
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px" style={{ background: "linear-gradient(180deg, rgba(34,211,238,0.3), rgba(192,132,252,0.3), rgba(34,211,238,0.3))" }} />
            {FLYWHEEL_STEPS.map((step, index) => {
              const Icon = stepIcons[index] || Zap;
              const color = stepColors[index];
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative flex items-start gap-5 mb-8 last:mb-0"
                >
                  <div className="relative z-10 shrink-0">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
                        border: `1px solid ${color}30`,
                        boxShadow: `0 0 15px ${color}15`,
                      }}
                    >
                      <Icon className="h-6 w-6" style={{ color }} />
                      <div
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: color, color: "#060a16" }}
                      >
                        {index + 1}
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-base font-heading font-bold text-white mb-1">{step.label}</h3>
                    <p className="text-xs text-gray-400">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                  <Repeat className="h-4 w-4 text-cyan-400" />
                </motion.div>
                <span className="text-xs font-semibold text-cyan-300">Continuous Loop</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue streams */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {REVENUE_SOURCES.map((source, index) => {
            const colors = ["#22D3EE", "#34D399", "#C084FC"];
            const c = colors[index];
            return (
              <motion.div
                key={source.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative p-6 rounded-xl overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, rgba(13,20,40,0.7) 0%, rgba(13,20,40,0.4) 100%)",
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${c}15`,
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-px transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${c}40, transparent)` }} />
                <div className="w-3 h-3 rounded-full mb-4" style={{ background: c, boxShadow: `0 0 10px ${c}50` }} />
                <h3 className="text-lg font-heading font-bold text-white mb-2">{source.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{source.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10 text-sm text-gray-500"
        >
          All rewards calculated and distributed daily at 00:00 UTC
        </motion.p>
      </div>
    </section>
  );
}

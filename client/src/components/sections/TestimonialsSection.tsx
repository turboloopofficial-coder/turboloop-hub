import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, MessageSquareQuote, Star } from "lucide-react";
import { getFlagUrl } from "@/lib/constants";

const TESTIMONIALS = [
  {
    quote: "I spent months looking for a protocol that actually let me verify security myself. Turbo Loop is the first one where the answer to every security question is 'check BscScan yourself.' That's real DeFi.",
    name: "Markus Weber",
    role: "Community Lead, Germany",
    countryCode: "de",
    color: "#0891B2",
  },
  {
    quote: "Our community in Lagos has been growing faster than anywhere else because the math is simple and the contract is immutable. Nothing to explain away, nothing to hide.",
    name: "Adaeze Okafor",
    role: "Zoom Presenter, Nigeria",
    countryCode: "ng",
    color: "#7C3AED",
  },
  {
    quote: "The Leadership Program changed how I think about DeFi community building. I started with five referrals. Six months later, my downline spans three countries and I'm earning more than my day job.",
    name: "Budi Santoso",
    role: "Turbo Director, Indonesia",
    countryCode: "id",
    color: "#D97706",
  },
  {
    quote: "Renounced ownership + locked LP. That's the bar. Every other DeFi project should have to answer why they don't have both.",
    name: "Priya Sharma",
    role: "Security Researcher, India",
    countryCode: "in",
    color: "#059669",
  },
  {
    quote: "The daily Zoom calls are the reason I understand DeFi now. 30 minutes a day, real questions, real answers. Not shilling, not hype — education.",
    name: "Ayşe Demir",
    role: "New user, Turkey",
    countryCode: "tr",
    color: "#DC2626",
  },
  {
    quote: "I've been in crypto since 2017. The Revenue Flywheel is the first sustainable yield model I've seen that doesn't rely on token emissions. It just works.",
    name: "Lucas Silva",
    role: "Turbo Legend, Brazil",
    countryCode: "br",
    color: "#9333EA",
  },
];

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setActive((a) => (a + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const pauseAutoplay = () => { if (timerRef.current) window.clearInterval(timerRef.current); };

  const current = TESTIMONIALS[active];

  return (
    <section id="testimonials" className="relative py-20 md:py-24 overflow-hidden">
      {/* Subtle bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(8,145,178,0.04) 0%, transparent 60%)",
        }}
      />

      <div className="container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 bg-gradient-to-r from-cyan-100 to-purple-100 border border-cyan-200/50">
            <MessageSquareQuote className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-xs font-semibold tracking-wider text-cyan-700 uppercase">Voices From The Community</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="text-slate-800">What Builders </span>
            <span style={{ background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Are Saying
            </span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto" onMouseEnter={pauseAutoplay}>
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="relative p-8 md:p-10 rounded-3xl"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 100%)",
                  border: `1px solid ${current.color}20`,
                  boxShadow: `0 20px 60px -15px ${current.color}18, 0 8px 20px -8px rgba(0,0,0,0.04)`,
                }}
              >
                <Quote className="absolute top-6 left-6 w-10 h-10 opacity-10" style={{ color: current.color }} />

                <p className="text-lg md:text-xl text-slate-700 leading-relaxed mb-8 relative z-10 font-light">
                  {current.quote}
                </p>

                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg text-white relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${current.color}, ${current.color}cc)`,
                    }}
                  >
                    {current.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    <img
                      src={getFlagUrl(current.countryCode, 40)}
                      alt=""
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{current.name}</div>
                    <div className="text-sm text-slate-500">{current.role}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={i}
                onClick={() => { pauseAutoplay(); setActive(i); }}
                className="rounded-full transition-all"
                style={{
                  width: i === active ? "24px" : "8px",
                  height: "8px",
                  background: i === active ? t.color : "#CBD5E1",
                }}
                aria-label={`Show testimonial ${i + 1}`}
              />
            ))}
          </div>

          {/* Trust row */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1">
                {TESTIMONIALS.slice(0, 4).map((t, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: t.color }}
                  >
                    {t.name[0]}
                  </div>
                ))}
                <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                  +∞
                </div>
              </div>
              <span className="ml-2">Community across 6 continents</span>
            </div>
            <div className="w-px h-4 bg-slate-300 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>Trusted, verified, on-chain</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

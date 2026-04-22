import { motion } from "framer-motion";
import { Shield, Video, Users, Gift } from "lucide-react";
import { useState } from "react";

const PROMO_CARDS = [
  {
    icon: Shield,
    title: "$100K Smart Contract Challenge",
    badge: "ACTIVE",
    description: "Prove It. Win $100,000.",
    details: "Open challenge to anyone who can prove centralization in the Turbo Loop smart contract. Identify any owner-controlled function, submit verifiable on-chain evidence, and claim $100,000 USDT if validated by independent auditors.",
    color: "#EF4444",
    glowColor: "rgba(239,68,68,0.15)",
    borderColor: "rgba(239,68,68,0.2)",
    isHero: true,
  },
  {
    icon: Video,
    title: "Content Creator Star",
    badge: "EARN PER VIEW",
    description: "Create Videos. Get Paid Per View.",
    details: "No minimum followers required. Earn from $5 (500 views) up to $1,000 (1M views) within 45 days. Supported on YouTube, Instagram, and Facebook.",
    color: "#C084FC",
    glowColor: "rgba(192,132,252,0.12)",
    borderColor: "rgba(192,132,252,0.2)",
    isHero: false,
  },
  {
    icon: Users,
    title: "Local Zoom Presenter",
    badge: "$100/MONTH",
    description: "Be the Voice of TurboLoop in Your Country.",
    details: "Earn $100/month as a community builder. Conduct local language Zoom sessions with a minimum of 40 real participants per session.",
    color: "#22D3EE",
    glowColor: "rgba(34,211,238,0.12)",
    borderColor: "rgba(34,211,238,0.2)",
    isHero: false,
  },
  {
    icon: Gift,
    title: "Onboarding Bonus Reward",
    badge: "LIMITED TIME",
    description: "Earn a One-Time Bonus When Your Referral Deposits.",
    details: "Bonuses range from $3 (100 USDT deposit) to $50 (5,000+ USDT deposit). Applies to first deposit only on 30-day or 60-day plans. Limited time program \u2014 2 months.",
    color: "#FBBF24",
    glowColor: "rgba(251,191,36,0.12)",
    borderColor: "rgba(251,191,36,0.2)",
    isHero: false,
  },
];

function PromoCard({ promo, index }: { promo: typeof PROMO_CARDS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const Icon = promo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative group ${promo.isHero ? "md:col-span-2" : ""}`}
    >
      <div
        className="relative p-7 md:p-8 rounded-2xl overflow-hidden h-full"
        style={{
          background: promo.isHero
            ? "linear-gradient(135deg, rgba(30,10,10,0.8) 0%, rgba(13,20,40,0.6) 100%)"
            : "linear-gradient(135deg, rgba(13,20,40,0.7) 0%, rgba(13,20,40,0.4) 100%)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${hovered ? promo.borderColor : "rgba(255,255,255,0.04)"}`,
          boxShadow: hovered ? `0 0 40px ${promo.glowColor}` : "none",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${promo.color}50, transparent)`,
            opacity: hovered ? 1 : 0.3,
            transition: "opacity 0.4s",
          }}
        />

        {/* Corner glow for hero card */}
        {promo.isHero && (
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full" style={{ background: `radial-gradient(circle, ${promo.glowColor}, transparent 70%)` }} />
        )}

        <div className="relative flex flex-col h-full">
          <div className="flex items-start justify-between mb-5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${promo.color}20, ${promo.color}05)`,
                border: `1px solid ${promo.color}30`,
              }}
            >
              <Icon className="h-6 w-6" style={{ color: promo.color }} />
            </div>
            <span
              className="text-xs font-bold px-4 py-1.5 rounded-full"
              style={{
                background: `${promo.color}15`,
                color: promo.color,
                border: `1px solid ${promo.color}30`,
                boxShadow: hovered ? `0 0 10px ${promo.color}20` : "none",
              }}
            >
              {promo.badge}
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-heading font-bold text-white mb-2">{promo.title}</h3>
          <p className="text-sm font-semibold mb-3" style={{ color: promo.color }}>{promo.description}</p>
          <p className="text-sm text-gray-400 leading-relaxed flex-1">{promo.details}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function PromotionsSection() {
  return (
    <section id="promotions" className="relative section-padding overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 60%)" }} />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-sm text-amber-300/80 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Active Promotions
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-5">
            <span className="text-white">Earn</span>{" "}
            <span className="text-gradient">Beyond Yield</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {PROMO_CARDS.map((promo, index) => (
            <PromoCard key={promo.title} promo={promo} index={index} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-10 text-sm text-gray-500"
        >
          Promotional Support backed by Project Developers Team
        </motion.p>
      </div>
    </section>
  );
}

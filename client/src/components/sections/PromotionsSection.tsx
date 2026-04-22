import { motion } from "framer-motion";
import { Shield, Video, Users, Gift, Flame } from "lucide-react";

const PROMO_CARDS = [
  {
    icon: Shield,
    title: "$100K Smart Contract Challenge",
    badge: "ACTIVE",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
    description: "Prove It. Win $100,000.",
    details: "Open challenge to anyone who can prove centralization in the Turbo Loop smart contract. Identify any owner-controlled function, submit verifiable on-chain evidence, and claim $100,000 USDT if validated by independent auditors.",
    accent: "from-red-500/20 to-orange-500/20",
    borderColor: "border-red-500/15 hover:border-red-500/30",
  },
  {
    icon: Video,
    title: "Content Creator Star",
    badge: "EARN PER VIEW",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    description: "Create Videos. Get Paid Per View.",
    details: "No minimum followers required. Earn from $5 (500 views) up to $1,000 (1M views) within 45 days. Supported on YouTube, Instagram, and Facebook.",
    accent: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/15 hover:border-purple-500/30",
  },
  {
    icon: Users,
    title: "Local Zoom Presenter",
    badge: "$100/MONTH",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    description: "Be the Voice of TurboLoop in Your Country.",
    details: "Earn $100/month as a community builder. Conduct local language Zoom sessions with a minimum of 40 real participants per session.",
    accent: "from-cyan-500/20 to-blue-500/20",
    borderColor: "border-cyan-500/15 hover:border-cyan-500/30",
  },
  {
    icon: Gift,
    title: "Onboarding Bonus Reward",
    badge: "LIMITED TIME",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    description: "Earn a One-Time Bonus When Your Referral Deposits.",
    details: "Bonuses range from $3 (100 USDT deposit) to $50 (5,000+ USDT deposit). Applies to first deposit only on 30-day or 60-day plans. Limited time program — 2 months.",
    accent: "from-amber-500/20 to-yellow-500/20",
    borderColor: "border-amber-500/15 hover:border-amber-500/30",
  },
];

export default function PromotionsSection() {
  return (
    <section id="promotions" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-500/3 rounded-full blur-[150px]" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-sm text-amber-300 mb-6">
            <Flame className="h-4 w-4" />
            Active Promotions
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            <span className="text-white">Earn </span>
            <span className="text-gradient">Beyond Yield</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {PROMO_CARDS.map((promo, index) => {
            const Icon = promo.icon;
            return (
              <motion.div
                key={promo.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className={`relative p-6 md:p-8 rounded-2xl border ${promo.borderColor} bg-[#0d1425]/80 backdrop-blur-sm transition-all duration-500 h-full`}>
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${promo.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <Icon className="h-8 w-8 text-cyan-400" />
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${promo.badgeColor}`}>
                        {promo.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-heading font-bold text-white mb-2">{promo.title}</h3>
                    <p className="text-cyan-400 text-sm font-medium mb-3">{promo.description}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{promo.details}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          Promotional Support backed by Project Developers Team
        </motion.p>
      </div>
    </section>
  );
}

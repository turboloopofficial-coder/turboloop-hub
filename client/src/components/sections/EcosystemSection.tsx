import { ECOSYSTEM_PILLARS } from "@/lib/constants";
import { motion } from "framer-motion";
import { CreditCard, ArrowLeftRight, TrendingUp, Users, Award, Shield } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  CreditCard, ArrowLeftRight, TrendingUp, Users, Award, Shield,
};

export default function EcosystemSection() {
  return (
    <section id="ecosystem" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px]" />

      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            <span className="text-white">The </span>
            <span className="text-gradient">Ecosystem</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Six Integrated Pillars. One Unified Protocol.
          </p>
        </motion.div>

        {/* Pillar Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ECOSYSTEM_PILLARS.map((pillar, index) => {
            const Icon = iconMap[pillar.icon] || Shield;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="relative p-6 md:p-8 rounded-2xl border border-cyan-500/10 bg-[#0d1425]/80 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-500 h-full">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Hexagonal icon container */}
                  <div className="relative mb-5">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-500">
                      <Icon className="h-7 w-7 text-cyan-400" />
                    </div>
                  </div>

                  <h3 className="relative text-xl font-heading font-bold text-white mb-1">
                    {pillar.title}
                  </h3>
                  <p className="relative text-sm text-cyan-400 font-medium mb-3">
                    {pillar.subtitle}
                  </p>
                  <p className="relative text-gray-400 text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

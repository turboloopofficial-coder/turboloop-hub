import { trpc } from "@/lib/trpc";
import { COUNTRY_FLAGS } from "@/lib/constants";
import { motion } from "framer-motion";
import { Globe, Trophy } from "lucide-react";

const MEDAL_ICONS = ["🥇", "🥈", "🥉"];

export default function LeaderboardSection() {
  const { data: leaderboard } = trpc.content.leaderboard.useQuery();

  const entries = leaderboard && leaderboard.length > 0
    ? leaderboard
    : [
        { rank: 1, country: "Germany", countryCode: "DE", description: "Strongest European Community", score: 100 },
        { rank: 2, country: "Nigeria", countryCode: "NG", description: "Fastest Growing in Africa", score: 85 },
        { rank: 3, country: "Indonesia", countryCode: "ID", description: "Leading Southeast Asia", score: 72 },
        { rank: 4, country: "India", countryCode: "IN", description: "Rapidly Expanding", score: 65 },
        { rank: 5, country: "Turkey", countryCode: "TR", description: "Emerging Market Leader", score: 50 },
        { rank: 6, country: "Brazil", countryCode: "BR", description: "Latin America Pioneer", score: 40 },
      ];

  return (
    <section id="leaderboard" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px] -translate-y-1/2" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-sm text-cyan-300 mb-6">
            <Globe className="h-4 w-4" />
            Country Leaderboard
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            <span className="text-white">Where Is TurboLoop </span>
            <span className="text-gradient">Growing Fastest?</span>
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-center gap-4 p-4 rounded-xl border border-cyan-500/10 bg-[#0d1425]/60 hover:border-cyan-500/25 transition-all">
                {/* Rank */}
                <div className="flex items-center gap-2 w-20 shrink-0">
                  {index < 3 && <span className="text-2xl">{MEDAL_ICONS[index]}</span>}
                  <span className="text-xl font-heading font-bold text-white">#{entry.rank}</span>
                </div>

                {/* Flag + Country */}
                <div className="flex items-center gap-3 w-40 shrink-0">
                  <span className="text-3xl">{COUNTRY_FLAGS[entry.countryCode] || "🏳️"}</span>
                  <span className="text-lg font-heading font-bold text-white">{entry.country}</span>
                </div>

                {/* Bar + Description */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-400">{entry.description}</span>
                    <span className="text-sm font-bold text-cyan-400">{entry.score}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-[#0a0f1e] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${entry.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, #22D3EE ${100 - entry.score}%, #06b6d4)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
          className="text-center mt-10 text-xl font-heading font-bold text-gray-300"
        >
          The World Is Joining. <span className="text-cyan-400">Are You?</span>
        </motion.p>
      </div>
    </section>
  );
}

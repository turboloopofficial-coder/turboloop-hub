import { trpc } from "@/lib/trpc";
import { COUNTRY_FLAGS } from "@/lib/constants";
import { motion } from "framer-motion";

const MEDAL_ICONS = ["\u{1F947}", "\u{1F948}", "\u{1F949}"];

const barGradients = [
  "linear-gradient(90deg, #22D3EE 0%, #06b6d4 100%)",
  "linear-gradient(90deg, #22D3EE 0%, #34D399 100%)",
  "linear-gradient(90deg, #34D399 0%, #22D3EE 100%)",
  "linear-gradient(90deg, #22D3EE 0%, #818CF8 100%)",
  "linear-gradient(90deg, #818CF8 0%, #C084FC 100%)",
  "linear-gradient(90deg, #C084FC 0%, #22D3EE 100%)",
];

const barGlows = [
  "rgba(34,211,238,0.3)", "rgba(34,211,238,0.25)", "rgba(52,211,153,0.25)",
  "rgba(34,211,238,0.2)", "rgba(129,140,248,0.2)", "rgba(192,132,252,0.2)",
];

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
    <section id="leaderboard" className="relative section-padding overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full" style={{ background: "radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 60%)" }} />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-sm text-cyan-300/80 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Country Leaderboard
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-5">
            <span className="text-white">Where Is TurboLoop</span>
            <br />
            <span className="text-gradient">Growing Fastest?</span>
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-4">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div
                className="relative p-5 md:p-6 rounded-xl overflow-hidden transition-all duration-400"
                style={{
                  background: "linear-gradient(135deg, rgba(13,20,40,0.7) 0%, rgba(13,20,40,0.4) 100%)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div className="flex items-center gap-4 md:gap-6 mb-3">
                  {/* Rank + Medal */}
                  <div className="flex items-center gap-2 w-20 shrink-0">
                    {index < 3 && <span className="text-2xl">{MEDAL_ICONS[index]}</span>}
                    <span className="text-2xl font-heading font-bold text-white">#{entry.rank}</span>
                  </div>

                  {/* Flag + Country */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-3xl">{COUNTRY_FLAGS[entry.countryCode] || ""}</span>
                    <div className="min-w-0">
                      <h3 className="text-lg md:text-xl font-heading font-bold text-white truncate">{entry.country}</h3>
                      <p className="text-sm text-gray-400 truncate">{entry.description}</p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <span
                      className="text-2xl md:text-3xl font-heading font-bold"
                      style={{ color: index < 2 ? "#22D3EE" : index < 4 ? "#34D399" : "#C084FC" }}
                    >
                      {entry.score}%
                    </span>
                  </div>
                </div>

                {/* Animated bar */}
                <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${entry.score}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full relative"
                    style={{
                      background: barGradients[index],
                      boxShadow: `0 0 15px ${barGlows[index]}, 0 0 30px ${barGlows[index]}`,
                    }}
                  >
                    {/* Shimmer effect */}
                    <div
                      className="absolute inset-0 rounded-full animate-shimmer"
                      style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)", backgroundSize: "200% 100%" }}
                    />
                  </motion.div>
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
          className="text-center mt-12 text-xl md:text-2xl font-heading font-bold text-gradient"
        >
          The World Is Joining. Are You?
        </motion.p>
      </div>
    </section>
  );
}

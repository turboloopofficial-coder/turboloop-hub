import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";
import {
  HelpCircle,
  Zap,
  Shield,
  Users,
  Wallet,
  TrendingUp,
  Globe,
  Search,
  Plus,
  MessageCircle,
  Sparkles,
  BookOpen,
  Lock,
  Coins,
} from "lucide-react";

type CategoryId = "all" | "platform" | "earning" | "security" | "getting-started" | "community";

const CATEGORIES: { id: CategoryId; label: string; icon: any; color: string }[] = [
  { id: "all", label: "All Questions", icon: BookOpen, color: "#0F172A" },
  { id: "platform", label: "Platform", icon: Sparkles, color: "#0891B2" },
  { id: "earning", label: "Earning", icon: Coins, color: "#10B981" },
  { id: "security", label: "Security", icon: Lock, color: "#7C3AED" },
  { id: "getting-started", label: "Getting Started", icon: Zap, color: "#F59E0B" },
  { id: "community", label: "Community", icon: Users, color: "#EC4899" },
];

type FaqItem = {
  id: string;
  category: Exclude<CategoryId, "all">;
  icon: any;
  iconColor: string;
  iconBg: string;
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "what-is",
    category: "platform",
    icon: Zap,
    iconColor: "#0891B2",
    iconBg: "rgba(8,145,178,0.1)",
    question: "What is Turbo Loop?",
    answer:
      "Turbo Loop is a complete DeFi ecosystem built on Binance Smart Chain. It combines six pillars — Turbo Buy, Turbo Swap, Yield Farming, Referral Network, Leadership Program, and Smart Contract Security — into one self-sustaining platform. Unlike single-purpose protocols, Turbo Loop generates revenue from real economic activity through its Revenue Flywheel.",
  },
  {
    id: "how-yield",
    category: "earning",
    icon: TrendingUp,
    iconColor: "#10B981",
    iconBg: "rgba(16,185,129,0.1)",
    question: "Where does the yield come from?",
    answer:
      "Turbo Loop generates yield from three real revenue sources: LP rewards from liquidity provision, Turbo Swap fees (0.3% per trade), and Turbo Buy fees from fiat-to-crypto conversions. These revenue streams create a self-reinforcing Velocity Cycle — the more the ecosystem is used, the more yield it generates. This is fundamentally different from protocols that rely on new deposits to pay existing users.",
  },
  {
    id: "security",
    category: "security",
    icon: Shield,
    iconColor: "#7C3AED",
    iconBg: "rgba(124,58,237,0.1)",
    question: "Is Turbo Loop safe?",
    answer:
      "Turbo Loop is built on five pillars of security: the smart contract has been independently audited, ownership is permanently renounced (no one can modify the contract), 100% of LP is locked, the contract is verified on BscScan, and all operations are 100% on-chain. The protocol is so confident in its security that it offers a $100,000 bounty to anyone who can prove centralization in the smart contract.",
  },
  {
    id: "get-started",
    category: "getting-started",
    icon: Wallet,
    iconColor: "#F59E0B",
    iconBg: "rgba(245,158,11,0.1)",
    question: "How do I get started?",
    answer:
      "Getting started takes five steps: (1) Connect your MetaMask or Trust Wallet, (2) Buy BNB or USDT through Turbo Buy or transfer from an exchange, (3) Deposit USDT into the farming contract, (4) Earn daily yield from protocol revenue, and (5) Grow by referring others and climbing leadership ranks. Visit turboloop.io and click Launch App to begin.",
  },
  {
    id: "referral",
    category: "community",
    icon: Users,
    iconColor: "#EC4899",
    iconBg: "rgba(236,72,153,0.1)",
    question: "How does the referral program work?",
    answer:
      "When you share your unique referral link and someone joins through it, you earn a percentage of their farming rewards across multiple levels. As your network grows, you can advance through five leadership ranks — Builder, Accelerator, Director, Executive, and Ambassador — each unlocking higher reward percentages. Top community builders also qualify for the Content Creator Star and Local Zoom Presenter programs.",
  },
  {
    id: "withdraw",
    category: "earning",
    icon: Wallet,
    iconColor: "#10B981",
    iconBg: "rgba(16,185,129,0.1)",
    question: "Can I withdraw my funds at any time?",
    answer:
      "Yes. You can withdraw your earned rewards at any time without penalties. You have three options: withdraw to your wallet, compound (reinvest) to increase your deposited amount and earn higher future yields, or a combination of both. The smart contract handles all withdrawals automatically on-chain.",
  },
  {
    id: "countries",
    category: "community",
    icon: Globe,
    iconColor: "#EC4899",
    iconBg: "rgba(236,72,153,0.1)",
    question: "Which countries is Turbo Loop available in?",
    answer:
      "Turbo Loop is a decentralized protocol accessible from anywhere in the world. The community currently spans 50+ countries across 6 continents, with the strongest communities in Germany, Nigeria, Indonesia, India, Turkey, and Brazil. Educational content is available in 48 languages, and daily Zoom sessions connect members globally.",
  },
  {
    id: "minimum",
    category: "getting-started",
    icon: HelpCircle,
    iconColor: "#F59E0B",
    iconBg: "rgba(245,158,11,0.1)",
    question: "Is there a minimum deposit amount?",
    answer:
      "The minimum deposit is designed to be accessible to users at all levels. You can start with a small amount to learn the platform and increase your deposit as you become more comfortable. The key is to start, compound regularly, and let the Revenue Flywheel work for you over time.",
  },
];

function FaqCard({ item, isOpen, onToggle, index }: { item: FaqItem; isOpen: boolean; onToggle: () => void; index: number }) {
  const Icon = item.icon;
  return (
    <AnimatedSection delay={Math.min(index * 0.04, 0.3)}>
      <motion.div
        layout
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "white",
          border: `1px solid ${isOpen ? `${item.iconColor}30` : "rgba(15,23,42,0.06)"}`,
          boxShadow: isOpen
            ? `0 20px 40px -12px ${item.iconColor}20, 0 4px 14px -2px rgba(15,23,42,0.05)`
            : "0 4px 14px -4px rgba(15,23,42,0.06)",
          transition: "border-color 0.3s, box-shadow 0.3s",
        }}
      >
        {/* Side accent stripe when open */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1"
          initial={false}
          animate={{ opacity: isOpen ? 1 : 0 }}
          style={{
            background: `linear-gradient(180deg, ${item.iconColor}, ${item.iconColor}80)`,
          }}
        />

        <button
          onClick={onToggle}
          className="w-full flex items-center gap-4 px-5 md:px-6 py-5 text-left group"
          aria-expanded={isOpen}
        >
          {/* Icon with animated bg */}
          <motion.div
            animate={{
              scale: isOpen ? 1.05 : 1,
              rotate: isOpen ? [0, -8, 8, 0] : 0,
            }}
            transition={{ duration: 0.4 }}
            className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: isOpen
                ? `linear-gradient(135deg, ${item.iconColor}, ${item.iconColor}cc)`
                : item.iconBg,
              boxShadow: isOpen ? `0 8px 20px -6px ${item.iconColor}50` : "none",
              transition: "background 0.3s, box-shadow 0.3s",
            }}
          >
            <Icon className="w-5 h-5 md:w-5 md:h-5" style={{ color: isOpen ? "white" : item.iconColor }} />
          </motion.div>

          <div className="flex-1 min-w-0">
            <h3
              className="text-base md:text-lg font-bold leading-snug transition-colors"
              style={{ color: isOpen ? item.iconColor : "#0F172A" }}
            >
              {item.question}
            </h3>
          </div>

          {/* Plus / cross indicator */}
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: isOpen ? `${item.iconColor}15` : "rgba(15,23,42,0.04)",
              border: `1px solid ${isOpen ? `${item.iconColor}30` : "rgba(15,23,42,0.08)"}`,
            }}
          >
            <Plus className="w-4 h-4" style={{ color: isOpen ? item.iconColor : "#64748B" }} />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 md:px-6 pb-6">
                {/* Subtle divider */}
                <div
                  className="h-px mb-4"
                  style={{
                    background: `linear-gradient(90deg, ${item.iconColor}30, transparent)`,
                  }}
                />
                <div className="md:pl-16">
                  <p className="text-slate-600 text-sm md:text-[15px] leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatedSection>
  );
}

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    let items = FAQ_ITEMS;
    if (activeCategory !== "all") {
      items = items.filter((i) => i.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(
        (i) => i.question.toLowerCase().includes(q) || i.answer.toLowerCase().includes(q)
      );
    }
    return items;
  }, [activeCategory, search]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: FAQ_ITEMS.length };
    FAQ_ITEMS.forEach((i) => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <section id="faq" className="section-spacing relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(8,145,178,0.08), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.06), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="container">
        <SectionHeading
          label="Frequently Asked Questions"
          title="Everything You Need to Know"
          subtitle="Quick answers to the most common questions about Turbo Loop."
        />

        <div className="max-w-4xl mx-auto">
          {/* Search bar */}
          <AnimatedSection delay={0.1}>
            <div className="relative mb-6">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-14 pr-5 py-4 rounded-2xl text-sm md:text-base text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-300"
                style={{
                  background: "white",
                  border: "1px solid rgba(15,23,42,0.08)",
                  boxShadow: "0 4px 14px -4px rgba(15,23,42,0.06)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(8,145,178,0.4)";
                  e.currentTarget.style.boxShadow = "0 8px 24px -6px rgba(8,145,178,0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(15,23,42,0.08)";
                  e.currentTarget.style.boxShadow = "0 4px 14px -4px rgba(15,23,42,0.06)";
                }}
              />
            </div>
          </AnimatedSection>

          {/* Category Tabs */}
          <AnimatedSection delay={0.15}>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-300"
                    style={{
                      background: isActive ? cat.color : "white",
                      color: isActive ? "white" : "#64748B",
                      border: `1px solid ${isActive ? cat.color : "rgba(15,23,42,0.08)"}`,
                      boxShadow: isActive
                        ? `0 8px 20px -6px ${cat.color}40`
                        : "0 2px 6px -2px rgba(15,23,42,0.04)",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: isActive ? "rgba(255,255,255,0.25)" : "rgba(15,23,42,0.06)",
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </AnimatedSection>

          {/* FAQ Items */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <FaqCard
                    item={item}
                    isOpen={openId === item.id}
                    onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                    index={index}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredItems.length === 0 && (
            <AnimatedSection>
              <div className="text-center py-16">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "white", border: "1px solid rgba(15,23,42,0.06)" }}
                >
                  <Search className="h-7 w-7 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm mb-1">No questions match your search.</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("all");
                  }}
                  className="text-cyan-600 text-sm font-semibold hover:underline"
                >
                  Clear filters
                </button>
              </div>
            </AnimatedSection>
          )}

          {/* CTA below FAQ */}
          <AnimatedSection delay={0.5}>
            <div className="mt-14 relative rounded-3xl overflow-hidden p-8 md:p-10 text-center"
              style={{
                background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 30px 60px -20px rgba(15,23,42,0.4)",
              }}
            >
              {/* Glow */}
              <div
                className="absolute inset-0 pointer-events-none opacity-50"
                style={{
                  background: "radial-gradient(ellipse at top, rgba(8,145,178,0.25), transparent 60%)",
                }}
              />
              {/* Grid pattern */}
              <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              <div className="relative">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                  style={{
                    background: "linear-gradient(135deg, rgba(8,145,178,0.2), rgba(124,58,237,0.2))",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <MessageCircle className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                  Still have questions?
                </h3>
                <p className="text-slate-400 text-sm md:text-base mb-6 max-w-md mx-auto">
                  Our community is active 24/7. Get answers from real members and the team.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="https://t.me/TurboLoop_Official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                      color: "white",
                      boxShadow: "0 10px 30px -8px rgba(8,145,178,0.5)",
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Ask in Telegram
                  </a>
                  <a
                    href="#videos"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "white",
                    }}
                  >
                    <BookOpen className="w-4 h-4" />
                    Watch Tutorials
                  </a>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

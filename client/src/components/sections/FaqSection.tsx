import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";
import { HelpCircle, Zap, Shield, Users, Wallet, TrendingUp, Globe } from "lucide-react";

const FAQ_ITEMS = [
  {
    id: "what-is",
    icon: <Zap className="w-5 h-5 text-cyan-400 shrink-0" />,
    question: "What is Turbo Loop?",
    answer:
      "Turbo Loop is a complete DeFi ecosystem built on Binance Smart Chain. It combines six pillars — Turbo Buy, Turbo Swap, Yield Farming, Referral Network, Leadership Program, and Smart Contract Security — into one self-sustaining platform. Unlike single-purpose protocols, Turbo Loop generates revenue from real economic activity through its Revenue Flywheel.",
  },
  {
    id: "how-yield",
    icon: <TrendingUp className="w-5 h-5 text-cyan-400 shrink-0" />,
    question: "Where does the yield come from?",
    answer:
      "Turbo Loop generates yield from three real revenue sources: LP rewards from liquidity provision, Turbo Swap fees (0.3% per trade), and Turbo Buy fees from fiat-to-crypto conversions. These revenue streams create a self-reinforcing Velocity Cycle — the more the ecosystem is used, the more yield it generates. This is fundamentally different from protocols that rely on new deposits to pay existing users.",
  },
  {
    id: "security",
    icon: <Shield className="w-5 h-5 text-cyan-400 shrink-0" />,
    question: "Is Turbo Loop safe?",
    answer:
      "Turbo Loop is built on five pillars of security: the smart contract has been independently audited, ownership is permanently renounced (no one can modify the contract), 100% of LP is locked, the contract is verified on BscScan, and all operations are 100% on-chain. The protocol is so confident in its security that it offers a $100,000 bounty to anyone who can prove centralization in the smart contract.",
  },
  {
    id: "get-started",
    icon: <Wallet className="w-5 h-5 text-cyan-400 shrink-0" />,
    question: "How do I get started?",
    answer:
      "Getting started takes five steps: (1) Connect your MetaMask or Trust Wallet, (2) Buy BNB or USDT through Turbo Buy or transfer from an exchange, (3) Deposit USDT into the farming contract, (4) Earn daily yield from protocol revenue, and (5) Grow by referring others and climbing leadership ranks. Visit turboloop.io and click Launch App to begin.",
  },
  {
    id: "referral",
    icon: <Users className="w-5 h-5 text-cyan-400 shrink-0" />,
    question: "How does the referral program work?",
    answer:
      "When you share your unique referral link and someone joins through it, you earn a percentage of their farming rewards across multiple levels. As your network grows, you can advance through five leadership ranks — Builder, Accelerator, Director, Executive, and Ambassador — each unlocking higher reward percentages. Top community builders also qualify for the Content Creator Star and Local Zoom Presenter programs.",
  },
  {
    id: "withdraw",
    icon: <Wallet className="w-5 h-5 text-cyan-400 shrink-0" />,
    question: "Can I withdraw my funds at any time?",
    answer:
      "Yes. You can withdraw your earned rewards at any time without penalties. You have three options: withdraw to your wallet, compound (reinvest) to increase your deposited amount and earn higher future yields, or a combination of both. The smart contract handles all withdrawals automatically on-chain.",
  },
  {
    id: "countries",
    icon: <Globe className="w-5 h-5 text-cyan-400 shrink-0" />,
    question: "Which countries is Turbo Loop available in?",
    answer:
      "Turbo Loop is a decentralized protocol accessible from anywhere in the world. The community currently spans 50+ countries across 6 continents, with the strongest communities in Germany, Nigeria, Indonesia, India, Turkey, and Brazil. Educational content is available in 12 languages, and daily Zoom sessions connect members globally.",
  },
  {
    id: "minimum",
    icon: <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0" />,
    question: "Is there a minimum deposit amount?",
    answer:
      "The minimum deposit is designed to be accessible to users at all levels. You can start with a small amount to learn the platform and increase your deposit as you become more comfortable. The key is to start, compound regularly, and let the Revenue Flywheel work for you over time.",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="section-spacing relative">
      <div className="container">
        <SectionHeading
          label="Frequently Asked Questions"
          title="Everything You Need to Know"
          subtitle="Quick answers to the most common questions about Turbo Loop."
        />

        <AnimatedSection delay={0.2}>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {FAQ_ITEMS.map((item, index) => (
                <AnimatedSection key={item.id} delay={0.1 + index * 0.05}>
                  <AccordionItem
                    value={item.id}
                    className="border-0 rounded-xl overflow-hidden"
                    style={{
                      background: "rgba(10, 18, 38, 0.6)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <AccordionTrigger className="px-5 py-5 text-base md:text-lg font-semibold text-white hover:no-underline hover:text-cyan-300 transition-colors gap-3 [&[data-state=open]]:text-cyan-400">
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5 text-gray-400 text-sm md:text-base leading-relaxed">
                      <div className="pl-8">
                        {item.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </AnimatedSection>
              ))}
            </Accordion>
          </div>
        </AnimatedSection>

        {/* CTA below FAQ */}
        <AnimatedSection delay={0.6}>
          <div className="text-center mt-14">
            <p className="text-gray-400 mb-4">Still have questions?</p>
            <a
              href="https://t.me/TurboLoop_Official"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: "rgba(34,211,238,0.1)",
                border: "1px solid rgba(34,211,238,0.3)",
                color: "#22D3EE",
              }}
            >
              Ask in Telegram Community
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

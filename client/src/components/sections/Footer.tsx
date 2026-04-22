import { SITE } from "@/lib/constants";
import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-cyan-500/10 bg-[#060a14]">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={SITE.logo} alt="Turbo Loop" className="h-10 w-10 object-contain rounded-lg" />
              <span className="text-lg font-heading font-bold">
                <span className="text-white">Turbo</span>
                <span className="text-cyan-400">Loop</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              The Complete DeFi Ecosystem on Binance Smart Chain. Sustainable yield, transparent by design, open to everyone.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-heading font-bold text-white mb-4 uppercase tracking-wider">Quick Links</h4>
            <div className="space-y-2">
              <a href="#ecosystem" className="block text-sm text-gray-400 hover:text-cyan-400 transition-colors">Ecosystem</a>
              <a href="#videos" className="block text-sm text-gray-400 hover:text-cyan-400 transition-colors">Video Hub</a>
              <a href="#events" className="block text-sm text-gray-400 hover:text-cyan-400 transition-colors">Events</a>
              <a href="#roadmap" className="block text-sm text-gray-400 hover:text-cyan-400 transition-colors">Roadmap</a>
              <a href="#trust" className="block text-sm text-gray-400 hover:text-cyan-400 transition-colors">Security</a>
              <a href={SITE.mainApp} target="_blank" rel="noopener noreferrer" className="block text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                Launch App <ExternalLink className="inline h-3 w-3 ml-1" />
              </a>
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-heading font-bold text-white mb-4 uppercase tracking-wider">Community</h4>
            <div className="space-y-2">
              <a href={SITE.socials.telegramCommunity} target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                Telegram Community
              </a>
              <a href={SITE.socials.telegramChat} target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                Telegram Chat
              </a>
              <a href={SITE.socials.twitter} target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                X (Twitter)
              </a>
              <a href={SITE.socials.youtube} target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                YouTube
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 pt-6 border-t border-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Turbo Loop. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            turboloop.tech is the community hub &middot;{" "}
            <a href={SITE.mainApp} target="_blank" rel="noopener noreferrer" className="text-cyan-500/50 hover:text-cyan-400">
              turboloop.io
            </a>{" "}
            is the main dApp
          </p>
        </div>
      </div>
    </footer>
  );
}

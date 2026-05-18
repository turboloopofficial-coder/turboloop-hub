// Visual card for a Smart Notification nudge.
//
// Renders bottom-right on desktop, full-width above the mobile bottom-CTA
// bar on phones. Distinct from the existing Toast component — Toast is
// for ephemeral "Link copied!" pings, this is for actionable nudges with
// a CTA button.
//
// Pure presentational — the SmartNotifications controller decides when
// to mount / unmount this.

"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { NotificationRule } from "@lib/notifications/rules";
import { trackEvent } from "@components/analytics/GoogleAnalytics";

interface NudgeCardProps {
  rule: NotificationRule;
  onDismiss: () => void;
  onAction: () => void;
}

export function NudgeCard({ rule, onDismiss, onAction }: NudgeCardProps) {
  const Icon = rule.icon;

  const handleAction = () => {
    trackEvent("nudge_click", {
      rule_id: rule.id,
      cta_label: rule.cta.label,
      cta_href: rule.cta.href,
    });
    onAction();
  };

  const handleDismiss = () => {
    trackEvent("nudge_dismiss", { rule_id: rule.id });
    onDismiss();
  };

  const ctaClasses =
    "inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-[var(--r-md)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]";

  return (
    <div
      role="status"
      aria-live="polite"
      // Mobile: sits at bottom-[80px] (clears the 68px MobileBottomCTA
      // bar + an 8px gap). z-50 sits below the chatbot (z-[70]) but
      // above the CTA bar (z-60) so the nudge is never hidden.
      //
      // Desktop (md+): anchored bottom-right with the original spacing.
      className="fixed left-4 right-4 bottom-[80px] md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-50 rounded-[var(--r-xl)] border border-[var(--c-border-strong)] bg-[var(--c-surface)] shadow-[var(--s-xl)] p-4 animate-nudge-in"
      style={{
        // Desktop has no CTA bar below — fall back to safe-area inset
        // to clear the iPhone home indicator when this is the only
        // overlay (e.g. on /admin where MobileBottomCTA is hidden).
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-2.5 right-2.5 text-[var(--c-text-subtle)] hover:text-[var(--c-text)] p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-brand-cyan)]"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-[var(--r-md)] flex items-center justify-center"
          style={{ background: "var(--c-brand-gradient)" }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-brand-cyan)] mb-1">
            {rule.eyebrow}
          </div>
          <div className="text-sm font-bold text-[var(--c-text)] leading-snug mb-1">
            {rule.title}
          </div>
          {rule.body && (
            <p className="text-xs text-[var(--c-text-muted)] leading-relaxed mb-3">
              {rule.body}
            </p>
          )}
          {rule.cta.external ? (
            <a
              href={rule.cta.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleAction}
              className={ctaClasses}
            >
              {rule.cta.label}
            </a>
          ) : (
            <Link
              href={rule.cta.href}
              onClick={handleAction}
              className={ctaClasses}
            >
              {rule.cta.label}
            </Link>
          )}
        </div>
      </div>
      <style>{`
        @keyframes nudge-in {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-nudge-in {
          animation: nudge-in 280ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-nudge-in { animation: none; }
        }
      `}</style>
    </div>
  );
}

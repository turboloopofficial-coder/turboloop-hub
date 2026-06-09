"use client";

// Pillar dropdowns for the desktop nav. Reusable NavDropdown component
// + 4 named exports — one per pillar (Protocol, Watch, Community, Earn).
// `ResourcesDropdown` is preserved as an alias of `EarnDropdown` so any
// legacy import still resolves.
//
// Critical fix from the v1 dropdown: imports the pillar arrays from the
// nav-links leaf module, NOT from Navbar. The previous circular import
// (Navbar → ResourcesDropdown → Navbar) left constants undefined at
// first client render and silently nuked the panel.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { TokenPriceWidget } from "@components/token/TokenPriceWidget";
import {
  PROTOCOL_LINKS,
  WATCH_LINKS,
  COMMUNITY_LINKS,
  EARN_LINKS,
  type NavLinkItem,
} from "./nav-links";

// ─── Reusable shell ──────────────────────────────────────────────

interface NavDropdownProps {
  /** Trigger button text — e.g. "Protocol", "Watch & Learn". */
  label: string;
  /** Links rendered as the panel's grid. */
  links: ReadonlyArray<NavLinkItem>;
  /** Panel CSS width — 520px for Protocol (2-col, 6 items), 400px for others. */
  panelWidth: string;
  /** Panel layout — 2-column grid for the wider Protocol panel,
   *  single-column for the slimmer Watch/Community/Earn panels. */
  columns: 1 | 2;
  /** Used for the panel's aria-label + id. */
  panelId: string;
}

export function NavDropdown({
  label,
  links,
  panelWidth,
  columns,
  panelId,
}: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape — standard menu behaviour.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex items-center gap-1 px-3 min-h-[44px] rounded-[var(--r-md)] text-sm font-semibold text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[rgba(15,23,42,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors"
      >
        {label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id={panelId}
          role="menu"
          aria-label={label}
          className={`absolute left-0 top-full mt-2 z-50 max-w-[calc(100vw-2rem)] rounded-[var(--r-xl)] border border-[var(--c-border)] shadow-[var(--s-xl)] p-2 grid gap-1 backdrop-blur-xl backdrop-saturate-150 ${
            columns === 2 ? "grid-cols-2" : "grid-cols-1"
          }`}
          style={{
            width: panelWidth,
            // Glass: surface tint at 85 % per spec. The solid var fallback
            // (#ffffff) covers the first-paint window before the variable
            // resolves.
            background:
              "color-mix(in oklab, var(--c-surface, #ffffff) 85%, transparent)",
          }}
        >
          {links.map((link) => (
            <NavDropdownLink key={link.href} link={link} onNavigate={() => setOpen(false)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Single link card inside a dropdown panel ────────────────────

function NavDropdownLink({
  link,
  onNavigate,
}: {
  link: NavLinkItem;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      role="menuitem"
      className={`flex items-start gap-3 p-3 min-h-[52px] rounded-[var(--r-md)] hover:bg-[rgba(15,23,42,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition group ${
        link.highlight ? "border border-[var(--c-brand-cyan)]" : ""
      }`}
    >
      <div
        className="text-xl flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl"
        style={{
          background:
            "color-mix(in oklab, var(--c-brand-cyan) 10%, transparent)",
        }}
        aria-hidden="true"
      >
        {link.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-[var(--c-text)] group-hover:text-[var(--c-brand-cyan)] transition-colors">
          {link.label}
        </div>
        {link.description && (
          <div className="text-xs text-[var(--c-text-muted)] mt-0.5 leading-snug">
            {link.description}
          </div>
        )}
        {/* The $TURBO Token card in EarnDropdown gets a live price ticker
            inline so the dropdown surfaces live data, not just labels. */}
        {link.highlight && (
          <TokenPriceWidget variant="inline" className="mt-1.5" />
        )}
      </div>
    </Link>
  );
}

// ─── 4 named pillar exports ──────────────────────────────────────

export function ProtocolDropdown() {
  return (
    <NavDropdown
      label="Protocol"
      links={PROTOCOL_LINKS}
      panelWidth="520px"
      columns={2}
      panelId="nav-protocol-panel"
    />
  );
}

export function WatchDropdown() {
  return (
    <NavDropdown
      label="Watch & Learn"
      links={WATCH_LINKS}
      panelWidth="400px"
      columns={1}
      panelId="nav-watch-panel"
    />
  );
}

export function CommunityDropdown() {
  return (
    <NavDropdown
      label="Community"
      links={COMMUNITY_LINKS}
      panelWidth="400px"
      columns={1}
      panelId="nav-community-panel"
    />
  );
}

export function EarnDropdown() {
  return (
    <NavDropdown
      label="Earn & Build"
      links={EARN_LINKS}
      panelWidth="400px"
      columns={1}
      panelId="nav-earn-panel"
    />
  );
}

// Legacy alias — any existing import of `ResourcesDropdown` keeps working
// by mapping to the new Earn pillar (which carries the legacy "earn"
// items: Token, Promotions, Apply, Careers, Creatives).
export const ResourcesDropdown = EarnDropdown;

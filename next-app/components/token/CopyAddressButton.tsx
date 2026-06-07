"use client";

// Tiny copy-to-clipboard button used in the /token page address
// cards. Falls back to navigator.clipboard.writeText; if the secure
// context refuses (rare on iOS in-app browsers + insecure intranets),
// shows a "tap to copy" hint and selects the text via execCommand.
//
// Visual feedback: button briefly flashes green + shows "Copied" for
// 1.5 s on success, then reverts.

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyAddressButtonProps {
  address: string;
  className?: string;
}

export function CopyAddressButton({
  address,
  className = "",
}: CopyAddressButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    let ok = false;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(address);
        ok = true;
      }
    } catch {}
    if (!ok) {
      // Last-resort fallback for browsers without clipboard API.
      try {
        const ta = document.createElement("textarea");
        ta.value = address;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {}
    }
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Copy address ${address}`}
      className={`inline-flex items-center gap-1 text-xs font-bold transition ${
        copied
          ? "text-emerald-600"
          : "text-[var(--c-text-muted)] hover:text-[var(--c-text)]"
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copy
        </>
      )}
    </button>
  );
}

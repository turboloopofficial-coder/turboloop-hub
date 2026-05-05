"use client";

// Toast — single global toast notification surface.
//
// Usage anywhere (client component): import { showToast } from "@components/Toast"
// then call showToast("Link copied!"). The provider lives in layout.tsx.

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Check, AlertCircle, Info } from "lucide-react";

type ToastVariant = "success" | "error" | "info";
type ToastEntry = { id: number; text: string; variant: ToastVariant };

const ToastCtx = createContext<{
  show: (text: string, variant?: ToastVariant) => void;
} | null>(null);

let externalShow: ((text: string, variant?: ToastVariant) => void) | null =
  null;

/** Imperative API — works from anywhere on the client (mutation handlers,
 *  copy callbacks, etc) without needing to thread a hook through props. */
export function showToast(text: string, variant: ToastVariant = "success") {
  externalShow?.(text, variant);
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastEntry[]>([]);
  const idRef = useRef(0);

  const show = (text: string, variant: ToastVariant = "success") => {
    const id = ++idRef.current;
    setItems(prev => [...prev, { id, text, variant }]);
    // Auto-dismiss after 2.6 s — long enough to read, short enough to
    // not get in the way of the next interaction.
    setTimeout(() => {
      setItems(prev => prev.filter(t => t.id !== id));
    }, 2600);
  };

  // Wire the imperative API too.
  useEffect(() => {
    externalShow = show;
    return () => {
      externalShow = null;
    };
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-x-0 bottom-0 z-[var(--z-toast,80)] flex flex-col items-center gap-2 px-4 pointer-events-none"
        style={{
          paddingBottom:
            "max(80px, calc(env(safe-area-inset-bottom) + 80px))",
        }}
      >
        {items.map(t => (
          <ToastItem key={t.id} entry={t} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ entry }: { entry: ToastEntry }) {
  const Icon =
    entry.variant === "success"
      ? Check
      : entry.variant === "error"
        ? AlertCircle
        : Info;
  const color =
    entry.variant === "success"
      ? "#10B981"
      : entry.variant === "error"
        ? "#EF4444"
        : "#0891B2";
  return (
    <div
      className="pointer-events-auto inline-flex items-center gap-2.5 px-4 py-3 rounded-full shadow-[var(--s-xl)] text-sm font-bold animate-toast-in"
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        color: "var(--c-text)",
      }}
    >
      <span
        className="inline-flex w-6 h-6 rounded-full items-center justify-center flex-shrink-0"
        style={{ background: `${color}20`, color }}
      >
        <Icon className="w-3.5 h-3.5" strokeWidth={3} />
      </span>
      <span>{entry.text}</span>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-toast-in {
          animation: toast-in 240ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-toast-in { animation: none; }
        }
      `}</style>
    </div>
  );
}

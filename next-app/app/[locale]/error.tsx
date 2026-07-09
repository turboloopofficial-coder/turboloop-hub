"use client";

// Locale-segment error boundary — catches unhandled exceptions in any
// localized route (/th, /ko, /lo, etc.).

import { useEffect } from "react";
import Link from "next/link";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[TurboLoop] Locale route error:", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "60dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "3rem 1.5rem",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #06B6D4, #7C3AED)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.25rem",
          fontSize: "1.5rem",
        }}
      >
        ⚡
      </div>
      <h1
        style={{
          fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
          fontWeight: 700,
          color: "#F1F5F9",
          marginBottom: "0.75rem",
        }}
      >
        Something went wrong
      </h1>
      <p style={{ color: "#94A3B8", maxWidth: 380, lineHeight: 1.6, marginBottom: "2rem" }}>
        An unexpected error occurred. Your funds remain safe on-chain.
        {error.digest && (
          <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.75rem", opacity: 0.6 }}>
            Error ID: {error.digest}
          </span>
        )}
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "9999px",
            background: "linear-gradient(135deg, #06B6D4, #7C3AED)",
            color: "white",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.08)",
            color: "#F1F5F9",
            fontWeight: 700,
            border: "1px solid rgba(255,255,255,0.12)",
            textDecoration: "none",
            fontSize: "0.875rem",
          }}
        >
          Go home
        </Link>
      </div>
    </main>
  );
}

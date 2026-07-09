"use client";

// Root error boundary — catches unhandled exceptions in the root app/ segment.
// Renders a branded fallback instead of the default Next.js error page.
// This component MUST be a Client Component (Next.js requirement for error.tsx).

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in development; in production swap for your error tracking
    console.error("[TurboLoop] Unhandled error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F172A",
          color: "#F1F5F9",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #06B6D4, #7C3AED)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.5rem",
            fontSize: "2rem",
          }}
        >
          ⚡
        </div>

        <h1
          style={{
            fontSize: "clamp(1.5rem, 5vw, 2.25rem)",
            fontWeight: 800,
            marginBottom: "0.75rem",
            background: "linear-gradient(90deg, #06B6D4, #7C3AED)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            color: "#94A3B8",
            maxWidth: 420,
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}
        >
          An unexpected error occurred. The TurboLoop protocol is unaffected —
          your funds remain safe on-chain.
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
      </body>
    </html>
  );
}

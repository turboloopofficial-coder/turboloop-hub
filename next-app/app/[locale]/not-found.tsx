// Locale-specific 404 page — shown when a localized route is not found.
// Mirrors the root not-found.tsx but uses the locale prefix in the home link.

import Link from "next/link";

export default function LocaleNotFound() {
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
          fontSize: "4rem",
          fontWeight: 900,
          background: "linear-gradient(135deg, #06B6D4, #7C3AED)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "1rem",
          lineHeight: 1,
        }}
      >
        404
      </div>
      <h1
        style={{
          fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
          fontWeight: 700,
          color: "#F1F5F9",
          marginBottom: "0.75rem",
        }}
      >
        Page not found
      </h1>
      <p style={{ color: "#94A3B8", maxWidth: 380, lineHeight: 1.6, marginBottom: "2rem" }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          padding: "0.75rem 1.75rem",
          borderRadius: "9999px",
          background: "linear-gradient(135deg, #06B6D4, #7C3AED)",
          color: "white",
          fontWeight: 700,
          textDecoration: "none",
          fontSize: "0.875rem",
        }}
      >
        Back to TurboLoop
      </Link>
    </main>
  );
}

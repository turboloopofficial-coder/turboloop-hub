import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "react-vendor";
          }
          // Animation library (used in many sections)
          if (id.includes("node_modules/framer-motion") || id.includes("node_modules/motion-")) {
            return "motion";
          }
          // Heavy markdown / syntax highlighting (only used on blog post pages)
          if (
            id.includes("node_modules/shiki") ||
            id.includes("node_modules/@shikijs") ||
            id.includes("node_modules/react-syntax-highlighter") ||
            id.includes("node_modules/refractor") ||
            id.includes("node_modules/prismjs") ||
            id.includes("node_modules/highlight.js")
          ) {
            return "syntax-highlight";
          }
          // Mermaid + diagram rendering (also blog only)
          if (
            id.includes("node_modules/mermaid") ||
            id.includes("node_modules/cytoscape") ||
            id.includes("node_modules/dagre") ||
            id.includes("node_modules/khroma") ||
            id.includes("node_modules/d3-")
          ) {
            return "mermaid";
          }
          // Markdown processing
          if (
            id.includes("node_modules/react-markdown") ||
            id.includes("node_modules/remark-") ||
            id.includes("node_modules/rehype-") ||
            id.includes("node_modules/micromark") ||
            id.includes("node_modules/mdast-") ||
            id.includes("node_modules/hast-") ||
            id.includes("node_modules/unified") ||
            id.includes("node_modules/unist-")
          ) {
            return "markdown";
          }
          // Radix UI primitives
          if (id.includes("node_modules/@radix-ui")) {
            return "radix";
          }
          // Lucide icons
          if (id.includes("node_modules/lucide-react")) {
            return "icons";
          }
          // tRPC + react-query
          if (
            id.includes("node_modules/@trpc") ||
            id.includes("node_modules/@tanstack") ||
            id.includes("node_modules/superjson")
          ) {
            return "trpc";
          }
          return undefined;
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});

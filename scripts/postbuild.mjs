/**
 * postbuild.mjs
 * Runs after `vite build`. Copies dist/public/index.html → dist/public/404.html
 * so Vercel serves the SPA for all unmatched client-side routes (e.g. /admin/login,
 * /films/slug, etc.) without a catch-all rewrite that would break /api/* functions.
 *
 * Vercel behaviour: when a request matches no static file and no serverless function,
 * it serves 404.html with a 200 status if the file exists in outputDirectory.
 * This is the standard Vercel SPA pattern.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distPublic = path.join(root, "dist", "public");
const src = path.join(distPublic, "index.html");
const dest = path.join(distPublic, "404.html");

if (!fs.existsSync(src)) {
  console.error("postbuild: dist/public/index.html not found — skipping 404.html copy");
  process.exit(0);
}

fs.copyFileSync(src, dest);
console.log("postbuild: copied index.html → 404.html (Vercel SPA fallback)");

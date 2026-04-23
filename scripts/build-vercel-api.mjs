import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcFile = path.join(projectRoot, "api/trpc/[trpc].ts");
const outFile = path.join(projectRoot, "api/trpc/[trpc].js");

console.log("🔧 Bundling Vercel serverless handler...");

if (!fs.existsSync(srcFile)) {
  console.error(`❌ Source file not found: ${srcFile}`);
  process.exit(1);
}

await build({
  entryPoints: [srcFile],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node20",
  outfile: outFile,
  logLevel: "info",
  // bcrypt/crypto etc. stay as Node built-ins
  // Everything else (express, trpc, drizzle, neon) gets bundled in
});

// Remove the TS source so Vercel picks up the bundled .js (it prefers .ts over .js if both exist)
fs.unlinkSync(srcFile);

const stats = fs.statSync(outFile);
console.log(`✅ Bundled to ${outFile} (${(stats.size / 1024).toFixed(1)} KB)`);

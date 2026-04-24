import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcFile = path.join(projectRoot, "server/_vercel/trpc-handler.ts");
const outFile = path.join(projectRoot, "api/trpc/[trpc].js");

console.log("🔧 Bundling Vercel serverless handler...");
console.log("  source:", srcFile);
console.log("  output:", outFile);

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
});

const stats = fs.statSync(outFile);
console.log(`✅ Bundled to ${outFile} (${(stats.size / 1024).toFixed(1)} KB)`);
console.log(`   Don't forget to commit ${path.relative(projectRoot, outFile)} after rebuilding.`);

import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const bundles = [
  {
    src: path.join(projectRoot, "server/_vercel/trpc-handler.ts"),
    out: path.join(projectRoot, "api/trpc/[trpc].js"),
    label: "tRPC handler",
  },
  {
    src: path.join(projectRoot, "server/_vercel/cron-publish-blog.ts"),
    out: path.join(projectRoot, "api/cron/publish-blog.js"),
    label: "Cron: publish-blog (legacy)",
  },
  {
    src: path.join(projectRoot, "server/_vercel/cron-master.ts"),
    out: path.join(projectRoot, "api/cron/master.js"),
    label: "Cron: master scheduler (every 5 min)",
  },
  {
    src: path.join(projectRoot, "server/_vercel/og-zoom.ts"),
    out: path.join(projectRoot, "api/og-zoom.js"),
    label: "Zoom banner generator",
  },
  {
    src: path.join(projectRoot, "server/_vercel/sitemap.ts"),
    out: path.join(projectRoot, "api/sitemap.js"),
    label: "Sitemap",
  },
  {
    src: path.join(projectRoot, "server/_vercel/og.ts"),
    out: path.join(projectRoot, "api/og.js"),
    label: "OG image generator",
  },
  {
    src: path.join(projectRoot, "server/_vercel/rss.ts"),
    out: path.join(projectRoot, "api/rss.js"),
    label: "RSS feed",
  },
  {
    src: path.join(projectRoot, "server/_vercel/social-meta.ts"),
    out: path.join(projectRoot, "api/social-meta.js"),
    label: "Social-bot OG previews",
  },
];

console.log("🔧 Bundling Vercel serverless handlers...\n");

for (const b of bundles) {
  if (!fs.existsSync(b.src)) {
    console.error(`❌ Source missing: ${b.src}`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(b.out), { recursive: true });
  await build({
    entryPoints: [b.src],
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node20",
    outfile: b.out,
    logLevel: "warning",
  });
  const stats = fs.statSync(b.out);
  console.log(`  ✓ ${b.label}: ${path.relative(projectRoot, b.out)} (${(stats.size / 1024).toFixed(1)} KB)`);
}

// Ensure each api/ directory has a package.json with type=commonjs
const cjsDirs = ["api/trpc", "api/cron", "api"];
for (const dir of cjsDirs) {
  const pkgPath = path.join(projectRoot, dir, "package.json");
  fs.mkdirSync(path.dirname(pkgPath), { recursive: true });
  fs.writeFileSync(pkgPath, JSON.stringify({ type: "commonjs" }, null, 2) + "\n");
}

console.log("\n✅ All handlers bundled");

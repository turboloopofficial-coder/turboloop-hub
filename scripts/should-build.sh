#!/bin/bash
# Vercel Ignored Build Step — turboloop-hub (next-app)
#
# Returns exit code 0 = SKIP build (no changes to UI/app code)
# Returns exit code 1 = RUN build (changes detected in app code)
#
# Vercel calls this script before every build. If it exits 0, the build is
# skipped and the previous deployment stays live — saving ~40 min of compute.
#
# Files that TRIGGER a build (exit 1):
#   next-app/**          — any Next.js app change
#   server/**            — any server/API change
#   shared/**            — any shared type/config change
#   drizzle/**           — any DB schema change
#   package.json         — dependency changes
#   vercel.json          — Vercel config changes
#   next-app/vercel.json — Next.js Vercel config changes
#
# Files that SKIP a build (exit 0):
#   scripts/**           — utility scripts
#   docs/**              — documentation
#   *.md                 — markdown files
#   client/**            — the turboloop.io client app (separate project)
#   workers/**           — Cloudflare Workers (deployed separately)
#   *.mjs / *.sh         — standalone scripts

echo "Checking if build is needed..."

# Get the list of changed files since last deployment
CHANGED=$(git diff HEAD^ HEAD --name-only 2>/dev/null || echo "")

if [ -z "$CHANGED" ]; then
  echo "No changed files detected — running build to be safe."
  exit 1
fi

echo "Changed files:"
echo "$CHANGED"

# Check if any UI/app files changed
BUILD_NEEDED=false

while IFS= read -r file; do
  case "$file" in
    next-app/*|server/*|shared/*|drizzle/*|package.json|vercel.json|next-app/vercel.json|tsconfig.json)
      echo "✅ Build needed — app file changed: $file"
      BUILD_NEEDED=true
      break
      ;;
    *)
      echo "⏭️  Skippable change: $file"
      ;;
  esac
done <<< "$CHANGED"

if [ "$BUILD_NEEDED" = true ]; then
  echo "Running build."
  exit 1
else
  echo "No app files changed — skipping build to save compute costs."
  exit 0
fi

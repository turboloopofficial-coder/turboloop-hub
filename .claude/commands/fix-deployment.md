---
description: Diagnose and fix Vercel deployment failures for the turboloop.tech Next.js app. Use when deployments are failing, stuck, or showing unexpected errors.
allowed-tools: Bash(curl *), Bash(git *), Bash(cat *), Bash(grep *), Bash(ls *), Bash(npm *), Bash(node *), Read, Glob, Grep
argument-hint: "[deployment-id] — optional Vercel deployment ID to inspect, e.g. dpl_abc123"
---

# Vercel Deployment Failure Diagnosis & Fix

You are diagnosing a Vercel deployment failure for the **turboloop.tech** Next.js 15 monorepo.

## Project context

!`cat /home/ubuntu/turboloop-hub-fresh/CLAUDE.md | head -80`

**Key facts:**
- Monorepo root: `turboloop-hub-fresh/` (or wherever this repo is cloned)
- Next.js app lives in `next-app/` subdirectory — Vercel `rootDirectory` is `next-app`
- Vercel project: `next-app` under team `turboloopofficial-9763s-projects`
- Live domain: `www.turboloop.tech` — **must never go offline**
- Framework: Next.js 15 App Router, Node.js 24.x
- Database: Neon PostgreSQL via `@neondatabase/serverless`
- API token env var: `VERCEL_TOKEN` (check if set, else prompt user)

## Step 1 — Gather deployment state

```bash
VERCEL_TOKEN="${VERCEL_TOKEN:-}"
TEAM_ID="team_GigFX3IbQ5fxfwqch2JWdIzP"
PROJECT_ID="prj_oJ9HDJLI9c7hBbI3hfu5HMWerHCl"
```

Run the following to get the 5 most recent deployments:

!`VERCEL_TOKEN="${VERCEL_TOKEN:-}" && [ -z "$VERCEL_TOKEN" ] && echo "⚠️  VERCEL_TOKEN not set — set it with: export VERCEL_TOKEN=<your-token>" || curl -s "https://api.vercel.com/v6/deployments?teamId=team_GigFX3IbQ5fxfwqch2JWdIzP&projectId=prj_oJ9HDJLI9c7hBbI3hfu5HMWerHCl&limit=5" -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "import json,sys,datetime; data=json.load(sys.stdin); [print(f'{datetime.datetime.fromtimestamp(d[\"createdAt\"]/1000).strftime(\"%m-%d %H:%M\")} | {d[\"readyState\"]:12} | {d[\"uid\"]} | {d.get(\"meta\",{}).get(\"githubCommitMessage\",\"\")[:60]}') for d in data.get('deployments',[])]"`

**If a deployment ID was passed as `$ARGUMENTS`**, inspect that specific deployment. Otherwise inspect the most recent failing one.

## Step 2 — Inspect the failing deployment

For the target deployment ID, fetch its build log:

```bash
# Replace DPL_ID with the actual deployment ID
curl -s "https://api.vercel.com/v2/deployments/${DPL_ID}/events?teamId=team_GigFX3IbQ5fxfwqch2JWdIzP&limit=200&direction=forward" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "
import json, sys
data = json.load(sys.stdin)
events = data if isinstance(data, list) else data.get('events', [])
print(f'Total events: {len(events)}')
for e in events[-40:]:
    text = e.get('text','') or e.get('payload',{}).get('text','')
    if text.strip():
        print(f'  {text[:150]}')
"
```

Also fetch the deployment metadata:

```bash
curl -s "https://api.vercel.com/v13/deployments/${DPL_ID}?teamId=team_GigFX3IbQ5fxfwqch2JWdIzP" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print('readyState:', d.get('readyState'))
print('errorCode:', d.get('errorCode'))
lambdas = d.get('lambdas', [])
for l in lambdas:
    outputs = l.get('output', [])
    print(f'Lambda {l[\"id\"]}: {len(outputs)} outputs')
"
```

## Step 3 — Classify the failure

Based on the build log and metadata, classify the error into one of these categories:

### Category A: Module not found / import error
**Symptoms:** Build log shows `Module not found: Can't resolve '...'`, TypeScript errors, missing package
**Root cause:** Import path points outside `next-app/` directory (webpack can't resolve), or package missing from `next-app/package.json`
**Fix:**
1. Check the failing import path — if it uses `../../../server/` from inside `next-app/`, it's pointing outside the rootDirectory
2. Either copy the file into `next-app/server/` and use `@/server/` alias, or add the package to `next-app/package.json`
3. Verify `next-app/tsconfig.json` has `"@/*": ["./*"]` path alias

### Category B: `Deploying outputs...` failure (0 lambda bundles)
**Symptoms:** Build completes successfully (all pages built, "Build Completed in /vercel/output"), then fails ~10s after "Deploying outputs..." with `unexpected_failure`. API shows `lambdas.output: []`
**Root cause:** Vercel's internal pipeline fails to package the serverless functions. Often triggered by:
- A route using `export const dynamic = 'force-dynamic'` combined with `export const runtime = 'edge'` and `export const preferredRegion = [...]` — the `preferredRegion` array on an Edge function can confuse the new lambda output handler
- A new API route that imports a Node.js-only package (like `@neondatabase/serverless`) while declaring `runtime = 'edge'`
- The `VERCEL_USE_NEW_LAMBDA_OUTPUT_HANDLER` flag (Vercel internal) being activated on the project, causing incompatibility with certain function configurations

**Diagnosis steps:**
```bash
# Check all routes for potentially conflicting exports
grep -rn "preferredRegion\|runtime.*edge\|force-dynamic" next-app/app/api/ next-app/app/ --include="*.ts" --include="*.tsx" | grep -v node_modules
```

**Fix options (try in order):**
1. Remove `preferredRegion` from any Edge function routes — Vercel handles region routing automatically
2. If a route uses `runtime = 'edge'` but imports Node.js-only packages, either switch to `runtime = 'nodejs'` or remove the import
3. Check if `export const dynamic = 'force-dynamic'` is needed — if the route is already an API route, it's dynamic by default
4. Try removing `outputDirectory: .next` from `next-app/vercel.json` (Vercel infers this for Next.js)

### Category C: Build timeout / API unreachable
**Symptoms:** Build hangs or fails during `generateStaticParams`, logs show repeated "Failed to set Next.js data cache" or fetch errors to `api.turboloop.tech`
**Root cause:** `generateStaticParams` calls the live API at build time, but the API is unreachable from Vercel's build environment
**Fix:** Add `export const dynamic = 'force-dynamic'` to the affected page, OR wrap `generateStaticParams` in try/catch that returns `[]` on failure

### Category D: `vercel.json` conflict
**Symptoms:** Deployment fails immediately, or wrong project is deployed
**Root cause:** Root `vercel.json` (legacy Vite config) conflicts with `next-app/vercel.json`
**Fix:** Rename root `vercel.json` to `vercel.json.bak` — it should not exist if Vercel's `rootDirectory` is `next-app`

### Category E: Node.js version mismatch
**Symptoms:** Build fails with native module errors, or `node:` protocol imports fail
**Fix:** Check Vercel project settings — should be `24.x`. Update in Vercel dashboard or via API.

### Category F: `cron-master.ts` accidentally copied to `next-app/server/_vercel/` mirror
**Symptoms:** Build log shows:
```
Type error: Cannot find module '../../drizzle/schema'
  --> next-app/server/_vercel/cron-master.ts
```
**Root cause:** `cron-master.ts` (and `_messagePools.ts`, `_campaigns.ts`) imports `../../drizzle/schema` which doesn't resolve from inside `next-app/`. These files must NEVER be in the `next-app/server/_vercel/` mirror — they are compiled separately by `build:api` (esbuild) into `api/cron/master.js` and are gitignored from the mirror.
**Fix:**
```bash
# Remove from mirror
git rm next-app/server/_vercel/cron-master.ts

# Ensure gitignore rule is in place
grep "cron-master" next-app/.gitignore || echo "server/_vercel/cron-master.ts" >> next-app/.gitignore

# Verify next build passes
cd next-app && npm run build && cd ..

# Commit and push
git add next-app/.gitignore
git commit -m "fix: remove cron-master.ts from next-app mirror"
git push origin main
```
**Prevention:** The correct mirror command is ONLY:
```bash
cp server/_vercel/telegram-webhook.ts next-app/server/_vercel/telegram-webhook.ts
cp server/_vercel/_telegram.ts next-app/server/_vercel/_telegram.ts
```
Never copy `cron-master.ts`, `_messagePools.ts`, or `_campaigns.ts` to the mirror.

## Step 4 — Apply the fix

Once the category is identified:

1. **Read the affected file(s)** to understand the current state
2. **Make the minimal targeted change** — don't refactor, just fix the specific issue
3. **Verify the fix** by checking for TypeScript errors: `cd next-app && npx tsc --noEmit 2>&1 | head -20`
4. **Commit and push** following the project's deployment protocol:
   - Commit message format: `fix(vercel): <concise description of what was fixed>`
   - Push to `origin/main` — Vercel auto-deploys on push
5. **Monitor the new deployment** — poll every 30s for up to 5 minutes

## Step 5 — Monitor the new deployment

After pushing, poll the latest deployment status:

```bash
# Poll every 30 seconds for up to 5 minutes
for i in $(seq 1 10); do
  STATUS=$(curl -s "https://api.vercel.com/v6/deployments?teamId=team_GigFX3IbQ5fxfwqch2JWdIzP&projectId=prj_oJ9HDJLI9c7hBbI3hfu5HMWerHCl&limit=1" \
    -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "import json,sys; d=json.load(sys.stdin)['deployments'][0]; print(d['readyState'], d['uid'])")
  echo "$(date +%H:%M:%S) — $STATUS"
  echo "$STATUS" | grep -q "READY" && echo "✅ Deployment succeeded!" && break
  echo "$STATUS" | grep -q "ERROR" && echo "❌ Deployment failed again" && break
  sleep 30
done
```

## Step 6 — Verify live site

After a READY deployment:

```bash
# Check the live site is responding
curl -sI https://www.turboloop.tech | head -5
# Check a key API route
curl -s https://www.turboloop.tech/api/token-price | python3 -c "import json,sys; d=json.load(sys.stdin); print('token-price OK:', d.get('price','N/A'))"
```

## Known history for this project

The following issues have been investigated and resolved (or ruled out):

| Issue | Status | Notes |
|-------|--------|-------|
| `@neondatabase/serverless` not found | Fixed in commit `56c209a` | Import path changed from `../../../server/` to `@/server/` |
| Root `vercel.json` conflict | Fixed — renamed to `.bak` | Legacy Vite config was interfering |
| `turboloop.tech` bare domain on project | Removed | Was causing redirect loops |
| `VERCEL_USE_NEW_LAMBDA_OUTPUT_HANDLER=0` env var | Removed | Vercel ignores it |
| Node.js version | Set to 24.x | Matches last READY deployment |
| `preferredRegion` on telegram-webhook Edge route | **Suspected cause of `Deploying outputs...` failure** | Added in commit between last READY and first failure — try removing it |
| `export const dynamic = 'force-dynamic'` on blog `[slug]` page | Present | Prevents static generation of ~150 blog pages; intentional to avoid build-time API calls |

## Quick reference — Vercel API

```bash
# List recent deployments
curl -s "https://api.vercel.com/v6/deployments?teamId=team_GigFX3IbQ5fxfwqch2JWdIzP&projectId=prj_oJ9HDJLI9c7hBbI3hfu5HMWerHCl&limit=5" \
  -H "Authorization: Bearer $VERCEL_TOKEN"

# Get deployment events (build log)
curl -s "https://api.vercel.com/v2/deployments/{DPL_ID}/events?teamId=team_GigFX3IbQ5fxfwqch2JWdIzP&limit=200&direction=forward" \
  -H "Authorization: Bearer $VERCEL_TOKEN"

# Get deployment metadata (lambdas, errorCode, etc.)
curl -s "https://api.vercel.com/v13/deployments/{DPL_ID}?teamId=team_GigFX3IbQ5fxfwqch2JWdIzP" \
  -H "Authorization: Bearer $VERCEL_TOKEN"

# Trigger a new deployment (redeploy latest commit)
curl -s -X POST "https://api.vercel.com/v13/deployments?teamId=team_GigFX3IbQ5fxfwqch2JWdIzP" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"next-app","gitSource":{"type":"github","repoId":"...","ref":"main"}}'
```

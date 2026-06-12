# /restore-admin-panel

Restore the admin panel at `https://api.turboloop.tech/admin` which is currently returning 404.

## Root Cause

The `vercel.json` file is **missing from the repo root**. This file does three things:
1. Configures the SPA catch-all rewrite (`"/*" → "/index.html"`) so Vercel serves the Vite SPA for all client-side routes including `/admin/*`
2. Sets per-function memory and timeout limits (tRPC handler needs 1024MB / 60s)
3. Registers the native Vercel cron for `publish-blog`

Without it, Vercel only serves files at exact paths. `/` works because `index.html` exists at root. `/admin/login` returns `NOT_FOUND` because there is no physical file there — it's a client-side route handled by wouter inside the SPA.

**Nothing else is broken.** All 15 admin tabs, all TRPC endpoints, the DB, R2 storage — all intact. Only the routing config is missing.

## The Admin Panel — Full Feature Inventory

| Tab | Component | What it does |
|---|---|---|
| AI Drafter | `AIDrafter.tsx` | Anthropic Claude Sonnet — drafts blog posts from a topic prompt, edits, publishes |
| Submissions | `SubmissionsManager.tsx` | Reviews community testimonials/submissions, approve/reject/publish |
| Blog Posts | `BlogManager.tsx` | Full blog CMS — create, edit, publish, unpublish, delete |
| Automation | `AutomationManager.tsx` | Telegram broadcast controls — force-fire any cron slot, view dedup log |
| Omni-Composer | `OmniComposer.tsx` | Multi-channel post composer — Telegram EN/DE/HI/ID, schedule, preview |
| Videos | `VideoManager.tsx` | Manage Cinematic Universe films — slug, poster, season/episode, publish |
| Events | `EventManager.tsx` | Create/edit Zoom events — title, link, passcode, language, status |
| Event Apps | `EventApplicationsManager.tsx` | Review event applications from the /apply page |
| Social Wall | `SocialWallManager.tsx` | Approve/reject community social wall posts, AI suggestion engine |
| Promotions | `PromotionManager.tsx` | Manage promotions page entries |
| Leaderboard | `LeaderboardManager.tsx` | Edit country leaderboard rankings, scores, descriptions |
| Presentations | `PresentationManager.tsx` | Manage 48-language presentation deck links |
| CRM | `CRMDashboard.tsx` | Community relationship management — contacts, notes, follow-ups |
| Careers | `CareersManager.tsx` | Manage careers/job listings |
| Settings | `ZoomSettings.tsx` + `WelcomePopupManager.tsx` | Zoom link/passcode/timeLabel per language; welcome popup toggle |

Auth: password-gated via JWT cookie (`jose`). Login at `/admin/login`. Session stored in `admin_credentials` table.

## Fix Steps

### Step 1 — Create `vercel.json` at repo root

Create `/home/ubuntu/turboloop-hub-fresh2/vercel.json` with this exact content:

```json
{
  "buildCommand": "npm run build && npm run build:api",
  "outputDirectory": "dist/public",
  "installCommand": "npm install --legacy-peer-deps",
  "functions": {
    "api/trpc/[trpc].js": {
      "memory": 1024,
      "maxDuration": 60
    },
    "api/cron/master.js": {
      "memory": 1024,
      "maxDuration": 60
    },
    "api/cron/publish-blog.js": {
      "memory": 512,
      "maxDuration": 30
    },
    "api/og.js": {
      "memory": 512,
      "maxDuration": 10
    },
    "api/og-zoom.js": {
      "memory": 512,
      "maxDuration": 10
    },
    "api/og-banner.js": {
      "memory": 512,
      "maxDuration": 10
    },
    "api/monitor.js": {
      "memory": 128,
      "maxDuration": 10
    },
    "api/sitemap.js": {
      "memory": 256,
      "maxDuration": 10
    },
    "api/rss.js": {
      "memory": 256,
      "maxDuration": 10
    },
    "api/social-meta.js": {
      "memory": 256,
      "maxDuration": 10
    }
  },
  "crons": [
    {
      "path": "/api/cron/publish-blog",
      "schedule": "0 4 * * *"
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Key rules:**
- The `/api/(.*)` rewrite MUST come before the SPA catch-all, otherwise API routes get swallowed by the SPA rewrite
- `outputDirectory` must match `vite.config.ts` → `build.outDir` → `dist/public`
- `buildCommand` runs both the Vite build AND the API bundle in one step

### Step 2 — Commit and push

```bash
cd /home/ubuntu/turboloop-hub-fresh2
git add vercel.json
git commit -m "fix: restore vercel.json — SPA rewrite + function config (fixes admin 404)"
git push origin main
```

### Step 3 — Verify after Vercel redeploys (~60–90 seconds)

```bash
# Should return 200 (the SPA HTML, not NOT_FOUND)
curl -s -o /dev/null -w "%{http_code}" "https://api.turboloop.tech/admin/login"

# Should still return 200 (API not broken by the rewrite)
curl -s -o /dev/null -w "%{http_code}" "https://api.turboloop.tech/api/cron/master?checkdb=1"
```

Both must return `200`. If `/admin/login` still returns 404, check Vercel deployment logs for build errors.

## What to check if it still 404s after deploy

1. **Build failed** — check Vercel dashboard for the deployment. A failed build keeps the old deployment live.
2. **Wrong outputDirectory** — verify `dist/public/index.html` exists after `npm run build`. If Vite changed its output dir, update `vercel.json` to match.
3. **Rewrite order wrong** — if API calls start 404ing, the rewrites are in the wrong order. The `/api/(.*)` rule must be first.
4. **vercel.json not at root** — Vercel only reads `vercel.json` from the project root (the directory Vercel is pointed at). Confirm the Vercel project root is set to the repo root, not `next-app/`.

## Architecture note

There are TWO Vercel projects from this repo:
- **`api.turboloop.tech`** → deploys from repo root → serves the Vite SPA (`dist/public/`) + serverless functions (`api/`) — **this is where the admin panel lives**
- **`turboloop.tech`** (or `www.turboloop.tech`) → deploys from `next-app/` → serves the Next.js marketing site

The `next-app/vercel.json` (framework: nextjs) is for the second project only. The root `vercel.json` is for the first project and was missing.

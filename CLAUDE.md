# CLAUDE.md — Turboloop Hub

Marketing/community hub for **Turbo Loop** (DeFi yield protocol on BSC).
Live: https://turboloop-hub.vercel.app · Target domain: https://turboloop.tech

This file is the single source of truth for future Claude sessions. Read it first.
Versioned feature history lives in `todo.md` (V1–V9+). Marketing/ops playbook lives in `scripts/MARKETING_PLAYBOOK.md`.

---

## What this is

A premium React SPA + tRPC API marketing hub — not the dApp itself. Visitors land here to learn what Turbo Loop is, watch films, read blog posts, join Zoom calls, browse 48-language presentations, see the leaderboard, submit testimonials, and get pushed to the actual dApp. Admins use a password-gated dashboard to manage all content and run an AI blog drafter.

The site is restructured into a narrative homepage + ~25 dedicated topic pages (security, community, creatives, ecosystem, films, learn, etc.) for SEO and shareability.

## Stack

| Layer   | Tech                                                                                                                     |
| ------- | ------------------------------------------------------------------------------------------------------------------------ |
| UI      | React 19, Vite 7, Tailwind CSS 4, wouter (router), framer-motion, Radix UI primitives, lucide-react, cmdk (Cmd+K search) |
| API     | tRPC v11 (router in `server/routers.ts`), zod validation, JWT cookie auth (jose)                                         |
| Data    | Postgres on Neon (serverless), Drizzle ORM (`drizzle/schema.ts`), bcryptjs for admin password                            |
| Storage | Cloudflare R2 via `@aws-sdk/client-s3` (image/PDF uploads)                                                               |
| AI      | `@anthropic-ai/sdk` — Sonnet 4.5 for blog drafting (admin-only)                                                          |
| Infra   | Vercel (static + serverless functions + native cron); external cron-job.org pinger every 5 min for the master scheduler  |
| Tests   | Vitest, server-side only (`server/**/*.test.ts`)                                                                         |

Path aliases: `@/*` → `client/src/*`, `@shared/*` → `shared/*`, `@assets/*` → `attached_assets/*`.

## Folder map

```
turboloop-hub/
├── api/                  # Vercel serverless entry points (BUNDLED OUTPUT — committed)
│   ├── trpc/[trpc].js    # tRPC handler
│   ├── cron/master.js    # Master scheduler (every 5 min via external pinger)
│   ├── cron/publish-blog.js  # Vercel native cron (daily 04:00 UTC, legacy)
│   ├── og.js, og-zoom.js, og-banner.js   # OG image generators (Edge runtime)
│   ├── sitemap.js, rss.js
│   └── package.json      # {"type":"commonjs"} — keep
│
├── client/
│   ├── index.html
│   ├── public/           # Static assets served as-is
│   └── src/
│       ├── App.tsx       # Routes (wouter), lazy-loaded pages, error boundaries
│       ├── main.tsx      # tRPC + react-query providers, referral capture
│       ├── pages/        # ~26 page components (Home eager, rest lazy)
│       ├── components/
│       │   ├── sections/ # Big composable home sections (Hero, Flywheel, Leaderboard, …)
│       │   ├── admin/    # AIDrafter, SubmissionsManager
│       │   └── ui/       # shadcn/ui-style Radix wrappers
│       ├── contexts/     # ThemeContext (light "Frosted Aurora" theme)
│       ├── hooks/        # useMobile, useComposition, usePersistFn
│       ├── lib/          # trpc client, blogVisuals, cinematicUniverse, comparisons,
│       │                 #  defi101, ecosystemPillars, searchIndex, referral, wallet…
│       └── index.css     # Tailwind + custom theme tokens
│
├── server/               # Source of truth for ALL backend logic
│   ├── _core/            # Dev-only Express harness
│   │   ├── index.ts      # Boots Express + Vite middleware in dev
│   │   ├── trpc.ts, context.ts, env.ts, systemRouter.ts, vite.ts
│   ├── _vercel/          # Vercel serverless source (bundled into api/ at build)
│   │   ├── trpc-handler.ts
│   │   ├── cron-master.ts        # Daily Telegram cadence (4 msgs/day)
│   │   ├── cron-publish-blog.ts  # Legacy native-cron handler
│   │   ├── _telegram.ts, _messagePools.ts
│   │   ├── og.ts, og-zoom.ts, sitemap.ts, rss.ts
│   ├── routers.ts        # THE tRPC router (admin auth, content CRUD, AI drafter, newsletter, submissions)
│   ├── db.ts             # Drizzle queries (one file, all tables)
│   └── storage.ts        # R2 put/get
│
├── shared/
│   ├── _core/errors.ts
│   ├── const.ts
│   └── types.ts
│
├── drizzle/
│   ├── schema.ts         # All 11 tables — single file
│   └── migrations/       # drizzle-kit generated
│
├── scripts/              # One-off node scripts: seed.mjs, upload-to-r2, gen-thumbs,
│                         # post-launch-message, MARKETING_PLAYBOOK.md, COUNTRY_LEADS_BRIEF.md
├── todo.md               # Versioned feature history (V1–V9+) — APPEND-ONLY chronicle
├── vercel.json           # Function memory/timeout, native cron, SPA rewrite
├── vite.config.ts        # Manual chunk splitting (react-vendor, motion, radix, mermaid, …)
└── drizzle.config.ts
```

## Commands

```bash
npm install --legacy-peer-deps   # match Vercel's installCommand
npm run dev                       # tsx watch — Express + Vite on first free port from 3000
npm run build                     # vite build → dist/public
npm run build:api                 # esbuild bundle server/_vercel → api/*.js (commit the output)
npm run check                     # tsc --noEmit
npm run test                      # vitest (server tests only)
npm run format                    # prettier
npm run db:generate / db:push / db:migrate   # drizzle-kit
npm run seed                      # scripts/seed.mjs
npm run r2:upload                 # scripts/upload-to-r2.mjs
```

**Package manager**: declares `pnpm@10.4.1` but Vercel installs with `npm install --legacy-peer-deps`. Use whichever matches the lockfile present.

## Architecture: the dual-runtime quirk (read this carefully)

The same TypeScript backend runs two ways:

1. **Dev (`npm run dev`)** — `server/_core/index.ts` starts Express on port 3000 (or first free port), mounts `appRouter` from `server/routers.ts` at `/api/trpc` via `createExpressMiddleware`, and Vite serves the React app with HMR.

2. **Prod (Vercel)** — there is no Express. `scripts/build-vercel-api.mjs` esbuild-bundles each handler in `server/_vercel/` into a self-contained CommonJS file under `api/`:
   - `server/_vercel/trpc-handler.ts` → `api/trpc/[trpc].js`
   - `server/_vercel/cron-master.ts` → `api/cron/master.js`
   - …etc for og, sitemap, rss, og-zoom, cron-publish-blog
     These bundled `.js` files are **committed to git** (see `.gitignore` line 121) and deployed to Vercel as-is. Each `api/*` subdir has a `package.json` with `{"type":"commonjs"}` so Node loads them as CJS.

**Implications**:

- Editing `server/routers.ts` → works in dev immediately, but for prod you must run `npm run build:api` and commit the regenerated `api/trpc/[trpc].js`.
- Same for any change in `server/_vercel/*` or any of its imports (db.ts, storage.ts, drizzle/schema.ts).
- The `vercel.json` `functions` block sets per-route memory + maxDuration. tRPC handler is 60s/1024MB.

## Data model (drizzle/schema.ts)

11 tables, all in one file:
`admin_credentials`, `blog_posts`, `videos`, `events`, `country_leaderboard`, `promotions`, `roadmap_phases`, `presentations`, `site_settings` (key-value, also used as cron-fire dedup ledger), `newsletter_signups`, `content_submissions`.

`videos` has optional Cinematic Universe metadata (slug, season, episode, posterUrl) — null for non-cinematic rows.
`blog_posts` supports `scheduledPublishAt` with self-heal in `publishOverdueBlogs()` — runs from the cron AND opportunistically from public list queries, so a missed cron day catches up on next visit.

## Routes (App.tsx)

Public: `/`, `/feed`, `/blog/:slug`, `/topic/:tag`, `/reels/:slug`, `/security`, `/community`, `/creatives`, `/roadmap`, `/promotions`, `/library`, `/faq`, `/ecosystem`, `/ecosystem/:slug`, `/films`, `/films/:slug`, `/submit`, `/vs/:slug`, `/learn`, `/learn/:slug`, `/privacy`, `/terms`.
Admin: `/admin/login`, `/admin/:rest*` (cookie-gated, JWT in `admin_token` httpOnly cookie).
Special: `/sitemap.xml`, `/rss.xml` (rewritten to API in `vercel.json`).

`Home` is eager; every other page is `lazy()` with a shared `PageLoader` fallback inside `PageErrorBoundary`. Route transitions are AnimatePresence fades (180ms).

## Cron / scheduled work

Two layers:

1. **Vercel native cron** — `vercel.json` schedules `/api/cron/master` daily at `0 4 * * *` (04:00 UTC). Belt-and-braces backup.
2. **External pinger (cron-job.org)** hits `/api/cron/master` **every 5 minutes**. The handler in `server/_vercel/cron-master.ts` decides which of 4 daily tasks to run based on UTC time, dedup'd via `site_settings` rows keyed `lastFired:<task>:<YYYY-MM-DD>`:
   - 14:00 UTC — daily blog publish + Telegram announce
   - 15:00 UTC — Hindi/Urdu Zoom T-30 reminder
   - 16:30 UTC — English Zoom T-30 reminder
   - 18:00 UTC — daily cinematic film
   - One-shot launch message (date-less key) — already fired

Telegram broadcast helpers in `server/_vercel/_telegram.ts` and message pools in `_messagePools.ts`.

## Auth model

Single admin account. Login at `/admin/login` POSTs `{email, password}` to `admin.login`. Server checks against `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars (auto-seeds `admin_credentials` row with bcrypt hash on first login), signs a 7-day JWT with `JWT_SECRET`, sets `admin_token` httpOnly cookie. `adminProcedure` middleware verifies cookie or `x-admin-token` header on every protected call.

If a tRPC call returns `UNAUTHORIZED` while on `/admin/*`, `main.tsx` auto-redirects to `/admin/login`.

## Environment variables

Required (server/\_core/env.ts + routers.ts):

- `DATABASE_URL` — Neon Postgres connection string
- `JWT_SECRET` — admin token signing key
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — single admin login
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`, `R2_ENDPOINT` — Cloudflare R2
- `ANTHROPIC_API_KEY` — AI Drafter (optional; feature throws helpful error if missing)
- Telegram bot token + channel IDs (used by `_telegram.ts` — check that file for exact var names before changes)

Set in Vercel project settings for prod; in `.env` locally (gitignored).

## Conventions

- **Comments**: existing code uses minimal comments, only for non-obvious WHY (see `cron-master.ts` header, `publishOverdueBlogs` doc). Match this — don't narrate WHAT.
- **Pages**: lazy-load anything that isn't `Home`. Wrap inside `PageErrorBoundary`.
- **New tRPC procedures**: add to `server/routers.ts`, then add the corresponding `db.ts` query. Public = `publicProcedure`, gated = `adminProcedure`.
- **New table**: add to `drizzle/schema.ts`, run `npm run db:generate` then `npm run db:push`.
- **Editing anything in `server/_vercel/` or its imports**: remember to `npm run build:api` and commit the regenerated `api/*.js`.
- **Vite chunk splitting**: heavy libs (mermaid, shiki, react-syntax-highlighter, radix, framer-motion, lucide, trpc, markdown stack) are manually chunked in `vite.config.ts` so the homepage stays light. Adding a new heavy dep that's only used on one page? Consider adding a chunk rule.
- **No README.md**: per repo state. Don't create one unless asked. This file is the entry point.

## Deployment Protocol — direct push to main

This repo runs in **fully-autonomous mode**: Claude pushes directly to `main`, no PR required. Vercel auto-deploys on push (~90s). To compensate for skipping PR review, **every push must run the full pre-push verification protocol below**. This is non-negotiable — never push broken code.

### Pre-push verification (run in this order)

1. `npm run check` — TypeScript must pass clean (zero errors).
2. `npm run build` — Vite production build must succeed.
3. **If any file in `server/_vercel/*` or its imports (`server/db.ts`, `server/storage.ts`, `drizzle/schema.ts`, `server/routers.ts`) was changed**: run `npm run build:api` and stage the regenerated `api/*.js` files with the same commit. Skipping this means dev works but prod is broken.
4. `npm run test` — all server Vitest suites must pass.
5. `npm run format` — re-stage any files Prettier touched.
6. `git diff --staged` — read your own diff. Look for typos, missing imports, broken JSX, accidental `console.log`, leftover debug code.
7. Commit with a clear message. Push to `origin/main`.
8. **Smoke test live (~90s after push)**: curl the homepage + every route the change touched. Confirm `200` status. For routes that should reflect the change in HTML/CSS, confirm the change is visible (sitemap entry, new copy, etc.).
9. Report what was checked, what passed, what shipped, and the live-verified URLs.

### When to pause and ask, not ship

The autonomous workflow has limits. Pause and ask the user before pushing if any of these are true:

- The change touches **>5 files** in a single commit.
- The change modifies **cron logic** (`server/_vercel/cron-master.ts`, `cron-publish-blog.ts`, `vercel.json` cron block).
- The change modifies **auth** (`server/routers.ts` `adminProcedure`, JWT logic, `admin_credentials` table).
- The change is a **schema migration** that runs against prod data (drizzle migrations are not auto-applied — `npm run db:push` is manual).
- The change touches **>1 file in `server/_vercel/`** at once (high blast radius — both dev and prod paths affected).
- A verification step **fails twice in a row** with different errors. Don't loop.
- You'd describe the change as a **refactor** or **architectural** change rather than a feature/fix.

In all other cases, ship autonomously.

### Recovery

If a push lands and breaks production:

1. Identify the breaking commit via `git log --oneline -10` and Vercel's deploy log.
2. Default action: `git revert <sha>` and push the revert. Don't try to fix-forward under pressure.
3. Investigate the failure root cause in a follow-up commit.

Force-pushes to main are **never** allowed under autonomous mode.

## Recent context (as of 2026-05-02)

Last commit: `a22abb3` — shipped 8 polish features (Cmd+K search via cmdk, share widget, FeaturedSubmissions strip on `/community`, `/privacy`, `/terms`, page transitions, error boundaries, 404 polish, loading skeletons).
See `git log` for the latest. See `todo.md` for the long-form V1–V9 history.

## Things that surprise people

1. The `api/*.js` files are committed build artifacts, not hand-written.
2. The cron is two-tiered (Vercel native + external 5-min pinger) and dedupes via `site_settings`.
3. `videos` table holds two very different things (regular reels/tutorials AND Cinematic Universe films) distinguished by whether `slug`/`season`/`episode` are set.
4. Blog auto-publish self-heals: even if cron misses, the next public list query catches up.
5. `admin_credentials` table is reseeded from env vars on every login attempt — env is the source of truth, the table is a derived bcrypt cache.

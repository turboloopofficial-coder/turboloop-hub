# TurboLoop Tech Hub — Project Handoff for Claude Code

## Project Overview

TurboLoop Tech Hub is a community hub website for the Turbo Loop DeFi ecosystem on Binance Smart Chain. It serves as the central information portal with educational videos, blog articles, events, promotions, a country leaderboard, and a library of 49 PDF presentations in different languages. The site is live at **turboloop.tech**.

The design follows a **"Frosted Aurora" light theme** — sky-blue to lavender to mint gradient backgrounds with glassmorphism cards, soft shadows, and subtle aurora blob animations.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Vite |
| Backend | Express 4, tRPC 11 (type-safe RPC) |
| Database | MySQL/TiDB (via Drizzle ORM) |
| Auth | Custom admin email/password login with JWT cookies |
| UI Library | shadcn/ui components |
| Routing | wouter (lightweight React router) |
| State | tRPC React Query hooks |
| File Storage | S3 via built-in storage helpers |
| Hosting | Manus platform (turboloop.tech) |

---

## Project Structure

```
turboloop-hub/
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.tsx             # Routes & layout
│   │   ├── index.css           # Global styles & theme variables
│   │   ├── main.tsx            # Entry point with providers
│   │   ├── lib/
│   │   │   ├── constants.ts    # Site data, flywheel steps, language flags
│   │   │   ├── trpc.ts         # tRPC client binding
│   │   │   └── utils.ts        # Utility functions
│   │   ├── pages/
│   │   │   ├── Home.tsx        # Main landing page (all sections)
│   │   │   ├── AdminLogin.tsx  # Admin email/password login
│   │   │   ├── AdminDashboard.tsx  # Full admin CMS (700+ lines)
│   │   │   ├── FeedPage.tsx    # Blog/video feed with filters
│   │   │   └── BlogPost.tsx    # Individual blog post view
│   │   ├── components/
│   │   │   ├── Navbar.tsx      # Main navigation bar
│   │   │   ├── BackgroundEffects.tsx  # Aurora gradient blobs
│   │   │   ├── ParticleCanvas.tsx     # Canvas particle network
│   │   │   ├── ScrollProgress.tsx     # Top scroll progress bar
│   │   │   ├── FloatingLaunchButton.tsx  # Sticky CTA button
│   │   │   ├── SectionHeading.tsx     # Reusable section header
│   │   │   ├── WelcomePopup.tsx       # First-visit welcome modal
│   │   │   ├── ImageUpload.tsx        # Admin image upload to S3
│   │   │   └── sections/             # Homepage sections:
│   │   │       ├── HeroSection.tsx
│   │   │       ├── EcosystemSection.tsx
│   │   │       ├── LeaderboardSection.tsx
│   │   │       ├── FlywheelSection.tsx
│   │   │       ├── PromotionsSection.tsx
│   │   │       ├── VideoSection.tsx
│   │   │       ├── BlogSection.tsx
│   │   │       ├── EventsSection.tsx
│   │   │       ├── RoadmapSection.tsx
│   │   │       ├── TrustSection.tsx   # Presentations library
│   │   │       ├── FaqSection.tsx
│   │   │       └── Footer.tsx
│   │   └── components/ui/     # shadcn/ui components (do not edit)
│   └── public/                # favicon, robots.txt only
├── server/
│   ├── routers.ts             # All tRPC routes (admin auth, content, CRUD)
│   ├── db.ts                  # Database query helpers
│   ├── storage.ts             # S3 storage helpers
│   ├── _core/                 # Framework internals (do not edit)
│   └── *.test.ts              # Vitest tests
├── drizzle/
│   └── schema.ts              # Database schema (all tables)
├── shared/                    # Shared types & constants
└── todo.md                    # Feature tracking
```

---

## Database Tables

The database has 9 tables defined in `drizzle/schema.ts`:

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | OAuth users (Manus login) | openId, name, email, role |
| `admin_credentials` | Admin login (email/password) | email, passwordHash |
| `blog_posts` | Blog articles | title, slug, content, coverImage, published |
| `videos` | YouTube videos by language | title, youtubeUrl, category, language, languageFlag |
| `events` | Zoom meetings/events | title, dateTime, meetingLink, passcode, status |
| `country_leaderboard` | Country rankings | rank, country, countryCode, score |
| `promotions` | Banner promotions | title, description, details (JSON), active |
| `roadmap_phases` | Project roadmap | phase, title, status (completed/current/upcoming) |
| `presentations` | PDF library (49 entries) | title, language, fileUrl, published |
| `site_settings` | Key-value config | settingKey, settingValue |

---

## API Routes (tRPC)

All API calls go through tRPC at `/api/trpc`. The routes are defined in `server/routers.ts`.

**Public routes** (no auth required) — accessed via `trpc.content.*`:

| Route | Returns |
|-------|---------|
| `content.blogPosts` | All published blog posts |
| `content.blogPost({ slug })` | Single blog post by slug |
| `content.videos` | All published videos |
| `content.events` | All published events |
| `content.leaderboard` | Country leaderboard entries |
| `content.promotions` | Active promotions |
| `content.roadmap` | Roadmap phases |
| `content.presentations` | Published presentations |
| `content.setting({ key })` | Site setting by key |

**Admin auth routes** — accessed via `trpc.admin.*`:

| Route | Purpose |
|-------|---------|
| `admin.login({ email, password })` | Login, sets JWT cookie |
| `admin.me` | Returns current admin email |
| `admin.logout` | Clears admin cookie |

**Admin CRUD routes** (require admin cookie) — accessed via `trpc.manage.*`:

All content types have `list`, `create`, `update`, `delete` mutations. Example: `manage.listBlogPosts`, `manage.createBlogPost`, `manage.updateBlogPost`, `manage.deleteBlogPost`.

---

## Admin Panel

The admin panel is at `/admin/login`. After login, it redirects to `/admin/dashboard`.

**Credentials:** Stored as environment secrets `ADMIN_EMAIL` and `ADMIN_PASSWORD`. On first login, the admin account is auto-created in the database.

**Admin Dashboard Tabs:**
1. **Blog** — Create/edit/delete blog posts (Markdown content, cover images)
2. **Videos** — Add YouTube URLs with language, category, flag
3. **Events** — Create Zoom events with date/time, meeting link, passcode
4. **Leaderboard** — Update country rankings and scores
5. **Promotions** — Create promotional banners with descriptions
6. **Roadmap** — Update roadmap phase statuses
7. **Presentations** — Manage PDF library (49 entries seeded)
8. **Settings** — Edit welcome popup title and message

---

## Authentication Flow

The admin login uses a custom email/password system (not Manus OAuth):

1. User submits email + password to `admin.login` tRPC mutation
2. Server verifies against `admin_credentials` table (bcrypt hashed)
3. On success, server sets `admin_token` JWT cookie (7-day expiry, SameSite=Lax)
4. Frontend navigates to `/admin/dashboard`
5. `AdminDashboard` calls `admin.me` to verify the cookie
6. If no valid cookie, redirects back to `/admin/login`

---

## Key Design Decisions

The **"Frosted Aurora" light theme** uses these patterns consistently:

- **Page backgrounds:** `linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #f0fdfa 100%)`
- **Card style:** `background: rgba(255,255,255,0.7)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(0,0,0,0.06)`
- **Text colors:** `text-slate-800` (headings), `text-slate-600` (body), `text-slate-400` (muted)
- **Accent colors:** Cyan (`#0891b2`, `text-cyan-600`) and Purple (`#a855f7`, `text-purple-600`)
- **Gradient text:** `background: linear-gradient(135deg, #0891b2, #a855f7)` with `-webkit-background-clip: text`

---

## Environment Variables

These are managed by the Manus platform and injected automatically:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `VITE_APP_TITLE` | Site title |
| `BUILT_IN_FORGE_API_URL` | Internal API URL |
| `BUILT_IN_FORGE_API_KEY` | Internal API key |

---

## Common Tasks

**To add a new homepage section:**
1. Create `client/src/components/sections/NewSection.tsx`
2. Import and add it to `client/src/pages/Home.tsx`
3. If it needs data, add a query in `server/db.ts` and a route in `server/routers.ts`

**To add a new admin tab:**
1. Add the manager component inside `client/src/pages/AdminDashboard.tsx`
2. Add a new `TabsTrigger` and `TabsContent` in the main dashboard component
3. Add corresponding CRUD routes in `server/routers.ts`

**To modify the database:**
1. Edit `drizzle/schema.ts`
2. Run `pnpm db:push` to apply changes
3. Update `server/db.ts` with new query helpers
4. Update `server/routers.ts` with new routes

**To run tests:**
```bash
pnpm test
```

**To start the dev server:**
```bash
pnpm dev
```

---

## Current Content in Database

- **49 presentations** in 49 languages (Amharic through Yoruba + English)
- **6 blog posts** seeded
- **Seed videos, events, promotions, leaderboard, roadmap** from initial setup
- **Welcome popup** configurable via Settings tab

---

## Known Issues / Areas for Improvement

1. The admin dashboard file (`AdminDashboard.tsx`) is 700+ lines — could be split into separate files per tab
2. Mobile responsiveness could be improved on some sections
3. No image preview in the promotions admin (images upload to S3 but no thumbnail shown)
4. Blog content uses plain text — could be enhanced with a rich text editor
5. No pagination on the presentations grid (all 49 load at once)

---

## GitHub Repository

The project is synced to GitHub. You can clone it and work locally with Claude Code. All changes pushed to the `main` branch will sync with the Manus deployment.

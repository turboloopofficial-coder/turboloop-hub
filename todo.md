# Turbo Loop Community Hub — TODO

## V1-V3 (Completed)
- [x] Basic project setup with database and auth
- [x] Database schema for all content types
- [x] API routes for all CRUD operations
- [x] Initial frontend sections
- [x] Admin dashboard with login
- [x] Seed data (videos, events, promotions, leaderboard, roadmap)
- [x] V2 Premium redesign (glassmorphism, animations)
- [x] V3 Fixes (hero heading, 3D tilt, flywheel diagram)
- [x] 2 blog posts seeded
- [x] Vitest tests passing

## V4 — PUBLISH-READY PREMIUM REBUILD
- [x] Darker base background (#060a16) with noise texture
- [x] Gradient mesh background orbs (cyan + purple)
- [x] Scroll progress indicator (cyan line at top)
- [x] Scroll-triggered reveal animations (Framer Motion)
- [x] Sticky floating Launch App button
- [x] Navbar: transparent → glassmorphism on scroll, mobile drawer
- [x] Hero: 100vh, canvas particle network, CSS gradient text, magnetic buttons
- [x] Ecosystem: 3x2 glassmorphism cards, staggered entrance, icon glow
- [x] Leaderboard: podium layout, real flags (flagcdn), gold/silver/bronze, thick bars, animated count-up numbers
- [x] Flywheel: SVG circular arrows, rotating center hub, energy particle animation, revenue streams
- [x] Promotions: $100K featured card, animated gradient border, pulsing badge
- [x] Feed page (/feed): grid layout, horizontal filter pills (All/Videos/Articles/Updates), video thumbnails with language badges
- [x] Events: DAILY badge, prominent Join Zoom button, passcode shown
- [x] Roadmap: real milestones, glowing path, radar ping on Phase 6, checkmarks/locks
- [x] Trust: dramatic blockquote, security badges, deck download
- [x] Footer: 4-column, social icons, hub vs dApp note
- [x] Videos: category filters, language flag filters, YouTube thumbnails
- [x] Blog: 2 seeded posts with premium card design
- [x] Admin login page with TurboLoop branding
- [x] Admin dashboard for content management
- [x] All vitest tests passing (12/12)
- [x] Full visual audit (desktop + mobile) — all sections verified
- [x] No console errors, all API calls return 200
- [x] TypeScript error in storageProxy.ts fixed (0 TS errors)

## V5 — NEXT STEPS
- [x] Add 4+ more blog posts to seed data (diverse topics: security, yield farming, community, roadmap)
- [x] Add FAQ / How It Works accordion section to homepage
- [x] Remind user about custom domain setup via Settings panel

## V6 — BUG FIXES & ADMIN IMPROVEMENTS
- [x] Fix flywheel section: remove stray floating cyan dot
- [x] Fix leaderboard: broken flag images for India, Turkey, Brazil (#4-#6)
- [x] Improve admin dashboard: clear content posting/uploading workflow with image upload to S3

## V7 — MAJOR UPDATE: FROSTED AURORA THEME + FEATURES
- [x] Implement "Frosted Aurora" light theme across entire site (index.css, all components)
- [x] Redesign Flywheel/Velocity Cycle section (circular flywheel with rotating ring)
- [x] Add "Blog" link to navigation menu bar (links to /feed)
- [x] Add Zoom countdown timer with auto-update and LIVE indicator (2hr window)
- [x] Redesign PDF/Presentations section for 50+ PDFs (filterable by language, organized grid, DB-backed with admin CRUD)
- [x] Convert AdminDashboard to light theme with Presentations tab
- [x] Convert AdminLogin to light theme
- [x] Convert ImageUpload component to light theme
- [x] All 14 vitest tests passing (presentations + content + auth)
- [x] No remaining dark theme references (#060a16, bg-[#0a0f1e]) in client code

## V8 — WELCOME POPUP + ADMIN ACCESS
- [x] Welcome notification popup on first visit (intro message + close button, shows once per session)
- [x] Admin login link in footer for easy access
- [x] Admin control to edit welcome popup title/message from dashboard (Settings tab)

## V9 — SEED 48 LANGUAGE PRESENTATIONS
- [x] Extract 48 PDFs from uploaded zip file
- [x] Upload all PDFs to storage via manus-upload-file (all 48 uploaded)
- [x] Seed all 48 presentations into database with proper language names and flags
- [x] Verify Presentations section displays all entries beautifully (flags, filters, download/view links working)

## V10 — COMPREHENSIVE SITE AUDIT + 3-BATCH FIX (2026-05-02 → 2026-05-03)

External browser audit of turboloop.tech + independent source audit. Combined
findings into [AUDIT_2026_05_02.md](AUDIT_2026_05_02.md). Shipped in 3 batches
via direct-push-to-main (per CLAUDE.md Deployment Protocol). 3 commits:
`2c020fa` (P0), `18ff42d` (P1), `dd9ad94` (P2).

### Critical (P0) — `2c020fa`
- [x] Newsletter signup duplication on homepage — removed inline (Footer)
- [x] 5 simultaneous Launch App CTAs reduced to ≤2 — removed FloatingLaunchButton from Home
- [x] Loading flash on stats ("0 / 0+ / 0 / $0K") — replaced count-up with direct render in Hero + HomeNumbersTeaser
- [x] /blog/* rendering 2 H1 tags — added h1→h2 demote in BlogContent.tsx Streamdown components
- [x] Invalid blog/topic/reel/film slugs — render `<NotFound />` instead of fake "not found" inline
- [x] SubmitPage form — added id/htmlFor linkage on all 5 fields, required + aria-required
- [x] Mobile video disappear/scroll — replaced 100vh/80vh with 100dvh/80dvh; added transform: translateZ(0) for iOS compositor layer
- [x] 14 missing alt texts — descriptive alt on cover images, country-flag overlays, language flags
- [x] SEO meta over Google truncation limits — Home, Films, Ecosystem trimmed
- [x] Share button AbortError → double-UI bug — distinguish AbortError (silent return) from real failure (custom fallback)
- [x] (audit-added) Stale "16 pages. 13 deep-dives" copy in client/index.html

### Important (P1) — `18ff42d`
- [x] SharePagePill enforces 44px min tap target
- [x] WelcomePopup close button 24px → 44px + aria-label
- [x] Hero stats ↔ HomeNumbersTeaser stat overlap — differentiated (Hero = live signals, HomeNumbersTeaser = breadth + depth)
- [x] (audit-added) HomePromotionsTeaser heading hierarchy — card titles h4 → h3
- [x] (audit-added) FilmsPage heading hierarchy — episode card titles h4 → h3 (was h2 → h4 jump)

### Polish (P2) — `dd9ad94`
- [x] Trust badges in Hero — wrapped in `<a>` with anchor links to /security#audit / #lp-lock / #renounced / #verified, aria-label
- [x] NewsletterSignup inputs — aria-label, autoComplete, required
- [x] (audit-added) Removed dead code: client/src/components/Map.tsx, client/src/components/ManusDialog.tsx
- [x] (audit-added) Removed leftover console.log in ComponentShowcase.tsx

### Deferred (out of scope for this batch)
- [ ] JSON-LD enrichment (BreadcrumbList on PageShell pages) — basic WebPage schema already present
- [ ] Page length review (Home 15.1 screenfuls, Feed 13.8, Community 12.4, Security 11.6) — needs design pass
- [ ] /security "106 small targets" — external audit likely tested /library; presentation cards there already adequate
- [ ] Trust badge external proof URLs (audit PDF, BscScan tx links) — currently anchor links to /security; swap to real URLs once available

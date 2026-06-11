# /feature-social-wall-suggestions

Build a **Video Suggestion Engine** in the Social Wall admin panel. This feature automatically discovers TurboLoop-related YouTube videos that are not yet on the Social Wall, ranks them by relevance and quality, and allows the admin to approve them with a single click.

---

## Context

The Social Wall (`/community`) already displays a YouTube video grid managed via `SocialWallManager.tsx`. Currently, admins must manually search for videos using a text query. The new feature adds an **"Auto-Suggestions" tab** to the Social Wall Manager that proactively surfaces the best TurboLoop videos from YouTube that aren't already on the wall.

**Key files to understand before starting:**
- `client/src/components/admin/SocialWallManager.tsx` — existing admin UI
- `server/routes.ts` — tRPC router (find the `socialWall` router)
- `server/db/schema.ts` — database schema (find the `socialWallVideos` table)

---

## What to Build

### 1. Backend: New tRPC Procedure `socialWall.getSuggestions`

Add a new procedure to the `socialWall` tRPC router that:

1. Queries the YouTube Data API v3 with multiple search terms:
   - `"TurboLoop DeFi"`
   - `"TurboLoop protocol review"`
   - `"TurboLoop USDT yield"`
   - `"turboloop.tech"`
   - `"Turbo Loop crypto"`
2. Fetches up to 50 results total (across all queries, deduplicated by `videoId`).
3. Filters out any `videoId` already present in the `socialWallVideos` table.
4. For each remaining video, fetches additional stats from the YouTube API: `viewCount`, `likeCount`, `commentCount`, `publishedAt`, `channelTitle`.
5. Scores each video using this formula:
   ```
   score = (viewCount * 1.0) + (likeCount * 5.0) + (commentCount * 3.0)
   ```
   Apply a recency bonus: multiply score by `1.5` if published within the last 30 days, `1.2` if within 90 days.
6. Returns the top 20 suggestions sorted by score descending.

The YouTube API key is already available in the environment as `YOUTUBE_API_KEY`. If it is not set, return an empty array with a `missingApiKey: true` flag.

### 2. Frontend: "Suggestions" Tab in SocialWallManager

Add a second tab to `SocialWallManager.tsx` alongside the existing "Search YouTube" tab:

**Tab: "🤖 Auto-Suggestions"**

- Shows a "Refresh Suggestions" button that calls `socialWall.getSuggestions`.
- Displays a loading spinner while fetching.
- Renders each suggestion as a card showing:
  - Video thumbnail (from `https://img.youtube.com/vi/{videoId}/mqdefault.jpg`)
  - Video title (truncated to 2 lines)
  - Channel name
  - View count, like count, published date
  - A relevance score badge (High / Medium / Low based on score thresholds)
  - **"Add to Wall"** button (calls existing `socialWall.save` mutation)
  - **"Dismiss"** button (stores dismissed IDs in localStorage so they don't reappear)
- If `missingApiKey` is true, show a yellow warning: "YouTube API key not configured. Add `YOUTUBE_API_KEY` to your environment variables."
- If no suggestions are found, show: "All discovered TurboLoop videos are already on the wall. Check back later."

### 3. Auto-Refresh via Cron (Optional Enhancement)

In `server/_vercel/cron-master.ts`, add a weekly task (fires every Sunday at 10:00 UTC) that:
1. Calls the same suggestion logic.
2. If any new high-score videos are found (score > threshold), sends a Telegram message to the admin's personal chat (use `TELEGRAM_ADMIN_CHAT_ID` env var) with the list of suggested videos and a link to the admin panel.

---

## Acceptance Criteria

- [ ] The "Auto-Suggestions" tab appears in the Social Wall Manager.
- [ ] Clicking "Refresh Suggestions" fetches and displays ranked TurboLoop videos not already on the wall.
- [ ] "Add to Wall" works correctly and the video immediately appears in the wall list.
- [ ] "Dismiss" hides a suggestion and it does not reappear on the next refresh (within the same browser session).
- [ ] Videos already on the wall are never shown in suggestions.
- [ ] The feature degrades gracefully if `YOUTUBE_API_KEY` is missing.

// /api/language-pipeline — Automated Language Onboarding Pipeline
//
// POST: Triggers the full language onboarding pipeline for an approved request.
//   Body: { requestId: number } or { languageCode: string }
//   Requires x-admin-token header.
//
// Pipeline steps (executed sequentially):
//   1. Video Dubbing — Dub all 5 homepage videos into the new language
//   2. Thumbnails — Generate 5 video thumbnails with localized text
//   3. Banners — Generate 200 marketing banners in the new language
//   4. Blogs — Translate core blog posts into the new language
//   5. Telegram Schedule — Set up recurring banner posts for the language
//
// Each step updates the pipeline_progress JSONB field on the language_requests row.
// The pipeline is designed to be idempotent — re-running skips completed steps.
//
// NOTE: This is the orchestration endpoint. The actual heavy lifting (TTS, image
// generation, etc.) happens via external APIs and Manus tasks. This endpoint
// records the pipeline state and provides a status dashboard for admins.

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@lib/db";
import { languageRequests } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const maxDuration = 60; // Allow up to 60s for pipeline orchestration

// Pipeline step definitions
const PIPELINE_STEPS = [
  "videoDubbing",
  "thumbnails",
  "banners",
  "blogs",
  "telegramSchedule",
] as const;

type PipelineStep = typeof PIPELINE_STEPS[number];

interface PipelineProgress {
  videoDubbing?: "pending" | "done";
  thumbnails?: "pending" | "done";
  banners?: "pending" | "done";
  blogs?: "pending" | "done";
  telegramSchedule?: "pending" | "done";
}

// ── POST: Trigger or advance the pipeline ──────────────────────────────────
export async function POST(req: NextRequest) {
  // Auth check
  const adminToken = req.headers.get("x-admin-token");
  const expectedToken = process.env.ADMIN_API_TOKEN || process.env.CRON_SECRET;
  if (!adminToken || adminToken !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { requestId, languageCode, action } = body;

    const db = getDb();

    // Find the language request
    let request;
    if (requestId) {
      const rows = await db
        .select()
        .from(languageRequests)
        .where(eq(languageRequests.id, requestId))
        .limit(1);
      request = rows[0];
    } else if (languageCode) {
      const rows = await db
        .select()
        .from(languageRequests)
        .where(eq(languageRequests.languageCode, languageCode))
        .limit(1);
      request = rows[0];
    }

    if (!request) {
      return NextResponse.json({ error: "Language request not found" }, { status: 404 });
    }

    // Handle different actions
    if (action === "approve") {
      // Approve the request and initialize pipeline
      const progress: PipelineProgress = {
        videoDubbing: "pending",
        thumbnails: "pending",
        banners: "pending",
        blogs: "pending",
        telegramSchedule: "pending",
      };

      await db
        .update(languageRequests)
        .set({
          status: "approved",
          pipelineProgress: progress,
          approvedAt: new Date(),
        })
        .where(eq(languageRequests.id, request.id));

      return NextResponse.json({
        message: `Language ${request.languageName} approved. Pipeline initialized.`,
        progress,
        nextStep: "videoDubbing",
        instructions: generateStepInstructions("videoDubbing", request),
      });
    }

    if (action === "complete_step") {
      // Mark a pipeline step as done and advance to next
      const { step } = body as { step: PipelineStep; [key: string]: unknown };
      if (!PIPELINE_STEPS.includes(step)) {
        return NextResponse.json({ error: `Invalid step: ${step}` }, { status: 400 });
      }

      const progress: PipelineProgress = (request.pipelineProgress as PipelineProgress) || {};
      progress[step] = "done";

      // Check if all steps are done
      const allDone = PIPELINE_STEPS.every(s => progress[s] === "done");
      const nextStep = PIPELINE_STEPS.find(s => progress[s] !== "done");

      await db
        .update(languageRequests)
        .set({
          status: allDone ? "completed" : "in_progress",
          pipelineProgress: progress,
          ...(allDone ? { completedAt: new Date() } : {}),
        })
        .where(eq(languageRequests.id, request.id));

      return NextResponse.json({
        message: allDone
          ? `All pipeline steps complete! ${request.languageName} is fully onboarded.`
          : `Step "${step}" marked as done. Next: ${nextStep}`,
        progress,
        allDone,
        nextStep: nextStep || null,
        instructions: nextStep ? generateStepInstructions(nextStep, request) : null,
      });
    }

    // Default: return current pipeline status
    return NextResponse.json({
      request: {
        id: request.id,
        languageName: request.languageName,
        languageCode: request.languageCode,
        nativeName: request.nativeName,
        flag: request.flag,
        status: request.status,
        votes: request.votes,
      },
      progress: request.pipelineProgress || {},
      nextStep: PIPELINE_STEPS.find(
        s => (request.pipelineProgress as PipelineProgress)?.[s] !== "done"
      ) || null,
    });
  } catch (err: unknown) {
    console.error("Language pipeline error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── GET: Pipeline status for all requests ──────────────────────────────────
export async function GET(req: NextRequest) {
  const adminToken = req.headers.get("x-admin-token");
  const expectedToken = process.env.ADMIN_API_TOKEN || process.env.CRON_SECRET;
  if (!adminToken || adminToken !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const requests = await db.select().from(languageRequests);

  return NextResponse.json({
    requests: requests.map(r => ({
      id: r.id,
      languageName: r.languageName,
      languageCode: r.languageCode,
      nativeName: r.nativeName,
      flag: r.flag,
      status: r.status,
      votes: r.votes,
      progress: r.pipelineProgress,
      createdAt: r.createdAt,
      approvedAt: r.approvedAt,
      completedAt: r.completedAt,
    })),
  });
}

// ── Helper: Generate step-by-step instructions for each pipeline phase ─────
function generateStepInstructions(
  step: PipelineStep,
  request: { languageName: string; languageCode: string; nativeName: string; flag: string }
): object {
  const { languageName, languageCode, nativeName, flag } = request;

  switch (step) {
    case "videoDubbing":
      return {
        step: "Video Dubbing",
        description: `Dub all 5 homepage tutorial videos into ${languageName} (${nativeName})`,
        manusTask: {
          title: `Dub TurboLoop tutorial videos into ${languageName}`,
          instructions: [
            `Translate and dub the 5 TurboLoop tutorial videos into ${languageName} (${languageCode})`,
            "Videos: v1-withdrawal, v2-investment, v3-lp-check, v4-deposit, v5-lp-position",
            "Use natural TTS voice appropriate for the language",
            "Match timing to original English audio with silence padding",
            `Upload dubbed audio to R2: reels/audio/${languageCode}/v{N}.mp3`,
          ],
        },
        r2Paths: [
          `reels/audio/${languageCode}/v1-withdrawal.mp3`,
          `reels/audio/${languageCode}/v2-investment.mp3`,
          `reels/audio/${languageCode}/v3-lp-check.mp3`,
          `reels/audio/${languageCode}/v4-deposit.mp3`,
          `reels/audio/${languageCode}/v5-lp-position.mp3`,
        ],
      };

    case "thumbnails":
      return {
        step: "Video Thumbnails",
        description: `Generate 5 video thumbnails with ${languageName} text`,
        manusTask: {
          title: `Generate ${languageName} video thumbnails`,
          instructions: [
            `Generate 5 portrait video thumbnails (1440×2560) for ${languageName}`,
            `Use the ${flag} flag and ${nativeName} text`,
            "Match the existing thumbnail style: dark tech background, TurboLoop logo, gradient accents",
            `Upload to R2: reels/thumbs/${languageCode}/v{N}.png`,
          ],
        },
        r2Paths: [
          `reels/thumbs/${languageCode}/v1-withdrawal.png`,
          `reels/thumbs/${languageCode}/v2-investment.png`,
          `reels/thumbs/${languageCode}/v3-lp-check.png`,
          `reels/thumbs/${languageCode}/v4-deposit.png`,
          `reels/thumbs/${languageCode}/v5-lp-position.png`,
        ],
      };

    case "banners":
      return {
        step: "Marketing Banners",
        description: `Generate 200 marketing banners in ${languageName}`,
        manusTask: {
          title: `Generate 200 ${languageName} marketing banners`,
          instructions: [
            `Generate 200 marketing banners with ${languageName} (${nativeName}) text`,
            "Follow the TurboLoop banner creative requirements spec",
            "Categories: lifestyle, token education, referral, DeFi education, FOMO, success stories",
            "Ensure TurboLoop logo on every banner (top-left, balanced size)",
            `Upload to R2: creatives/${languageCode}/banner-{NNN}.png`,
            "Update the creatives manifest JSON with the new banners",
          ],
        },
        r2Prefix: `creatives/${languageCode}/`,
        targetCount: 200,
      };

    case "blogs":
      return {
        step: "Blog Translations",
        description: `Translate core blog posts into ${languageName}`,
        manusTask: {
          title: `Translate TurboLoop blog posts into ${languageName}`,
          instructions: [
            `Translate the top 10 English blog posts into ${languageName}`,
            "Maintain SEO structure: title, excerpt, content, tags",
            `Use slug suffix: -${languageCode} (e.g., what-is-turboloop-${languageCode})`,
            "Set translationOf FK to the English parent post ID",
            "Insert into the blog_posts table via the admin API",
          ],
        },
        targetPosts: 10,
      };

    case "telegramSchedule":
      return {
        step: "Telegram Scheduling",
        description: `Schedule recurring banner posts for ${languageName} community`,
        manusTask: {
          title: `Set up ${languageName} Telegram banner schedule`,
          instructions: [
            `Create a recurring scheduled post for ${languageName} banners`,
            "Schedule: 2 banners per day (morning + evening in target timezone)",
            "Rotate through the 200 banners sequentially",
            "Use the Omni-Composer scheduled posts system",
            `Channel: telegram_${languageCode} (create if needed)`,
          ],
        },
        cronExpression: "0 8,18 * * *",
      };

    default:
      return { step, description: "Unknown step" };
  }
}

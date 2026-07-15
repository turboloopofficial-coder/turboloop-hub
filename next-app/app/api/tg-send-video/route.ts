/**
 * POST /api/tg-send-video
 * Downloads a video from a URL and sends it to a Telegram channel via multipart upload.
 * This runs inside Vercel where TELEGRAM_BOT_TOKEN is available.
 * Protected by CRON_SECRET.
 *
 * Body: { videoUrl: string, caption: string, chatId?: string }
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const TG_API = "https://api.telegram.org/bot";

export async function POST(req: NextRequest) {
  // Auth check
  const auth = req.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET || "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });
  }

  let body: { videoUrl: string; caption: string; chatId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const { videoUrl, caption, chatId } = body;
  if (!videoUrl || !caption) {
    return NextResponse.json({ ok: false, error: "videoUrl and caption are required" }, { status: 400 });
  }

  const targetChatId = chatId || process.env.TELEGRAM_CHANNEL;
  if (!targetChatId) {
    return NextResponse.json({ ok: false, error: "No chatId provided and TELEGRAM_CHANNEL not set" }, { status: 500 });
  }

  try {
    // Download the video from R2
    const vidRes = await fetch(videoUrl, { signal: AbortSignal.timeout(240000) });
    if (!vidRes.ok) {
      return NextResponse.json({ ok: false, error: `Video fetch failed: ${vidRes.status}` }, { status: 500 });
    }
    const vidBuf = await vidRes.arrayBuffer();

    // Upload to Telegram as multipart/form-data
    const form = new FormData();
    form.append("chat_id", targetChatId);
    form.append("caption", caption);
    form.append("parse_mode", "HTML");
    form.append("supports_streaming", "true");
    form.append("video", new Blob([vidBuf], { type: "video/mp4" }), "video.mp4");

    const tgRes = await fetch(`${TG_API}${token}/sendVideo`, {
      method: "POST",
      body: form,
    });
    const tgData: any = await tgRes.json();

    if (!tgData?.ok) {
      return NextResponse.json({ ok: false, error: tgData?.description || `TG HTTP ${tgRes.status}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true, messageId: tgData?.result?.message_id });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}

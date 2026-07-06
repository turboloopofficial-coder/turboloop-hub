/**
 * POST /api/broadcast
 * Secure endpoint to broadcast a photo + caption to Telegram channels.
 * Protected by REVALIDATE_SECRET.
 *
 * Body: { secret, photoUrl, caption, parseMode?, chatIds? }
 * chatIds: optional array of chat IDs/usernames to override env vars
 */
import { NextRequest, NextResponse } from "next/server";

const TG_API = "https://api.telegram.org/bot";

async function sendPhoto(
  token: string,
  chatId: string,
  photoUrl: string,
  caption: string,
  parseMode: string
): Promise<{ ok: boolean; chatId: string; error?: string }> {
  try {
    const res = await fetch(`${TG_API}${token}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: parseMode,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      return { ok: false, chatId, error: data.description };
    }
    return { ok: true, chatId };
  } catch (err: unknown) {
    return { ok: false, chatId, error: String(err) };
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "REVALIDATE_SECRET not configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const { secret: reqSecret, photoUrl, caption, parseMode = "HTML", chatIds } = body;

  if (reqSecret !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!photoUrl || !caption) {
    return NextResponse.json({ ok: false, error: "Missing photoUrl or caption" }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });
  }

  // Use provided chatIds or fall back to env vars
  let destinations: string[] = [];
  if (Array.isArray(chatIds) && chatIds.length > 0) {
    destinations = chatIds.filter(Boolean);
  } else {
    const channel = process.env.TELEGRAM_CHANNEL;
    const chat = process.env.TELEGRAM_CHAT;
    destinations = [channel, chat].filter(Boolean) as string[];
  }

  if (destinations.length === 0) {
    return NextResponse.json({ ok: false, error: "No chat destinations configured" }, { status: 500 });
  }

  const results = await Promise.all(
    destinations.map((chatId) => sendPhoto(token, chatId, photoUrl, caption, parseMode))
  );

  const allOk = results.every((r) => r.ok);
  return NextResponse.json({ ok: allOk, results });
}

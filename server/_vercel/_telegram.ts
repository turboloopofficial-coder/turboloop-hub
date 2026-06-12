// Telegram bot helper — used by all server-side automation.
// Reads TELEGRAM_BOT_TOKEN from env. Broadcast functions send to both
// TELEGRAM_CHANNEL and TELEGRAM_CHAT so posts land in both places directly,
// without relying on Telegram's native channel→group auto-forward.

const TG_API = "https://api.telegram.org/bot";

export type TgPhotoMessage = {
  chatId: string;
  photoUrl: string;
  /** Optional pre-fetched image buffer — if provided, photoUrl fetch is skipped */
  photoBuffer?: ArrayBuffer;
  caption: string;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  /** Optional inline keyboard buttons */
  buttons?: Array<{ text: string; url: string }>;
};

export type TgVideoMessage = {
  chatId: string;
  videoUrl: string;
  caption: string;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  buttons?: Array<{ text: string; url: string }>;
};

export type TgTextMessage = {
  chatId: string;
  text: string;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  buttons?: Array<{ text: string; url: string }>;
  disablePreview?: boolean;
};

function inlineKeyboard(buttons?: Array<{ text: string; url: string }>) {
  if (!buttons || buttons.length === 0) return undefined;
  return { inline_keyboard: [buttons.map((b) => ({ text: b.text, url: b.url }))] };
}

export async function tgSendPhoto(token: string, msg: TgPhotoMessage): Promise<{ ok: boolean; error?: string }> {
  const kb = inlineKeyboard(msg.buttons);
  try {
    // Fetch the image binary from R2/CDN and upload as multipart/form-data.
    // This avoids Telegram's own URL-fetch path which rejects certain CDN
    // responses with "wrong type of web page content".
    // If photoBuffer is pre-provided (e.g. SVG→PNG conversion), skip the fetch.
    let imgBuf: ArrayBuffer;
    if (msg.photoBuffer) {
      imgBuf = msg.photoBuffer;
    } else {
      const imgRes = await fetch(msg.photoUrl, { signal: AbortSignal.timeout(20000) });
      if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status} ${msg.photoUrl}`);
      imgBuf = await imgRes.arrayBuffer();
    }
    const form = new FormData();
    form.append("chat_id", msg.chatId);
    form.append("caption", msg.caption);
    form.append("parse_mode", msg.parseMode || "HTML");
    if (kb) form.append("reply_markup", JSON.stringify(kb));
    form.append("photo", new Blob([imgBuf], { type: "image/png" }), "photo.png");
    const r = await fetch(`${TG_API}${token}/sendPhoto`, {
      method: "POST",
      body: form,
    });
    const data: any = await r.json();
    if (!data?.ok) return { ok: false, error: data?.description || `HTTP ${r.status}` };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: String(err?.message || err) };
  }
}

/** Send a video by URL. Telegram will fetch the file from `videoUrl`
 *  server-side and re-host it; supported types: mp4, mov, mkv (Telegram
 *  re-encodes). Same caption + inline keyboard contract as `tgSendPhoto`.
 *  Used by the Omni-Composer when `mediaType='video'`. */
export async function tgSendVideo(token: string, msg: TgVideoMessage): Promise<{ ok: boolean; error?: string }> {
  const body: any = {
    chat_id: msg.chatId,
    video: msg.videoUrl,
    caption: msg.caption,
    parse_mode: msg.parseMode || "HTML",
    supports_streaming: true,
  };
  const kb = inlineKeyboard(msg.buttons);
  if (kb) body.reply_markup = kb;

  try {
    const r = await fetch(`${TG_API}${token}/sendVideo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data: any = await r.json();
    if (!data?.ok) return { ok: false, error: data?.description || `HTTP ${r.status}` };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: String(err?.message || err) };
  }
}

/** Send a text-only message, optionally as a reply to a specific
 *  message in the chat. Used by the auto-reply webhook so the bot's
 *  response threads under the user's question instead of arriving as
 *  a fresh standalone message that drowns in a busy group.
 *
 *  `replyToMessageId` maps to Telegram's `reply_to_message_id`. The
 *  rest of the contract mirrors `tgSendMessage`. */
export async function tgSendTextMessage(
  token: string,
  msg: TgTextMessage & { replyToMessageId?: number }
): Promise<{ ok: boolean; messageId?: number; error?: string }> {
  const body: any = {
    chat_id: msg.chatId,
    text: msg.text,
    parse_mode: msg.parseMode || "HTML",
    disable_web_page_preview: msg.disablePreview === true,
  };
  if (msg.replyToMessageId) {
    body.reply_to_message_id = msg.replyToMessageId;
    // Don't fail the send if the original message was deleted between
    // the trigger and our reply — better to land as a regular message
    // than to silently drop the answer.
    body.allow_sending_without_reply = true;
  }
  const kb = inlineKeyboard(msg.buttons);
  if (kb) body.reply_markup = kb;

  try {
    const r = await fetch(`${TG_API}${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data: any = await r.json();
    if (!data?.ok) return { ok: false, error: data?.description || `HTTP ${r.status}` };
    // Surface the sent message_id so callers can chain replies — used
    // by sendThreadedReply in telegram-webhook.ts to thread long /ask
    // answers across multiple bubbles.
    return { ok: true, messageId: data?.result?.message_id };
  } catch (err: any) {
    return { ok: false, error: String(err?.message || err) };
  }
}

export async function tgSendMessage(token: string, msg: TgTextMessage): Promise<{ ok: boolean; error?: string }> {
  const body: any = {
    chat_id: msg.chatId,
    text: msg.text,
    parse_mode: msg.parseMode || "HTML",
    disable_web_page_preview: msg.disablePreview === true,
  };
  const kb = inlineKeyboard(msg.buttons);
  if (kb) body.reply_markup = kb;

  try {
    const r = await fetch(`${TG_API}${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data: any = await r.json();
    if (!data?.ok) return { ok: false, error: data?.description || `HTTP ${r.status}` };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: String(err?.message || err) };
  }
}

/** Broadcast a photo to the channel AND the chat group directly.
 *  Both destinations receive the post independently — no reliance on
 *  Telegram's native channel→group auto-forward. */
export async function tgBroadcastPhoto(msg: Omit<TgPhotoMessage, "chatId">): Promise<Array<{ chatId: string; ok: boolean; error?: string }>> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return [];
  const dests = [process.env.TELEGRAM_CHANNEL, process.env.TELEGRAM_CHAT].filter(Boolean) as string[];
  const results = [];
  for (const chatId of dests) {
    const r = await tgSendPhoto(token, { ...msg, chatId });
    results.push({ chatId, ...r });
  }
  return results;
}

/** Broadcast a video to the channel AND the chat group directly. */
export async function tgBroadcastVideo(msg: Omit<TgVideoMessage, "chatId">): Promise<Array<{ chatId: string; ok: boolean; error?: string }>> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return [];
  const dests = [process.env.TELEGRAM_CHANNEL, process.env.TELEGRAM_CHAT].filter(Boolean) as string[];
  const results = [];
  for (const chatId of dests) {
    const r = await tgSendVideo(token, { ...msg, chatId });
    results.push({ chatId, ...r });
  }
  return results;
}

/** Broadcast a text message to the channel AND the chat group directly. */
export async function tgBroadcastMessage(msg: Omit<TgTextMessage, "chatId">): Promise<Array<{ chatId: string; ok: boolean; error?: string }>> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return [];
  const dests = [process.env.TELEGRAM_CHANNEL, process.env.TELEGRAM_CHAT].filter(Boolean) as string[];
  const results = [];
  for (const chatId of dests) {
    const r = await tgSendMessage(token, { ...msg, chatId });
    results.push({ chatId, ...r });
  }
  return results;
}

/** HTML-escape a string for Telegram's HTML parse_mode */
export function tgEscape(s: string | null | undefined): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

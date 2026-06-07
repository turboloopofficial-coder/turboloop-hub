// Telegram bot helper — used by all server-side automation.
// Reads TELEGRAM_BOT_TOKEN from env. Sends to TELEGRAM_CHANNEL + TELEGRAM_CHAT
// (both should be public usernames like @TurboLoop_Official).

const TG_API = "https://api.telegram.org/bot";

export type TgPhotoMessage = {
  chatId: string;
  photoUrl: string;
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
  const body: any = {
    chat_id: msg.chatId,
    photo: msg.photoUrl,
    caption: msg.caption,
    parse_mode: msg.parseMode || "HTML",
  };
  const kb = inlineKeyboard(msg.buttons);
  if (kb) body.reply_markup = kb;

  try {
    const r = await fetch(`${TG_API}${token}/sendPhoto`, {
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

/** Send to ALL configured destinations (channel + chat) — returns per-destination results */
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

/** Broadcast a video to the default Channel + Group pair. Same fan-out
 *  policy as `tgBroadcastPhoto` — used by the Omni-Composer's
 *  `telegram_en` channel when the post has `mediaType='video'`. */
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

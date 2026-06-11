# /fix-ask-threading

The `/ask` AI trigger sends long responses as a single Telegram message, which gets truncated at 4096 characters. Fix this by splitting the AI response into multiple messages sent as a thread — each part replies to the previous part, creating a clean threaded conversation.

---

## Pre-flight: Read these files first

1. `server/_vercel/telegram-webhook.ts` — find `buildAskResponse`, the `/ask` trigger, and the main send block (around line 740)
2. `server/_vercel/_telegram.ts` — read `tgSendTextMessage` — it currently returns `{ ok: boolean; error?: string }` but does NOT return the sent `message_id`. This needs to be fixed first.

---

## Step 1: Update `tgSendTextMessage` in `_telegram.ts` to return `messageId`

The current return type is `{ ok: boolean; error?: string }`. Change it to also return `messageId` so the webhook can chain replies.

Find `tgSendTextMessage` in `server/_vercel/_telegram.ts` and change the return type and return value:

**Before:**
```typescript
export async function tgSendTextMessage(
  token: string,
  msg: TgTextMessage & { replyToMessageId?: number }
): Promise<{ ok: boolean; error?: string }> {
  // ...
  const data: any = await r.json();
  if (!data?.ok) return { ok: false, error: data?.description || `HTTP ${r.status}` };
  return { ok: true };
```

**After:**
```typescript
export async function tgSendTextMessage(
  token: string,
  msg: TgTextMessage & { replyToMessageId?: number }
): Promise<{ ok: boolean; messageId?: number; error?: string }> {
  // ...
  const data: any = await r.json();
  if (!data?.ok) return { ok: false, error: data?.description || `HTTP ${r.status}` };
  return { ok: true, messageId: data?.result?.message_id };
```

---

## Step 2: Add `splitIntoChunks` helper to `telegram-webhook.ts`

Add this function after the imports, before `TRIGGERS`. It splits a long HTML-formatted string at natural paragraph boundaries, keeping each chunk under Telegram's 4096-character limit.

```typescript
/**
 * Split a long Telegram HTML string into chunks of at most `maxLen` characters.
 * Splits preferentially at double-newlines (paragraph breaks), then single
 * newlines, then at the hard limit. Never splits inside an HTML tag.
 * Returns an array of 1 or more chunks.
 */
function splitIntoChunks(text: string, maxLen = 3800): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxLen) {
    // Try to split at a paragraph break (double newline) within the limit
    let splitAt = remaining.lastIndexOf("\n\n", maxLen);
    if (splitAt < maxLen * 0.4) {
      // Paragraph break too early — try single newline
      splitAt = remaining.lastIndexOf("\n", maxLen);
    }
    if (splitAt < maxLen * 0.4) {
      // No good newline — hard split at maxLen, avoid splitting mid-tag
      splitAt = maxLen;
      // Back up past any open HTML tag
      const tagStart = remaining.lastIndexOf("<", splitAt);
      const tagEnd = remaining.lastIndexOf(">", splitAt);
      if (tagStart > tagEnd) splitAt = tagStart;
    }
    chunks.push(remaining.slice(0, splitAt).trimEnd());
    remaining = remaining.slice(splitAt).trimStart();
  }

  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}
```

---

## Step 3: Add `sendThreadedReply` helper to `telegram-webhook.ts`

Add this function right after `splitIntoChunks`. It sends the first chunk as a reply to the user's original message, then sends each subsequent chunk as a reply to the previous chunk, creating a thread.

```typescript
/**
 * Send a (potentially long) response as a threaded sequence of messages.
 * - Chunk 1: replies to `replyToMessageId` (the user's original message)
 * - Chunk 2+: each replies to the previous chunk's message_id
 * Returns true if all chunks sent successfully.
 */
async function sendThreadedReply(
  token: string,
  chatId: string,
  text: string,
  replyToMessageId: number | undefined
): Promise<boolean> {
  const chunks = splitIntoChunks(text);
  let currentReplyId = replyToMessageId;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    // Add part indicator on subsequent chunks so the thread reads naturally
    const chunkText = chunks.length > 1 && i > 0
      ? `<i>(continued ${i + 1}/${chunks.length})</i>\n\n${chunk}`
      : chunk;

    const result = await tgSendTextMessage(token, {
      chatId,
      text: chunkText,
      parseMode: "HTML",
      replyToMessageId: currentReplyId,
      disablePreview: true,
    });

    if (!result.ok) {
      console.error(`[telegram-webhook] sendThreadedReply chunk ${i + 1}/${chunks.length} failed:`, result.error);
      return false;
    }

    // Next chunk replies to this chunk's message_id
    currentReplyId = result.messageId;
  }

  return true;
}
```

---

## Step 4: Update the main send block in `telegram-webhook.ts`

Find the block that currently sends the reply (around line 740 — the `tgSendTextMessage` call inside the `try` block). Replace it with `sendThreadedReply`:

**Before:**
```typescript
const responseText = trigger.buildResponse
  ? await trigger.buildResponse(text)
  : (trigger.response ?? "");
await tgSendTextMessage(token, {
  chatId: String(chatId),
  text: responseText,
  parseMode: "HTML",
  replyToMessageId: safeReplyToId,
  disablePreview: true,
});
```

**After:**
```typescript
const responseText = trigger.buildResponse
  ? await trigger.buildResponse(text)
  : (trigger.response ?? "");
await sendThreadedReply(token, String(chatId), responseText, safeReplyToId);
```

This applies to ALL triggers, not just `/ask` — short responses (under 3800 chars) will still send as a single message since `splitIntoChunks` returns a single-element array. Only long responses get split.

---

## Step 5: Copy to mirror, typecheck, build, commit

```bash
# 1. Copy to the next-app mirror (must be identical)
cp server/_vercel/telegram-webhook.ts next-app/server/_vercel/telegram-webhook.ts

# 2. Typecheck — must pass with zero new errors
npm run check

# 3. Commit both files
git add server/_vercel/telegram-webhook.ts next-app/server/_vercel/telegram-webhook.ts server/_vercel/_telegram.ts
git commit -m "feat(telegram): thread long /ask replies across multiple messages

- tgSendTextMessage now returns messageId from Telegram response
- splitIntoChunks() splits at paragraph breaks, max 3800 chars/chunk
- sendThreadedReply() chains chunks: each replies to the previous
- All triggers use sendThreadedReply — short replies still single msg"

# 4. Push
git push
```

---

## Verification

After deploying (~90s), test by sending a complex `/ask` question that produces a long answer:

```
/ask explain the full 20-level referral system including all 7 ranks and their requirements
```

Expected result: bot sends Part 1 as a reply to your message, then Part 2 as a reply to Part 1, etc. — a clean thread. Short questions (e.g. `/ask what is the contract address?`) should still get a single-message reply.

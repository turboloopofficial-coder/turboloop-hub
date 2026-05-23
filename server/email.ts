// Transactional emails (submission received + submission approved).
//
// Resend is only invoked when RESEND_API_KEY is set in the environment.
// If unset, every send is a silent no-op — the submission flow never
// blocks, never throws, and existing deploys keep working.
//
// To enable: set RESEND_API_KEY + RESEND_FROM in Vercel env vars.
//   - RESEND_API_KEY: from https://resend.com/api-keys
//   - RESEND_FROM: a verified sender, e.g. "TurboLoop <hello@turboloop.tech>"

const API = "https://api.resend.com/emails";
const SITE = "https://turboloop.tech";

interface SendParams {
  to: string | null | undefined;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "TurboLoop <hello@turboloop.tech>";
  if (!apiKey || !to) return; // silent no-op

  // Crude email-vs-telegram detection: if the contact doesn't look like an
  // email, skip (Resend won't send to a Telegram handle).
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return;

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to, subject, html }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.warn(`[email] resend ${res.status}: ${await res.text()}`);
    }
  } catch (err: any) {
    console.warn("[email] send failed:", err?.message || err);
  }
}

const wrap = (heading: string, body: string) => `
<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F7F8FC;padding:32px 16px;margin:0;">
  <div style="max-width:520px;margin:0 auto;background:white;border-radius:18px;overflow:hidden;box-shadow:0 12px 32px -8px rgba(15,23,42,0.08);">
    <div style="background:linear-gradient(135deg,#0891B2,#7C3AED);padding:24px 28px;color:white;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;opacity:0.85;margin-bottom:6px;">TurboLoop</div>
      <div style="font-size:22px;font-weight:700;line-height:1.2;">${heading}</div>
    </div>
    <div style="padding:28px;color:#0F172A;line-height:1.6;font-size:15px;">
      ${body}
      <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(15,23,42,0.08);font-size:12px;color:#64748B;">
        <a href="${SITE}" style="color:#0891B2;text-decoration:none;font-weight:600;">turboloop.tech</a>
        &nbsp;·&nbsp; The complete DeFi ecosystem on Binance Smart Chain
      </div>
    </div>
  </div>
</body></html>`;

const KIND_LABEL: Record<string, string> = {
  testimonial: "testimonial",
  photo: "photo",
  reel: "reel",
  story: "story",
  creator_apply: "Creator Star application",
  presenter_apply: "Local Presenter application",
};

export async function sendSubmissionReceivedEmail(p: {
  to: string | null | undefined;
  name: string;
  kind: string;
}) {
  const label = KIND_LABEL[p.kind] ?? "submission";
  await sendEmail({
    to: p.to,
    subject: `We got your ${label} — TurboLoop`,
    html: wrap(
      `Thanks, ${p.name}.`,
      `<p>We received your <b>${label}</b> and it's queued for review.</p>
       <p>Most submissions are reviewed within 48 hours. You'll get another email the moment it's approved.</p>
       <p style="margin-top:24px;"><a href="${SITE}/my-submissions" style="display:inline-block;padding:12px 22px;border-radius:999px;background:linear-gradient(135deg,#0891B2,#7C3AED);color:white;text-decoration:none;font-weight:700;font-size:14px;">Check status</a></p>`
    ),
  });
}

export async function sendSubmissionApprovedEmail(p: {
  to: string | null | undefined;
  name: string;
  kind: string;
}) {
  const label = KIND_LABEL[p.kind] ?? "submission";
  await sendEmail({
    to: p.to,
    subject: `You're live on TurboLoop · share it`,
    html: wrap(
      `Approved, ${p.name}.`,
      `<p>Your <b>${label}</b> just went live on TurboLoop.</p>
       <p>Share it — your contribution helps the community grow, and we boost the contributors who push hardest.</p>
       <p style="margin-top:24px;"><a href="${SITE}/community" style="display:inline-block;padding:12px 22px;border-radius:999px;background:linear-gradient(135deg,#0891B2,#7C3AED);color:white;text-decoration:none;font-weight:700;font-size:14px;">See it live</a></p>`
    ),
  });
}

// ─────────────────────────────────────────────────────────────────────
// Admin-triggered templates (Phase 5 — admin email panel)
//
// These are NOT fired automatically by the submission flow — they're
// available from the admin dashboard "Send email" dropdown so the team
// can move someone through the moderation lifecycle without leaving
// the tab. Each follows the same `wrap()` brand shell so every
// outbound email looks the same to the recipient.
//
// All four templates share the same signature: `to`, `name`, `kind`,
// + the optional `customMessage` override for the admin to inject a
// personal note when the template's standard copy isn't quite right.
// ─────────────────────────────────────────────────────────────────────

export type AdminEmailTemplate =
  | "content_approved"
  | "payment_pending_wallet"
  | "payment_sent"
  | "content_rejected"
  | "needs_more_info";

export const ADMIN_TEMPLATE_LABELS: Record<AdminEmailTemplate, string> = {
  content_approved: "Content approved",
  payment_pending_wallet: "Payment pending — send wallet",
  payment_sent: "Payment sent",
  content_rejected: "Content rejected",
  needs_more_info: "Needs more info",
};

interface AdminSendArgs {
  template: AdminEmailTemplate;
  to: string | null | undefined;
  name: string;
  kind: string;
  /** Optional admin-typed paragraph appended to the standard template
   *  body. Lets the team add per-recipient color without breaking the
   *  brand shell. Plain text — newlines become <br>. */
  customMessage?: string | null;
  /** Optional rejection reason — only meaningful for `content_rejected`. */
  reason?: string | null;
  /** Optional payment amount — only meaningful for `payment_sent`. */
  payoutAmountUsd?: number | null;
  /** Optional payment txid — only meaningful for `payment_sent`. */
  payoutTxId?: string | null;
}

const cta = (label: string, href: string) =>
  `<p style="margin-top:24px;"><a href="${href}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:linear-gradient(135deg,#0891B2,#7C3AED);color:white;text-decoration:none;font-weight:700;font-size:14px;">${label}</a></p>`;

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderCustom = (raw: string | null | undefined) => {
  if (!raw) return "";
  const safe = escapeHtml(raw).replace(/\n/g, "<br>");
  return `<p style="margin-top:18px;padding:14px 16px;background:#F1F5F9;border-radius:10px;color:#0F172A;font-style:italic;">${safe}</p>`;
};

export async function sendAdminTemplateEmail(args: AdminSendArgs): Promise<{ ok: boolean; sent: boolean; reason?: string }> {
  const label = KIND_LABEL[args.kind] ?? "submission";
  let subject = "TurboLoop update";
  let heading = `Hi ${args.name}.`;
  let body = "";

  switch (args.template) {
    case "content_approved":
      subject = `Approved · your ${label} is live`;
      heading = `Approved, ${args.name}.`;
      body =
        `<p>Your <b>${label}</b> just went live on TurboLoop.</p>` +
        `<p>Share it — your contribution helps the community grow, and we boost the contributors who push hardest.</p>` +
        renderCustom(args.customMessage) +
        cta("See it live", `${SITE}/community`);
      break;

    case "payment_pending_wallet":
      subject = `Send us your BSC wallet to receive payment`;
      heading = `Payment ready, ${args.name}.`;
      body =
        `<p>Your <b>${label}</b> is approved for payment. To receive it, please reply with your <b>BSC (BEP-20) wallet address</b>.</p>` +
        `<p>USDT will be sent on Binance Smart Chain — make sure the address you provide accepts BEP-20 USDT (most wallets do, including MetaMask, Trust Wallet, and exchange-hosted wallets).</p>` +
        renderCustom(args.customMessage) +
        cta("Reply to this email with your wallet", `mailto:hello@turboloop.tech?subject=${encodeURIComponent("My BSC wallet for TurboLoop payment")}`);
      break;

    case "payment_sent": {
      const amt = typeof args.payoutAmountUsd === "number" ? args.payoutAmountUsd : null;
      const tx = args.payoutTxId ? args.payoutTxId.trim() : null;
      subject = amt ? `Payment sent · ${amt} USDT` : `Payment sent`;
      heading = `Paid, ${args.name}.`;
      body =
        (amt
          ? `<p>We just sent <b>${amt} USDT</b> for your ${label}.</p>`
          : `<p>We just sent your payment for the ${label}.</p>`) +
        (tx
          ? `<p>Transaction: <a href="https://bscscan.com/tx/${encodeURIComponent(tx)}" style="color:#0891B2;font-family:monospace;font-size:12px;word-break:break-all;">${escapeHtml(tx)}</a></p>`
          : "") +
        renderCustom(args.customMessage) +
        cta("View on BscScan", tx ? `https://bscscan.com/tx/${encodeURIComponent(tx)}` : "https://bscscan.com/");
      break;
    }

    case "content_rejected":
      subject = `About your ${label}`;
      heading = `Hi ${args.name},`;
      body =
        `<p>Thanks for sending your <b>${label}</b>. Unfortunately we can't approve it as it stands.</p>` +
        (args.reason
          ? `<p><b>Reason:</b> ${escapeHtml(args.reason)}</p>`
          : "") +
        `<p>If you'd like to revise and resubmit, you're welcome to — every contribution helps us understand the community better, even when it doesn't make the wall.</p>` +
        renderCustom(args.customMessage) +
        cta("Submit again", `${SITE}/submit`);
      break;

    case "needs_more_info":
      subject = `Quick question about your ${label}`;
      heading = `Hi ${args.name},`;
      body =
        `<p>We're reviewing your <b>${label}</b> and need a bit more info before we can approve.</p>` +
        (args.customMessage
          ? renderCustom(args.customMessage)
          : `<p>Could you reply to this email with any additional context — full video URL, original publish date, language, audience size, etc.?</p>`) +
        cta("Reply via email", "mailto:hello@turboloop.tech?subject=Re%3A%20My%20submission");
      break;
  }

  if (!args.to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.to)) {
    return { ok: true, sent: false, reason: "no valid email address on file" };
  }
  await sendEmail({
    to: args.to,
    subject,
    html: wrap(heading, body),
  });
  return { ok: true, sent: true };
}

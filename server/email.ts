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

// Client-side helpers for the contributor forms (/submit, /apply,
// /my-submissions). Each form posts directly to the legacy tRPC API
// endpoint at the configured base URL.
//
// Why this approach: the existing tRPC API on the legacy SPA is fully
// working, validated, and connected to the same Neon Postgres database
// the new app's static pages already read from. Re-implementing the
// same submit/byIds endpoints in the new app would be redundant work
// during migration. Post-cutover, this base URL gets repointed to
// api.turboloop.tech (legacy app moved to subdomain) and these helpers
// keep working without any change.

// Forms POST to the legacy tRPC API at api.turboloop.tech, which is
// the SAME Vercel project that previously served turboloop.tech — just
// reachable at a new subdomain so it keeps working when the new
// Next.js build takes over the apex domain at cutover.
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "https://api.turboloop.tech";

export type SubmissionType =
  | "testimonial"
  | "story"
  | "photo"
  | "reel"
  | "creator_apply"
  | "presenter_apply";

export interface SubmissionInput {
  type: SubmissionType;
  authorName: string;
  authorContact?: string;
  authorCountry?: string;
  body: string;
  fileUrl?: string;
}

interface SubmitResponse {
  success: boolean;
  id: number;
}

interface SubmissionStatus {
  id: number;
  type: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface TRPCEnvelope<T> {
  result?: { data?: { json?: T } };
  error?: { message?: string };
}

/** POST a submission. Throws on validation/network error.
 *  Returns { success, id } on success. */
export async function submitSubmission(
  input: SubmissionInput
): Promise<SubmitResponse> {
  // tRPC v11 batch wire format for POST mutations.
  const url = `${API_BASE}/api/trpc/submissions.submit?batch=1`;
  const body = { 0: { json: input } };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Submit failed: HTTP ${res.status}`);
  }

  // tRPC batch response is an array; we sent a single op so [0] is ours.
  const out = (await res.json()) as Array<TRPCEnvelope<SubmitResponse>>;
  const first = out?.[0];
  if (first?.error) {
    throw new Error(first.error.message ?? "Submit failed");
  }
  if (!first?.result?.data?.json) {
    throw new Error("Submit returned no data");
  }
  return first.result.data.json;
}

/** Fetch the status of a list of submission ids. Returns rows the
 *  server has — silently drops any id we don't have permission to see
 *  or that's been deleted. */
export async function fetchSubmissionsByIds(
  ids: number[]
): Promise<SubmissionStatus[]> {
  if (ids.length === 0) return [];
  const url = new URL(`${API_BASE}/api/trpc/submissions.byIds`);
  url.searchParams.set("input", JSON.stringify({ json: { ids } }));
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`byIds failed: HTTP ${res.status}`);
  }
  const out = (await res.json()) as TRPCEnvelope<SubmissionStatus[]>;
  if (out.error) throw new Error(out.error.message ?? "byIds failed");
  return out.result?.data?.json ?? [];
}

// ─── Local persistence helpers ───────────────────────────────────────
// Persist successful submission ids on the device so /my-submissions
// can show their status without requiring auth. localStorage is per-
// origin, so this travels with the device — not the user.

const SUBMISSION_IDS_KEY = "turboloop_submission_ids";

export function rememberSubmissionId(id: number) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(SUBMISSION_IDS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const set = new Set<number>(Array.isArray(existing) ? existing : []);
    set.add(id);
    localStorage.setItem(SUBMISSION_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function getRememberedSubmissionIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SUBMISSION_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(n => typeof n === "number") : [];
  } catch {
    return [];
  }
}

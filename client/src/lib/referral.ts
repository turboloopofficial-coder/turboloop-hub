// Referral code handling
// - Captures `?ref=XXX` from URL, stores in localStorage
// - Allows user to set their own code manually
// - Used by ShareButton to embed in shared URLs

const KEY = "turboloop_ref_code";

export function captureReferralFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const url = new URL(window.location.href);
    const ref = url.searchParams.get("ref");
    if (ref && /^[a-zA-Z0-9_-]{2,64}$/.test(ref)) {
      localStorage.setItem(KEY, ref);
      // Remove from URL to keep it clean
      url.searchParams.delete("ref");
      const newPath = url.pathname + (url.searchParams.toString() ? "?" + url.searchParams.toString() : "") + url.hash;
      window.history.replaceState({}, "", newPath);
      return ref;
    }
  } catch { /* ignore */ }
  return null;
}

export function getReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setReferralCode(code: string): void {
  if (typeof window === "undefined") return;
  try {
    if (code && /^[a-zA-Z0-9_-]{2,64}$/.test(code)) {
      localStorage.setItem(KEY, code);
    }
  } catch { /* ignore */ }
}

export function clearReferralCode(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch { /* ignore */ }
}

export function buildShareUrl(path: string): string {
  if (typeof window === "undefined") return path;
  const ref = getReferralCode();
  const url = new URL(path, window.location.origin);
  if (ref) url.searchParams.set("ref", ref);
  return url.toString();
}

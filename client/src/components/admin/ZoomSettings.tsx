// Admin form for overriding the Zoom join links + passcodes (Task C).
//
// Reads/writes the existing `site_settings` table via the
// `manage.getSetting` / `manage.setSetting` tRPC routes (no schema
// migration needed). Keys are documented in server/zoom-config.ts:
//   zoom_en_link, zoom_en_passcode, zoom_hi_link, zoom_hi_passcode
//
// Validation: the link field is checked against the same regex the
// server uses (`ZOOM_URL_PATTERN`) before save. Invalid input shows
// an inline error and disables the save button — better than letting
// a broken URL reach a few thousand subscribers via the daily
// reminder cron.

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";

const ZOOM_URL_PATTERN = /^https:\/\/[a-z0-9.-]+\.zoom\.us\/j\/\d+/i;

type Lang = "en" | "hi";

interface LangFormState {
  link: string;
  passcode: string;
  // Pristine values from server, so "Save" only fires for actual edits.
  serverLink: string;
  serverPasscode: string;
}

const EMPTY: LangFormState = {
  link: "",
  passcode: "",
  serverLink: "",
  serverPasscode: "",
};

export function ZoomSettings() {
  // Two parallel forms, one per language. Could be one form with a
  // dropdown, but a flat 2-column layout makes the override status
  // visible at a glance.
  const [en, setEn] = useState<LangFormState>(EMPTY);
  const [hi, setHi] = useState<LangFormState>(EMPTY);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Load all 4 settings on mount. Empty strings mean "unset" — the
  // server-side getZoomConfig will fall back to hardcoded defaults
  // for any unset key, so a blank field is safe.
  const enLink = trpc.manage.getSetting.useQuery({ key: "zoom_en_link" });
  const enPass = trpc.manage.getSetting.useQuery({ key: "zoom_en_passcode" });
  const hiLink = trpc.manage.getSetting.useQuery({ key: "zoom_hi_link" });
  const hiPass = trpc.manage.getSetting.useQuery({ key: "zoom_hi_passcode" });
  const loading =
    enLink.isPending || enPass.isPending || hiLink.isPending || hiPass.isPending;

  useEffect(() => {
    if (!loading) {
      const enLinkVal = enLink.data ?? "";
      const enPassVal = enPass.data ?? "";
      const hiLinkVal = hiLink.data ?? "";
      const hiPassVal = hiPass.data ?? "";
      setEn({ link: enLinkVal, passcode: enPassVal, serverLink: enLinkVal, serverPasscode: enPassVal });
      setHi({ link: hiLinkVal, passcode: hiPassVal, serverLink: hiLinkVal, serverPasscode: hiPassVal });
    }
  }, [loading, enLink.data, enPass.data, hiLink.data, hiPass.data]);

  const save = trpc.manage.setSetting.useMutation();

  function linkError(link: string): string | null {
    if (link.trim() === "") return null; // blank = use server default, OK
    return ZOOM_URL_PATTERN.test(link.trim())
      ? null
      : "Must look like https://us06web.zoom.us/j/<digits>";
  }

  async function commit(lang: Lang) {
    const state = lang === "en" ? en : hi;
    const setter = lang === "en" ? setEn : setHi;
    const linkKey = `zoom_${lang}_link`;
    const passKey = `zoom_${lang}_passcode`;
    if (linkError(state.link)) return;

    // Only fire mutations for fields that actually changed.
    const ops: Promise<unknown>[] = [];
    if (state.link.trim() !== state.serverLink) {
      ops.push(save.mutateAsync({ key: linkKey, value: state.link.trim() }));
    }
    if (state.passcode.trim() !== state.serverPasscode) {
      ops.push(save.mutateAsync({ key: passKey, value: state.passcode.trim() }));
    }
    if (ops.length === 0) return;
    await Promise.all(ops);

    setter(s => ({
      ...s,
      link: s.link.trim(),
      passcode: s.passcode.trim(),
      serverLink: s.link.trim(),
      serverPasscode: s.passcode.trim(),
    }));
    setSavedAt(
      `${lang === "en" ? "English" : "Hindi/Urdu"} updated at ${new Date().toLocaleTimeString()}`
    );
  }

  function LangColumn({
    lang,
    state,
    setState,
    defaultHint,
  }: {
    lang: Lang;
    state: LangFormState;
    setState: React.Dispatch<React.SetStateAction<LangFormState>>;
    defaultHint: string;
  }) {
    const err = linkError(state.link);
    const dirty =
      state.link.trim() !== state.serverLink ||
      state.passcode.trim() !== state.serverPasscode;
    const usingOverride =
      state.serverLink.length > 0 || state.serverPasscode.length > 0;
    return (
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">
            {lang === "en" ? "English Daily Call" : "Hindi / Urdu Daily Call"}
          </h3>
          <span
            className={`text-[0.6875rem] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded-full ${
              usingOverride
                ? "bg-cyan-50 text-cyan-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {usingOverride ? "Override active" : "Default"}
          </span>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`zoom-${lang}-link`}>Zoom join link</Label>
          <Input
            id={`zoom-${lang}-link`}
            value={state.link}
            onChange={e => setState(s => ({ ...s, link: e.target.value }))}
            placeholder={defaultHint}
            className={err ? "border-red-400 focus:border-red-500" : undefined}
          />
          {err && (
            <p className="text-xs text-red-600 flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3" />
              {err}
            </p>
          )}
          <p className="text-xs text-slate-400">
            Leave blank to use the hardcoded default in{" "}
            <code className="text-[0.6875rem]">shared/zoomEvents.ts</code>.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`zoom-${lang}-pass`}>Passcode</Label>
          <Input
            id={`zoom-${lang}-pass`}
            value={state.passcode}
            onChange={e =>
              setState(s => ({ ...s, passcode: e.target.value }))
            }
            placeholder="6-digit code"
          />
        </div>
        <Button
          type="button"
          onClick={() => commit(lang)}
          disabled={!dirty || Boolean(err) || save.isPending}
          className="w-full"
        >
          {save.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save {lang === "en" ? "English" : "Hindi"} overrides
            </>
          )}
        </Button>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 py-10 justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading Zoom settings…</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Zoom Daily Calls
        </h2>
        <p className="text-sm text-slate-500 max-w-2xl">
          Override the Zoom join link + passcode used by the 15:00 UTC
          (Hindi) and 16:30 UTC (English) T-30 reminder cron. Leave a
          field blank to fall back to the hardcoded default. URL must
          match <code>https://*.zoom.us/j/&lt;digits&gt;</code>.
        </p>
      </div>
      {savedAt && (
        <div className="flex items-center gap-2 text-sm text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4" />
          {savedAt}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LangColumn
          lang="en"
          state={en}
          setState={setEn}
          defaultHint="https://us06web.zoom.us/j/8347511147?pwd=…"
        />
        <LangColumn
          lang="hi"
          state={hi}
          setState={setHi}
          defaultHint="https://us06web.zoom.us/j/4455663232?pwd=…"
        />
      </div>
    </div>
  );
}

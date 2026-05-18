// Admin CRUD for the Careers CMS (Task F).
//
// Reads + writes the job_vacancies table via tRPC. Roles can be in one
// of three statuses:
//   - draft   — hidden from /careers, editable
//   - open    — visible on /careers, accepting applications
//   - closed  — hidden from /careers, kept for audit/SEO redirects
//
// Open roles can also auto-close via `closingAt` — the public list
// filters out roles whose closingAt is in the past. Setting closingAt
// is optional; without it, a role stays open until you manually flip
// status to closed.

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  Plus,
  Save,
  Trash2,
  Edit3,
  X,
  Power,
  AlertCircle,
} from "lucide-react";

// Declared manually rather than inferred from the tRPC hook because
// React-Query's typing can return `unknown` for the data field
// depending on the version. Mirrors job_vacancies in drizzle/schema.ts.
// Dates land on the client as `Date` objects (the tRPC transformer
// preserves them across the wire), not strings.
type Vacancy = {
  id: number;
  slug: string;
  title: string;
  flag: string | null;
  location: string;
  stipend: string;
  bullets: string[];
  status: "open" | "closed" | "draft";
  tgSupportLink: string | null;
  closingAt: Date | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

type FormState = {
  slug: string;
  title: string;
  flag: string;
  location: string;
  stipend: string;
  bullets: string; // newline-separated; serialized to/from string[]
  status: "open" | "closed" | "draft";
  tgSupportLink: string;
  closingAt: string; // YYYY-MM-DD; "" → null
  sortOrder: number;
};

const EMPTY_FORM: FormState = {
  slug: "",
  title: "",
  flag: "",
  location: "",
  stipend: "",
  bullets: "",
  status: "draft",
  tgSupportLink: "",
  closingAt: "",
  sortOrder: 0,
};

function vacancyToForm(v: Vacancy): FormState {
  return {
    slug: v.slug,
    title: v.title,
    flag: v.flag ?? "",
    location: v.location,
    stipend: v.stipend,
    bullets: (v.bullets ?? []).join("\n"),
    status: v.status,
    tgSupportLink: v.tgSupportLink ?? "",
    closingAt: v.closingAt
      ? new Date(v.closingAt).toISOString().slice(0, 10)
      : "",
    sortOrder: v.sortOrder,
  };
}

// The create vs. update schemas accept slightly different shapes:
//   create: optional fields are `string.optional()` (undefined-only)
//   update: optional fields are `string.nullable().optional()` (null OK)
// So we emit undefined for unset values on create, and null on update.
function formToCreateInput(f: FormState) {
  const bullets = f.bullets
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);
  return {
    title: f.title.trim(),
    flag: f.flag.trim() || undefined,
    location: f.location.trim(),
    stipend: f.stipend.trim(),
    bullets,
    status: f.status,
    tgSupportLink: f.tgSupportLink.trim() || undefined,
    closingAt: f.closingAt ? new Date(f.closingAt) : undefined,
    sortOrder: Number(f.sortOrder) || 0,
  };
}

function formToUpdatePatch(f: FormState) {
  const bullets = f.bullets
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);
  return {
    title: f.title.trim(),
    flag: f.flag.trim() || null,
    location: f.location.trim(),
    stipend: f.stipend.trim(),
    bullets,
    status: f.status,
    tgSupportLink: f.tgSupportLink.trim() || null,
    closingAt: f.closingAt ? new Date(f.closingAt) : null,
    sortOrder: Number(f.sortOrder) || 0,
  };
}

function slugError(slug: string): string | null {
  if (slug.length === 0) return "Required";
  if (!/^[a-z0-9][a-z0-9-]{0,99}$/.test(slug))
    return "Lowercase letters, digits, and dashes; must start with letter/digit.";
  return null;
}

export function CareersManager() {
  const list = trpc.careers.adminList.useQuery();
  const utils = trpc.useUtils();
  const invalidate = () => utils.careers.adminList.invalidate();

  const create = trpc.careers.create.useMutation({ onSuccess: invalidate });
  const update = trpc.careers.update.useMutation({ onSuccess: invalidate });
  const remove = trpc.careers.delete.useMutation({ onSuccess: invalidate });

  const [editingId, setEditingId] = useState<number | null>(null); // -1 = new
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function startNew() {
    setForm(EMPTY_FORM);
    setEditingId(-1);
  }

  function startEdit(v: Vacancy) {
    setForm(vacancyToForm(v));
    setEditingId(v.id);
  }

  function cancel() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  async function save() {
    if (editingId === null) return;
    if (editingId === -1) {
      const err = slugError(form.slug);
      if (err) return;
      await create.mutateAsync({ slug: form.slug.trim(), ...formToCreateInput(form) });
    } else {
      await update.mutateAsync({ id: editingId, patch: formToUpdatePatch(form) });
    }
    cancel();
  }

  async function setStatus(v: Vacancy, status: "open" | "closed" | "draft") {
    await update.mutateAsync({ id: v.id, patch: { status } });
  }

  async function destroy(v: Vacancy) {
    if (!confirm(`Delete the role "${v.title}"? This can't be undone.`)) return;
    await remove.mutateAsync({ id: v.id });
  }

  if (list.isPending) {
    return (
      <div className="flex items-center gap-2 text-slate-500 py-10 justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading vacancies…</span>
      </div>
    );
  }

  const rows = list.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Careers</h2>
          <p className="text-sm text-slate-500 max-w-2xl">
            Listings shown on{" "}
            <a
              href="https://turboloop.tech/careers"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-cyan-700 hover:underline"
            >
              turboloop.tech/careers
            </a>
            . Only roles with status <code>open</code> + closing-at in the
            future appear publicly. Status defaults to <code>draft</code>{" "}
            on create.
          </p>
        </div>
        <Button type="button" onClick={startNew}>
          <Plus className="h-4 w-4 mr-2" /> New role
        </Button>
      </div>

      {editingId !== null && (
        <VacancyForm
          form={form}
          setForm={setForm}
          isNew={editingId === -1}
          onSave={save}
          onCancel={cancel}
          busy={create.isPending || update.isPending}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 col-span-full">
            No vacancies yet — click <strong>New role</strong> above.
          </Card>
        ) : (
          rows.map(v => (
            <Card key={v.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <code>{v.slug}</code>
                    <StatusBadge status={v.status} />
                  </div>
                  <h3 className="font-bold text-slate-900 mt-1">
                    {v.flag ? `${v.flag} ` : ""}
                    {v.title}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {v.location} · {v.stipend}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(v)}
                    title="Edit"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => destroy(v)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {v.bullets.length > 0 && (
                <ul className="text-xs text-slate-600 space-y-1 pl-3">
                  {v.bullets.slice(0, 4).map((b, i) => (
                    <li key={i} className="list-disc list-inside">
                      {b}
                    </li>
                  ))}
                  {v.bullets.length > 4 && (
                    <li className="text-slate-400">
                      + {v.bullets.length - 4} more
                    </li>
                  )}
                </ul>
              )}
              <div className="flex gap-2 pt-1">
                {v.status !== "open" && (
                  <Button
                    size="sm"
                    onClick={() => setStatus(v, "open")}
                    className="text-xs"
                  >
                    <Power className="h-3 w-3 mr-1" /> Open
                  </Button>
                )}
                {v.status === "open" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setStatus(v, "closed")}
                    className="text-xs"
                  >
                    <Power className="h-3 w-3 mr-1" /> Close
                  </Button>
                )}
                {v.status !== "draft" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setStatus(v, "draft")}
                    className="text-xs"
                  >
                    Move to draft
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "open" | "closed" | "draft" }) {
  const cfg = {
    open: { label: "OPEN", classes: "bg-emerald-50 text-emerald-700" },
    closed: { label: "CLOSED", classes: "bg-rose-50 text-rose-700" },
    draft: { label: "DRAFT", classes: "bg-slate-100 text-slate-600" },
  }[status];
  return (
    <span
      className={`text-[0.625rem] font-bold tracking-[0.2em] uppercase px-1.5 py-0.5 rounded ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  );
}

function VacancyForm({
  form,
  setForm,
  isNew,
  onSave,
  onCancel,
  busy,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  isNew: boolean;
  onSave: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const slugErr = isNew ? slugError(form.slug) : null;
  const canSave =
    !slugErr &&
    form.title.trim().length > 1 &&
    form.location.trim().length > 1 &&
    form.stipend.trim().length > 0 &&
    !busy;
  return (
    <Card className="p-5 space-y-4 border-cyan-200">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900">
          {isNew ? "New role" : `Editing ${form.title || "role"}`}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={e =>
              setForm(s => ({ ...s, slug: e.target.value.toLowerCase() }))
            }
            disabled={!isNew}
            placeholder="presenter-de"
            className={slugErr ? "border-red-400" : undefined}
          />
          {slugErr && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {slugErr}
            </p>
          )}
          {!isNew && (
            <p className="text-[0.625rem] text-slate-400">
              Slug is permanent — existing submissions reference it
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={e => setForm(s => ({ ...s, title: e.target.value }))}
            placeholder="German Zoom Presenter"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="flag">Flag emoji</Label>
          <Input
            id="flag"
            value={form.flag}
            onChange={e => setForm(s => ({ ...s, flag: e.target.value }))}
            placeholder="🇩🇪"
            maxLength={8}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={form.location}
            onChange={e => setForm(s => ({ ...s, location: e.target.value }))}
            placeholder="Remote · Deutsch"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stipend">Stipend *</Label>
          <Input
            id="stipend"
            value={form.stipend}
            onChange={e => setForm(s => ({ ...s, stipend: e.target.value }))}
            placeholder="$100 / month"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={form.status}
            onChange={e =>
              setForm(s => ({ ...s, status: e.target.value as FormState["status"] }))
            }
            className="w-full h-9 px-3 rounded-md border border-slate-200 text-sm"
          >
            <option value="draft">Draft (hidden)</option>
            <option value="open">Open (live on /careers)</option>
            <option value="closed">Closed (hidden, kept for audit)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="closing">Auto-close at</Label>
          <Input
            id="closing"
            type="date"
            value={form.closingAt}
            onChange={e =>
              setForm(s => ({ ...s, closingAt: e.target.value }))
            }
          />
          <p className="text-[0.625rem] text-slate-400">
            Optional. Role auto-hides from /careers after this date.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tg">Support Telegram</Label>
          <Input
            id="tg"
            value={form.tgSupportLink}
            onChange={e =>
              setForm(s => ({ ...s, tgSupportLink: e.target.value }))
            }
            placeholder="@TurboLoop_Support"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sort">Sort order</Label>
          <Input
            id="sort"
            type="number"
            value={form.sortOrder}
            onChange={e =>
              setForm(s => ({
                ...s,
                sortOrder: Number(e.target.value) || 0,
              }))
            }
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bullets">Bullets (one per line)</Label>
        <Textarea
          id="bullets"
          value={form.bullets}
          onChange={e => setForm(s => ({ ...s, bullets: e.target.value }))}
          placeholder={
            "Host weekly community Zoom sessions in Deutsch.\nWalk new members through wallet setup, deposit, and yield mechanics.\nCoordinate with the global presenter team via Telegram."
          }
          rows={5}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!canSave}>
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isNew ? "Create" : "Save changes"}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}

// Reusable contact-fields block for every submission form.
//
// Renders:
//   • WhatsApp phone input (country-code <select> + numeric input)
//     — REQUIRED. The form submitting this block should expose the
//     concatenated "+CC NNNNNNNNN" value to its API call.
//   • Email — optional
//   • Telegram @handle — optional
//   • Other social — optional free-form (Twitter/X URL, IG handle, etc.)
//
// All controlled by parent state via the props below. Designed to drop
// into any existing form with minimum boilerplate — the parent owns
// state, this component just renders the inputs.
//
// Country-code list covers the top TurboLoop community markets +
// common DeFi-active regions. Sorted by user volume in our existing
// member base so the most-likely codes appear first. "Other" lets a
// user type their own +CC if their country isn't listed.

"use client";

import { useMemo } from "react";

export interface ContactState {
  /** Country code prefix only — e.g. "+91". Concatenated with phone
   *  to form the full whatsappNumber sent to the API. */
  countryCode: string;
  /** Local phone number, digits only (no spaces, no leading 0). */
  phone: string;
  email: string;
  telegramHandle: string;
  otherSocial: string;
}

export const EMPTY_CONTACT: ContactState = {
  countryCode: "+91",
  phone: "",
  email: "",
  telegramHandle: "",
  otherSocial: "",
};

interface ContactFieldsProps {
  value: ContactState;
  onChange: (next: ContactState) => void;
  /** Show a small required-marker on the WhatsApp field's label. */
  requireWhatsapp?: boolean;
  /** Optional id-prefix to disambiguate field ids when multiple
   *  ContactFields render on the same page. */
  idPrefix?: string;
}

// Country codes ranked by TurboLoop community volume. "Other" lets
// users type a custom code if their country isn't listed.
const COUNTRY_CODES: ReadonlyArray<{ code: string; label: string; flag: string }> = [
  { code: "+91", label: "India",        flag: "🇮🇳" },
  { code: "+62", label: "Indonesia",    flag: "🇮🇩" },
  { code: "+234", label: "Nigeria",     flag: "🇳🇬" },
  { code: "+49", label: "Germany",      flag: "🇩🇪" },
  { code: "+63", label: "Philippines",  flag: "🇵🇭" },
  { code: "+92", label: "Pakistan",     flag: "🇵🇰" },
  { code: "+880", label: "Bangladesh",  flag: "🇧🇩" },
  { code: "+44", label: "United Kingdom", flag: "🇬🇧" },
  { code: "+1", label: "USA / Canada",  flag: "🇺🇸" },
  { code: "+971", label: "UAE",         flag: "🇦🇪" },
  { code: "+966", label: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+20", label: "Egypt",         flag: "🇪🇬" },
  { code: "+90", label: "Turkey",        flag: "🇹🇷" },
  { code: "+27", label: "South Africa",  flag: "🇿🇦" },
  { code: "+254", label: "Kenya",        flag: "🇰🇪" },
  { code: "+233", label: "Ghana",        flag: "🇬🇭" },
  { code: "+60", label: "Malaysia",      flag: "🇲🇾" },
  { code: "+65", label: "Singapore",     flag: "🇸🇬" },
  { code: "+84", label: "Vietnam",       flag: "🇻🇳" },
  { code: "+66", label: "Thailand",      flag: "🇹🇭" },
  { code: "+33", label: "France",        flag: "🇫🇷" },
  { code: "+34", label: "Spain",         flag: "🇪🇸" },
  { code: "+39", label: "Italy",         flag: "🇮🇹" },
  { code: "+55", label: "Brazil",        flag: "🇧🇷" },
  { code: "+52", label: "Mexico",        flag: "🇲🇽" },
  { code: "+7", label: "Russia",         flag: "🇷🇺" },
  { code: "+86", label: "China",         flag: "🇨🇳" },
  { code: "+81", label: "Japan",         flag: "🇯🇵" },
  { code: "+82", label: "South Korea",   flag: "🇰🇷" },
  { code: "other", label: "Other (type below)", flag: "🌍" },
];

/** Strip non-digit chars + leading zeros from phone input. */
function cleanPhone(input: string): string {
  return input.replace(/[^\d]/g, "").replace(/^0+/, "");
}

export function ContactFields({
  value,
  onChange,
  requireWhatsapp = true,
  idPrefix = "contact",
}: ContactFieldsProps) {
  const isCustomCC = value.countryCode === "other";

  function update<K extends keyof ContactState>(key: K, v: ContactState[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="space-y-4">
      {/* WhatsApp — REQUIRED. Country-code selector + numeric input. */}
      <div>
        <label
          htmlFor={`${idPrefix}-phone`}
          className="block text-sm font-bold text-[var(--c-text)] mb-1.5"
        >
          WhatsApp number {requireWhatsapp && <span className="text-[var(--c-brand-cyan)]" aria-label="required">*</span>}
        </label>
        <div className="flex gap-2">
          <select
            value={isCustomCC ? "other" : value.countryCode}
            onChange={e => update("countryCode", e.target.value)}
            className="shrink-0 h-12 px-3 rounded-[var(--r-md)] bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] text-sm font-bold focus:outline-none focus:border-[var(--c-brand-cyan)]"
            aria-label="Country code"
          >
            {COUNTRY_CODES.map(c => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code === "other" ? "+ Other" : c.code} {c.code !== "other" ? `· ${c.label}` : ""}
              </option>
            ))}
          </select>
          <input
            id={`${idPrefix}-phone`}
            type="tel"
            inputMode="tel"
            required={requireWhatsapp}
            placeholder={isCustomCC ? "+CC + number, e.g. +355 666123456" : "9876543210"}
            value={value.phone}
            onChange={e => update("phone", isCustomCC ? e.target.value : cleanPhone(e.target.value))}
            className="flex-1 h-12 px-3 rounded-[var(--r-md)] bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-brand-cyan)]"
            aria-describedby={`${idPrefix}-phone-help`}
          />
        </div>
        <p
          id={`${idPrefix}-phone-help`}
          className="mt-1.5 text-xs text-[var(--c-text-muted)]"
        >
          We&rsquo;ll use this to follow up about your submission. Include country code.
        </p>
      </div>

      {/* Email — optional */}
      <div>
        <label htmlFor={`${idPrefix}-email`} className="block text-sm font-bold text-[var(--c-text)] mb-1.5">
          Email <span className="text-[var(--c-text-subtle)] font-normal">(optional)</span>
        </label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          inputMode="email"
          placeholder="you@example.com"
          value={value.email}
          onChange={e => update("email", e.target.value)}
          className="w-full h-12 px-3 rounded-[var(--r-md)] bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-brand-cyan)]"
        />
      </div>

      {/* Telegram — optional */}
      <div>
        <label htmlFor={`${idPrefix}-tg`} className="block text-sm font-bold text-[var(--c-text)] mb-1.5">
          Telegram handle <span className="text-[var(--c-text-subtle)] font-normal">(optional)</span>
        </label>
        <input
          id={`${idPrefix}-tg`}
          type="text"
          placeholder="@yourhandle"
          value={value.telegramHandle}
          onChange={e => update("telegramHandle", e.target.value)}
          className="w-full h-12 px-3 rounded-[var(--r-md)] bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-brand-cyan)]"
        />
      </div>

      {/* Other social — optional */}
      <div>
        <label htmlFor={`${idPrefix}-other`} className="block text-sm font-bold text-[var(--c-text)] mb-1.5">
          Other social <span className="text-[var(--c-text-subtle)] font-normal">(optional — X, IG, YouTube, etc.)</span>
        </label>
        <input
          id={`${idPrefix}-other`}
          type="text"
          placeholder="X/Twitter, Instagram, or other link"
          value={value.otherSocial}
          onChange={e => update("otherSocial", e.target.value)}
          className="w-full h-12 px-3 rounded-[var(--r-md)] bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-brand-cyan)]"
        />
      </div>
    </div>
  );
}

/** Build the wire-format WhatsApp string from ContactState. Returns
 *  "+CC NNNNN" or null if the user hasn't entered enough digits. */
export function contactToWhatsappString(state: ContactState): string | null {
  if (state.countryCode === "other") {
    const trimmed = state.phone.trim();
    if (trimmed.replace(/[^\d]/g, "").length < 7) return null;
    return trimmed;
  }
  const digits = state.phone.replace(/[^\d]/g, "");
  if (digits.length < 7) return null;
  return `${state.countryCode} ${digits}`;
}

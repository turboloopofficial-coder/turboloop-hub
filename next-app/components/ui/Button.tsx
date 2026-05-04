// Button — the ONLY button. Six variants × three sizes × icon support.
//
// The legacy SPA had 8+ inline button definitions duplicated across
// every page. This replaces every one of them. If you find yourself
// reaching for inline style={{ background: "linear-gradient..." }} on
// a button, stop and add a variant here instead.

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@lib/cn";
import { type LucideIcon } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Icon shown before the label */
  iconBefore?: LucideIcon;
  /** Icon shown after the label */
  iconAfter?: LucideIcon;
  /** Disables the button and shows a spinner. */
  loading?: boolean;
  /** Stretches to fill its parent's width — common on mobile CTAs. */
  fullWidth?: boolean;
  /** When true, button gets thumb-friendly height (52px) — use on
   *  primary mobile CTAs where the user really should not miss. */
  thumbReachable?: boolean;
}

const baseClass = [
  "inline-flex items-center justify-center gap-2 font-bold",
  "rounded-[var(--r-lg)] transition-[transform,opacity,box-shadow]",
  "duration-[var(--m-instant)] ease-[var(--m-standard)]",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "focus-visible:outline-2 focus-visible:outline-offset-2",
].join(" ");

const sizeClass: Record<Size, string> = {
  sm: "px-3 h-9 text-xs",
  md: "px-5 h-11 text-sm",
  lg: "px-7 h-12 text-base",
};

const variantClass: Record<Variant, string> = {
  // PRIMARY — cyan→purple gradient, brand shadow, white text. Use for the
  // single most important action on a screen. Never two on the same page.
  primary: [
    "text-white",
    "bg-[var(--c-brand-gradient)]",
    "shadow-[var(--s-brand)]",
    "hover:shadow-[var(--s-xl)]",
  ].join(" "),
  // SECONDARY — solid surface with border, dark text. Sits next to primary.
  secondary: [
    "bg-[var(--c-surface)] text-[var(--c-text)]",
    "border border-[var(--c-border)]",
    "shadow-[var(--s-sm)]",
    "hover:bg-[var(--c-bg)] hover:shadow-[var(--s-md)]",
  ].join(" "),
  // GHOST — no background, only color. For nav links, less-prominent CTAs.
  ghost: [
    "text-[var(--c-text-muted)]",
    "hover:text-[var(--c-text)]",
    "hover:bg-[rgba(15,23,42,0.05)]",
    "dark:hover:bg-[rgba(255,255,255,0.06)]",
  ].join(" "),
  // OUTLINE — bordered, no fill. For tertiary actions.
  outline: [
    "text-[var(--c-text)]",
    "border border-[var(--c-border-strong)]",
    "hover:bg-[rgba(15,23,42,0.04)]",
    "dark:hover:bg-[rgba(255,255,255,0.04)]",
  ].join(" "),
  // DANGER — destructive actions (delete, reject).
  danger: [
    "text-white",
    "bg-[var(--c-danger)]",
    "shadow-[var(--s-md)]",
    "hover:opacity-90",
  ].join(" "),
  // SUBTLE — almost invisible, for "Cancel" / "Maybe later" type actions.
  subtle: [
    "text-[var(--c-text-muted)]",
    "hover:text-[var(--c-text)]",
  ].join(" "),
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      iconBefore: IconBefore,
      iconAfter: IconAfter,
      loading,
      fullWidth,
      thumbReachable,
      className,
      children,
      disabled,
      ...rest
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseClass,
          sizeClass[size],
          variantClass[variant],
          fullWidth && "w-full",
          // Override min-height for the thumb-reachable case (mobile CTAs).
          // 52px ≈ 1cm at typical density — comfortably tappable on the
          // Realme Narzo 50.
          thumbReachable && "h-[52px] text-base",
          className
        )}
        {...rest}
      >
        {loading ? (
          <span
            className="inline-block w-4 h-4 rounded-full border-2 border-current border-r-transparent animate-spin"
            aria-hidden="true"
          />
        ) : IconBefore ? (
          <IconBefore className="w-4 h-4" aria-hidden="true" />
        ) : null}
        {children}
        {!loading && IconAfter ? (
          <IconAfter className="w-4 h-4" aria-hidden="true" />
        ) : null}
      </button>
    );
  }
);

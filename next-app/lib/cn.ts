import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind classes with conflict resolution. Drop-in for the
 *  same helper that lives in the legacy SPA — keeps usage consistent
 *  across both codebases during migration. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

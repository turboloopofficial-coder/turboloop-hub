"use client";

// TrackedLink — outbound anchor that fires an analytics event when
// clicked. All token-page CTAs use this so we can measure conversion
// in GA without scattering inline onClick handlers across the page.
//
// All outbound URLs in lib/tokenFacts.ts already carry UTM tags; this
// just adds the client-side event fire on top.

import type { AnchorHTMLAttributes } from "react";
import { trackEvent, type AnalyticsEvent } from "@lib/analytics";

interface TrackedLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "onClick"> {
  href: string;
  event: AnalyticsEvent;
  /** Optional extra params attached to the event payload. */
  eventParams?: Record<string, string | number | boolean>;
}

export function TrackedLink({
  href,
  event,
  eventParams,
  children,
  target = "_blank",
  rel = "noopener noreferrer",
  ...rest
}: TrackedLinkProps) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      onClick={() => trackEvent(event, eventParams)}
      {...rest}
    >
      {children}
    </a>
  );
}

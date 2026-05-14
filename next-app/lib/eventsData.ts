// Static data for the /events page — past events, upcoming events,
// organizer leaderboard, sponsorship tiers, and community roles.
//
// All hand-curated. No DB read — this is the "what we've done + who we
// reward" page, calibrated to the current state of the program.

export type EventTier = "local" | "city" | "regional" | "national";

export type PastEvent = {
  id: string;
  location: string;
  flag: string;
  date: string;
  attendees: number;
  achievements: string[];
  verified: boolean;
  imageUrl?: string;
};

export type UpcomingEvent = {
  id: string;
  title: string;
  location: string;
  flag: string;
  date: string;
  hostName: string;
  coAttendCount: number;
  registrationUrl?: string;
};

export type OrganizerRank = {
  name: string;
  country: string;
  eventsHosted: number;
  teamSize: number;
  role: string;
};

// imageUrl points at /images/events/* in next-app/public/. The card
// component falls back to a brand gradient if the file is missing, so
// it's safe to ship the page before the real photos are dropped in.
export const PAST_EVENTS: PastEvent[] = [
  {
    id: "pe-1",
    location: "Lagos, Nigeria",
    flag: "🇳🇬",
    date: "Oct 15, 2025",
    attendees: 120,
    achievements: [
      "Local presenter program launched",
      "15+ wallet setups completed live",
    ],
    verified: true,
    imageUrl: "/images/events/lagos-event.jpg",
  },
  {
    id: "pe-2",
    location: "Dubai, UAE",
    flag: "🇦🇪",
    date: "Nov 02, 2025",
    attendees: 45,
    achievements: [
      "VIP networking session",
      "High-net-worth onboardings",
    ],
    verified: true,
    imageUrl: "/images/events/dubai-event.jpg",
  },
  {
    id: "pe-3",
    location: "Mumbai, India",
    flag: "🇮🇳",
    date: "Dec 10, 2025",
    attendees: 85,
    achievements: [
      "Hindi-language presentation",
      "Community Telegram group created",
    ],
    verified: true,
    imageUrl: "/images/events/mumbai-event.jpg",
  },
];

/** Wall of Proof — masonry grid of past meetup photos shown right
 *  below the hero. Drop real JPGs into next-app/public/images/events/
 *  to replace the placeholders; missing files just fall back to the
 *  brand gradient overlay. */
export const WALL_OF_PROOF: Array<{ src: string; alt: string }> = [
  { src: "/images/events/wall-1.jpg", alt: "Lagos meetup — onboarding session" },
  { src: "/images/events/wall-2.jpg", alt: "Dubai VIP networking floor" },
  { src: "/images/events/wall-3.jpg", alt: "Mumbai Hindi-language Q&A" },
  { src: "/images/events/wall-4.jpg", alt: "Local presenter on stage" },
  { src: "/images/events/wall-5.jpg", alt: "Attendees networking" },
  { src: "/images/events/wall-6.jpg", alt: "Live wallet setup demo" },
  { src: "/images/events/wall-7.jpg", alt: "Branded stage backdrop" },
  { src: "/images/events/wall-8.jpg", alt: "Community group photo" },
];

export const UPCOMING_EVENTS: UpcomingEvent[] = [];

export const ORGANIZER_LEADERBOARD: OrganizerRank[] = [
  {
    name: "Ahmed O.",
    country: "🇳🇬",
    eventsHosted: 4,
    teamSize: 620,
    role: "City Ambassador",
  },
  {
    name: "Raj P.",
    country: "🇮🇳",
    eventsHosted: 3,
    teamSize: 510,
    role: "City Ambassador",
  },
  {
    name: "Elena M.",
    country: "🇪🇸",
    eventsHosted: 2,
    teamSize: 180,
    role: "Organizer",
  },
];

export const SPONSORSHIP_TIERS = [
  {
    id: "local" as EventTier,
    name: "Local Meetup",
    pax: "10 – 30",
    depositReq: "100 USDT",
    teamReq: "10+",
    total: 100,
    advance: 50,
    performance: 50,
    deliverables:
      "Group photo, sign-in sheet, TurboLoop branding MUST be clearly visible in all photos and videos.",
    icon: "☕",
  },
  {
    id: "city" as EventTier,
    name: "City Seminar",
    pax: "50 – 100",
    depositReq: "500 USDT",
    teamReq: "50+",
    total: 500,
    advance: 250,
    performance: 250,
    deliverables:
      "Presentation video, professional photos, attendee list, TurboLoop branding MUST be clearly visible in all photos and videos.",
    icon: "🏙️",
  },
  {
    id: "regional" as EventTier,
    name: "Regional Conference",
    pax: "200 – 500",
    depositReq: "2,000 USDT",
    teamReq: "200+",
    total: 2500,
    advance: 1250,
    performance: 1250,
    deliverables:
      "Professional aftermovie, marketing plan execution proof, TurboLoop branding MUST be clearly visible in all photos and videos.",
    icon: "🌍",
  },
  {
    id: "national" as EventTier,
    name: "National Summit",
    pax: "1,000+",
    depositReq: "10,000 USDT",
    teamReq: "1,000+",
    total: 10000,
    advance: 5000,
    performance: 5000,
    deliverables:
      "Full media coverage, PR, professional aftermovie, TurboLoop branding MUST be clearly visible in all photos and videos.",
    icon: "🏛️",
  },
] as const;

export const COMMUNITY_ROLES = [
  {
    title: "City Ambassador",
    requirements: [
      "Hosted 3+ verified Tier 2 (City Seminar) events",
      "Personal active deposit > 1,000 USDT",
      "Active team size > 500 users",
    ],
    stipend: "250 USDT / month",
    responsibilities:
      "Manage local Telegram group, host monthly meetups, assist new users.",
  },
  {
    title: "Regional Director",
    requirements: [
      "Hosted 2+ verified Tier 3 (Regional Conference) events",
      "Personal active deposit > 5,000 USDT",
      "Active team size > 2,000 users",
    ],
    stipend: "1,000 USDT / month",
    responsibilities:
      "Oversee City Ambassadors, coordinate regional marketing, translate official materials.",
  },
  {
    title: "Global Presenter",
    requirements: [
      "Hosted 1+ verified Tier 4 (National Summit) event",
      "Personal active deposit > 20,000 USDT",
      "Active team size > 5,000 users",
    ],
    stipend: "2,500 USDT / month",
    responsibilities:
      "Host official weekly Zoom calls, create educational video content, represent TurboLoop globally.",
  },
] as const;

/** Tier-gated meetup kit — every approved organizer ships with a
 *  baseline kit (digital assets) and unlocks additional physical /
 *  production goods as they move up the tier ladder. Used in the
 *  "Meetup Kit" grid on /events. The "tier gate" copy lives inside
 *  the title for clarity at a glance. */
export const MEETUP_KIT = [
  {
    title: "Digital Assets (All Tiers)",
    detail:
      "17-slide cinematic pitch deck, PDF flyers, attendee ID badges.",
    icon: "📊",
  },
  {
    title: "Merch Designs (City+)",
    detail:
      "T-shirt and cap design files ready for local printing.",
    icon: "👕",
  },
  {
    title: "Physical Branding (Regional+)",
    detail:
      "High-res print files for 6ft standees and stage backdrops.",
    icon: "🏗️",
  },
  {
    title: "Full Production (National)",
    detail:
      "Custom branding package, PR support, and official social media amplification.",
    icon: "🎥",
  },
] as const;

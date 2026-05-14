// Static data for the /events page — past events, upcoming events,
// organizer leaderboard, sponsorship tiers, community roles, meetup
// kit, and the Wall-of-Proof gallery.
//
// All media lives on R2 under turboloop-assets, served by the public
// pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev hostname.

export type EventTier = "local" | "city" | "regional" | "national";

export type PastEvent = {
  id: string;
  /** Display title (line 1 on the card) */
  title?: string;
  location: string;
  flag: string;
  date: string;
  attendees: number;
  achievements: string[];
  verified: boolean;
  /** Optional poster / thumbnail JPEG */
  imageUrl?: string;
  /** Optional MP4 — when set the card renders a playable hero video
   *  instead of the static imageUrl. imageUrl (if provided) is used
   *  as the video's poster frame. */
  videoUrl?: string;
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
  /** Optional banner image for the card hero */
  imageUrl?: string;
  /** Optional invitation MP4 played in a modal/inline */
  videoUrl?: string;
};

export type OrganizerRank = {
  name: string;
  country: string;
  eventsHosted: number;
  teamSize: number;
  role: string;
};

const R2 = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

export const PAST_EVENTS: PastEvent[] = [
  {
    id: "pe-lagos-2026-04",
    title: "Turbo Loop Successful Soft Launch",
    location: "Radisson Hotels, GRA Ikeja, Lagos",
    flag: "🇳🇬",
    date: "Apr 4, 2026",
    attendees: 120,
    achievements: [
      "Local Presenter Program launched live on stage",
      "15+ wallet setups completed during the floor session",
      "Hosted at Radisson Hotels — first Tier 2 City Seminar",
    ],
    verified: true,
    imageUrl: `${R2}/events/past/lagos/lagos-4.jpg`,
    videoUrl: `${R2}/events/past/lagos/main.mp4`,
  },
];

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  // Real — Port Harcourt business launch dinner.
  {
    id: "ue-ph-2026-05",
    title: "Business Launch Dinner — Port Harcourt",
    location:
      "IBK Hotel & Suites, Road 3B House 19, Queens Park Estate, Rumuodara/Eneka Road, Port Harcourt",
    flag: "🇳🇬",
    date: "Sat, May 23, 2026 · 11:00 AM prompt",
    hostName: "TurboLoop Nigeria",
    coAttendCount: 86,
    registrationUrl: "https://t.me/TurboLoop_Official",
    imageUrl: `${R2}/events/upcoming/port-harcourt-banner.jpg`,
    videoUrl: `${R2}/events/upcoming/port-harcourt-invite.mp4`,
  },
  // Berlin — placeholder/teaser entry for the EU launch wave.
  {
    id: "ue-berlin-2026-06",
    title: "TurboLoop DACH Roundtable",
    location: "Soho House Berlin, Torstraße 1, 10119 Berlin, Germany",
    flag: "🇩🇪",
    date: "Sat, Jun 13, 2026 · 6:00 PM CET",
    hostName: "TurboLoop DACH",
    coAttendCount: 42,
    registrationUrl: "https://t.me/TurboLoop_Official",
  },
  // Dubai — placeholder for the GCC quarterly.
  {
    id: "ue-dubai-2026-06",
    title: "Global Yield Summit — Dubai",
    location: "Address Sky View, Downtown Dubai, UAE",
    flag: "🇦🇪",
    date: "Sat, Jun 20, 2026 · 7:30 PM GST",
    hostName: "TurboLoop GCC",
    coAttendCount: 68,
    registrationUrl: "https://t.me/TurboLoop_Official",
  },
];

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
 *  production goods as they move up the tier ladder. */
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

/** Wall of Proof — masonry grid of past meetup photos shown right
 *  below the hero. All Lagos soft-launch photos for now (more events
 *  ship more photos here over time). */
export const WALL_OF_PROOF: Array<{ src: string; alt: string }> = [
  { src: `${R2}/events/past/lagos/lagos-1.jpg`, alt: "Lagos soft launch — venue overview" },
  { src: `${R2}/events/past/lagos/lagos-2.jpg`, alt: "Lagos soft launch — attendee welcome" },
  { src: `${R2}/events/past/lagos/lagos-3.jpg`, alt: "Lagos soft launch — onboarding session" },
  { src: `${R2}/events/past/lagos/lagos-4.jpg`, alt: "Lagos soft launch — main stage" },
  { src: `${R2}/events/past/lagos/lagos-5.jpg`, alt: "Lagos soft launch — Q&A floor" },
  { src: `${R2}/events/past/lagos/lagos-6.jpg`, alt: "Lagos soft launch — networking break" },
  { src: `${R2}/events/past/lagos/lagos-7.jpg`, alt: "Lagos soft launch — group photo" },
  { src: `${R2}/events/past/lagos/lagos-8.jpg`, alt: "Lagos soft launch — closing remarks" },
];

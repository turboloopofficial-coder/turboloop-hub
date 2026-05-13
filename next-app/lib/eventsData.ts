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
  },
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
    deliverables: "Group photo, sign-in sheet",
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
    deliverables: "Presentation video, professional photos, attendee list",
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
      "Professional aftermovie, marketing plan execution proof",
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
    deliverables: "Full media coverage, PR, professional aftermovie",
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

/** What every approved organizer gets shipped with on day one. Used in
 *  the "Meetup Kit" grid on /events. */
export const MEETUP_KIT = [
  {
    title: "Official Slide Decks",
    detail: "17-slide cinematic pitch deck — EN, ES, RU, HI.",
    icon: "📊",
  },
  {
    title: "Print-Ready Assets",
    detail: "Banners, flyers, attendee ID badges. PDF + source files.",
    icon: "🖨️",
  },
  {
    title: "Video Assets",
    detail: "4-season cinematic film library, ready for projection.",
    icon: "🎬",
  },
  {
    title: "Marketing Amplification",
    detail: "Promotion on the official Telegram channel + the Hub.",
    icon: "📣",
  },
] as const;

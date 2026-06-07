// Single source of truth for everything $TURBO. Every surface that
// renders token copy / numbers / links pulls from THIS file — never
// hardcodes addresses or tier percentages inline. Changing a fact
// here updates every page in one shot.
//
// All numbers verified against the official tokenomics PDF. Do NOT
// edit without checking the doc first.
//
// IMPORTANT copy rules (per manus):
//   - Trade tax goes to admin. Period. Do NOT connect it to the
//     buyback in any user-facing copy. The buyback is funded
//     separately by 10% of admin fees from the main protocol.
//   - Buy/sell uses TurboLoop native swap as the primary path.
//     PancakeSwap is a secondary "advanced" option.
//   - Vesting rank == existing Leadership Program rank (same system).

export const TOKEN = {
  name: "TurboLoop Token",
  symbol: "TURBO",
  network: "BSC (BEP-20)",
  network_id: "bsc",
  contract: "0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3",
  pair: "0x5bede66bb27184001960e769efab95304f0e1759",
  buybackContract: "0xd8735b03e0b18f1e0598c211cee9558c6247b6b9",
  totalSupply: 1_000_000,
  totalSupplyFormatted: "1,000,000",
  launchPrice: 0.001,
  launchPriceFormatted: "$0.001",
  initialLpToken: 1_000_000,
  initialLpUsdt: 1_000,
  buyTaxPct: 1,
  sellTaxPct: 2,
  minDepositUsd: 100,
} as const;

// Outbound links. Branded UTM tags so we can measure conversion in
// Google Analytics. Helper below for ad-hoc URLs from other parts of
// the site that should also UTM-tag their outbound token clicks.
export const TOKEN_LINKS = {
  buyNative:
    "https://turboloop.io/dashboard/swap?from=USDT&to=TURBO&utm_source=turboloop_tech&utm_medium=token_page&utm_campaign=buy",
  sellNative:
    "https://turboloop.io/dashboard/swap?from=TURBO&to=USDT&utm_source=turboloop_tech&utm_medium=token_page&utm_campaign=sell",
  manageInApp:
    "https://turboloop.io/dashboard/token-rewards?utm_source=turboloop_tech&utm_medium=token_page&utm_campaign=manage",
  pancakeswap: `https://pancakeswap.finance/swap?outputCurrency=${TOKEN.contract}&utm_source=turboloop_tech&utm_medium=token_page&utm_campaign=pancakeswap`,
  dexscreener: `https://dexscreener.com/${TOKEN.network_id}/${TOKEN.pair}?utm_source=turboloop_tech&utm_medium=token_page`,
  bscscanContract: `https://bscscan.com/address/${TOKEN.contract}`,
  bscscanPair: `https://bscscan.com/address/${TOKEN.pair}`,
  bscscanBuyback: `https://bscscan.com/address/${TOKEN.buybackContract}`,
  lpCreateTx:
    "https://bscscan.com/tx/0xbf8497481f513ed6475a62be0c419fb79950eeaacf1cd895f51d38f52454befc",
  tokenRenounceTx:
    "https://bscscan.com/tx/0xc9fc9c8aab9f2efd6a0719ad1f70bcf9c339615c9a8bc4590f4276c8af79694c",
  buybackRenounceTx:
    "https://bscscan.com/tx/0x4584f92fc791a31ea8cc257778205999a29e7919e14615599d121d4649a2813f",
} as const;

export const DEXSCREENER_API = `https://api.dexscreener.com/latest/dex/pairs/${TOKEN.network_id}/${TOKEN.pair}`;

// Deposit reward tiers — sliding scale by USDT deposit amount. The
// percentage is applied to the deposit value in USD; the resulting
// USD amount is paid out as TURBO at the LIVE market price at the
// moment of deposit (so a $12 reward at $0.001 = 12,000 TURBO; at
// $0.002 it would be 6,000 TURBO — count is fixed at deposit time).
// Split: 70% to investor, 30% to referrer.
export interface DepositRewardTier {
  /** Inclusive lower bound in USDT. */
  min: number;
  /** Inclusive upper bound in USDT. null = no cap. */
  max: number | null;
  /** Reward percentage as a decimal (0.008 = 0.80%). */
  pct: number;
  /** Display label for the tier band. */
  label: string;
  /** Display label for the percentage. */
  pctLabel: string;
}

export const DEPOSIT_TIERS: DepositRewardTier[] = [
  { min: 100,    max: 499,     pct: 0.0080, label: "$100 – $499",      pctLabel: "0.80%" },
  { min: 500,    max: 999,     pct: 0.0100, label: "$500 – $999",      pctLabel: "1.00%" },
  { min: 1_000,  max: 4_999,   pct: 0.0120, label: "$1,000 – $4,999",  pctLabel: "1.20%" },
  { min: 5_000,  max: 9_999,   pct: 0.0140, label: "$5,000 – $9,999",  pctLabel: "1.40%" },
  { min: 10_000, max: 24_999,  pct: 0.0150, label: "$10,000 – $24,999", pctLabel: "1.50%" },
  { min: 25_000, max: null,    pct: 0.0160, label: "$25,000+",         pctLabel: "1.60%" },
];

/** Reward split — fixed protocol parameter. */
export const REWARD_SPLIT = {
  investor: 0.70,
  referrer: 0.30,
  investorPctLabel: "70%",
  referrerPctLabel: "30%",
} as const;

/** Resolve the right tier for a USDT deposit amount. Returns null if
 *  the deposit is below the minimum reward threshold ($100). */
export function tierForDeposit(usdAmount: number): DepositRewardTier | null {
  if (!Number.isFinite(usdAmount) || usdAmount < TOKEN.minDepositUsd) return null;
  for (const t of DEPOSIT_TIERS) {
    if (usdAmount >= t.min && (t.max === null || usdAmount <= t.max)) return t;
  }
  return DEPOSIT_TIERS[DEPOSIT_TIERS.length - 1];
}

// Vesting — rank-based monthly unlock. Per manus: same rank system as
// the existing Leadership Program. A user's Leadership rank also
// determines token vesting speed.
export interface VestingRank {
  slug: string;
  name: string;
  /** Monthly unlock percentage as a decimal (0.11 = 11%/month). */
  monthlyUnlock: number;
  monthlyUnlockLabel: string;
  /** Whole-number months to fully unlock (10 / unlock-rate), for
   *  display in the calculator + table. */
  monthsToFull: number;
}

export const VESTING_RANKS: VestingRank[] = [
  { slug: "base",       name: "No rank (base)", monthlyUnlock: 0.10, monthlyUnlockLabel: "10%", monthsToFull: 10 },
  { slug: "partner",    name: "Partner",        monthlyUnlock: 0.11, monthlyUnlockLabel: "11%", monthsToFull: 10 },
  { slug: "influencer", name: "Influencer",     monthlyUnlock: 0.12, monthlyUnlockLabel: "12%", monthsToFull: 9 },
  { slug: "leader",     name: "Leader",         monthlyUnlock: 0.14, monthlyUnlockLabel: "14%", monthsToFull: 8 },
  { slug: "manager",    name: "Manager",        monthlyUnlock: 0.15, monthlyUnlockLabel: "15%", monthsToFull: 7 },
  { slug: "ambassador", name: "Ambassador",     monthlyUnlock: 0.16, monthlyUnlockLabel: "16%", monthsToFull: 7 },
  { slug: "champion",   name: "Champion",       monthlyUnlock: 0.18, monthlyUnlockLabel: "18%", monthsToFull: 6 },
  { slug: "legend",     name: "Legend",         monthlyUnlock: 0.20, monthlyUnlockLabel: "20%", monthsToFull: 5 },
];

/** Buyback parameters — separate, independent mechanism from trade
 *  tax. Funded by 10% of admin fees from the main TurboLoop protocol.
 *  Daily, automated, on-chain. Do NOT connect this in copy to the
 *  trade tax (1%/2%). They are two separate things. */
export const BUYBACK = {
  fundingPctOfAdminFees: 10,
  frequency: "Daily",
  automation: "Smart-contract automated",
} as const;

/** TurboLoop Leadership Program rank legend — exposed here so the
 *  calculator + FAQ can explicitly state "your Leadership rank
 *  determines vesting speed." Per manus, these are the SAME ranks. */
export const LEADERSHIP_RANK_NOTE =
  "Your TurboLoop Leadership Program rank determines your token vesting unlock speed.";

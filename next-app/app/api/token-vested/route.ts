import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const TOKEN_CONTRACT = "0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3";
const DEAD_ADDRESS   = "0x000000000000000000000000000000000000dead";
const BSC_RPC        = "https://bsc-dataseed.binance.org/";
const CACHE_TTL_MS   = 5 * 60_000; // 5 minutes

export interface TokenVestedData {
  /** Tokens held by the token contract itself — these are locked/vesting. */
  lockedVested: string;
  lockedVestedNum: number | null;
  /** Tokens sent to the dead address — permanently burned. */
  burned: string;
  burnedNum: number | null;
  /** Total supply on-chain (minted, including rewards). */
  totalSupply: string;
  totalSupplyNum: number | null;
  /** True circulating = totalSupply - lockedVested - burned */
  trueCirculating: string;
  trueCirculatingNum: number | null;
  /** Percentage of total supply that is locked/vested (0–100). */
  lockedPct: number | null;
  /** Percentage of total supply that is burned (0–100). */
  burnedPct: number | null;
  fetchedAt: number;
  fresh: boolean;
}

let cached: { data: TokenVestedData; expiresAt: number } | null = null;

function fmtCommas(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString("en-US");
}

function fmtPct(n: number): string {
  return n.toFixed(2);
}

async function ethCall(data: string): Promise<string> {
  const payload = {
    jsonrpc: "2.0",
    method: "eth_call",
    params: [{ to: TOKEN_CONTRACT, data }, "latest"],
    id: 1,
  };
  const res = await fetch(BSC_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(6000),
  });
  const json = (await res.json()) as { result?: string };
  return json.result ?? "0x0";
}

function balanceOfSelector(address: string): string {
  // balanceOf(address) = 0x70a08231 + address padded to 32 bytes
  return "0x70a08231" + address.slice(2).toLowerCase().padStart(64, "0");
}

function hexToTokens(hex: string): number {
  // 18 decimals
  const raw = BigInt(hex === "0x" ? "0x0" : hex);
  return Number(raw) / 1e18;
}

async function fetchOnChain(): Promise<TokenVestedData> {
  try {
    const [totalHex, lockedHex, burnedHex] = await Promise.all([
      ethCall("0x18160ddd"),                             // totalSupply()
      ethCall(balanceOfSelector(TOKEN_CONTRACT)),        // balanceOf(contract itself)
      ethCall(balanceOfSelector(DEAD_ADDRESS)),          // balanceOf(dead)
    ]);

    const total   = hexToTokens(totalHex);
    const locked  = hexToTokens(lockedHex);
    const burned  = hexToTokens(burnedHex);
    const circulating = Math.max(0, total - locked - burned);

    return {
      lockedVested:       fmtCommas(locked),
      lockedVestedNum:    locked,
      burned:             fmtCommas(burned),
      burnedNum:          burned,
      totalSupply:        fmtCommas(total),
      totalSupplyNum:     total,
      trueCirculating:    fmtCommas(circulating),
      trueCirculatingNum: circulating,
      lockedPct:          total > 0 ? parseFloat(fmtPct((locked  / total) * 100)) : null,
      burnedPct:          total > 0 ? parseFloat(fmtPct((burned  / total) * 100)) : null,
      fetchedAt:          Date.now(),
      fresh:              true,
    };
  } catch {
    return {
      lockedVested: "—", lockedVestedNum: null,
      burned: "—",       burnedNum: null,
      totalSupply: "—",  totalSupplyNum: null,
      trueCirculating: "—", trueCirculatingNum: null,
      lockedPct: null,   burnedPct: null,
      fetchedAt: Date.now(),
      fresh: false,
    };
  }
}

export async function GET() {
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  }

  const data = await fetchOnChain();
  if (data.fresh) {
    cached = { data, expiresAt: now + CACHE_TTL_MS };
  } else if (cached) {
    return NextResponse.json(cached.data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
        "X-Token-Vested-Status": "stale-fallback",
      },
    });
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": data.fresh
        ? "public, s-maxage=300, stale-while-revalidate=600"
        : "public, s-maxage=30, stale-while-revalidate=120",
      "X-Token-Vested-Status": data.fresh ? "fresh" : "unavailable",
    },
  });
}

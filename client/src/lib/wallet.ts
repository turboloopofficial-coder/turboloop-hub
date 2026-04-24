// Minimal wallet connection helper — uses injected providers (MetaMask, Trust Wallet, etc.)
// No external libraries needed. Sets the connected address as the referral code.

import { setReferralCode } from "./referral";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
  isTrust?: boolean;
};

function getProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as any).ethereum as EthereumProvider | undefined;
  return eth || null;
}

export function hasWallet(): boolean {
  return getProvider() !== null;
}

/**
 * Short form of a wallet address for display, e.g. 0x1234...abcd
 */
export function shortenAddress(addr: string): string {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * Prompts the user to connect their wallet. Returns the connected address, or null if declined.
 * On success, sets the address as the referral code.
 */
export async function connectWallet(): Promise<string | null> {
  const eth = getProvider();
  if (!eth) {
    alert(
      "No Web3 wallet detected. Please install MetaMask or Trust Wallet to connect. Mobile users: open this page inside your wallet's built-in browser."
    );
    return null;
  }
  try {
    const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
    const address = accounts?.[0];
    if (address) {
      setReferralCode(address);
      return address;
    }
    return null;
  } catch (e) {
    console.warn("[wallet] connect rejected", e);
    return null;
  }
}

/**
 * Returns the currently connected address without prompting, or null.
 */
export async function getConnectedAddress(): Promise<string | null> {
  const eth = getProvider();
  if (!eth) return null;
  try {
    const accounts = (await eth.request({ method: "eth_accounts" })) as string[];
    return accounts?.[0] || null;
  } catch {
    return null;
  }
}

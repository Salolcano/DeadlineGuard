import { createClient } from "genlayer-js";
import { GENLAYER_CHAIN } from "../genlayer/client";
import type { Agreement } from "./types";

/** Read-only wrapper. Writes go through Transaction Kit (see components/). */
class DeadlineGuard {
  private address: `0x${string}`;
  private client: any;

  constructor(contractAddress: string, account?: string | null) {
    this.address = contractAddress as `0x${string}`;
    this.client = createClient({
      chain: GENLAYER_CHAIN,
      ...(account ? { account: account as `0x${string}` } : {}),
    } as any);
  }

  async getAgreements(): Promise<Agreement[]> {
    try {
      const raw: any = await this.client.readContract({
        address: this.address,
        functionName: "get_agreements",
        args: [],
      });
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!Array.isArray(parsed)) return [];
      return (parsed as Agreement[])
        .map((a) => ({ ...a, escrow: Number(a.escrow) }))
        .sort((a, b) => Number(b.id) - Number(a.id));
    } catch (e) {
      console.error("Error fetching agreements:", e);
      throw new Error("Failed to fetch agreements from contract");
    }
  }

  async getEarned(address: string | null): Promise<number> {
    if (!address) return 0;
    try {
      const v = await this.client.readContract({
        address: this.address,
        functionName: "get_earned_of",
        args: [address],
      });
      return Number(v) || 0;
    } catch {
      return 0;
    }
  }
}

export default DeadlineGuard;

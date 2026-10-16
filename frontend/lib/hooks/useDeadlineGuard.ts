"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import DeadlineGuard from "../contracts/DeadlineGuard";
import { getContractAddress } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import type { Agreement } from "../contracts/types";

export function useDeadlineGuardContract(): DeadlineGuard | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();
  return useMemo(
    () => (contractAddress ? new DeadlineGuard(contractAddress, address) : null),
    [contractAddress, address],
  );
}

export function useAgreements() {
  const contract = useDeadlineGuardContract();
  return useQuery<Agreement[], Error>({
    queryKey: ["agreements"],
    queryFn: () => (contract ? contract.getAgreements() : Promise.resolve([])),
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
    staleTime: 2000,
    enabled: !!contract,
  });
}

/** Total escrow released to this address as provider (wei). */
export function usePayout(address: string | null) {
  const contract = useDeadlineGuardContract();
  return useQuery<number, Error>({
    queryKey: ["earned", address],
    queryFn: () => (contract ? contract.getEarned(address) : Promise.resolve(0)),
    enabled: !!address && !!contract,
    staleTime: 2000,
  });
}

export function useInvalidateAgreements() {
  const qc = useQueryClient();
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: ["agreements"] });
    qc.invalidateQueries({ queryKey: ["earned"] });
  }, [qc]);
}

export const fromWei = (wei: number | bigint) => Number(wei) / 1e18;

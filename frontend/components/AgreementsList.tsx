"use client";

import { useMemo, useState } from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { GenLayerTransactionPanel, type SubmitInput, type TrackedStatus } from "@genlayer/transaction-kit-react";
import { fromWei, useAgreements, useInvalidateAgreements } from "@/lib/hooks/useDeadlineGuard";
import { GENLAYER_NETWORK, getContractAddress } from "@/lib/genlayer/client";
import { useTransactionKit } from "@/lib/genlayer/kit";
import { useWallet } from "@/lib/genlayer/wallet";
import { error, success } from "@/lib/utils/toast";
import type { Agreement } from "@/lib/contracts/types";
import { AddressDisplay } from "./AddressDisplay";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

const PILL = { active: "pill pill-active", released: "pill pill-good", refunded: "pill pill-bad" } as const;
const LABEL = { active: "● Monitoring", released: "✓ SLA kept · paid", refunded: "✕ SLA breached · refunded" } as const;

function CheckDialog({ ag, onClose }: { ag: Agreement | null; onClose: () => void }) {
  const { address } = useWallet();
  const kit = useTransactionKit(address);
  const invalidate = useInvalidateAgreements();
  const contractAddress = getContractAddress();
  const tx = useMemo<SubmitInput | null>(
    () => (ag ? ({ kind: "write", address: contractAddress as `0x${string}`, method: "check_sla", args: [ag.id] as any } as SubmitInput) : null),
    [ag, contractAddress],
  );
  const done = (s: TrackedStatus) => {
    invalidate();
    if (s.successful !== false) { success("Check decided", { description: "Validators reached consensus on the evidence." }); onClose(); }
    else error("Not decided", { description: "Evidence was unavailable or unclear. Funds are untouched; try again later." });
  };
  return (
    <Dialog open={!!ag} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="brand-card sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Run SLA check</DialogTitle>
          <DialogDescription>Validators fetch the status page and vote. Only a clear, quoted result moves the escrow.</DialogDescription>
        </DialogHeader>
        {ag && kit && tx && (
          <GenLayerTransactionPanel kit={kit} tx={tx} network={GENLAYER_NETWORK.chainName} theme="light" trackUntil="decided" onDone={done} />
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AgreementsList() {
  const { data = [], isLoading, error: err } = useAgreements();
  const { address } = useWallet();
  const [target, setTarget] = useState<Agreement | null>(null);
  const me = address?.toLowerCase();

  if (!getContractAddress())
    return <div className="brand-card p-6 text-sm">Set <code>NEXT_PUBLIC_CONTRACT_ADDRESS</code> in <code>frontend/.env</code> to your Studio deployment.</div>;
  if (isLoading) return <div className="brand-card p-6 text-sm text-muted-foreground">Reading agreements from GenLayer…</div>;
  if (err) return <div className="brand-card p-6 text-sm text-destructive">{err.message}</div>;
  if (data.length === 0)
    return (
      <div className="brand-card p-10 text-center">
        <img src="/art/empty.svg" alt="A shield with a clock" className="w-56 mx-auto" />
        <p className="font-bold text-xl mt-2">No agreements yet</p>
        <p className="text-sm text-muted-foreground">Connect a wallet and lock the first escrow.</p>
      </div>
    );

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {data.map((a) => {
          const party = me && (me === a.customer.toLowerCase() || me === a.provider.toLowerCase());
          return (
            <article key={a.id} className="brand-card brand-card-hover p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg leading-tight">{a.title}</h3>
                <span className={PILL[a.status]}>{LABEL[a.status]}</span>
              </div>
              <p className="text-sm text-muted-foreground">{a.sla_rule}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{fromWei(a.escrow)}</span>
                <span className="eyebrow">GEN in escrow</span>
              </div>
              <dl className="text-xs grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <dt className="text-muted-foreground">Customer</dt><dd><AddressDisplay address={a.customer} /></dd>
                <dt className="text-muted-foreground">Provider</dt><dd><AddressDisplay address={a.provider} /></dd>
                <dt className="text-muted-foreground">Review</dt><dd>{a.deadline || "any time"}</dd>
              </dl>
              <a href={a.evidence_url} target="_blank" rel="noopener noreferrer" className="text-xs inline-flex items-center gap-1 text-accent hover:underline break-all">
                <ExternalLink className="w-3 h-3 shrink-0" /> {a.evidence_url}
              </a>
              {a.status !== "active" ? (
                <p className="text-xs rounded-lg bg-muted p-3">{a.verdict_reason}</p>
              ) : (
                <Button variant="gradient" disabled={!party} onClick={() => setTarget(a)} className="mt-auto">
                  <ShieldCheck className="w-4 h-4" /> {party ? "Run SLA check" : "Only the parties can check"}
                </Button>
              )}
            </article>
          );
        })}
      </div>
      <CheckDialog ag={target} onClose={() => setTarget(null)} />
    </>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { parseEther } from "viem";
import { GenLayerTransactionPanel, type SubmitInput, type TrackedStatus } from "@genlayer/transaction-kit-react";
import { useInvalidateAgreements } from "@/lib/hooks/useDeadlineGuard";
import { GENLAYER_NETWORK, getContractAddress } from "@/lib/genlayer/client";
import { useTransactionKit } from "@/lib/genlayer/kit";
import { useWallet } from "@/lib/genlayer/wallet";
import { error, success } from "@/lib/utils/toast";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const TEXTAREA =
  "flex w-full min-h-[84px] rounded-md border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";
const EMPTY = { provider: "", title: "", rule: "", url: "", deadline: "", amount: "" };

export function CreateAgreementModal() {
  const { isConnected, address, isLoading } = useWallet();
  const kit = useTransactionKit(address);
  const invalidate = useInvalidateAgreements();
  const contractAddress = getContractAddress();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "review">("form");
  const [f, setF] = useState(EMPTY);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<any>) => {
    setF({ ...f, [k]: e.target.value });
    setErrs({ ...errs, [k]: "" });
  };

  const amountWei = useMemo(() => {
    try { return parseEther(f.amount || "0"); } catch { return BigInt(0); }
  }, [f.amount]);

  // Stable identity: the panel re-estimates fees whenever this changes.
  const tx = useMemo<SubmitInput>(
    () => ({
      kind: "write",
      address: contractAddress as `0x${string}`,
      method: "create_agreement",
      args: [f.provider.trim(), f.title.trim(), f.rule.trim(), f.url.trim(), f.deadline.trim()] as any,
      value: amountWei,
    } as SubmitInput),
    [contractAddress, f, amountWei],
  );

  useEffect(() => {
    if (!isConnected && open && step === "form") setOpen(false);
  }, [isConnected, open, step]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/^0x[0-9a-fA-F]{40}$/.test(f.provider.trim())) e.provider = "Enter the provider's 0x wallet address";
    if (f.provider.trim().toLowerCase() === address?.toLowerCase()) e.provider = "Provider must be a different wallet";
    if (!f.title.trim()) e.title = "Name the agreement";
    if (f.rule.trim().length < 10) e.rule = "Describe when the SLA is kept (10+ characters)";
    if (!/^https?:\/\//i.test(f.url.trim())) e.url = "Enter a status page address starting with http";
    if (amountWei <= BigInt(0)) e.amount = "Escrow must be greater than 0";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const reset = () => { setF(EMPTY); setErrs({}); setStep("form"); };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!isConnected || !kit) return error("Connect your wallet first");
    if (!contractAddress) return error("Contract address not configured", { description: "Set NEXT_PUBLIC_CONTRACT_ADDRESS." });
    if (validate()) setStep("review");
  };

  const done = (s: TrackedStatus) => {
    if (s.successful !== false) {
      invalidate();
      success("Escrow locked", { description: "Your agreement is now recorded on GenLayer." });
      reset();
      setOpen(false);
    } else error("Transaction failed", { description: "The transaction completed without a successful outcome." });
  };

  const field = (k: keyof typeof EMPTY, label: string, ph: string, type = "text") => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type={type} placeholder={ph} value={f[k]} onChange={set(k)} className={errs[k] ? "border-destructive" : ""} />
      {errs[k] && <p className="text-xs text-destructive">{errs[k]}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); setOpen(o); }}>
      <DialogTrigger asChild>
        <Button variant="gradient" disabled={!isConnected || !address || isLoading}>
          <Plus className="w-4 h-4" /> New agreement
        </Button>
      </DialogTrigger>
      <DialogContent className="brand-card sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Lock escrow against an SLA</DialogTitle>
          <DialogDescription>Write the SLA in plain English and point to the public status page that proves it.</DialogDescription>
        </DialogHeader>
        {step === "review" && kit && contractAddress ? (
          <div className="mt-2 space-y-4">
            <Button type="button" variant="secondary" size="sm" onClick={() => setStep("form")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <GenLayerTransactionPanel kit={kit} tx={tx} network={GENLAYER_NETWORK.chainName} theme="light" trackUntil="decided" onDone={done} />
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 mt-2">
            {field("title", "Agreement name", "Acme Cloud uptime, October")}
            {field("provider", "Provider wallet (gets paid if SLA is kept)", "0x…")}
            <div className="space-y-1.5">
              <Label htmlFor="rule">SLA (plain English)</Label>
              <textarea id="rule" className={`${TEXTAREA} ${errs.rule ? "border-destructive" : ""}`} placeholder="Kept if the status page shows 99.9% uptime or higher this week." value={f.rule} onChange={set("rule")} />
              {errs.rule && <p className="text-xs text-destructive">{errs.rule}</p>}
            </div>
            {field("url", "Evidence status page", "https://status.example.com", "url")}
            <div className="grid grid-cols-2 gap-3">
              {field("amount", "Escrow (GEN)", "1.5", "number")}
              {field("deadline", "Review date (label)", "2026-10-31")}
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" className="flex-1" disabled={!kit}>Review</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

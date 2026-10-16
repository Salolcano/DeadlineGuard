export type AgreementStatus = "active" | "released" | "refunded";

export interface Agreement {
  id: string;
  customer: string;
  provider: string;
  title: string;
  sla_rule: string;
  evidence_url: string;
  deadline: string;
  escrow: number; // wei
  status: AgreementStatus;
  outcome: "" | "sla_met" | "sla_breached";
  verdict_reason: string;
  checks: number;
}

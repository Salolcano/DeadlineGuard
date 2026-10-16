"use client";

import { Navbar } from "@/components/Navbar";
import { AgreementsList } from "@/components/AgreementsList";
import { useAgreements } from "@/lib/hooks/useDeadlineGuard";
import { fromWei } from "@/lib/hooks/useDeadlineGuard";

const STEPS = [
  { img: "/art/step-lock.svg", n: "01 · lock", t: "Escrow the payment.", d: "The customer writes the SLA in plain English, names the provider, links a public status page and locks GEN in the contract." },
  { img: "/art/step-eye.svg", n: "02 · watch", t: "Validators read the page.", d: "Either party runs a check. Every validator fetches the live page and an LLM judges it against your SLA, quoting the exact text it relied on." },
  { img: "/art/step-scales.svg", n: "03 · settle", t: "Release or refund.", d: "Consensus on one verdict moves the money: kept pays the provider, breached refunds the customer. Unclear evidence moves nothing." },
];

const TRUST = [
  ["Fail-safe verdicts", "Only the exact strings “met” or “breached” with a quote that really appears on the page can move funds. Anything else reverts and the escrow stays put."],
  ["Prompt-injection isolation", "The SLA and the fetched page are untrusted, so they are sent as one escaped JSON data object between fixed rules."],
  ["Consensus-bound explanation", "Validators agree on one enum value. The stored reason is written by the contract from that value, never from model text."],
  ["One-shot finalization", "An agreement settles once. No second check, no double payout."],
];

export default function HomePage() {
  const { data = [] } = useAgreements();
  const locked = data.filter((a) => a.status === "active").reduce((s, a) => s + fromWei(a.escrow), 0);

  return (
    <div id="top" className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 px-4 md:px-6">
        <section className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="animate-fade-in">
            <p className="eyebrow mb-4">SLA escrow on GenLayer</p>
            <h1 className="text-5xl md:text-6xl leading-[1.02]">
              Promises, <span className="serif-accent">verified</span> by the web.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-md">
              Lock payment against a plain-English SLA. GenLayer validators read the live status page and release or refund the funds. No arbiter, no invoice chasing.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              {["No middleman", "Evidence-quoted", "Fail-safe by design"].map((t) => <span key={t} className="pill">{t}</span>)}
            </div>
            <div className="mt-8 flex gap-8">
              <div><p className="text-3xl font-bold">{data.length}</p><p className="eyebrow">Agreements</p></div>
              <div><p className="text-3xl font-bold">{locked.toFixed(2)}</p><p className="eyebrow">GEN monitored</p></div>
              <div><p className="text-3xl font-bold">{data.filter((a) => a.status !== "active").length}</p><p className="eyebrow">Settled</p></div>
            </div>
          </div>
          <img src="/art/hero.svg" alt="A status page, a shield with a clock and a stack of GEN coins" className="w-full animate-floaty" />
        </section>

        <section id="how" className="max-w-5xl mx-auto mt-24">
          <p className="eyebrow">How it works</p>
          <h2 className="text-3xl md:text-4xl mt-2">One page of evidence. <span className="serif-accent">One verdict.</span></h2>
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {STEPS.map((s) => (
              <div key={s.n} className="brand-card p-5">
                <img src={s.img} alt="" className="w-full h-36 object-contain" />
                <p className="eyebrow mt-3">{s.n}</p>
                <h3 className="text-xl mt-1">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="agreements" className="max-w-5xl mx-auto mt-24 scroll-mt-24">
          <p className="eyebrow">Live on Studio</p>
          <h2 className="text-3xl md:text-4xl mt-2 mb-8">Active <span className="serif-accent">agreements</span></h2>
          <AgreementsList />
        </section>

        <section id="trust" className="max-w-5xl mx-auto mt-24 scroll-mt-24">
          <p className="eyebrow">Trust model</p>
          <h2 className="text-3xl md:text-4xl mt-2">Built so a bad model answer <span className="serif-accent">can’t pay out.</span></h2>
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            {TRUST.map(([t, d]) => (
              <div key={t} className="brand-card p-5"><h3 className="text-lg">{t}</h3><p className="text-sm text-muted-foreground mt-1">{d}</p></div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">Demo caveat: the customer picks the evidence page, so use a status source both parties trust.</p>
        </section>
      </main>

      <footer className="mt-24 border-t border-border py-6 text-sm text-muted-foreground">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap gap-6 justify-center">
          <a href="https://genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent">Powered by GenLayer</a>
          <a href="https://studio.genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent">Studio</a>
          <a href="https://explorer-studio.genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent">Explorer</a>
          <a href="https://docs.genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent">Docs</a>
        </div>
      </footer>
    </div>
  );
}

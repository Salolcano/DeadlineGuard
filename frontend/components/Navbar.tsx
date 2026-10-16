"use client";

import { AccountPanel } from "./AccountPanel";
import { CreateAgreementModal } from "./CreateAgreementModal";

export function Navbar() {
  return (
    <header className="fixed top-3 inset-x-0 z-40 px-3">
      <div className="brand-navbar max-w-5xl mx-auto flex items-center justify-between h-14 pl-4 pr-2">
        <a href="#top" className="flex items-center gap-2 font-bold text-lg">
          <img src="/favicon.svg" alt="" className="w-7 h-7" />
          DeadlineGuard
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#agreements" className="hover:text-foreground">Agreements</a>
          <a href="#trust" className="hover:text-foreground">Trust model</a>
        </nav>
        <div className="flex items-center gap-2">
          <CreateAgreementModal />
          <AccountPanel />
        </div>
      </div>
    </header>
  );
}

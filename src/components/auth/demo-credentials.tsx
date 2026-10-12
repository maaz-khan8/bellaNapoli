"use client";

import { KeyRound, MousePointerClick } from "lucide-react";
import type { Role } from "@/lib/types";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/store/auth-store";
import { cn } from "@/lib/utils";

/** One-click demo credential helper shown on each login page. */
export function DemoCredentials({
  role,
  onUse,
  tone = "light",
}: {
  role: Role;
  onUse: (email: string, password: string) => void;
  tone?: "light" | "dark";
}) {
  const account = DEMO_ACCOUNTS.find((a) => a.role === role)!;
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed p-4 text-sm",
        tone === "dark" ? "border-white/15 bg-white/5 text-white/80" : "border-primary/30 bg-primary/5",
      )}
    >
      <div className="flex items-start gap-3">
        <KeyRound className={cn("mt-0.5 size-4 shrink-0", tone === "dark" ? "text-white/60" : "text-primary")} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Demo {account.title} account</p>
          <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-xs">
            <dt className="opacity-70">Email</dt>
            <dd className="truncate">{account.email}</dd>
            <dt className="opacity-70">Password</dt>
            <dd>{DEMO_PASSWORD}</dd>
          </dl>
        </div>
        <button
          type="button"
          onClick={() => onUse(account.email, DEMO_PASSWORD)}
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition",
            tone === "dark" ? "bg-white/10 text-white hover:bg-white/20" : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          <MousePointerClick className="size-3.5" aria-hidden="true" /> Use
        </button>
      </div>
    </div>
  );
}

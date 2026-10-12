"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/dashboard/primitives";
import { ResetDemoButton } from "@/components/shared/reset-demo-button";
import { LOGIN_PATHS, useAuthStore } from "@/store/auth-store";
import { useSession } from "@/hooks/use-session";
import { formatDateTime, initials } from "@/lib/format";

export function AccountPanel({ role, roleLabel }: { role: Extract<Role, "manager" | "admin">; roleLabel: string }) {
  const session = useSession(role)!;
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  return (
    <Panel title="Your account">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">{initials(session.name)}</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{session.name}</p>
          <p className="text-sm text-muted-foreground">{session.email} · {roleLabel}</p>
          <p className="mt-1 text-xs text-muted-foreground">Signed in {formatDateTime(session.signedInAt)} · session {session.remember ? "remembered for 30 days" : "expires in 12 hours"}</p>
        </div>
        <Button
          variant="outline"
          className="h-10"
          onClick={() => {
            logout(role);
            toast.success("Signed out");
            router.push(LOGIN_PATHS[role]);
          }}
        >
          <LogOut /> Sign out
        </Button>
      </div>
    </Panel>
  );
}

export function PreferencesPanel({ items }: { items: { id: string; label: string; hint: string; defaultOn: boolean }[] }) {
  const [state, setState] = useState(() => Object.fromEntries(items.map((i) => [i.id, i.defaultOn])));
  return (
    <Panel title="Notification preferences" description="Preview only — real email and SMS delivery will be added with the backend." actions={<span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 uppercase">Preview</span>}>
      <ul className="divide-y">
        {items.map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div>
              <Label htmlFor={`pref-${i.id}`}>{i.label}</Label>
              <p className="text-xs text-muted-foreground">{i.hint}</p>
            </div>
            <Switch
              id={`pref-${i.id}`}
              checked={state[i.id]}
              onCheckedChange={(v) => {
                setState((s) => ({ ...s, [i.id]: v }));
                toast.success(`${i.label} ${v ? "on" : "off"}`, { description: "Saved for this session (preview)." });
              }}
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function DemoDataPanel() {
  return (
    <Panel title="Demo data" description="Everything in this prototype is stored in your browser's localStorage.">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex size-11 items-center justify-center rounded-xl bg-muted"><Database className="size-5 text-muted-foreground" aria-hidden="true" /></span>
        <p className="min-w-0 flex-1 text-sm text-muted-foreground">Reset restores the original menu, restaurant profile, 30 customers and ~90 days of order history, and clears the cart.</p>
        <ResetDemoButton className="h-10" />
      </div>
      <p className="mt-4 flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Authentication and role protection here are simulated for UI review. No real passwords or personal data are stored.
      </p>
    </Panel>
  );
}

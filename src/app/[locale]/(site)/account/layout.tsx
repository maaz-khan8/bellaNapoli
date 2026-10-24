"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useFormat } from "@/hooks/use-format";
import { motion } from "motion/react";
import { LogOut, MapPin, Package, User } from "lucide-react";
import { toast } from "sonner";
import { RoleGuard } from "@/components/auth/role-guard";
import { useCurrentCustomer, useSession } from "@/hooks/use-session";
import { useAuthStore } from "@/store/auth-store";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/account", label: "profile", icon: User },
  { href: "/account/orders", label: "orders", icon: Package },
  { href: "/account/addresses", label: "addresses", icon: MapPin },
] as const;

function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const ta = useTranslations("account");
  const f = useFormat();
  const session = useSession("customer")!;
  const customer = useCurrentCustomer();
  const logout = useAuthStore((s) => s.logout);
  const name = customer?.name ?? session.name;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-wrap items-center gap-5">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-tomato-500 to-ember-500 text-xl font-bold text-white shadow-lg shadow-primary/25" aria-hidden="true">
          {initials(name)}
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{ta("greeting", { name: name.split(" ")[0]! })}</h1>
          <p className="text-sm text-muted-foreground">{customer ? ta("memberSince", { date: f.date(customer.joinedAt, { month: "long", year: "numeric" }) }) : session.email}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label={ta("navLabel")} className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {TABS.map((t) => {
            const active = t.href === "/account" ? pathname === "/account" : pathname.startsWith(t.href);
            return (
              <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined} className={cn("relative flex h-11 shrink-0 items-center gap-2.5 rounded-xl px-4 text-sm font-semibold transition-colors", active ? "text-primary" : "text-charcoal-600 hover:bg-white hover:text-foreground")}>
                {active && <motion.span layoutId="account-tab" className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-border" />}
                <t.icon className="relative size-4" aria-hidden="true" />
                <span className="relative">{ta(`tabs.${t.label}`)}</span>
              </Link>
            );
          })}
          <button
            onClick={() => {
              logout("customer");
              toast.success(ta("signedOut"));
              router.push("/");
            }}
            className="flex h-11 shrink-0 items-center gap-2.5 rounded-xl px-4 text-sm font-semibold text-destructive hover:bg-destructive/5 lg:mt-4"
          >
            <LogOut className="size-4" aria-hidden="true" /> {ta("signOut")}
          </button>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="customer">
      <AccountShell>{children}</AccountShell>
    </RoleGuard>
  );
}

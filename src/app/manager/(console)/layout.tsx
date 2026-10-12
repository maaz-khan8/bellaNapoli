"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LayoutList,
  Pizza,
  Settings,
  ShieldAlert,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { RoleGuard } from "@/components/auth/role-guard";
import { DashboardShell, type NavItem, type Notice } from "@/components/dashboard/dashboard-shell";
import { DashboardSkeleton } from "@/components/shared/page-loader";
import { LogoMark } from "@/components/brand/logo";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDataStore } from "@/store/data-store";
import { formatCurrency, timeAgo } from "@/lib/format";

function ManagerBrand() {
  const name = useDataStore((s) => s.restaurant.name);
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className="size-9" />
      <div className="leading-tight">
        <p className="text-sm font-semibold text-white">{name}</p>
        <p className="text-[11px] font-medium tracking-wider text-ember-300 uppercase">Manager Console</p>
      </div>
    </div>
  );
}

function AcceptingToggle() {
  const accepting = useDataStore((s) => s.restaurant.acceptingOrders);
  const setAccepting = useDataStore((s) => s.setAcceptingOrders);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-sidebar-accent px-3 py-2.5">
      <div>
        <Label htmlFor="sidebar-accepting" className="text-sm text-white">Accepting orders</Label>
        <p className="text-[11px] text-sidebar-foreground/60">{accepting ? "Store is live" : "Online ordering paused"}</p>
      </div>
      <Switch
        id="sidebar-accepting"
        checked={accepting}
        onCheckedChange={(v) => {
          setAccepting(v);
          toast[v ? "success" : "warning"](v ? "You're accepting online orders" : "Online ordering paused", {
            description: v ? "Customers can check out again." : "Customers can browse but not place orders.",
          });
        }}
      />
    </div>
  );
}

/** Toasts when a brand-new order arrives (e.g. from the customer tab). */
function NewOrderWatcher() {
  const orders = useDataStore((s) => s.orders);
  const router = useRouter();
  const known = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!known.current) {
      known.current = new Set(orders.map((o) => o.id));
      return;
    }
    for (const o of orders) {
      if (known.current.has(o.id)) continue;
      known.current.add(o.id);
      if (o.status === "pending") {
        toast(`New order ${o.number}`, {
          description: `${o.customer.name} · ${o.items.reduce((n, i) => n + i.quantity, 0)} items · ${formatCurrency(o.total)}`,
          action: { label: "View", onClick: () => router.push(`/manager/orders?status=pending`) },
          duration: 10000,
        });
      }
    }
  }, [orders, router]);
  return null;
}

function ManagerConsole({ children }: { children: React.ReactNode }) {
  const orders = useDataStore((s) => s.orders);
  const restaurant = useDataStore((s) => s.restaurant);
  const pending = useMemo(() => orders.filter((o) => o.status === "pending").sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [orders]);

  const nav: NavItem[] = [
    { href: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/manager/orders", label: "Orders", icon: ClipboardList, badge: pending.length },
    { href: "/manager/menu", label: "Menu", icon: Pizza },
    { href: "/manager/categories", label: "Categories", icon: LayoutList },
    { href: "/manager/restaurant", label: "Restaurant profile", icon: Store },
    { href: "/manager/analytics", label: "Sales analytics", icon: BarChart3 },
    { href: "/manager/settings", label: "Settings", icon: Settings },
  ];

  const notices: Notice[] = pending.map((o) => ({
    id: o.id,
    title: `New order ${o.number} · ${formatCurrency(o.total)}`,
    description: `${o.customer.name} · ${timeAgo(o.createdAt)}`,
    href: "/manager/orders?status=pending",
    unread: true,
  }));

  const suspended = !restaurant.platformActive || restaurant.approvalStatus === "suspended";
  const banner = suspended ? (
    <div role="alert" className="flex items-center gap-2 bg-red-600 px-4 py-2.5 text-sm font-medium text-white sm:px-8">
      <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
      Your store has been deactivated by the platform administrator. Customers can&apos;t place orders until it&apos;s reactivated.
    </div>
  ) : !restaurant.acceptingOrders ? (
    <div role="status" className="bg-amber-100 px-4 py-2.5 text-sm font-medium text-amber-900 sm:px-8">
      Online ordering is paused. Turn on &ldquo;Accepting orders&rdquo; in the sidebar to go live.
    </div>
  ) : null;

  return (
    <DashboardShell
      role="manager"
      basePath="/manager"
      brand={<ManagerBrand />}
      brandCompact={<LogoMark className="size-9" />}
      nav={nav}
      notices={notices}
      roleLabel="Restaurant Manager"
      sidebarFooter={<AcceptingToggle />}
      banner={banner}
    >
      <NewOrderWatcher />
      {children}
    </DashboardShell>
  );
}

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-manager flex min-h-svh flex-1 flex-col">
      <RoleGuard role="manager" fallback={<div className="p-8"><DashboardSkeleton /></div>}>
        <ManagerConsole>{children}</ManagerConsole>
      </RoleGuard>
    </div>
  );
}

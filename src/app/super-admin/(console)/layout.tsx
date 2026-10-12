"use client";

import { useMemo } from "react";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Percent,
  Settings,
  ShieldAlert,
  Store,
  Users,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { DashboardShell, type NavItem, type Notice } from "@/components/dashboard/dashboard-shell";
import { DashboardSkeleton } from "@/components/shared/page-loader";
import { PlatformBrand, PlatformMark } from "@/components/brand/platform-logo";
import { useDataStore } from "@/store/data-store";
import { formatCurrency, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

function SidebarRestaurant() {
  const restaurant = useDataStore((s) => s.restaurant);
  const live = restaurant.platformActive && restaurant.approvalStatus === "approved";
  return (
    <div className="rounded-xl bg-sidebar-accent px-3 py-2.5 text-xs">
      <p className="text-sidebar-foreground/60">Monitoring 1 restaurant</p>
      <p className="mt-1 flex items-center gap-2 font-semibold text-white">
        <span className={cn("size-2 rounded-full", live ? "bg-emerald-400" : "bg-red-400")} aria-hidden="true" />
        {restaurant.name}
        <span className="sr-only">{live ? "(live)" : "(inactive)"}</span>
      </p>
    </div>
  );
}

function AdminConsole({ children }: { children: React.ReactNode }) {
  const orders = useDataStore((s) => s.orders);
  const restaurant = useDataStore((s) => s.restaurant);
  const platformName = useDataStore((s) => s.platform.platformName);

  const notices: Notice[] = useMemo(() => {
    const list: Notice[] = [];
    if (!restaurant.platformActive) list.push({ id: "rest-inactive", title: `${restaurant.name} is deactivated`, description: "Customers can't order until reactivated", href: "/super-admin/restaurant", unread: true });
    const recent = orders.filter((o) => o.placedInDemo).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
    for (const o of recent) {
      list.push({ id: o.id, title: `Order ${o.number} · ${formatCurrency(o.total)}`, description: `${o.customer.name} · ${o.status} · ${timeAgo(o.createdAt)}`, href: `/super-admin/orders?q=${o.number}`, unread: o.status === "pending" });
    }
    return list;
  }, [orders, restaurant]);

  const nav: NavItem[] = [
    { href: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/super-admin/restaurant", label: "Restaurant", icon: Store },
    { href: "/super-admin/customers", label: "Customers", icon: Users },
    { href: "/super-admin/orders", label: "Orders", icon: ClipboardList },
    { href: "/super-admin/commissions", label: "Commissions", icon: Percent },
    { href: "/super-admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/super-admin/settings", label: "Settings", icon: Settings },
  ];

  const banner = !restaurant.platformActive ? (
    <div role="alert" className="flex items-center gap-2 bg-red-600 px-4 py-2.5 text-sm font-medium text-white sm:px-8">
      <ShieldAlert className="size-4 shrink-0" aria-hidden="true" /> {restaurant.name} is deactivated on the platform — its storefront is not accepting orders.
    </div>
  ) : null;

  return (
    <DashboardShell
      role="admin"
      basePath="/super-admin"
      brand={<PlatformBrand name={platformName} />}
      brandCompact={<PlatformMark />}
      nav={nav}
      notices={notices}
      roleLabel="Super Admin"
      sidebarFooter={<SidebarRestaurant />}
      banner={banner}
    >
      {children}
    </DashboardShell>
  );
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-admin flex min-h-svh flex-1 flex-col">
      <RoleGuard role="admin" fallback={<div className="p-8"><DashboardSkeleton /></div>}>
        <AdminConsole>{children}</AdminConsole>
      </RoleGuard>
    </div>
  );
}

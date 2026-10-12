"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Coins, DollarSign, ShoppingBag, Star, Store, UserCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCard, PageHeader, Panel, RangeSelect } from "@/components/dashboard/primitives";
import { BarsChart, SERIES, count } from "@/components/dashboard/charts";
import { OrderDetailsSheet } from "@/components/dashboard/order-details-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDataStore } from "@/store/data-store";
import { useNow } from "@/hooks/use-now";
import {
  activeCustomerCount,
  commissionSummary,
  granularityFor,
  inRange,
  newCustomersSeries,
  percentChange,
  previousBounds,
  rangeBounds,
  salesSeries,
  startOfDay,
  summarize,
  type RangeKey,
} from "@/lib/metrics";
import { formatCurrency, formatNumber, formatPercent, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const DAY = 86_400_000;

export default function AdminDashboardPage() {
  const orders = useDataStore((s) => s.orders);
  const customers = useDataStore((s) => s.customers);
  const restaurant = useDataStore((s) => s.restaurant);
  const rate = useDataStore((s) => s.platform.commissionRate);
  const [range, setRange] = useState<RangeKey>("30d");
  const [selected, setSelected] = useState<string | null>(null);
  const now = useNow();

  const d = useMemo(() => {
    const { from, to } = rangeBounds(range, now);
    const cur = inRange(orders, from, to);
    const prevB = previousBounds(range, now);
    const prev = prevB ? inRange(orders, prevB.from, prevB.to) : null;
    const g = granularityFor(range);
    const c = commissionSummary(cur, rate);
    const pc = prev ? commissionSummary(prev, rate) : null;
    const s = summarize(cur);
    return {
      c,
      pc,
      s,
      ps: prev ? summarize(prev) : null,
      newCustomers: customers.filter((x) => { const t = new Date(x.joinedAt).getTime(); return t >= from && t < to; }).length,
      active: activeCustomerCount(cur),
      series: salesSeries(cur, g, from, to, rate),
      signups: newCustomersSeries(customers, "week", startOfDay(now) - 83 * DAY, now + DAY),
      recent: [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 7),
      completion: s.orders ? (s.completed / s.orders) * 100 : 0,
      cancelRate: s.orders ? ((s.cancelled + s.rejected) / s.orders) * 100 : 0,
    };
  }, [orders, customers, rate, range, now]);

  const delta = (a: number, b?: number) => (b === undefined ? undefined : percentChange(a, b));
  const activeCustomers = customers.filter((c) => c.status === "active").length;

  return (
    <>
      <PageHeader
        title="Platform overview"
        description={`Monitoring ${restaurant.name} on the Crustline platform · ${rate}% commission`}
        actions={<RangeSelect value={range} onChange={setRange} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard index={0} label="Total customers" value={formatNumber(customers.length)} icon={Users} tone="primary" hint={`${activeCustomers} active · +${d.newCustomers} in period`} />
        <KpiCard index={1} label="Total orders" value={formatNumber(d.s.orders)} icon={ShoppingBag} tone="blue" delta={delta(d.s.orders, d.ps?.orders)} />
        <KpiCard index={2} label="Total sales (GMV)" value={formatCurrency(d.c.gross)} icon={DollarSign} tone="green" delta={delta(d.c.gross, d.pc?.gross)} />
        <KpiCard index={3} label="Platform commission" value={formatCurrency(d.c.commission)} icon={Coins} tone="amber" delta={delta(d.c.commission, d.pc?.commission)} hint={`${rate}% of gross sales`} />
        <KpiCard index={4} label="Restaurant earnings" value={formatCurrency(d.c.earnings)} icon={Store} tone="slate" delta={delta(d.c.earnings, d.pc?.earnings)} />
        <KpiCard index={5} label="Active customers" value={formatNumber(d.active)} icon={UserCheck} tone="blue" hint="Placed an order in period" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_24rem]">
        <Panel title="Gross sales split" description="Each bar is total sales: restaurant earnings + platform commission">
          <BarsChart
            data={d.series as unknown as Record<string, unknown>[]}
            series={[
              { key: "earnings", label: "Restaurant earnings", color: SERIES[0]! },
              { key: "commission", label: "Platform commission", color: SERIES[1]! },
            ]}
            stacked
            caption="Gross sales split into restaurant earnings and platform commission"
            height={300}
          />
        </Panel>

        <Panel title="Restaurant performance" bodyClassName="p-0">
          <div className="relative h-28 overflow-hidden">
            <Image src={restaurant.coverImage} alt="" fill sizes="400px" className="object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-3 left-4 text-white">
              <p className="font-semibold">{restaurant.name}</p>
              <p className="flex items-center gap-1 text-xs text-white/80"><Star className="size-3.5 fill-gold-400 text-gold-400" aria-hidden="true" /> {restaurant.rating} · {restaurant.reviewCount.toLocaleString()} reviews</p>
            </div>
            <span className={cn("absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-bold", restaurant.platformActive ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
              {restaurant.platformActive ? "Active" : "Deactivated"}
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-px bg-border text-sm">
            {[
              ["Orders", formatNumber(d.s.orders)],
              ["Avg. order", formatCurrency(d.s.averageOrderValue)],
              ["Completion", formatPercent(d.completion)],
              ["Cancel / reject", formatPercent(d.cancelRate)],
              ["Accepting orders", restaurant.acceptingOrders ? "Yes" : "Paused"],
              ["Approval", restaurant.approvalStatus[0]!.toUpperCase() + restaurant.approvalStatus.slice(1)],
            ].map(([k, v]) => (
              <div key={k} className="bg-card px-4 py-3">
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="p-4">
            <Button asChild variant="outline" className="h-10 w-full rounded-xl"><Link href="/super-admin/restaurant">Manage restaurant <ArrowRight /></Link></Button>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[24rem_1fr]">
        <Panel title="Customer activity" description="New sign-ups per week · last 12 weeks">
          <BarsChart data={d.signups} series={[{ key: "customers", label: "New customers", color: "var(--chart-1)" }]} format={count} caption="New customers per week" height={220} />
          <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
            <div><p className="text-xs text-muted-foreground">Ordered in period</p><p className="text-lg font-bold">{d.active}</p></div>
            <div><p className="text-xs text-muted-foreground">Deactivated accounts</p><p className="text-lg font-bold">{customers.length - activeCustomers}</p></div>
          </div>
        </Panel>
        <Panel title="Recent orders" description="Across the platform — click for details" actions={<Link href="/super-admin/orders" className="text-sm font-semibold text-primary hover:underline">All orders</Link>} bodyClassName="p-0 pt-3">
          <ul className="divide-y">
            {d.recent.map((o) => (
              <li key={o.id}>
                <button onClick={() => setSelected(o.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 text-left hover:bg-muted/50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{o.number} <span className="font-normal text-muted-foreground">· {o.customer.name}</span></p>
                    <p className="truncate text-xs text-muted-foreground">{timeAgo(o.createdAt)} · {restaurant.name}</p>
                  </div>
                  <StatusBadge status={o.status} fulfillment={o.fulfillment} pulse />
                  <span className="tabular w-20 text-right text-sm font-semibold">{formatCurrency(o.total)}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <OrderDetailsSheet orderId={selected} onClose={() => setSelected(null)} mode="admin" />
    </>
  );
}

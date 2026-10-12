"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Ban,
  Bike,
  CheckCircle2,
  Clock,
  DollarSign,
  Receipt,
  ShoppingBag,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { KpiCard, PageHeader, Panel, Segmented } from "@/components/dashboard/primitives";
import { RankedBars, TrendChart, count, money } from "@/components/dashboard/charts";
import { LiveQueue } from "@/components/dashboard/live-queue";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDataStore } from "@/store/data-store";
import { useSession } from "@/hooks/use-session";
import { useNow } from "@/hooks/use-now";
import { ACTIVE_STATUSES } from "@/lib/order-status";
import { bestSellers, inRange, ordersInRange, percentChange, salesSeries, startOfDay, summarize } from "@/lib/metrics";
import { formatCurrency, formatDate, timeAgo } from "@/lib/format";

const DAY = 86_400_000;

export default function ManagerDashboardPage() {
  const session = useSession("manager")!;
  const orders = useDataStore((s) => s.orders);
  const restaurant = useDataStore((s) => s.restaurant);
  const setAccepting = useDataStore((s) => s.setAcceptingOrders);
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");
  const now = useNow();

  const data = useMemo(() => {
    const today = startOfDay(now);
    const todayOrders = inRange(orders, today, now + DAY);
    const yesterdayOrders = inRange(orders, today - DAY, today);
    const t = summarize(todayOrders);
    const y = summarize(yesterdayOrders);
    return {
      t,
      y,
      series: salesSeries(orders, "day", today - 13 * DAY, now + DAY),
      best: bestSellers(ordersInRange(orders, "30d", now), 6),
      active: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)),
      recent: [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
    };
  }, [orders, now]);

  const hour = new Date(now).getHours();
  const greeting = hour < 12 ? "Buongiorno" : hour < 18 ? "Buon pomeriggio" : "Buonasera";

  return (
    <>
      <PageHeader
        title={`${greeting}, ${session.name.split(" ")[0]}`}
        description={`Here's how ${restaurant.name} is doing today, ${formatDate(now, { weekday: "long", month: "long", day: "numeric" })}.`}
        actions={<Button asChild className="h-10 rounded-xl"><Link href="/manager/orders?status=pending">Open order queue <ArrowRight /></Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard index={0} label="Today's revenue" value={formatCurrency(data.t.revenue)} icon={DollarSign} delta={percentChange(data.t.revenue, data.y.revenue)} deltaLabel="vs yesterday" />
        <KpiCard index={1} label="Orders today" value={String(data.t.orders)} icon={ShoppingBag} tone="blue" delta={percentChange(data.t.orders, data.y.orders)} deltaLabel="vs yesterday" />
        <KpiCard index={2} label="Pending" value={String(data.t.pending)} icon={Clock} tone="amber" hint={data.t.pending ? "Waiting for you to accept" : "All caught up"} />
        <KpiCard index={3} label="Completed today" value={String(data.t.completed)} icon={CheckCircle2} tone="green" hint={`${data.t.active} in progress`} />
        <KpiCard index={4} label="Cancelled / rejected" value={String(data.t.cancelled + data.t.rejected)} icon={Ban} tone="red" hint={`${data.y.cancelled + data.y.rejected} yesterday`} />
        <KpiCard index={5} label="Avg. order value" value={formatCurrency(data.t.averageOrderValue)} icon={Receipt} tone="slate" delta={percentChange(data.t.averageOrderValue, data.y.averageOrderValue)} deltaLabel="vs yesterday" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <Panel
          title="Sales — last 14 days"
          description={metric === "revenue" ? "Gross revenue from non-cancelled orders" : "Orders per day"}
          actions={<Segmented label="Chart metric" value={metric} onChange={setMetric} options={[{ value: "revenue", label: "Revenue" }, { value: "orders", label: "Orders" }]} />}
        >
          <TrendChart
            data={data.series as unknown as Record<string, unknown>[]}
            series={[{ key: metric, label: metric === "revenue" ? "Revenue" : "Orders", color: "var(--chart-1)" }]}
            format={metric === "revenue" ? money : count}
            caption={`Daily ${metric} for the last 14 days`}
          />
        </Panel>

        <Panel title="Restaurant status">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 p-3.5">
              <div>
                <Label htmlFor="dash-accepting" className="font-semibold">Accepting online orders</Label>
                <p className="text-xs text-muted-foreground">{restaurant.acceptingOrders ? "Customers can check out" : "Checkout is paused"}</p>
              </div>
              <Switch id="dash-accepting" checked={restaurant.acceptingOrders} onCheckedChange={setAccepting} />
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground"><Bike className="size-4" aria-hidden="true" /> Delivery</dt>
                <dd className="font-medium">{restaurant.delivery.enabled ? `On · ~${restaurant.delivery.estimatedMinutes} min` : "Off"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground"><Store className="size-4" aria-hidden="true" /> Pickup</dt>
                <dd className="font-medium">{restaurant.pickup.enabled ? `On · ~${restaurant.pickup.estimatedMinutes} min` : "Off"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Platform status</dt>
                <dd className={restaurant.platformActive ? "font-medium text-emerald-700" : "font-medium text-red-700"}>{restaurant.platformActive ? "Active" : "Deactivated"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Approval</dt>
                <dd className="font-medium capitalize">{restaurant.approvalStatus}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Active orders</dt>
                <dd className="font-medium">{data.active.length}</dd>
              </div>
            </dl>
            <Button asChild variant="outline" className="h-10 w-full rounded-xl"><Link href="/manager/restaurant">Edit restaurant profile</Link></Button>
          </div>
        </Panel>
      </div>

      <Panel className="mt-6" title="Live kitchen queue" description="Tap an order for details, or move it to the next stage." actions={<Link href="/manager/orders" className="text-sm font-semibold text-primary hover:underline">All orders</Link>}>
        <LiveQueue orders={data.active} />
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_24rem]">
        <Panel title="Recent orders" actions={<Link href="/manager/orders" className="text-sm font-semibold text-primary hover:underline">View all</Link>} bodyClassName="p-0 pt-3">
          <ul className="divide-y">
            {data.recent.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{o.number} <span className="font-normal text-muted-foreground">· {o.customer.name}</span></p>
                  <p className="truncate text-xs text-muted-foreground">{timeAgo(o.createdAt)} · {o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</p>
                </div>
                <StatusBadge status={o.status} fulfillment={o.fulfillment} />
                <span className="tabular w-20 text-right text-sm font-semibold">{formatCurrency(o.total)}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Best-selling items" description="Units sold · last 30 days">
          <RankedBars items={data.best.map((b) => ({ label: b.name, value: b.quantity, sub: formatCurrency(b.revenue), image: b.image }))} />
        </Panel>
      </div>
    </>
  );
}

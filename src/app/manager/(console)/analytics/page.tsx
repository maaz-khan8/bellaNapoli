"use client";

import { useMemo, useState } from "react";
import { DollarSign, Download, Package, Receipt, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { KpiCard, PageHeader, Panel, RangeSelect, Segmented } from "@/components/dashboard/primitives";
import { BarsChart, DonutChart, RankedBars, TrendChart, count, money } from "@/components/dashboard/charts";
import { useDataStore } from "@/store/data-store";
import {
  bestSellers,
  fulfillmentSplit,
  granularityFor,
  inRange,
  isRevenueOrder,
  ordersByHour,
  percentChange,
  previousBounds,
  rangeBounds,
  salesSeries,
  summarize,
  type Granularity,
  type RangeKey,
} from "@/lib/metrics";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency, formatNumber } from "@/lib/format";
import { round2 } from "@/lib/pricing";

const RANGES = [
  { value: "7d" as const, label: "Last 7 days" },
  { value: "30d" as const, label: "Last 30 days" },
  { value: "90d" as const, label: "Last 90 days" },
  { value: "all" as const, label: "All time" },
];

export default function AnalyticsPage() {
  const orders = useDataStore((s) => s.orders);
  const products = useDataStore((s) => s.products);
  const categories = useDataStore((s) => s.categories);
  const [range, setRange] = useState<RangeKey>("30d");
  const [granularity, setGranularity] = useState<Granularity>("day");

  const data = useMemo(() => {
    const { from, to } = rangeBounds(range);
    const current = inRange(orders, from, to);
    const prevB = previousBounds(range);
    const prev = prevB ? inRange(orders, prevB.from, prevB.to) : [];
    const productCat = new Map(products.map((p) => [p.id, p.categoryId]));
    const byCategory = new Map<string, number>();
    for (const o of current.filter(isRevenueOrder)) {
      for (const i of o.items) {
        const cat = categories.find((c) => c.id === productCat.get(i.productId))?.name ?? "Other";
        byCategory.set(cat, round2((byCategory.get(cat) ?? 0) + i.lineTotal));
      }
    }
    return {
      s: summarize(current),
      p: summarize(prev),
      hasPrev: !!prevB,
      series: salesSeries(current, granularity, from, to),
      best: bestSellers(current, 8),
      hours: ordersByHour(current.filter(isRevenueOrder)),
      split: fulfillmentSplit(current),
      categories: [...byCategory.entries()].map(([label, revenue]) => ({ label, revenue })).sort((a, b) => b.revenue - a.revenue),
    };
  }, [orders, products, categories, range, granularity]);

  const delta = (a: number, b: number) => (data.hasPrev ? percentChange(a, b) : undefined);

  const exportCsv = () => {
    downloadCsv(`bella-napoli-sales-${range}.csv`, data.series.map((p) => ({ period: p.label, orders: p.orders, revenue: p.revenue })));
    toast.success("Sales report exported");
  };

  return (
    <>
      <PageHeader
        title="Sales analytics"
        description="Revenue counts every order except cancelled and rejected ones."
        actions={
          <>
            <RangeSelect value={range} onChange={(v) => { setRange(v); setGranularity(granularityFor(v)); }} options={RANGES} />
            <Button variant="outline" className="h-10 rounded-xl" onClick={exportCsv}><Download /> Export CSV</Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard index={0} label="Revenue" value={formatCurrency(data.s.revenue)} icon={DollarSign} delta={delta(data.s.revenue, data.p.revenue)} />
        <KpiCard index={1} label="Total orders" value={formatNumber(data.s.orders)} icon={ShoppingBag} tone="blue" delta={delta(data.s.orders, data.p.orders)} />
        <KpiCard index={2} label="Average order value" value={formatCurrency(data.s.averageOrderValue)} icon={Receipt} tone="slate" delta={delta(data.s.averageOrderValue, data.p.averageOrderValue)} />
        <KpiCard index={3} label="Items sold" value={formatNumber(data.s.itemsSold)} icon={Package} tone="green" delta={delta(data.s.itemsSold, data.p.itemsSold)} />
      </div>

      <Panel
        className="mt-6"
        title="Revenue over time"
        description={`${granularity === "day" ? "Daily" : granularity === "week" ? "Weekly" : "Monthly"} gross sales`}
        actions={<Segmented label="Granularity" value={granularity} onChange={setGranularity} options={[{ value: "day", label: "Daily" }, { value: "week", label: "Weekly" }, { value: "month", label: "Monthly" }]} />}
      >
        <TrendChart data={data.series as unknown as Record<string, unknown>[]} series={[{ key: "revenue", label: "Revenue", color: "var(--chart-1)" }]} caption="Revenue over time" height={300} />
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Orders over time" description="Completed and in-progress orders">
          <BarsChart data={data.series as unknown as Record<string, unknown>[]} series={[{ key: "orders", label: "Orders", color: "#2a78d6" }]} format={count} caption="Orders per period" height={260} />
        </Panel>
        <Panel title="Busiest hours" description="When customers order (local time)">
          <BarsChart data={data.hours} series={[{ key: "orders", label: "Orders", color: "#eb6834" }]} format={count} caption="Orders by hour of day" height={260} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Best-selling products" description="By units sold" className="xl:col-span-1">
          <RankedBars items={data.best.map((b) => ({ label: b.name, value: b.quantity, sub: formatCurrency(b.revenue), image: b.image }))} />
        </Panel>
        <Panel title="Revenue by category" description="Item revenue before discounts & fees">
          <BarsChart data={data.categories} series={[{ key: "revenue", label: "Revenue", color: "var(--chart-1)" }]} layout="vertical" caption="Revenue by menu category" height={Math.max(220, data.categories.length * 36)} />
        </Panel>
        <Panel title="Delivery vs pickup" description="Share of orders">
          <DonutChart data={data.split} caption="Orders by fulfillment type" centerValue={formatNumber(data.s.revenueOrders)} centerLabel="orders" />
          <dl className="mt-5 space-y-1.5 border-t pt-4 text-sm">
            {data.split.map((s) => (
              <div key={s.name} className="flex justify-between"><dt className="text-muted-foreground">{s.name} revenue</dt><dd className="tabular font-semibold">{money(s.revenue)}</dd></div>
            ))}
          </dl>
        </Panel>
      </div>
    </>
  );
}

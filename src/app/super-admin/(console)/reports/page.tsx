"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, Panel, RangeSelect } from "@/components/dashboard/primitives";
import { BarsChart, DonutChart, SERIES, TrendChart, count } from "@/components/dashboard/charts";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDataStore } from "@/store/data-store";
import {
  commissionSummary,
  customerStats,
  fulfillmentSplit,
  granularityFor,
  inRange,
  newCustomersSeries,
  rangeBounds,
  salesSeries,
  statusBreakdown,
  summarize,
  type RangeKey,
} from "@/lib/metrics";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { round2 } from "@/lib/pricing";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

export default function ReportsPage() {
  const orders = useDataStore((s) => s.orders);
  const customers = useDataStore((s) => s.customers);
  const rate = useDataStore((s) => s.platform.commissionRate);
  const [range, setRange] = useState<RangeKey>("30d");
  const [tab, setTab] = useState("sales");

  const r = useMemo(() => {
    const { from, to } = rangeBounds(range);
    const cur = inRange(orders, from, to);
    const g = granularityFor(range);
    const s = summarize(cur);
    const series = salesSeries(cur, g, from, to, rate);
    const topCustomers = customerStats(customers, cur).filter((c) => c.orders > 0).sort((a, b) => b.spent - a.spent).slice(0, 10);
    const signups = newCustomersSeries(customers, g === "day" ? "week" : g, from, to);
    return {
      cur, s, series, topCustomers, signups,
      c: commissionSummary(cur, rate),
      breakdown: statusBreakdown(cur),
      split: fulfillmentSplit(cur),
      newCustomers: customers.filter((c) => { const t = new Date(c.joinedAt).getTime(); return t >= from && t < to; }).length,
      returning: topCustomers.length ? customerStats(customers, cur).filter((c) => c.orders > 1).length : 0,
    };
  }, [orders, customers, rate, range]);

  const exportReport = () => {
    const stamp = `${range}-${new Date().toISOString().slice(0, 10)}`;
    if (tab === "sales") downloadCsv(`sales-report-${stamp}.csv`, r.series.map((p) => ({ period: p.label, orders: p.orders, gross_sales: p.revenue, avg_order_value: p.orders ? round2(p.revenue / p.orders) : 0 })));
    if (tab === "orders") downloadCsv(`orders-report-${stamp}.csv`, r.cur.map((o) => ({ order: o.number, placed: formatDateTime(o.createdAt), customer: o.customer.name, type: o.fulfillment, items: o.items.reduce((n, i) => n + i.quantity, 0), subtotal: o.subtotal, discount: o.discount, delivery_fee: o.deliveryFee, total: o.total, status: o.status })));
    if (tab === "customers") downloadCsv(`customers-report-${stamp}.csv`, customerStats(customers, r.cur).map((c) => ({ name: c.customer.name, email: c.customer.email, joined: formatDate(c.customer.joinedAt), status: c.customer.status, orders_in_period: c.orders, spent_in_period: c.spent })));
    if (tab === "commission") downloadCsv(`commission-report-${stamp}.csv`, r.series.map((p) => ({ period: p.label, orders: p.orders, gross_sales: p.revenue, commission_rate: `${rate}%`, commission: p.commission, restaurant_earnings: p.earnings })));
    toast.success("Report exported", { description: "CSV downloaded to your device." });
  };

  return (
    <>
      <PageHeader
        title="Reports & analytics"
        description="Platform-wide reporting for Bella Napoli. Export any report as CSV."
        actions={
          <>
            <RangeSelect value={range} onChange={setRange} />
            <Button className="h-10 rounded-xl" onClick={exportReport}><Download /> Export CSV</Button>
          </>
        }
      />
      <Tabs value={tab} onValueChange={setTab} className="gap-5">
        <TabsList className="h-10 w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="sales" className="px-4">Sales</TabsTrigger>
          <TabsTrigger value="orders" className="px-4">Orders</TabsTrigger>
          <TabsTrigger value="customers" className="px-4">Customers</TabsTrigger>
          <TabsTrigger value="commission" className="px-4">Commission</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Gross sales" value={formatCurrency(r.s.revenue)} />
            <Stat label="Billable orders" value={formatNumber(r.s.revenueOrders)} />
            <Stat label="Avg. order value" value={formatCurrency(r.s.averageOrderValue)} />
            <Stat label="Items sold" value={formatNumber(r.s.itemsSold)} />
          </div>
          <Panel title="Gross sales over time"><TrendChart data={r.series as unknown as Record<string, unknown>[]} series={[{ key: "revenue", label: "Gross sales", color: "var(--chart-1)" }]} caption="Gross sales over time" /></Panel>
          <Panel title="Sales by period" bodyClassName="p-0">
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader><TableRow className="hover:bg-transparent"><TableHead className="pl-5">Period</TableHead><TableHead className="text-right">Orders</TableHead><TableHead className="text-right">Gross sales</TableHead><TableHead className="pr-5 text-right">Avg. order</TableHead></TableRow></TableHeader>
                <TableBody>
                  {[...r.series].reverse().map((p) => (
                    <TableRow key={p.key}><TableCell className="pl-5">{p.label}</TableCell><TableCell className="tabular text-right">{p.orders}</TableCell><TableCell className="tabular text-right">{formatCurrency(p.revenue)}</TableCell><TableCell className="tabular pr-5 text-right">{formatCurrency(p.orders ? p.revenue / p.orders : 0)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Total orders" value={formatNumber(r.s.orders)} />
            <Stat label="Completed" value={formatNumber(r.s.completed)} />
            <Stat label="In progress" value={formatNumber(r.s.pending + r.s.active)} />
            <Stat label="Cancelled / rejected" value={formatNumber(r.s.cancelled + r.s.rejected)} />
          </div>
          <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
            <Panel title="Orders over time"><BarsChart data={r.series as unknown as Record<string, unknown>[]} series={[{ key: "orders", label: "Orders", color: SERIES[0]! }]} format={count} caption="Orders over time" /></Panel>
            <Panel title="Delivery vs pickup"><DonutChart data={r.split} caption="Orders by fulfillment type" centerValue={formatNumber(r.s.revenueOrders)} centerLabel="orders" /></Panel>
          </div>
          <Panel title="Status breakdown" bodyClassName="p-0">
            <Table>
              <TableHeader><TableRow className="hover:bg-transparent"><TableHead className="pl-5">Status</TableHead><TableHead className="text-right">Orders</TableHead><TableHead className="pr-5 text-right">Share</TableHead></TableRow></TableHeader>
              <TableBody>
                {r.breakdown.map((b) => (
                  <TableRow key={b.status}><TableCell className="pl-5"><StatusBadge status={b.status} /></TableCell><TableCell className="tabular text-right">{b.count}</TableCell><TableCell className="tabular pr-5 text-right">{r.s.orders ? ((b.count / r.s.orders) * 100).toFixed(1) : "0.0"}%</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Total customers" value={formatNumber(customers.length)} />
            <Stat label="New in period" value={formatNumber(r.newCustomers)} />
            <Stat label="Ordering customers" value={formatNumber(new Set(r.cur.map((o) => o.customerId)).size)} />
            <Stat label="Repeat customers" value={formatNumber(r.returning)} />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <Panel title="New customer sign-ups"><BarsChart data={r.signups} series={[{ key: "customers", label: "New customers", color: "var(--chart-1)" }]} format={count} caption="New customer sign-ups" height={260} /></Panel>
            <Panel title="Top customers in period" bodyClassName="p-0">
              <Table>
                <TableHeader><TableRow className="hover:bg-transparent"><TableHead className="pl-5">Customer</TableHead><TableHead className="text-right">Orders</TableHead><TableHead className="pr-5 text-right">Spent</TableHead></TableRow></TableHeader>
                <TableBody>
                  {r.topCustomers.map((c) => (
                    <TableRow key={c.customer.id}><TableCell className="pl-5 font-medium">{c.customer.name}</TableCell><TableCell className="tabular text-right">{c.orders}</TableCell><TableCell className="tabular pr-5 text-right font-semibold">{formatCurrency(c.spent)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="commission" className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Gross sales" value={formatCurrency(r.c.gross)} />
            <Stat label="Commission rate" value={`${rate}%`} />
            <Stat label="Platform commission" value={formatCurrency(r.c.commission)} />
            <Stat label="Restaurant earnings" value={formatCurrency(r.c.earnings)} />
          </div>
          <Panel title="Commission vs earnings" description="Stacked bars total gross sales">
            <BarsChart data={r.series as unknown as Record<string, unknown>[]} series={[{ key: "earnings", label: "Restaurant earnings", color: SERIES[0]! }, { key: "commission", label: "Platform commission", color: SERIES[1]! }]} stacked caption="Commission and restaurant earnings over time" />
          </Panel>
        </TabsContent>
      </Tabs>
    </>
  );
}

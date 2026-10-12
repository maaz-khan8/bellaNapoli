"use client";

import { useMemo, useState } from "react";
import { Coins, DollarSign, Info, Percent, Save, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KpiCard, PageHeader, Panel, RangeSelect } from "@/components/dashboard/primitives";
import { BarsChart, DonutChart, SERIES, money } from "@/components/dashboard/charts";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDataStore } from "@/store/data-store";
import { commissionSummary, granularityFor, inRange, rangeBounds, salesSeries, type RangeKey } from "@/lib/metrics";
import { formatCurrency, formatNumber } from "@/lib/format";

export default function CommissionsPage() {
  const orders = useDataStore((s) => s.orders);
  const rate = useDataStore((s) => s.platform.commissionRate);
  const updatePlatform = useDataStore((s) => s.updatePlatform);
  const [range, setRange] = useState<RangeKey>("90d");
  const [draft, setDraft] = useState(String(rate));
  const [confirm, setConfirm] = useState(false);

  const parsed = Number(draft);
  const draftError = draft.trim() === "" || Number.isNaN(parsed) ? "Enter a percentage" : parsed < 0 || parsed > 40 ? "Choose a rate between 0% and 40%" : null;

  const d = useMemo(() => {
    const { from, to } = rangeBounds(range);
    const cur = inRange(orders, from, to);
    const g = range === "all" || range === "90d" ? "month" : granularityFor(range);
    return { c: commissionSummary(cur, rate), series: salesSeries(cur, g, from, to, rate) };
  }, [orders, rate, range]);

  const preview = draftError ? null : commissionSummary(inRange(orders, rangeBounds(range).from, rangeBounds(range).to), parsed);

  return (
    <>
      <PageHeader
        title="Commission management"
        description="Platform commission is charged on gross sales (order totals) of every order that isn't cancelled or rejected."
        actions={<RangeSelect value={range} onChange={setRange} />}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard index={0} label="Gross sales" value={formatCurrency(d.c.gross)} icon={DollarSign} tone="green" hint={`${formatNumber(d.c.orders)} billable orders`} />
        <KpiCard index={1} label="Commission rate" value={`${rate}%`} icon={Percent} tone="slate" hint="Applied platform-wide" />
        <KpiCard index={2} label="Platform commission" value={formatCurrency(d.c.commission)} icon={Coins} tone="amber" />
        <KpiCard index={3} label="Restaurant earnings" value={formatCurrency(d.c.earnings)} icon={Store} tone="blue" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[22rem_1fr]">
        <div className="min-w-0 space-y-6">
          <Panel title="Commission rate" description="Demo setting — recalculates every dashboard instantly.">
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (!draftError && parsed !== rate) setConfirm(true);
              }}
              className="space-y-4"
            >
              <div className="grid gap-1.5">
                <Label htmlFor="rate">Commission percentage</Label>
                <div className="relative">
                  <Input id="rate" type="number" min={0} max={40} step={0.5} value={draft} onChange={(e) => setDraft(e.target.value)} aria-invalid={!!draftError} aria-describedby={draftError ? "rate-error" : "rate-hint"} className="h-11 pr-9 text-lg font-semibold" />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <input type="range" min={0} max={40} step={0.5} value={draftError ? rate : parsed} onChange={(e) => setDraft(e.target.value)} className="mt-2 w-full accent-[var(--primary)]" aria-label="Commission percentage slider" />
                {draftError ? <p id="rate-error" role="alert" className="text-xs font-medium text-destructive">{draftError}</p> : <p id="rate-hint" className="text-xs text-muted-foreground">Typical marketplace range: 10–30%.</p>}
              </div>
              {preview && parsed !== rate && (
                <p className="rounded-xl bg-accent p-3 text-xs">
                  At <strong>{parsed}%</strong>, commission for this period would be <strong>{formatCurrency(preview.commission)}</strong> ({preview.commission >= d.c.commission ? "+" : "−"}{formatCurrency(Math.abs(preview.commission - d.c.commission))}).
                </p>
              )}
              <Button type="submit" className="h-10 w-full" disabled={!!draftError || parsed === rate}><Save /> Save rate</Button>
            </form>
          </Panel>
          <Panel title="Split for period">
            <DonutChart
              data={[{ name: "Restaurant earnings", value: d.c.earnings }, { name: "Platform commission", value: d.c.commission }]}
              format={money}
              caption="Gross sales split"
              centerValue={`${rate}%`}
              centerLabel="commission"
            />
          </Panel>
        </div>

        <div className="min-w-0 space-y-6">
          <Panel title="Commission over time" description="Stacked: restaurant earnings + platform commission = gross sales">
            <BarsChart
              data={d.series as unknown as Record<string, unknown>[]}
              series={[{ key: "earnings", label: "Restaurant earnings", color: SERIES[0]! }, { key: "commission", label: "Platform commission", color: SERIES[1]! }]}
              stacked
              caption="Commission and earnings over time"
              height={280}
            />
          </Panel>
          <Panel title="Commission summary" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-5">Period</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Gross sales</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="pr-5 text-right">Restaurant earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...d.series].reverse().map((p) => (
                    <TableRow key={p.key}>
                      <TableCell className="pl-5 font-medium">{p.label}</TableCell>
                      <TableCell className="tabular text-right">{p.orders}</TableCell>
                      <TableCell className="tabular text-right">{formatCurrency(p.revenue)}</TableCell>
                      <TableCell className="tabular text-right text-amber-800">{formatCurrency(p.commission)}</TableCell>
                      <TableCell className="tabular pr-5 text-right">{formatCurrency(p.earnings)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="pl-5 font-semibold">Total</TableCell>
                    <TableCell className="tabular text-right font-semibold">{d.c.orders}</TableCell>
                    <TableCell className="tabular text-right font-semibold">{formatCurrency(d.c.gross)}</TableCell>
                    <TableCell className="tabular text-right font-semibold">{formatCurrency(d.c.commission)}</TableCell>
                    <TableCell className="tabular pr-5 text-right font-semibold">{formatCurrency(d.c.earnings)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            <p className="flex items-start gap-2 border-t px-5 py-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /> Period rows are rounded to the cent; totals are calculated from the full period, so they may differ by a few cents from the sum of rows.
            </p>
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`Change commission to ${parsed}%?`}
        description="All dashboards, reports and restaurant earnings will be recalculated with the new rate. (Demo — historical invoices would normally be preserved.)"
        confirmLabel="Update rate"
        onConfirm={() => {
          updatePlatform({ commissionRate: parsed });
          toast.success(`Commission rate set to ${parsed}%`);
        }}
      />
    </>
  );
}

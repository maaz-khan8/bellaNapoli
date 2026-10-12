"use client";

/* eslint-disable @next/next/no-img-element -- logo may be an uploaded data URL */
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bike, Clock, ExternalLink, Mail, MapPin, Phone, Power, Star, Store } from "lucide-react";
import { toast } from "sonner";
import type { ApprovalStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Panel } from "@/components/dashboard/primitives";
import { TrendChart } from "@/components/dashboard/charts";
import { LogoMark } from "@/components/brand/logo";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDataStore } from "@/store/data-store";
import { commissionSummary, rangeBounds, salesSeries, statusBreakdown, summarize } from "@/lib/metrics";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const APPROVAL: Record<ApprovalStatus, { label: string; className: string }> = {
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-800 ring-emerald-600/25" },
  pending: { label: "Pending review", className: "bg-amber-50 text-amber-800 ring-amber-600/25" },
  suspended: { label: "Suspended", className: "bg-red-50 text-red-800 ring-red-600/25" },
};

export default function AdminRestaurantPage() {
  const restaurant = useDataStore((s) => s.restaurant);
  const orders = useDataStore((s) => s.orders);
  const products = useDataStore((s) => s.products);
  const rate = useDataStore((s) => s.platform.commissionRate);
  const setPlatformActive = useDataStore((s) => s.setPlatformActive);
  const setApprovalStatus = useDataStore((s) => s.setApprovalStatus);
  const [confirmOff, setConfirmOff] = useState(false);

  const d = useMemo(() => {
    const { from, to } = rangeBounds("90d");
    return {
      life: commissionSummary(orders, rate),
      all: summarize(orders),
      series: salesSeries(orders, "week", from, to),
      breakdown: statusBreakdown(orders),
    };
  }, [orders, rate]);
  const maxCount = Math.max(1, ...d.breakdown.map((b) => b.count));

  const operational = restaurant.platformActive && restaurant.approvalStatus !== "suspended" && restaurant.acceptingOrders;

  return (
    <>
      <PageHeader
        title="Restaurant"
        description="The prototype platform currently hosts one restaurant."
        actions={<Button asChild variant="outline" className="h-10 rounded-xl"><Link href="/" target="_blank"><ExternalLink /> Visit storefront</Link></Button>}
      />

      <section className="overflow-hidden rounded-2xl bg-card shadow-xs ring-1 ring-border" aria-label="Restaurant profile">
        <div className="relative h-40 sm:h-52">
          <Image src={restaurant.coverImage} alt="" fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="relative flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <div className="-mt-12 flex size-24 shrink-0 items-center justify-center rounded-2xl bg-card shadow-lg ring-4 ring-card">
            {restaurant.logo ? <img src={restaurant.logo} alt="" className="size-20 rounded-xl object-cover" /> : <LogoMark className="size-20" />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold">{restaurant.name}</h2>
            <p className="text-sm text-muted-foreground">{restaurant.tagline}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className={cn("rounded-full px-2.5 py-1 ring-1 ring-inset", APPROVAL[restaurant.approvalStatus].className)}>{APPROVAL[restaurant.approvalStatus].label}</span>
              <span className={cn("rounded-full px-2.5 py-1 ring-1 ring-inset", restaurant.platformActive ? "bg-emerald-50 text-emerald-800 ring-emerald-600/25" : "bg-red-50 text-red-800 ring-red-600/25")}>
                Platform: {restaurant.platformActive ? "Active" : "Deactivated"}
              </span>
              <span className={cn("rounded-full px-2.5 py-1 ring-1 ring-inset", operational ? "bg-sky-50 text-sky-800 ring-sky-600/25" : "bg-zinc-100 text-zinc-700 ring-zinc-500/25")}>
                {operational ? "Taking orders" : "Not taking orders"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1"><Star className="size-3.5 fill-gold-500 text-gold-500" aria-hidden="true" /> {restaurant.rating} ({restaurant.reviewCount.toLocaleString()})</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[22rem_1fr]">
        <div className="min-w-0 space-y-6">
          <Panel title="Platform controls" description="Demo actions — changes apply instantly to the storefront and manager console.">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 p-3.5">
                <div>
                  <Label htmlFor="platform-active" className="flex items-center gap-2 font-semibold"><Power className="size-4" aria-hidden="true" /> Restaurant active</Label>
                  <p className="text-xs text-muted-foreground">Deactivating blocks all new orders</p>
                </div>
                <Switch
                  id="platform-active"
                  checked={restaurant.platformActive}
                  onCheckedChange={(v) => {
                    if (!v) return setConfirmOff(true);
                    setPlatformActive(true);
                    toast.success(`${restaurant.name} reactivated`, { description: "The storefront is accepting orders again." });
                  }}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="approval">Approval status</Label>
                <Select value={restaurant.approvalStatus} onValueChange={(v) => { setApprovalStatus(v as ApprovalStatus); toast.success(`Approval set to ${APPROVAL[v as ApprovalStatus].label}`); }}>
                  <SelectTrigger id="approval" className="h-10 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent position="popper">
                    {(Object.keys(APPROVAL) as ApprovalStatus[]).map((k) => <SelectItem key={k} value={k}>{APPROVAL[k].label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Suspended restaurants can&apos;t receive orders.</p>
              </div>
            </div>
          </Panel>

          <Panel title="Details">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span>{restaurant.address}, {restaurant.city}</span></li>
              <li className="flex gap-2.5"><Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span>{restaurant.phone}</span></li>
              <li className="flex gap-2.5"><Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span>{restaurant.email}</span></li>
              <li className="flex gap-2.5"><Bike className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span>{restaurant.delivery.enabled ? `Delivery ${formatCurrency(restaurant.delivery.fee)} · free over ${formatCurrency(restaurant.delivery.freeDeliveryOver)} · ${restaurant.delivery.radiusKm} km` : "Delivery off"}</span></li>
              <li className="flex gap-2.5"><Store className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span>{restaurant.pickup.enabled ? `Pickup ~${restaurant.pickup.estimatedMinutes} min` : "Pickup off"}</span></li>
              <li className="flex gap-2.5"><Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span>{restaurant.hours.filter((h) => !h.closed).length} days/week · {products.length} menu items</span></li>
            </ul>
          </Panel>
        </div>

        <div className="min-w-0 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Lifetime sales", formatCurrency(d.life.gross)],
              [`Commission earned (${rate}%)`, formatCurrency(d.life.commission)],
              ["Lifetime orders", formatNumber(d.all.orders)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-card p-5 shadow-xs ring-1 ring-border">
                <p className="text-sm text-muted-foreground">{k}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">{v}</p>
              </div>
            ))}
          </div>
          <Panel title="Sales performance" description="Weekly gross sales · last 90 days">
            <TrendChart data={d.series as unknown as Record<string, unknown>[]} series={[{ key: "revenue", label: "Gross sales", color: "var(--chart-1)" }]} caption="Weekly gross sales for the last 90 days" height={240} />
          </Panel>
          <Panel title="Order summary" description="All orders by status">
            <ul className="space-y-3">
              {d.breakdown.map((b) => (
                <li key={b.status} className="grid grid-cols-[10rem_1fr_3rem] items-center gap-3">
                  <StatusBadge status={b.status} className="justify-self-start" />
                  <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary/70" style={{ width: `${(b.count / maxCount) * 100}%` }} /></div>
                  <span className="tabular text-right text-sm font-semibold">{b.count}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOff}
        onOpenChange={setConfirmOff}
        title={`Deactivate ${restaurant.name}?`}
        description="The storefront will stop accepting orders immediately and the restaurant manager will see a deactivation notice. You can reactivate at any time."
        confirmLabel="Deactivate"
        destructive
        onConfirm={() => {
          setPlatformActive(false);
          toast.warning(`${restaurant.name} deactivated`, { description: "Customers can no longer place orders." });
        }}
      />
    </>
  );
}

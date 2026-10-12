"use client";

import { useMemo, useState } from "react";
import { Bike, ChevronLeft, ChevronRight, Inbox, Search, Store } from "lucide-react";
import type { FulfillmentType, Order, OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { RangeSelect } from "@/components/dashboard/primitives";
import { OrderDetailsSheet, useOrderActions } from "@/components/dashboard/order-details-sheet";
import { nextStatus } from "@/lib/order-status";
import { ordersInRange, type RangeKey } from "@/lib/metrics";
import { formatCurrency, formatDateTime, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "pending" | "active" | "completed" | "closed";

const STATUS_TABS: { value: StatusFilter; label: string; match: (s: OrderStatus) => boolean }[] = [
  { value: "all", label: "All", match: () => true },
  { value: "pending", label: "New", match: (s) => s === "pending" },
  { value: "active", label: "In progress", match: (s) => s === "accepted" || s === "preparing" || s === "ready" },
  { value: "completed", label: "Completed", match: (s) => s === "completed" },
  { value: "closed", label: "Cancelled / rejected", match: (s) => s === "cancelled" || s === "rejected" },
];

const PAGE_SIZE = 12;

export function OrdersTable({
  orders,
  mode,
  initialQuery = "",
  initialRange = "30d",
  initialStatus = "all",
}: {
  orders: Order[];
  mode: "manager" | "admin";
  initialQuery?: string;
  initialRange?: RangeKey;
  initialStatus?: StatusFilter;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [fulfillment, setFulfillment] = useState<"all" | FulfillmentType>("all");
  const [range, setRange] = useState<RangeKey>(initialRange);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const { advance } = useOrderActions();

  const inRange = useMemo(() => ordersInRange(orders, range).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [orders, range]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tab = STATUS_TABS.find((t) => t.value === status)!;
    return inRange.filter((o) => {
      if (!tab.match(o.status)) return false;
      if (fulfillment !== "all" && o.fulfillment !== fulfillment) return false;
      if (!q) return true;
      return [o.number, o.customer.name, o.customer.phone, o.customer.email, ...o.items.map((i) => i.name)].some((s) => s.toLowerCase().includes(q));
    });
  }, [inRange, query, status, fulfillment]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const resetPage = () => setPage(0);

  const quickAction = (order: Order) => {
    const next = mode === "manager" ? nextStatus(order.status, order.fulfillment) : null;
    if (!next) return null;
    return (
      <Button
        size="sm"
        variant={order.status === "pending" ? "default" : "outline"}
        className="h-8"
        onClick={(e) => {
          e.stopPropagation();
          advance(order);
        }}
      >
        {next.label.replace(" order", "").replace("Send out for delivery", "Out for delivery").replace("Mark ready for pickup", "Ready")}
      </Button>
    );
  };

  return (
    <div className="rounded-2xl bg-card shadow-xs ring-1 ring-border">
      <div className="space-y-3 border-b p-4">
        <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4" role="tablist" aria-label="Filter by status">
          {STATUS_TABS.map((t) => {
            const n = inRange.filter((o) => t.match(o.status)).length;
            const active = status === t.value;
            return (
              <button
                key={t.value}
                role="tab"
                aria-selected={active}
                onClick={() => { setStatus(t.value); resetPage(); }}
                className={cn("flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
              >
                {t.label}
                <span className={cn("tabular rounded-md px-1.5 text-xs", active ? "bg-white/20" : "bg-muted")}>{n}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor={`${mode}-orders-search`} className="sr-only">Search orders</label>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id={`${mode}-orders-search`} value={query} onChange={(e) => { setQuery(e.target.value); resetPage(); }} placeholder="Search by order #, customer, phone or item" className="h-10 rounded-xl pl-9" />
          </div>
          <Select value={fulfillment} onValueChange={(v) => { setFulfillment(v as typeof fulfillment); resetPage(); }}>
            <SelectTrigger className="h-10 min-w-36 rounded-xl" aria-label="Fulfillment type"><SelectValue /></SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
              <SelectItem value="pickup">Pickup</SelectItem>
            </SelectContent>
          </Select>
          <RangeSelect value={range} onChange={(v) => { setRange(v); resetPage(); }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Inbox} title="No orders match" description="Try a different search, status or date range." />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  {mode === "manager" && <TableHead className="pr-5 text-right">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((o) => (
                  <TableRow
                    key={o.id}
                    className={cn("cursor-pointer", o.status === "pending" && "bg-amber-50/60 hover:bg-amber-50")}
                    onClick={() => setSelected(o.id)}
                  >
                    <TableCell className="pl-5">
                      <button className="text-left font-semibold hover:text-primary focus-visible:outline-2" onClick={(e) => { e.stopPropagation(); setSelected(o.id); }}>
                        {o.number}
                      </button>
                      <p className="text-xs text-muted-foreground">{timeAgo(o.createdAt)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{o.customer.name}</p>
                      <p className="text-xs text-muted-foreground">{o.customer.phone}</p>
                    </TableCell>
                    <TableCell className="max-w-56">
                      <p className="truncate text-sm">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</p>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        {o.fulfillment === "delivery" ? <Bike className="size-4" aria-hidden="true" /> : <Store className="size-4" aria-hidden="true" />}
                        {o.fulfillment === "delivery" ? "Delivery" : "Pickup"}
                      </span>
                    </TableCell>
                    <TableCell className="tabular text-right font-semibold">{formatCurrency(o.total)}</TableCell>
                    <TableCell><StatusBadge status={o.status} fulfillment={o.fulfillment} pulse /></TableCell>
                    {mode === "manager" && <TableCell className="pr-5 text-right">{quickAction(o)}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y md:hidden">
            {rows.map((o) => (
              <li key={o.id}>
                <div role="button" tabIndex={0} onClick={() => setSelected(o.id)} onKeyDown={(e) => e.key === "Enter" && setSelected(o.id)} className={cn("block w-full p-4 text-left", o.status === "pending" && "bg-amber-50/60")}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{o.number} <span className="font-normal text-muted-foreground">· {o.customer.name}</span></p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)} · {o.fulfillment === "delivery" ? "Delivery" : "Pickup"}</p>
                    </div>
                    <p className="tabular font-bold">{formatCurrency(o.total)}</p>
                  </div>
                  <p className="mt-1.5 truncate text-sm text-muted-foreground">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <StatusBadge status={o.status} fulfillment={o.fulfillment} pulse />
                    {quickAction(o)}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              {safePage * PAGE_SIZE + 1}–{Math.min(filtered.length, (safePage + 1) * PAGE_SIZE)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon-lg" className="size-9" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} aria-label="Previous page"><ChevronLeft /></Button>
              <span className="px-2 text-muted-foreground">Page {safePage + 1} / {pageCount}</span>
              <Button variant="outline" size="icon-lg" className="size-9" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)} aria-label="Next page"><ChevronRight /></Button>
            </div>
          </div>
        </>
      )}

      <OrderDetailsSheet orderId={selected} onClose={() => setSelected(null)} mode={mode} />
    </div>
  );
}

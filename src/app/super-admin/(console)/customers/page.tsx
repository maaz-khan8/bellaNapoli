"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Mail, MapPin, Phone, Search, UserCheck, UserX, Users } from "lucide-react";
import { toast } from "sonner";
import type { Customer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { KpiCard, PageHeader } from "@/components/dashboard/primitives";
import { OrderDetailsSheet } from "@/components/dashboard/order-details-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDataStore } from "@/store/data-store";
import { customerStats, ordersInRange, activeCustomerCount } from "@/lib/metrics";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency, formatDate, formatDateTime, initials, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const PAGE = 12;

function AccountStatus({ status }: { status: Customer["status"] }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", status === "active" ? "bg-emerald-50 text-emerald-800 ring-emerald-600/25" : "bg-zinc-100 text-zinc-700 ring-zinc-500/25")}>
      {status === "active" ? <UserCheck className="size-3.5" aria-hidden="true" /> : <UserX className="size-3.5" aria-hidden="true" />}
      {status === "active" ? "Active" : "Deactivated"}
    </span>
  );
}

export default function AdminCustomersPage() {
  const customers = useDataStore((s) => s.customers);
  const orders = useDataStore((s) => s.orders);
  const updateCustomer = useDataStore((s) => s.updateCustomer);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const stats = useMemo(() => customerStats(customers, orders).sort((a, b) => b.spent - a.spent), [customers, orders]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stats.filter(({ customer: c }) =>
      (status === "all" || c.status === status) &&
      (!q || [c.name, c.email, c.phone].some((s) => s.toLowerCase().includes(q))),
    );
  }, [stats, query, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * PAGE, safePage * PAGE + PAGE);
  const selected = stats.find((s) => s.customer.id === selectedId);
  const selectedOrders = useMemo(() => orders.filter((o) => o.customerId === selectedId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [orders, selectedId]);
  const active30 = activeCustomerCount(ordersInRange(orders, "30d"));
  const totalSpent = stats.reduce((s, x) => s + x.spent, 0);

  const setAccount = (c: Customer, next: Customer["status"]) => {
    updateCustomer(c.id, { status: next });
    toast.success(`${c.name} ${next === "active" ? "reactivated" : "deactivated"}`, {
      description: next === "active" ? "They can sign in and order again." : "They're signed out and can't place orders.",
    });
  };

  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone who has an account with Bella Napoli on the platform."
        actions={
          <Button variant="outline" className="h-10 rounded-xl" onClick={() => { downloadCsv("customers.csv", stats.map((s) => ({ name: s.customer.name, email: s.customer.email, phone: s.customer.phone, status: s.customer.status, joined: formatDate(s.customer.joinedAt), orders: s.orders, spent: s.spent }))); toast.success("Customer list exported"); }}>
            <Download /> Export CSV
          </Button>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KpiCard index={0} label="Total customers" value={String(customers.length)} icon={Users} />
        <KpiCard index={1} label="Ordered in last 30 days" value={String(active30)} icon={UserCheck} tone="green" />
        <KpiCard index={2} label="Lifetime customer spend" value={formatCurrency(totalSpent)} icon={Users} tone="slate" hint={`Avg ${formatCurrency(totalSpent / Math.max(1, customers.length))} per customer`} />
      </div>

      <div className="rounded-2xl bg-card shadow-xs ring-1 ring-border">
        <div className="flex flex-col gap-2 border-b p-4 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor="cust-search" className="sr-only">Search customers</label>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="cust-search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder="Search by name, email or phone" className="h-10 rounded-xl pl-9" />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v as typeof status); setPage(0); }}>
            <SelectTrigger className="h-10 min-w-40 rounded-xl" aria-label="Account status"><SelectValue /></SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All accounts</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Deactivated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={Users} title="No customers found" description="Try a different search or filter." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Customer</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="hidden md:table-cell">Last order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ customer: c, orders: n, spent, lastOrderAt }) => (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => setSelectedId(c.id)}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{initials(c.name)}</span>
                        <div className="min-w-0">
                          <button className="font-semibold hover:text-primary" onClick={(e) => { e.stopPropagation(); setSelectedId(c.id); }}>{c.name}</button>
                          <p className="max-w-52 truncate text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">{c.phone}</TableCell>
                    <TableCell className="tabular text-right">{n}</TableCell>
                    <TableCell className="tabular text-right font-semibold">{formatCurrency(spent)}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{lastOrderAt ? timeAgo(lastOrderAt) : "Never"}</TableCell>
                    <TableCell><AccountStatus status={c.status} /></TableCell>
                    <TableCell className="pr-5 text-right">
                      <Button size="sm" variant="ghost" className="h-8" onClick={(e) => { e.stopPropagation(); setSelectedId(c.id); }}>View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm">
          <p className="text-muted-foreground">{filtered.length} customer{filtered.length === 1 ? "" : "s"}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-lg" className="size-9" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} aria-label="Previous page"><ChevronLeft /></Button>
            <span className="px-2 text-muted-foreground">Page {safePage + 1} / {pageCount}</span>
            <Button variant="outline" size="icon-lg" className="size-9" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)} aria-label="Next page"><ChevronRight /></Button>
          </div>
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent className="w-full gap-0 p-0 sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader className="border-b px-6 py-5">
                <div className="flex items-center gap-4 pr-8">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground">{initials(selected.customer.name)}</span>
                  <div className="min-w-0">
                    <SheetTitle className="text-lg font-bold">{selected.customer.name}</SheetTitle>
                    <SheetDescription>Customer since {formatDate(selected.customer.joinedAt)}</SheetDescription>
                  </div>
                </div>
                <div className="mt-3"><AccountStatus status={selected.customer.status} /></div>
              </SheetHeader>
              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
                <dl className="grid grid-cols-3 gap-3 text-center">
                  {[["Orders", String(selected.orders)], ["Spent", formatCurrency(selected.spent)], ["Avg. order", formatCurrency(selected.orders ? selected.spent / Math.max(1, selectedOrders.filter((o) => o.status !== "cancelled" && o.status !== "rejected").length) : 0)]].map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-muted/60 p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-0.5 font-bold">{v}</dd></div>
                  ))}
                </dl>
                <section aria-labelledby="contact-h" className="space-y-2 text-sm">
                  <h3 id="contact-h" className="font-semibold">Contact</h3>
                  <p className="flex items-center gap-2 text-muted-foreground"><Mail className="size-4" aria-hidden="true" />{selected.customer.email}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Phone className="size-4" aria-hidden="true" />{selected.customer.phone}</p>
                  {selected.customer.addresses.map((a) => (
                    <p key={a.id} className="flex items-start gap-2 text-muted-foreground"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span><strong className="text-foreground">{a.label}:</strong> {a.line1}, {a.city} {a.postalCode}</span></p>
                  ))}
                </section>
                <section aria-labelledby="hist-h">
                  <h3 id="hist-h" className="mb-2 text-sm font-semibold">Order history</h3>
                  {selectedOrders.length === 0 ? (
                    <p className="rounded-xl bg-muted/60 p-4 text-center text-sm text-muted-foreground">No orders yet.</p>
                  ) : (
                    <ul className="divide-y rounded-xl ring-1 ring-border">
                      {selectedOrders.map((o) => (
                        <li key={o.id}>
                          <button onClick={() => setOrderId(o.id)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold">{o.number}</p>
                              <p className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</p>
                            </div>
                            <StatusBadge status={o.status} fulfillment={o.fulfillment} />
                            <span className="tabular w-16 text-right text-sm font-semibold">{formatCurrency(o.total)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
              <SheetFooter className="border-t bg-muted/40 px-6 py-4">
                {selected.customer.status === "active" ? (
                  <ConfirmDialog
                    trigger={<Button variant="outline" className="h-11 w-full border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"><UserX /> Deactivate account</Button>}
                    title={`Deactivate ${selected.customer.name}?`}
                    description="They'll be signed out and won't be able to sign in or place orders until reactivated. Order history is kept."
                    confirmLabel="Deactivate"
                    destructive
                    onConfirm={() => setAccount(selected.customer, "inactive")}
                  />
                ) : (
                  <Button className="h-11 w-full" onClick={() => setAccount(selected.customer, "active")}><UserCheck /> Reactivate account</Button>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
      <OrderDetailsSheet orderId={orderId} onClose={() => setOrderId(null)} mode="admin" />
    </>
  );
}

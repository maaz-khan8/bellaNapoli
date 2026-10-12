"use client";

import { useState } from "react";
import { Ban, Banknote, Bike, Mail, MapPin, MessageSquare, Phone, Store, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import { OrderTimeline } from "@/components/shared/order-timeline";
import { OrderItems, OrderTotals } from "@/components/shared/order-items";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDataStore } from "@/store/data-store";
import { nextStatus, statusLabel } from "@/lib/order-status";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { round2 } from "@/lib/pricing";

const REJECT_REASONS = ["Kitchen at full capacity", "Item unavailable", "Address outside delivery area", "Restaurant closing soon"];

export function useOrderActions() {
  const updateOrderStatus = useDataStore((s) => s.updateOrderStatus);
  const advance = (order: Order) => {
    const next = nextStatus(order.status, order.fulfillment);
    if (!next) return;
    updateOrderStatus(order.id, next.status);
    toast.success(`${order.number} → ${statusLabel(next.status, order.fulfillment)}`, {
      description: "The customer's tracking page has been updated.",
    });
  };
  return { advance, updateOrderStatus };
}

export function OrderDetailsSheet({
  orderId,
  onClose,
  mode,
}: {
  orderId: string | null;
  onClose: () => void;
  mode: "manager" | "admin";
}) {
  const order = useDataStore((s) => s.orders.find((o) => o.id === orderId));
  const commissionRate = useDataStore((s) => s.platform.commissionRate);
  const { advance, updateOrderStatus } = useOrderActions();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState(REJECT_REASONS[0]!);

  const next = order ? nextStatus(order.status, order.fulfillment) : null;
  const canCancel = order && ["accepted", "preparing"].includes(order.status);

  return (
    <Sheet open={!!orderId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-lg">
        {order && (
          <>
            <SheetHeader className="border-b px-6 py-5">
              <div className="flex flex-wrap items-center gap-3 pr-8">
                <SheetTitle className="text-xl font-bold">{order.number}</SheetTitle>
                <StatusBadge status={order.status} fulfillment={order.fulfillment} pulse />
                {order.placedInDemo && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">Placed in demo</span>}
              </div>
              <SheetDescription>Placed {formatDateTime(order.createdAt)} · {order.items.reduce((n, i) => n + i.quantity, 0)} items · {formatCurrency(order.total)}</SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <section aria-labelledby="cust-h" className="grid gap-3 rounded-2xl bg-muted/60 p-4 text-sm sm:grid-cols-2">
                <h3 id="cust-h" className="sr-only">Customer</h3>
                <div className="sm:col-span-2">
                  <p className="font-semibold">{order.customer.name}</p>
                </div>
                <p className="flex items-center gap-2 text-muted-foreground"><Phone className="size-4 shrink-0" aria-hidden="true" />{order.customer.phone}</p>
                <p className="flex min-w-0 items-center gap-2 text-muted-foreground"><Mail className="size-4 shrink-0" aria-hidden="true" /><span className="truncate">{order.customer.email}</span></p>
                <p className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
                  {order.fulfillment === "delivery" ? <Bike className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <Store className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
                  <span><strong className="text-foreground">{order.fulfillment === "delivery" ? "Delivery" : "Pickup"}</strong>{order.address && <> · <MapPin className="inline size-3.5" aria-hidden="true" /> {order.address}</>}</span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground"><Banknote className="size-4 shrink-0" aria-hidden="true" />Cash on Delivery</p>
                {order.instructions && <p className="flex items-start gap-2 text-muted-foreground sm:col-span-2"><MessageSquare className="mt-0.5 size-4 shrink-0" aria-hidden="true" />“{order.instructions}”</p>}
              </section>

              <section aria-labelledby="items-h">
                <h3 id="items-h" className="mb-3 text-sm font-semibold">Items</h3>
                <OrderItems order={order} compact />
                <div className="mt-4 border-t pt-4"><OrderTotals order={order} /></div>
                {mode === "admin" && (
                  <p className="mt-3 rounded-xl bg-accent px-3 py-2 text-xs">
                    Platform commission ({commissionRate}%): <strong>{formatCurrency(round2((order.total * commissionRate) / 100))}</strong>
                    {(order.status === "cancelled" || order.status === "rejected") && " — not charged on cancelled/rejected orders"}
                  </p>
                )}
              </section>

              <section aria-labelledby="tl-h">
                <h3 id="tl-h" className="mb-4 text-sm font-semibold">Status timeline</h3>
                <OrderTimeline order={order} />
              </section>
            </div>

            {mode === "manager" ? (
              (next || order.status === "pending" || canCancel) && (
                <SheetFooter className="gap-2 border-t bg-muted/40 px-6 py-4">
                  {next && (
                    <Button className="h-11 w-full text-sm font-semibold" onClick={() => advance(order)}>
                      {next.label}
                    </Button>
                  )}
                  <div className="grid grid-cols-1 gap-2">
                    {order.status === "pending" && (
                      <Button variant="outline" className="h-11 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={() => setRejectOpen(true)}>
                        <XCircle /> Reject order
                      </Button>
                    )}
                    {canCancel && (
                      <ConfirmDialog
                        trigger={<Button variant="ghost" className="h-10 text-muted-foreground"><Ban /> Cancel order</Button>}
                        title={`Cancel ${order.number}?`}
                        description="The customer will see this order as cancelled. Use this only if the order can't be fulfilled."
                        confirmLabel="Cancel order"
                        destructive
                        onConfirm={() => {
                          updateOrderStatus(order.id, "cancelled", "Cancelled by restaurant");
                          toast.success(`${order.number} cancelled`);
                        }}
                      />
                    )}
                  </div>
                </SheetFooter>
              )
            ) : (
              <SheetFooter className="border-t bg-muted/40 px-6 py-4">
                <p className="text-xs text-muted-foreground">Read-only view. Order status is managed by the restaurant in the Manager dashboard.</p>
              </SheetFooter>
            )}

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject {order.number}?</DialogTitle>
                  <DialogDescription>The customer will be notified with the reason you choose.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                  <Label htmlFor="reject-reason">Reason</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger id="reject-reason" className="h-10 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent position="popper">
                      {REJECT_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRejectOpen(false)}>Keep order</Button>
                  <Button
                    className="bg-destructive text-white hover:bg-destructive/90"
                    onClick={() => {
                      updateOrderStatus(order.id, "rejected", reason);
                      setRejectOpen(false);
                      toast.success(`${order.number} rejected`, { description: reason });
                    }}
                  >
                    Reject order
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

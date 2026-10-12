"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Banknote, FileQuestion, MapPin, Phone, RadioTower, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/role-guard";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { OrderTimeline } from "@/components/shared/order-timeline";
import { OrderItems, OrderTotals } from "@/components/shared/order-items";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCustomerOrder } from "@/hooks/use-customer-order";
import { useReorder } from "@/hooks/use-reorder";
import { useDataStore } from "@/store/data-store";
import { PROGRESS_STEPS, STATUS_META, statusLabel } from "@/lib/order-status";
import { formatDateTime, formatTime } from "@/lib/format";

function Tracking() {
  const { id } = useParams<{ id: string }>();
  const order = useCustomerOrder(id);
  const restaurant = useDataStore((s) => s.restaurant);
  const updateOrderStatus = useDataStore((s) => s.updateOrderStatus);
  const reorder = useReorder();
  const lastStatus = useRef(order?.status);

  // Announce kitchen updates that arrive from the manager dashboard (other tab)
  useEffect(() => {
    if (!order) return;
    if (lastStatus.current && lastStatus.current !== order.status) {
      toast.info(`Order ${order.number}: ${statusLabel(order.status, order.fulfillment)}`, {
        description: STATUS_META[order.status].description,
      });
    }
    lastStatus.current = order.status;
  }, [order]);

  if (!order) {
    return <EmptyState icon={FileQuestion} title="Order not found" description="This order doesn't exist or belongs to a different account." action={<Button asChild className="h-11 rounded-full px-6"><Link href="/account/orders">My orders</Link></Button>} className="min-h-[60vh]" />;
  }

  const failed = order.status === "cancelled" || order.status === "rejected";
  const stepIndex = PROGRESS_STEPS.indexOf(order.status);
  const progress = failed ? 100 : ((stepIndex + (order.status === "completed" ? 0 : 0.5)) / (PROGRESS_STEPS.length - 1)) * 100;
  const eta = new Date(new Date(order.createdAt).getTime() + order.estimatedMinutes * 60_000);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> All orders
      </Link>

      <div className="mt-4 overflow-hidden rounded-[2rem] bg-charcoal-950 text-white">
        <div className="relative p-6 sm:p-8">
          <div className="bg-dots absolute inset-0" aria-hidden="true" />
          <div className="absolute -top-20 -right-20 size-72 rounded-full bg-tomato-500/25 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/60">Order {order.number} · {formatDateTime(order.createdAt)}</p>
              <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl" aria-live="polite">{statusLabel(order.status, order.fulfillment)}</h1>
              <p className="mt-2 text-white/70">{STATUS_META[order.status].description}</p>
            </div>
            {!failed && order.status !== "completed" && (
              <div className="glass-dark rounded-2xl px-5 py-3 ring-1 ring-white/10">
                <p className="text-xs text-white/60">Estimated {order.fulfillment === "delivery" ? "arrival" : "ready"}</p>
                <p className="text-3xl font-bold tabular">{formatTime(eta)}</p>
              </div>
            )}
          </div>
          <div className="relative mt-8 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Order progress" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <motion.div className={failed ? "h-full rounded-full bg-red-500" : "h-full rounded-full bg-linear-to-r from-ember-400 to-tomato-500"} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ type: "spring", stiffness: 60, damping: 18 }} />
          </div>
          <p className="relative mt-3 flex items-center gap-2 text-xs text-white/60">
            <RadioTower className="size-3.5 text-basil-100" aria-hidden="true" /> Live demo sync — status changes made in the Restaurant Manager dashboard appear here automatically.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border sm:p-8" aria-labelledby="timeline-heading">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 id="timeline-heading" className="text-lg font-semibold">Order timeline</h2>
            <StatusBadge status={order.status} fulfillment={order.fulfillment} pulse />
          </div>
          <OrderTimeline order={order} />
        </section>

        <div className="min-w-0 space-y-6">
          <section className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border" aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="mb-4 font-semibold">Summary</h2>
            <OrderItems order={order} compact />
            <div className="mt-4 border-t pt-4"><OrderTotals order={order} /></div>
          </section>
          <section className="space-y-3 rounded-3xl bg-card p-6 text-sm shadow-sm ring-1 ring-border" aria-label="Delivery details">
            <p className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />{order.fulfillment === "delivery" ? order.address : `Pickup at ${restaurant.address}`}</p>
            <p className="flex gap-2"><Banknote className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />Cash on Delivery</p>
            <p className="flex gap-2"><Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />Questions? Call {restaurant.phone}</p>
          </section>
          <div className="grid gap-2">
            {order.status === "pending" && (
              <ConfirmDialog
                trigger={<Button variant="outline" className="h-12 rounded-full border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"><XCircle /> Cancel order</Button>}
                title={`Cancel order ${order.number}?`}
                description="You can cancel while the restaurant hasn't accepted your order yet. This can't be undone."
                confirmLabel="Cancel order"
                destructive
                onConfirm={() => {
                  updateOrderStatus(order.id, "cancelled", "Cancelled by customer");
                  toast.success("Order cancelled");
                }}
              />
            )}
            {(order.status === "completed" || failed) && (
              <Button className="h-12 rounded-full" onClick={() => reorder(order)}><RotateCcw /> Order again</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <RoleGuard role="customer">
      <Tracking />
    </RoleGuard>
  );
}

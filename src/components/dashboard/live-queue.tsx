"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bike, Store } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { OrderDetailsSheet, useOrderActions } from "@/components/dashboard/order-details-sheet";
import { STATUS_META, nextStatus } from "@/lib/order-status";
import { formatCurrency, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const COLUMNS: { status: OrderStatus; title: string }[] = [
  { status: "pending", title: "New" },
  { status: "accepted", title: "Accepted" },
  { status: "preparing", title: "In the oven" },
  { status: "ready", title: "Ready / out" },
];

/** Kanban-style view of today's active orders with one-tap progression. */
export function LiveQueue({ orders }: { orders: Order[] }) {
  const { advance } = useOrderActions();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const list = orders.filter((o) => o.status === col.status).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
          return (
            <section key={col.status} aria-label={`${col.title} orders`} className="rounded-xl bg-muted/60 p-2.5">
              <h3 className="mb-2 flex items-center justify-between px-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <span className="flex items-center gap-1.5"><span className={cn("size-2 rounded-full", STATUS_META[col.status].dot)} aria-hidden="true" />{col.title}</span>
                <span className="tabular rounded-md bg-card px-1.5 py-0.5 text-foreground">{list.length}</span>
              </h3>
              <ul className="space-y-2">
                <AnimatePresence initial={false}>
                  {list.length === 0 && (
                    <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-dashed px-3 py-5 text-center text-xs text-muted-foreground">No orders</motion.li>
                  )}
                  {list.map((o) => {
                    const next = nextStatus(o.status, o.fulfillment);
                    return (
                      <motion.li
                        key={o.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn("rounded-lg bg-card p-3 shadow-xs ring-1 ring-border", o.status === "pending" && "ring-2 ring-amber-400")}
                      >
                        <button className="block w-full text-left" onClick={() => setSelected(o.id)}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">{o.number}</span>
                            <span className="tabular text-sm font-semibold">{formatCurrency(o.total)}</span>
                          </div>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            {o.fulfillment === "delivery" ? <Bike className="size-3.5" aria-label="Delivery" /> : <Store className="size-3.5" aria-label="Pickup" />}
                            {o.customer.name} · {timeAgo(o.createdAt)}
                          </p>
                          <p className="mt-1.5 line-clamp-2 text-xs">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</p>
                        </button>
                        {next && (
                          <Button size="sm" variant={o.status === "pending" ? "default" : "outline"} className="mt-2.5 h-8 w-full" onClick={() => advance(o)}>
                            {next.label}
                          </Button>
                        )}
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </section>
          );
        })}
      </div>
      <OrderDetailsSheet orderId={selected} onClose={() => setSelected(null)} mode="manager" />
    </>
  );
}

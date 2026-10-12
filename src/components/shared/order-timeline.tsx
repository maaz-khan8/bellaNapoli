"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { Order } from "@/lib/types";
import { PROGRESS_STEPS, STATUS_META, statusLabel } from "@/lib/order-status";
import { StatusGlyph } from "@/components/shared/status-badge";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Vertical status timeline. Terminal failures (rejected/cancelled) render as their own final step. */
export function OrderTimeline({ order, className }: { order: Order; className?: string }) {
  const failed = order.status === "rejected" || order.status === "cancelled";
  const reached = new Map(order.history.map((h) => [h.status, h]));
  const currentIndex = PROGRESS_STEPS.indexOf(order.status);

  const steps = failed
    ? [...PROGRESS_STEPS.filter((s) => reached.has(s)), order.status]
    : PROGRESS_STEPS;

  return (
    <ol className={cn("relative space-y-0", className)} aria-label="Order progress">
      {steps.map((status, i) => {
        const event = reached.get(status);
        const isFailedStep = failed && status === order.status;
        const done = !!event && (failed || PROGRESS_STEPS.indexOf(status) < currentIndex || order.status === "completed");
        const current = status === order.status && !failed && order.status !== "completed";
        const last = i === steps.length - 1;

        return (
          <li key={status} className="relative flex gap-4 pb-7 last:pb-0" aria-current={current ? "step" : undefined}>
            {!last && (
              <div className="absolute top-11 left-[21px] h-[calc(100%-2.75rem)] w-0.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
                <motion.div
                  className="w-full bg-primary"
                  initial={{ height: 0 }}
                  animate={{ height: done && !isFailedStep ? "100%" : 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            )}
            <div className="relative shrink-0">
              {current && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-primary/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  aria-hidden="true"
                />
              )}
              <motion.div
                layout
                className={cn(
                  "relative flex size-11 items-center justify-center rounded-full border-2 transition-colors",
                  isFailedStep && "border-red-500 bg-red-500 text-white",
                  !isFailedStep && (done || current) && "border-primary bg-primary text-primary-foreground",
                  !isFailedStep && !done && !current && "border-border bg-card text-muted-foreground",
                )}
              >
                {done && !isFailedStep && !current ? <Check className="size-5" /> : <StatusGlyph status={status} fulfillment={order.fulfillment} className="size-5" />}
              </motion.div>
            </div>
            <div className="min-w-0 pt-1.5">
              <p className={cn("font-semibold", !event && "text-muted-foreground")}>
                {statusLabel(status, order.fulfillment)}
                {current && <span className="sr-only"> (current status)</span>}
              </p>
              <p className="text-sm text-muted-foreground">
                {event ? (
                  <>
                    {formatTime(event.at)}
                    {event.note ? ` · ${event.note}` : ` · ${STATUS_META[status].description}`}
                  </>
                ) : (
                  STATUS_META[status].description
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

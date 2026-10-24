"use client";

import { useTranslations } from "next-intl";
import { Ban, Bike, CheckCheck, ChefHat, CircleCheck, Clock, PackageCheck, XCircle } from "lucide-react";
import type { FulfillmentType, OrderStatus } from "@/lib/types";
import { STATUS_META } from "@/lib/order-status";
import { cn } from "@/lib/utils";

/** Status icon as a static component (one icon per status; "ready" depends on fulfillment). */
export function StatusGlyph({ status, fulfillment, className }: { status: OrderStatus; fulfillment?: FulfillmentType; className?: string }) {
  const props = { className, "aria-hidden": true as const };
  switch (status) {
    case "pending":
      return <Clock {...props} />;
    case "accepted":
      return <CircleCheck {...props} />;
    case "preparing":
      return <ChefHat {...props} />;
    case "ready":
      return fulfillment === "pickup" ? <PackageCheck {...props} /> : <Bike {...props} />;
    case "completed":
      return <CheckCheck {...props} />;
    case "rejected":
      return <XCircle {...props} />;
    case "cancelled":
      return <Ban {...props} />;
  }
}

const NOTE_KEYS: Record<string, "cancelledByCustomer" | "cancelledByRestaurant" | "kitchenFull" | "itemUnavailable" | "outsideArea" | "closingSoon"> = {
  "Cancelled by customer": "cancelledByCustomer",
  "Cancelled by restaurant": "cancelledByRestaurant",
  "Kitchen at full capacity": "kitchenFull",
  "Item unavailable": "itemUnavailable",
  "Address outside delivery area": "outsideArea",
  "Address outside delivery zone": "outsideArea",
  "Restaurant closing soon": "closingSoon",
};

/** Translated status label and description ("ready" depends on delivery vs pickup). */
export function useStatusText() {
  const t = useTranslations("status");
  return {
    label: (status: OrderStatus, fulfillment?: FulfillmentType) =>
      status === "ready" ? t(fulfillment === "pickup" ? "ready.pickup" : "ready.delivery") : t(`${status}.label` as "pending.label"),
    description: (status: OrderStatus) => t(`${status}.description` as "pending.description"),
    /** Known status notes (cancel/reject reasons) are stored in English — translate them when possible. */
    note: (note: string) => {
      const key = NOTE_KEYS[note];
      return key ? t(`notes.${key}`) : note;
    },
  };
}

export function StatusBadge({
  status,
  fulfillment,
  className,
  pulse = false,
}: {
  status: OrderStatus;
  fulfillment?: FulfillmentType;
  className?: string;
  pulse?: boolean;
}) {
  const meta = STATUS_META[status];
  const text = useStatusText();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ring-1 ring-inset",
        meta.badge,
        className,
      )}
    >
      {pulse && status === "pending" ? (
        <span className="relative flex size-2" aria-hidden="true">
          <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-75", meta.dot)} />
          <span className={cn("relative inline-flex size-2 rounded-full", meta.dot)} />
        </span>
      ) : (
        <StatusGlyph status={status} fulfillment={fulfillment} className="size-3.5" />
      )}
      {text.label(status, fulfillment)}
    </span>
  );
}

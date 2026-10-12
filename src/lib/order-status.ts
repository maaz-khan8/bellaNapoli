import type { FulfillmentType, OrderStatus } from "@/lib/types";

interface StatusMeta {
  label: string;
  description: string;
  /** Badge classes — always paired with an icon + text label, never colour alone */
  badge: string;
  dot: string;
}

export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  pending: {
    label: "Pending",
    description: "Waiting for the restaurant to confirm",
    badge: "bg-amber-50 text-amber-800 ring-amber-600/25",
    dot: "bg-amber-500",
  },
  accepted: {
    label: "Accepted",
    description: "The kitchen has confirmed your order",
    badge: "bg-sky-50 text-sky-800 ring-sky-600/25",
    dot: "bg-sky-500",
  },
  preparing: {
    label: "Preparing",
    description: "Your pizza is in the wood-fired oven",
    badge: "bg-orange-50 text-orange-800 ring-orange-600/25",
    dot: "bg-orange-500",
  },
  ready: {
    label: "Ready",
    description: "Packed and ready to go",
    badge: "bg-violet-50 text-violet-800 ring-violet-600/25",
    dot: "bg-violet-500",
  },
  completed: {
    label: "Completed",
    description: "Enjoy your meal — buon appetito!",
    badge: "bg-emerald-50 text-emerald-800 ring-emerald-600/25",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    description: "The restaurant couldn't accept this order",
    badge: "bg-red-50 text-red-800 ring-red-600/25",
    dot: "bg-red-500",
  },
  cancelled: {
    label: "Cancelled",
    description: "This order was cancelled",
    badge: "bg-zinc-100 text-zinc-700 ring-zinc-500/25",
    dot: "bg-zinc-400",
  },
};

/** "Ready" reads differently depending on how the order is fulfilled. */
export function statusLabel(status: OrderStatus, fulfillment?: FulfillmentType) {
  if (status === "ready") {
    return fulfillment === "pickup" ? "Ready for Pickup" : "Out for Delivery";
  }
  return STATUS_META[status].label;
}


export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "completed",
  "rejected",
  "cancelled",
];

/** Happy-path progression shown on the tracking timeline */
export const PROGRESS_STEPS: OrderStatus[] = ["pending", "accepted", "preparing", "ready", "completed"];

export const ACTIVE_STATUSES: OrderStatus[] = ["pending", "accepted", "preparing", "ready"];
export const CLOSED_STATUSES: OrderStatus[] = ["completed", "rejected", "cancelled"];

/** Next status the kitchen can move an order to, with the button label */
export function nextStatus(
  status: OrderStatus,
  fulfillment: FulfillmentType,
): { status: OrderStatus; label: string } | null {
  switch (status) {
    case "pending":
      return { status: "accepted", label: "Accept order" };
    case "accepted":
      return { status: "preparing", label: "Start preparing" };
    case "preparing":
      return {
        status: "ready",
        label: fulfillment === "pickup" ? "Mark ready for pickup" : "Send out for delivery",
      };
    case "ready":
      return { status: "completed", label: "Mark completed" };
    default:
      return null;
  }
}

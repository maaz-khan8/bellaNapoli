import Image from "next/image";
import type { Order } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function OrderItems({ order, compact = false }: { order: Order; compact?: boolean }) {
  return (
    <ul className="divide-y divide-border">
      {order.items.map((item, i) => (
        <li key={`${item.productId}-${i}`} className="flex gap-3 py-3 first:pt-0 last:pb-0">
          <div className={cn("relative shrink-0 overflow-hidden rounded-lg bg-muted", compact ? "size-11" : "size-14")}>
            <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium">
                <span className="tabular text-muted-foreground">{item.quantity}×</span> {item.name}
              </p>
              <p className="tabular shrink-0 font-semibold">{formatCurrency(item.lineTotal)}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {[item.size, item.crust, ...item.toppings.map((t) => `+ ${t}`), ...item.addons.map((a) => `+ ${a}`)]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {item.notes && <p className="mt-1 text-xs italic text-muted-foreground">“{item.notes}”</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function OrderTotals({ order }: { order: Order }) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="tabular">{formatCurrency(order.subtotal)}</dd>
      </div>
      {order.discount > 0 && (
        <div className="flex justify-between text-basil-600">
          <dt>Discount {order.promoCode && `(${order.promoCode})`}</dt>
          <dd className="tabular">−{formatCurrency(order.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-muted-foreground">{order.fulfillment === "delivery" ? "Delivery fee" : "Pickup"}</dt>
        <dd className="tabular">{order.deliveryFee > 0 ? formatCurrency(order.deliveryFee) : "Free"}</dd>
      </div>
      <div className="flex justify-between border-t pt-2 text-base font-semibold">
        <dt>Total</dt>
        <dd className="tabular">{formatCurrency(order.total)}</dd>
      </div>
    </dl>
  );
}

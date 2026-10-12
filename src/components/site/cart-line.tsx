"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Trash2 } from "lucide-react";
import type { CartItem } from "@/lib/types";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCartStore } from "@/store/cart-store";
import { useDataStore } from "@/store/data-store";
import { formatCurrency } from "@/lib/format";
import { lineTotal } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function CartLine({ item, size = "md" }: { item: CartItem; size?: "sm" | "md" }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const product = useDataStore((s) => s.products.find((p) => p.id === item.productId));
  const details = [
    item.size?.name,
    item.crust?.name,
    ...item.toppings.map((t) => `+ ${t.name}`),
    ...item.addons.map((a) => `+ ${a.name}`),
  ].filter(Boolean);
  const unavailable = !product || !product.available;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
      className="flex gap-3 py-4"
    >
      <Link
        href={product ? `/menu/${product.slug}` : "/menu"}
        className={cn("relative shrink-0 overflow-hidden rounded-xl bg-muted", size === "sm" ? "size-18" : "size-24")}
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image src={item.image} alt="" fill sizes="96px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold leading-snug">{item.name}</p>
          <p className="tabular shrink-0 font-semibold">{formatCurrency(lineTotal(item))}</p>
        </div>
        {details.length > 0 && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{details.join(" · ")}</p>}
        {item.notes && <p className="mt-0.5 text-xs italic text-muted-foreground">“{item.notes}”</p>}
        {unavailable && <p className="mt-1 text-xs font-medium text-destructive">This item is currently unavailable — please remove it to check out.</p>}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            min={0}
            onChange={(q) => updateQuantity(item.id, q)}
            label={`Quantity for ${item.name}`}
          />
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="size-4" /> <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>
    </motion.li>
  );
}

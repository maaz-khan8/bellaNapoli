"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useContent } from "@/hooks/use-content";
import type { Order, SelectedOption } from "@/lib/types";
import { configuredUnitPrice } from "@/lib/pricing";
import { useCartStore } from "@/store/cart-store";
import { useDataStore } from "@/store/data-store";
import { useUIStore } from "@/store/ui-store";

/** Rebuild cart lines from a past order using today's menu and prices. */
export function useReorder() {
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const pulseCart = useUIStore((s) => s.pulseCart);
  const t = useTranslations("cart");
  const content = useContent();

  return useCallback(
    (order: Order) => {
      const { products, crusts, toppings, addons } = useDataStore.getState();
      let added = 0;
      const skipped: string[] = [];
      for (const line of order.items) {
        const product = products.find((p) => p.id === line.productId);
        if (!product || !product.available) {
          skipped.push(content.orderItemName(line));
          continue;
        }
        const sizeDef = line.size ? product.sizes.find((s) => line.size!.startsWith(s.label)) : undefined;
        const crustDef = line.crust ? crusts.find((c) => c.name === line.crust) : undefined;
        const size: SelectedOption | undefined = sizeDef ? { id: sizeDef.id, name: `${sizeDef.label} ${sizeDef.inches}"`, price: sizeDef.price } : undefined;
        const crust: SelectedOption | undefined = crustDef ? { id: crustDef.id, name: crustDef.name, price: crustDef.price } : undefined;
        const tops = toppings.filter((t) => t.available && line.toppings.includes(t.name)).map((t) => ({ id: t.id, name: t.name, price: t.price }));
        const adds = addons.filter((a) => a.available && line.addons.includes(a.name)).map((a) => ({ id: a.id, name: a.name, price: a.price }));
        addItem({
          productId: product.id,
          name: product.name,
          image: product.image,
          kind: product.kind,
          size,
          crust,
          toppings: tops,
          addons: adds,
          notes: line.notes,
          unitPrice: configuredUnitPrice(product, { size, crust, toppings: tops, addons: adds }),
          quantity: line.quantity,
        });
        added += 1;
      }
      if (added) {
        pulseCart();
        setCartOpen(true);
        toast.success(t("reordered", { count: added, number: order.number }), {
          description: skipped.length ? t("unavailableToday", { items: skipped.join(", ") }) : t("todaysPrices"),
        });
      } else {
        toast.error(t("nothingAvailable"));
      }
    },
    [addItem, setCartOpen, pulseCart, t, content],
  );
}

"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import type { CartItem, Product } from "@/lib/types";
import { configuredUnitPrice } from "@/lib/pricing";
import { useCartStore } from "@/store/cart-store";
import { useDataStore } from "@/store/data-store";
import { useUIStore } from "@/store/ui-store";

/** Shared add-to-cart behaviour: cart update, icon pulse and confirmation toast. */
export function useAddToCart() {
  const addItem = useCartStore((s) => s.addItem);
  const pulseCart = useUIStore((s) => s.pulseCart);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const crusts = useDataStore((s) => s.crusts);

  const add = useCallback(
    (item: Omit<CartItem, "id">) => {
      addItem(item);
      pulseCart();
      toast.success(`${item.quantity}× ${item.name} added`, {
        description: [item.size?.name, item.crust?.name].filter(Boolean).join(" · ") || "Added to your order",
        action: { label: "View cart", onClick: () => setCartOpen(true) },
      });
    },
    [addItem, pulseCart, setCartOpen],
  );

  /** One-tap add with sensible defaults (Medium, classic crust for pizzas). */
  const quickAdd = useCallback(
    (product: Product) => {
      const sizeDef = product.sizes.find((s) => s.id === "size_m") ?? product.sizes[0];
      const crustDef = crusts[0];
      const size = product.kind === "pizza" && sizeDef ? { id: sizeDef.id, name: `${sizeDef.label} ${sizeDef.inches}"`, price: sizeDef.price } : undefined;
      const crust = product.kind === "pizza" && crustDef ? { id: crustDef.id, name: crustDef.name, price: crustDef.price } : undefined;
      add({
        productId: product.id,
        name: product.name,
        image: product.image,
        kind: product.kind,
        size,
        crust,
        toppings: [],
        addons: [],
        unitPrice: configuredUnitPrice(product, { size, crust }),
        quantity: 1,
      });
    },
    [add, crusts],
  );

  return { add, quickAdd };
}

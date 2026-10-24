"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useContent } from "@/hooks/use-content";
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
  const t = useTranslations("cart");
  const content = useContent();

  const add = useCallback(
    (item: Omit<CartItem, "id">) => {
      addItem(item);
      pulseCart();
      const details = [item.size && content.sizeText(item.size.name), item.crust && content.crustName(item.crust)].filter(Boolean).join(" · ");
      toast.success(t("added", { count: item.quantity, name: content.productName({ id: item.productId, name: item.name }) }), {
        description: details || t("addedToOrder"),
        action: { label: t("viewCart"), onClick: () => setCartOpen(true) },
      });
    },
    [addItem, pulseCart, setCartOpen, t, content],
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

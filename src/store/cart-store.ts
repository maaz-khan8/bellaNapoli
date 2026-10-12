import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartItem, FulfillmentType } from "@/lib/types";
import { uid } from "@/lib/format";

export const CART_STORAGE_KEY = "bella-napoli:cart";

interface CartState {
  items: CartItem[];
  promoCode?: string;
  fulfillment: FulfillmentType;
  addItem: (item: Omit<CartItem, "id">) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  setPromoCode: (code?: string) => void;
  setFulfillment: (f: FulfillmentType) => void;
  replaceItems: (items: Omit<CartItem, "id">[]) => void;
  clear: () => void;
}

/** Two cart lines merge only when every customisation matches. */
function configKey(i: Omit<CartItem, "id" | "quantity">) {
  return JSON.stringify([
    i.productId,
    i.size?.id,
    i.crust?.id,
    i.toppings.map((t) => t.id).sort(),
    i.addons.map((a) => a.id).sort(),
    i.notes?.trim() ?? "",
  ]);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      promoCode: undefined,
      fulfillment: "delivery",

      addItem: (item) =>
        set((s) => {
          const key = configKey(item);
          const existing = s.items.find((i) => configKey(i) === key);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.id === existing.id ? { ...i, quantity: Math.min(20, i.quantity + item.quantity) } : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, id: uid("line") }] };
        }),
      updateQuantity: (id, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.id !== id)
              : s.items.map((i) => (i.id === id ? { ...i, quantity: Math.min(20, quantity) } : i)),
        })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setPromoCode: (promoCode) => set({ promoCode: promoCode?.trim().toUpperCase() || undefined }),
      setFulfillment: (fulfillment) => set({ fulfillment }),
      replaceItems: (items) => set({ items: items.map((i) => ({ ...i, id: uid("line") })) }),
      clear: () => set({ items: [], promoCode: undefined }),
    }),
    {
      name: CART_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

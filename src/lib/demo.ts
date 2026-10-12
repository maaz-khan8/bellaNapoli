import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useDataStore } from "@/store/data-store";

/** Restore every store to its seeded state. Built-in demo sessions stay signed in. */
export function resetDemoData() {
  useDataStore.getState().resetDemo();
  useCartStore.getState().clear();
  useCartStore.getState().setFulfillment("delivery");
  useAuthStore.getState().resetAccounts();
}

import { create } from "zustand";

/** Ephemeral UI state — intentionally not persisted. */
interface UIState {
  hydrated: boolean;
  cartOpen: boolean;
  /** Increments on every add-to-cart, drives the cart icon "bump" animation */
  cartPulse: number;
  setCartOpen: (open: boolean) => void;
  pulseCart: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  hydrated: false,
  cartOpen: false,
  cartPulse: 0,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  pulseCart: () => set((s) => ({ cartPulse: s.cartPulse + 1 })),
}));

export const useHydrated = () => useUIStore((s) => s.hydrated);

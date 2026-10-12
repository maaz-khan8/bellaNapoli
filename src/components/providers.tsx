"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AUTH_STORAGE_KEY, useAuthStore } from "@/store/auth-store";
import { CART_STORAGE_KEY, useCartStore } from "@/store/cart-store";
import { DATA_STORAGE_KEY, useDataStore } from "@/store/data-store";
import { useUIStore } from "@/store/ui-store";

/**
 * Hydrates persisted stores after mount (so server and first client render
 * match) and keeps open tabs in sync — e.g. a manager accepting an order in
 * one tab updates the customer's tracking page in another.
 */
function StoreHydrator() {
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      useDataStore.persist.rehydrate(),
      useAuthStore.persist.rehydrate(),
      useCartStore.persist.rehydrate(),
    ]).then(() => {
      if (cancelled) return;
      useDataStore.getState().reanchor(Date.now());
      useUIStore.setState({ hydrated: true });
    });

    const onStorage = (e: StorageEvent) => {
      if (e.key === DATA_STORAGE_KEY) void useDataStore.persist.rehydrate();
      if (e.key === AUTH_STORAGE_KEY) void useAuthStore.persist.rehydrate();
      if (e.key === CART_STORAGE_KEY) void useCartStore.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={200}>
        <StoreHydrator />
        {children}
        <Toaster position="top-center" richColors closeButton />
      </TooltipProvider>
    </MotionConfig>
  );
}

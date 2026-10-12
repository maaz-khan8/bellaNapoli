"use client";

import { useDataStore } from "@/store/data-store";
import { useSession } from "@/hooks/use-session";

/** An order, only if it belongs to the signed-in customer. */
export function useCustomerOrder(id: string) {
  const session = useSession("customer");
  return useDataStore((s) => s.orders.find((o) => o.id === id && o.customerId === session?.customerId));
}

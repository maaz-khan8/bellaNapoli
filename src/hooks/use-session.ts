"use client";

import type { Role } from "@/lib/types";
import { isSessionValid, useAuthStore } from "@/store/auth-store";
import { useDataStore } from "@/store/data-store";

/**
 * Returns the valid session for a role, or undefined.
 * Customer sessions also end as soon as the platform deactivates the account.
 */
export function useSession(role: Role) {
  const session = useAuthStore((s) => s.sessions[role]);
  const deactivated = useDataStore((s) =>
    role === "customer" && session?.customerId
      ? s.customers.find((c) => c.id === session.customerId)?.status === "inactive"
      : false,
  );
  return isSessionValid(session) && !deactivated ? session : undefined;
}

/** The signed-in customer's live record (reflects admin/manager edits). */
export function useCurrentCustomer() {
  const session = useSession("customer");
  return useDataStore((s) =>
    session?.customerId ? s.customers.find((c) => c.id === session.customerId) : undefined,
  );
}

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/dashboard/primitives";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { useDataStore } from "@/store/data-store";

function ManagerOrders() {
  const orders = useDataStore((s) => s.orders);
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const status = params.get("status");
  const pending = orders.filter((o) => o.status === "pending").length;

  return (
    <>
      <PageHeader
        title="Orders"
        description={pending ? `${pending} new order${pending > 1 ? "s" : ""} waiting for you. Status changes sync instantly to the customer.` : "Manage incoming orders. Status changes sync instantly to the customer."}
      />
      <OrdersTable
        key={`${q}|${status}`}
        orders={orders}
        mode="manager"
        initialQuery={q}
        initialRange={q ? "all" : "30d"}
        initialStatus={status === "pending" ? "pending" : "all"}
      />
    </>
  );
}

export default function ManagerOrdersPage() {
  return (
    <Suspense>
      <ManagerOrders />
    </Suspense>
  );
}

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/dashboard/primitives";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { useDataStore } from "@/store/data-store";

function AdminOrders() {
  const orders = useDataStore((s) => s.orders);
  const restaurant = useDataStore((s) => s.restaurant);
  const q = useSearchParams().get("q") ?? "";
  return (
    <>
      <PageHeader title="Orders" description={`All orders placed with ${restaurant.name}. Statuses update live as the restaurant processes them.`} />
      <OrdersTable key={q} orders={orders} mode="admin" initialQuery={q} initialRange={q ? "all" : "30d"} />
    </>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <AdminOrders />
    </Suspense>
  );
}

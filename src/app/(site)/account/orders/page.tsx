"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderCard } from "@/components/site/order-card";
import { useCurrentCustomer } from "@/hooks/use-session";
import { useDataStore } from "@/store/data-store";
import { ACTIVE_STATUSES } from "@/lib/order-status";

type Filter = "all" | "active" | "past";

export default function CustomerOrdersPage() {
  const customer = useCurrentCustomer();
  const allOrders = useDataStore((s) => s.orders);
  const [filter, setFilter] = useState<Filter>("all");

  const orders = useMemo(
    () => allOrders.filter((o) => o.customerId === customer?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [allOrders, customer?.id],
  );
  const visible = orders.filter((o) =>
    filter === "all" ? true : filter === "active" ? ACTIVE_STATUSES.includes(o.status) : !ACTIVE_STATUSES.includes(o.status),
  );
  const activeCount = orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Order history</h2>
          <p className="text-sm text-muted-foreground">Track active orders and reorder past favourites.</p>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="h-10">
            <TabsTrigger value="all" className="px-4">All ({orders.length})</TabsTrigger>
            <TabsTrigger value="active" className="px-4">Active ({activeCount})</TabsTrigger>
            <TabsTrigger value="past" className="px-4">Past</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {visible.length === 0 ? (
        <EmptyState
          icon={Package}
          title={filter === "active" ? "No active orders" : "No orders yet"}
          description="When you place an order it'll show up here with live tracking."
          action={<Button asChild className="h-11 rounded-full px-6"><Link href="/menu">Order now</Link></Button>}
          className="rounded-3xl bg-card ring-1 ring-border"
        />
      ) : (
        <div className="grid gap-4">{visible.map((o) => <OrderCard key={o.id} order={o} />)}</div>
      )}
    </div>
  );
}

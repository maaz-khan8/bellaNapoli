"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
  const t = useTranslations("account.history");

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
          <h2 className="text-2xl font-semibold">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="h-10">
            <TabsTrigger value="all" className="px-4">{t("all", { count: orders.length })}</TabsTrigger>
            <TabsTrigger value="active" className="px-4">{t("active", { count: activeCount })}</TabsTrigger>
            <TabsTrigger value="past" className="px-4">{t("past")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {visible.length === 0 ? (
        <EmptyState
          icon={Package}
          title={filter === "active" ? t("noActive") : t("none")}
          description={t("noneBody")}
          action={<Button asChild className="h-11 rounded-full px-6"><Link href="/menu">{t("orderNow")}</Link></Button>}
          className="rounded-3xl bg-card ring-1 ring-border"
        />
      ) : (
        <div className="grid gap-4">{visible.map((o) => <OrderCard key={o.id} order={o} />)}</div>
      )}
    </div>
  );
}

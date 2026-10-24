"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useContent } from "@/hooks/use-content";
import { useFormat } from "@/hooks/use-format";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useReorder } from "@/hooks/use-reorder";
import { ACTIVE_STATUSES } from "@/lib/order-status";

export function OrderCard({ order }: { order: Order }) {
  const reorder = useReorder();
  const t = useTranslations("orders");
  const content = useContent();
  const f = useFormat();
  const active = ACTIVE_STATUSES.includes(order.status);
  const count = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <article className="min-w-0 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border transition hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{t("order", { number: order.number })}</h3>
          <p className="text-sm text-muted-foreground">{f.dateTime(order.createdAt)} · {order.fulfillment === "delivery" ? t("delivery") : t("pickup")}</p>
        </div>
        <StatusBadge status={order.status} fulfillment={order.fulfillment} pulse />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex -space-x-3">
          {order.items.slice(0, 4).map((i, idx) => (
            <div key={idx} className="relative size-12 overflow-hidden rounded-full bg-muted ring-2 ring-card">
              <Image src={i.image} alt="" fill sizes="48px" className="object-cover" />
            </div>
          ))}
        </div>
        <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          {order.items.map((i) => `${i.quantity}× ${content.orderItemName(i)}`).join(", ")}
        </p>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-sm">
          <span className="text-muted-foreground">{t("items", { count })} · </span>
          <span className="tabular font-bold">{f.currency(order.total)}</span>
        </p>
        <div className="flex gap-2">
          {!active && (
            <Button variant="outline" className="h-10 rounded-full" onClick={() => reorder(order)}>
              <RotateCcw /> {t("reorder")}
            </Button>
          )}
          <Button asChild className="h-10 rounded-full">
            <Link href={`/orders/${order.id}`}>{active ? t("track") : t("details")} <ArrowRight /></Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

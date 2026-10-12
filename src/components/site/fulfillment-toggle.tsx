"use client";

import { motion } from "motion/react";
import { Bike, Store } from "lucide-react";
import type { FulfillmentType } from "@/lib/types";
import { useDataStore } from "@/store/data-store";
import { cn } from "@/lib/utils";

export function FulfillmentToggle({
  value,
  onChange,
  name = "fulfillment",
}: {
  value: FulfillmentType;
  onChange: (v: FulfillmentType) => void;
  name?: string;
}) {
  const restaurant = useDataStore((s) => s.restaurant);
  const options = [
    { value: "delivery" as const, label: "Delivery", sub: `~${restaurant.delivery.estimatedMinutes} min`, icon: Bike, enabled: restaurant.delivery.enabled },
    { value: "pickup" as const, label: "Pickup", sub: `~${restaurant.pickup.estimatedMinutes} min`, icon: Store, enabled: restaurant.pickup.enabled },
  ];
  return (
    <div role="radiogroup" aria-label="Delivery or pickup" className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1 ring-1 ring-border">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <label
            key={o.value}
            className={cn(
              "relative flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/40",
              active ? "text-primary-foreground" : "text-charcoal-600 hover:text-foreground",
              !o.enabled && "cursor-not-allowed opacity-50",
            )}
          >
            <input type="radio" name={name} value={o.value} checked={active} disabled={!o.enabled} onChange={() => onChange(o.value)} className="sr-only" />
            {active && <motion.span layoutId={`${name}-pill`} className="absolute inset-0 rounded-xl bg-primary shadow-md" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <o.icon className="relative size-4" aria-hidden="true" />
            <span className="relative">
              {o.label}
              <span className={cn("ml-1 text-xs font-medium", active ? "text-white/80" : "text-muted-foreground")}>
                {o.enabled ? o.sub : "Unavailable"}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

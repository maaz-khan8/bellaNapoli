"use client";

import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  size = "md",
  label,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  const t = useTranslations("common");
  const btn = size === "sm" ? "size-8" : "size-11";
  return (
    <div
      role="group"
      aria-label={label ?? t("quantity")}
      className={cn("inline-flex items-center rounded-full bg-muted p-1 ring-1 ring-border", className)}
    >
      <button
        type="button"
        className={cn(btn, "flex items-center justify-center rounded-full bg-background text-foreground shadow-sm transition hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:hover:bg-background disabled:hover:text-foreground")}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={value - 1 < 1 ? t("removeItem") : t("decrease")}
      >
        <Minus className="size-4" />
      </button>
      <output aria-live="polite" className={cn("tabular text-center font-semibold", size === "sm" ? "w-8 text-sm" : "w-10")}>
        {value}
      </output>
      <button
        type="button"
        className={cn(btn, "flex items-center justify-center rounded-full bg-background text-foreground shadow-sm transition hover:bg-primary hover:text-primary-foreground disabled:opacity-40")}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={t("increase")}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

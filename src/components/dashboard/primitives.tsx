"use client";

import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon, Minus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RANGE_OPTIONS, type RangeKey } from "@/lib/metrics";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, description, actions, children, className, bodyClassName }: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("min-w-0 rounded-2xl bg-card shadow-xs ring-1 ring-border", className)} aria-label={title}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
          <div>
            {title && <h2 className="font-semibold">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaLabel = "vs previous period",
  hint,
  tone = "primary",
  index = 0,
  invertDelta = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: number | null;
  deltaLabel?: string;
  hint?: string;
  tone?: "primary" | "green" | "amber" | "red" | "blue" | "slate";
  index?: number;
  /** For metrics where going down is good (e.g. cancellations) */
  invertDelta?: boolean;
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-sky-50 text-sky-700",
    slate: "bg-slate-100 text-slate-700",
  };
  const good = delta == null ? null : invertDelta ? delta <= 0 : delta >= 0;
  const DeltaIcon = delta == null || Math.abs(delta) < 0.05 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="min-w-0 rounded-2xl bg-card p-5 shadow-xs ring-1 ring-border"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("flex size-9 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight sm:text-[1.7rem]">{value}</p>
      {delta !== undefined && (
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          {delta === null ? (
            <span>New this period</span>
          ) : (
            <>
              <span className={cn("inline-flex items-center gap-0.5 font-semibold", good ? "text-emerald-700" : "text-red-700")}>
                <DeltaIcon className="size-3.5" aria-hidden="true" />
                {Math.abs(delta).toFixed(1)}%
              </span>
              <span>{deltaLabel}</span>
            </>
          )}
        </p>
      )}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </motion.div>
  );
}

export function RangeSelect({ value, onChange, options = RANGE_OPTIONS }: { value: RangeKey; onChange: (v: RangeKey) => void; options?: typeof RANGE_OPTIONS }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as RangeKey)}>
      <SelectTrigger className="h-10 min-w-40 rounded-xl bg-card" aria-label="Date range">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl bg-muted p-1 ring-1 ring-border">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("relative h-8 rounded-lg px-3 text-xs font-semibold transition-colors", value === o.value ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          {value === o.value && <motion.span layoutId={`seg-${label}`} className="absolute inset-0 rounded-lg bg-card shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

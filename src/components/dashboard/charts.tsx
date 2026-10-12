"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactCurrency, formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Categorical slots in fixed order (validated CVD-safe reference palette). */
export const SERIES = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"];
const GRID = "#e6e3dd";
const AXIS = "#898781";

type Formatter = (v: number) => string;
export const money: Formatter = (v) => formatCurrency(v);
export const count: Formatter = (v) => formatNumber(v);

interface SeriesDef {
  key: string;
  label: string;
  color: string;
}

function ChartTooltip({ active, payload, label, series, format }: {
  active?: boolean;
  payload?: { dataKey?: string | number; value?: number }[];
  label?: string;
  series: SeriesDef[];
  format: Formatter;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-36 rounded-xl bg-popover px-3 py-2.5 text-xs shadow-lg ring-1 ring-foreground/10">
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      {payload.map((p) => {
        const s = series.find((x) => x.key === p.dataKey);
        return (
          <p key={String(p.dataKey)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full" style={{ background: s?.color }} aria-hidden="true" />
              {s?.label}
            </span>
            <span className="tabular font-semibold text-foreground">{format(Number(p.value ?? 0))}</span>
          </p>
        );
      })}
    </div>
  );
}

/** Screen-reader alternative for every chart */
function DataTable({ data, xKey, series, format, caption }: { data: Record<string, unknown>[]; xKey: string; series: SeriesDef[]; format: Formatter; caption: string }) {
  return (
    <div className="sr-only"><table>
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{xKey}</th>
          {series.map((s) => <th key={s.key} scope="col">{s.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <th scope="row">{String(row[xKey])}</th>
            {series.map((s) => <td key={s.key}>{format(Number(row[s.key] ?? 0))}</td>)}
          </tr>
        ))}
      </tbody>
    </table></div>
  );
}

export function TrendChart({
  data,
  xKey = "label",
  series,
  format = money,
  height = 280,
  caption,
}: {
  data: Record<string, unknown>[];
  xKey?: string;
  series: SeriesDef[];
  format?: Formatter;
  height?: number;
  caption: string;
}) {
  const id = useId().replace(/:/g, "");
  const multi = series.length > 1;
  return (
    <figure>
      <div style={{ height }} aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`${id}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={multi ? 0.12 : 0.22} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="0" />
            <XAxis dataKey={xKey} tickLine={false} axisLine={{ stroke: GRID }} tick={{ fill: AXIS, fontSize: 11 }} minTickGap={24} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: AXIS, fontSize: 11 }} width={56} tickFormatter={(v: number) => (format === money ? formatCompactCurrency(v).replace(".00", "") : formatNumber(v))} />
            <Tooltip cursor={{ stroke: AXIS, strokeWidth: 1, strokeDasharray: "4 4" }} content={(props) => <ChartTooltip {...(props as object)} series={series} format={format} />} />
            {multi && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} formatter={(value) => series.find((s) => s.key === value)?.label ?? value} />}
            {series.map((s) => (
              <Area key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} fill={`url(#${id}-${s.key})`} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} animationDuration={700} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <DataTable data={data} xKey={xKey} series={series} format={format} caption={caption} />
    </figure>
  );
}

export function BarsChart({
  data,
  xKey = "label",
  series,
  format = money,
  height = 280,
  stacked = false,
  caption,
  layout = "horizontal",
}: {
  data: Record<string, unknown>[];
  xKey?: string;
  series: SeriesDef[];
  format?: Formatter;
  height?: number;
  stacked?: boolean;
  caption: string;
  layout?: "horizontal" | "vertical";
}) {
  const multi = series.length > 1;
  const vertical = layout === "vertical";
  const tickFormat = (v: number) => (format === money ? formatCompactCurrency(v).replace(".00", "") : formatNumber(v));
  return (
    <figure>
      <div style={{ height }} aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout={vertical ? "vertical" : "horizontal"} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap={vertical ? "22%" : "28%"}>
            <CartesianGrid vertical={vertical} horizontal={!vertical} stroke={GRID} />
            {vertical ? (
              <>
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: AXIS, fontSize: 11 }} tickFormatter={tickFormat} />
                <YAxis type="category" dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: "#52514e", fontSize: 12 }} width={150} />
              </>
            ) : (
              <>
                <XAxis dataKey={xKey} tickLine={false} axisLine={{ stroke: GRID }} tick={{ fill: AXIS, fontSize: 11 }} minTickGap={12} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: AXIS, fontSize: 11 }} width={56} tickFormatter={tickFormat} />
              </>
            )}
            <Tooltip cursor={{ fill: "rgb(0 0 0 / 0.04)" }} content={(props) => <ChartTooltip {...(props as object)} series={series} format={format} />} />
            {multi && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} formatter={(value) => series.find((s) => s.key === value)?.label ?? value} />}
            {series.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                stackId={stacked ? "stack" : undefined}
                fill={s.color}
                stroke="#fff"
                strokeWidth={stacked ? 1 : 0}
                radius={stacked ? (i === series.length - 1 ? (vertical ? [0, 4, 4, 0] : [4, 4, 0, 0]) : 0) : vertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                maxBarSize={vertical ? 22 : 40}
                animationDuration={700}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DataTable data={data} xKey={xKey} series={series} format={format} caption={caption} />
    </figure>
  );
}

export function DonutChart({
  data,
  format = count,
  caption,
  centerLabel,
  centerValue,
}: {
  data: { name: string; value: number }[];
  format?: Formatter;
  caption: string;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <figure className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative size-44 shrink-0" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="100%" paddingAngle={2} stroke="none" startAngle={90} endAngle={-270} animationDuration={700}>
              {data.map((d, i) => <Cell key={d.name} fill={SERIES[i % SERIES.length]} />)}
            </Pie>
            <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
              <div className="rounded-xl bg-popover px-3 py-2 text-xs shadow-lg ring-1 ring-foreground/10">
                <span className="font-semibold">{payload[0].name}</span>: {format(Number(payload[0].value))}
              </div>
            ) : null} />
          </PieChart>
        </ResponsiveContainer>
        {centerValue && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{centerValue}</span>
            <span className="text-[11px] text-muted-foreground">{centerLabel}</span>
          </div>
        )}
      </div>
      <figcaption className="w-full flex-1">
        <span className="sr-only">{caption}</span>
        <ul className="space-y-2.5">
          {data.map((d, i) => (
            <li key={d.name} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: SERIES[i % SERIES.length] }} aria-hidden="true" />
                {d.name}
              </span>
              <span className="tabular font-semibold">
                {format(d.value)} <span className="font-normal text-muted-foreground">· {total ? Math.round((d.value / total) * 100) : 0}%</span>
              </span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

/** Ranked list with inline bars — readable at any width, no chart library needed. */
export function RankedBars({ items, format = count, className }: { items: { label: string; value: number; sub?: string; image?: string }[]; format?: Formatter; className?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ol className={cn("space-y-3.5", className)}>
      {items.map((item, idx) => (
        <li key={item.label} className="flex items-center gap-3">
          <span className="w-5 text-center text-xs font-bold text-muted-foreground">{idx + 1}</span>
          {item.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image.replace("w=900", "w=96")} alt="" className="size-9 shrink-0 rounded-lg object-cover" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate font-medium">{item.label}</span>
              <span className="tabular shrink-0 font-semibold">{format(item.value)}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
            {item.sub && <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

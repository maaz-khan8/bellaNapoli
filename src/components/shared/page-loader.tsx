import { cn } from "@/lib/utils";

export function PageLoader({ label = "Loading", className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn("flex min-h-[50vh] w-full items-center justify-center", className)}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative size-12" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}…</span>
      </div>
    </div>
  );
}

/** Skeleton block with a gentle shimmer */
export function Shimmer({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton-shimmer rounded-lg", className)} />;
}

export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard" className="space-y-6">
      <Shimmer className="h-8 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Shimmer className="h-80 lg:col-span-2" />
        <Shimmer className="h-80" />
      </div>
    </div>
  );
}

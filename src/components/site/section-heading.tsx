import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  tone = "dark",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn(align === "center" && "max-w-2xl")}>
        {eyebrow && (
          <p className={cn("mb-3 inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase", tone === "light" ? "text-ember-300" : "text-primary")}>
            <span className="h-px w-6 bg-current" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h2 className={cn("font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl", tone === "light" ? "text-white" : "text-charcoal-900")}>
          {title}
        </h2>
        {description && (
          <p className={cn("mt-4 max-w-xl text-base leading-relaxed text-pretty", tone === "light" ? "text-white/70" : "text-muted-foreground", align === "center" && "mx-auto")}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

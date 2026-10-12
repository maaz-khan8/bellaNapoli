import { cn } from "@/lib/utils";

/** Our company's platform mark (Crustline) — used only in Super Admin. */
export function PlatformMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={cn("size-9", className)}>
      <defs>
        <linearGradient id="cl-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#cl-g)" />
      <path d="M12 27c2-9 6-14 8-14s6 5 8 14" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M15 22h10" stroke="#fff" strokeOpacity=".6" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function PlatformBrand({ name = "Crustline" }: { name?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <PlatformMark />
      <div className="leading-tight">
        <p className="text-sm font-bold tracking-tight text-white">{name}</p>
        <p className="text-[11px] font-medium tracking-wider text-indigo-300 uppercase">Super Admin</p>
      </div>
    </div>
  );
}

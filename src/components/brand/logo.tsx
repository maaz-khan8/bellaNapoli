"use client";

/* eslint-disable @next/next/no-img-element -- logo may be a user-uploaded data URL */
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useDataStore } from "@/store/data-store";

export function LogoMark({ className }: { className?: string }) {
  const logo = useDataStore((s) => s.restaurant.logo);
  if (logo) {
    return <img src={logo} alt="" className={cn("size-10 rounded-full object-cover", className)} />;
  }
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("size-10", className)}>
      <circle cx="24" cy="24" r="23" fill="#d63a26" />
      <circle cx="24" cy="24" r="18.5" fill="none" stroke="#fff8ef" strokeOpacity=".35" strokeWidth="1.2" strokeDasharray="2 3" />
      <path d="M24 9.5 37 34.5a28 28 0 0 1-26 0Z" fill="#fdcf9c" />
      <path d="M24 12.8 34.6 33.2a25 25 0 0 1-21.2 0Z" fill="#f28c28" />
      <circle cx="21.5" cy="24" r="2.4" fill="#94251a" />
      <circle cx="27" cy="28.5" r="2.4" fill="#94251a" />
      <circle cx="20" cy="30.5" r="1.9" fill="#94251a" />
      <path d="M26 20.5c1.6-.4 2.6.3 2.8 1.6-1.5.5-2.6-.1-2.8-1.6Z" fill="#2f7a4a" />
    </svg>
  );
}

export function Logo({
  className,
  tone = "dark",
  href = "/",
  compact = false,
}: {
  className?: string;
  tone?: "dark" | "light";
  href?: string;
  compact?: boolean;
}) {
  const name = useDataStore((s) => s.restaurant.name);
  const t = useTranslations("brand");
  const [first, ...rest] = name.replace(/\s*pizza$/i, "").split(" ");
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5 rounded-lg", className)}
      aria-label={t("home", { name })}
    >
      <LogoMark className="transition-transform duration-500 group-hover:rotate-[18deg]" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={cn("font-display text-lg font-semibold tracking-tight whitespace-nowrap sm:text-xl", tone === "light" ? "text-white" : "text-charcoal-900")}>
            {first} <span className="italic text-tomato-500">{rest.join(" ")}</span>
          </span>
          <span className={cn("mt-1 text-[10px] font-semibold whitespace-nowrap uppercase tracking-[0.1em] sm:tracking-[0.22em]", tone === "light" ? "text-white/60" : "text-charcoal-400")}>
            {t("tagline")}
          </span>
        </span>
      )}
    </Link>
  );
}

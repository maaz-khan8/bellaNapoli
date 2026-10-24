"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { localizePath } from "@/i18n/routing";
import type { Role } from "@/lib/types";
import { LOGIN_PATHS, isSessionValid, useAuthStore } from "@/store/auth-store";
import { useHydrated } from "@/store/ui-store";
import { useSession } from "@/hooks/use-session";
import { PageLoader } from "@/components/shared/page-loader";

/**
 * UI-level route protection (prototype only — not security).
 * Redirects to the role's own login page, noting which other role (if any)
 * is currently signed in so the login page can explain the denial.
 */
export function RoleGuard({
  role,
  children,
  fallback,
}: {
  role: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const hydrated = useHydrated();
  const session = useSession(role);
  const sessions = useAuthStore((s) => s.sessions);
  const router = useRouter();
  // Locale-less path (e.g. "/checkout"), so the redirect target works in any language
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("common");

  useEffect(() => {
    if (!hydrated || session) return;
    const params = new URLSearchParams({ redirect: pathname });
    // Explain the denial using the most privileged other session (e.g. a manager trying Super Admin)
    const other = (["admin", "manager", "customer"] as Role[]).find((r) => r !== role && isSessionValid(sessions[r]));
    if (other) params.set("denied", other);
    const login = role === "customer" ? localizePath(LOGIN_PATHS.customer, locale) : LOGIN_PATHS[role];
    router.replace(`${login}?${params.toString()}`);
  }, [hydrated, session, sessions, role, pathname, router, locale]);

  if (!hydrated || !session) return <>{fallback ?? <PageLoader label={t("checkingSession")} />}</>;
  return <>{children}</>;
}

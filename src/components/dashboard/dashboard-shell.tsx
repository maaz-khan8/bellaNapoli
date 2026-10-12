"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Bell,
  ChevronsLeft,
  ExternalLink,
  LogOut,
  type LucideIcon,
  Menu,
  Search,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/auth-store";
import { useSession } from "@/hooks/use-session";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  href: string;
  unread?: boolean;
}

interface ShellProps {
  role: Extract<Role, "manager" | "admin">;
  basePath: string;
  brand: React.ReactNode;
  brandCompact: React.ReactNode;
  nav: NavItem[];
  notices: Notice[];
  roleLabel: string;
  sidebarFooter?: React.ReactNode;
  banner?: React.ReactNode;
  children: React.ReactNode;
}

const COLLAPSE_KEY = "bella-napoli:sidebar-collapsed";

function NavLinks({ nav, collapsed, onNavigate }: { nav: NavItem[]; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const link = (
          <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
              active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            {active && (
              <motion.span layoutId={`nav-active-${collapsed}`} className="absolute inset-0 rounded-xl bg-sidebar-accent ring-1 ring-white/5" transition={{ type: "spring", stiffness: 400, damping: 34 }}>
                <span className="absolute top-2.5 bottom-2.5 left-0 w-1 rounded-r-full bg-sidebar-primary" />
              </motion.span>
            )}
            <item.icon className={cn("relative size-[18px] shrink-0", active && "text-sidebar-primary")} aria-hidden="true" />
            {!collapsed && <span className="relative flex-1 truncate">{item.label}</span>}
            {!!item.badge && (
              <span
                className={cn(
                  "relative flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1.5 text-[11px] font-bold text-sidebar-primary-foreground",
                  collapsed && "absolute top-1 right-1 h-4 min-w-4 px-1 text-[10px]",
                )}
                aria-label={`${item.badge} need attention`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
        return (
          <li key={item.href}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              link
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function DashboardShell({ role, basePath, brand, brandCompact, nav, notices, roleLabel, sidebarFooter, banner, children }: ShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession(role)!;
  const logout = useAuthStore((s) => s.logout);
  // The shell only renders client-side (behind RoleGuard), so reading storage here is hydration-safe
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return typeof window !== "undefined" && localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const unread = notices.filter((n) => n.unread).length;

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      } catch {}
      return !c;
    });
  };

  const signOut = () => {
    logout(role);
    toast.success("Signed out");
    router.push(`${basePath}/login`);
  };

  const current = nav.find((n) => pathname.startsWith(n.href));

  return (
    <div className="flex min-h-svh flex-1 bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-svh shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-300 lg:flex",
          collapsed ? "w-[4.75rem]" : "w-64",
        )}
        aria-label={`${roleLabel} navigation`}
      >
        <div className={cn("flex h-16 items-center border-b border-sidebar-border", collapsed ? "justify-center px-2" : "px-5")}>
          {collapsed ? brandCompact : brand}
        </div>
        <nav className="flex-1 overflow-y-auto p-3" aria-label="Primary">
          <NavLinks nav={nav} collapsed={collapsed} />
        </nav>
        {!collapsed && sidebarFooter && <div className="border-t border-sidebar-border p-3">{sidebarFooter}</div>}
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={toggleCollapsed}
            className={cn("flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-sidebar-foreground/60 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", collapsed && "justify-center px-0")}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            <ChevronsLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} aria-hidden="true" />
            {!collapsed && "Collapse"}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-0 bg-sidebar p-0 text-sidebar-foreground" showCloseButton={false}>
          <SheetTitle className="sr-only">{roleLabel} navigation</SheetTitle>
          <SheetDescription className="sr-only">Navigate between dashboard sections</SheetDescription>
          <div className="flex h-16 items-center border-b border-sidebar-border px-5">{brand}</div>
          <nav className="flex-1 overflow-y-auto p-3" aria-label="Primary">
            <NavLinks nav={nav} collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </nav>
          {sidebarFooter && <div className="border-t border-sidebar-border p-3">{sidebarFooter}</div>}
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 sm:px-6">
          <Button variant="ghost" size="icon-lg" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu className="size-5" />
          </Button>
          <p className="truncate text-sm font-semibold lg:hidden">{current?.label}</p>
          <form
            role="search"
            className="relative hidden max-w-sm flex-1 md:block"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`${basePath}/orders${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
            }}
          >
            <label htmlFor={`${role}-search`} className="sr-only">Search orders</label>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id={`${role}-search`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search orders, customers…  ⏎" className="h-10 rounded-xl bg-card pl-9" />
          </form>

          <div className="ml-auto flex items-center gap-1.5">
            <Button asChild variant="ghost" className="hidden h-10 rounded-xl sm:inline-flex">
              <Link href="/" target="_blank" rel="noopener"><ExternalLink /> View store</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-lg" className="relative size-10 rounded-xl" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
                  <Bell className="size-5" />
                  {unread > 0 && <span className="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-background" aria-hidden="true" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications {unread > 0 && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{unread} new</span>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notices.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
                ) : (
                  notices.slice(0, 6).map((n) => (
                    <DropdownMenuItem key={n.id} asChild className="items-start py-2.5">
                      <Link href={n.href}>
                        <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.unread ? "bg-primary" : "bg-transparent")} aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">{n.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">{n.description}</span>
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-xl p-1 pr-2 transition hover:bg-muted" aria-label="Account menu">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">{initials(session.name)}</span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-sm font-semibold">{session.name}</span>
                    <span className="block text-xs text-muted-foreground">{roleLabel}</span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="font-semibold">{session.name}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">{session.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href={`${basePath}/settings`}><Settings /> Settings</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/" target="_blank" rel="noopener"><ExternalLink /> Open customer site</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={signOut}><LogOut /> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {banner}
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

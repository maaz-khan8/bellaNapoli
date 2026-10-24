import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/** Locale-aware Link / router for the customer website. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);

import type { Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#d63a26",
};

/**
 * Pass-through root. Each section renders its own <html>:
 * the localized customer site (app/[locale]) and the English staff portals
 * (app/manager, app/super-admin).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

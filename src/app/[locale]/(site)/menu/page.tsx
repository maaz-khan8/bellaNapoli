import type { Metadata } from "next";
import { Suspense } from "react";
import { MenuBrowser } from "@/components/site/menu-browser";
import { PageLoader } from "@/components/shared/page-loader";

export const metadata: Metadata = { title: "Menu" };

export default function MenuPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading the menu" />}>
      <MenuBrowser />
    </Suspense>
  );
}

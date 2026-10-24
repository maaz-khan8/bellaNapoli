"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { createFormatter } from "@/lib/format";

const TAGS: Record<string, string> = { de: "de-DE", en: "en-US", tr: "tr-TR" };

/** Currency, number and date formatting in the active language. */
export function useFormat() {
  const locale = useLocale();
  return useMemo(() => createFormatter(TAGS[locale] ?? "en-US"), [locale]);
}

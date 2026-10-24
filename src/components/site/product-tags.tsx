"use client";

import { ChefHat, Flame, Leaf, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductTag } from "@/lib/types";
import { cn } from "@/lib/utils";

const TAGS: Record<ProductTag, { label: string; icon: typeof Leaf; className: string }> = {
  veg: { label: "Vegetarian", icon: Leaf, className: "bg-basil-50 text-basil-700 ring-basil-500/25" },
  spicy: { label: "Spicy", icon: Flame, className: "bg-tomato-50 text-tomato-700 ring-tomato-500/25" },
  new: { label: "New", icon: Sparkles, className: "bg-ember-50 text-ember-700 ring-ember-500/30" },
  chef: { label: "Chef's pick", icon: ChefHat, className: "bg-charcoal-900 text-white ring-charcoal-900" },
};

export function ProductTagBadge({ tag, className }: { tag: ProductTag; className?: string }) {
  const meta = TAGS[tag];
  const t = useTranslations("tags");
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", meta.className, className)}>
      <meta.icon className="size-3" aria-hidden="true" />
      {t(tag)}
    </span>
  );
}

export const TAG_OPTIONS = (Object.keys(TAGS) as ProductTag[]).map((value) => ({ value, label: TAGS[value].label }));

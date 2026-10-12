"use client";

import { useMemo } from "react";
import { useFieldArray, useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductTag } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { ImagePicker } from "@/components/dashboard/image-picker";
import { TAG_OPTIONS } from "@/components/site/product-tags";
import { useDataStore } from "@/store/data-store";
import { slugify, uid } from "@/lib/format";

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter a product name"),
    description: z.string().trim().min(10, "Write at least a short description (10+ characters)"),
    categoryId: z.string().min(1, "Choose a category"),
    kind: z.enum(["pizza", "item"]),
    image: z.string().min(1, "Choose or upload an image"),
    price: z.number({ message: "Enter a price" }).min(0, "Price can't be negative").max(999, "That price looks too high"),
    sizes: z.array(
      z.object({
        id: z.string(),
        label: z.string().trim().min(1, "Label required"),
        inches: z.number({ message: "Required" }).min(6, "Min 6\"").max(30, "Max 30\""),
        price: z.number({ message: "Required" }).min(0.5, "Min $0.50").max(999),
      }),
    ),
    toppingIds: z.array(z.string()),
    addonIds: z.array(z.string()),
    tags: z.array(z.string()),
    available: z.boolean(),
    featured: z.boolean(),
    bestSeller: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.kind === "pizza" && v.sizes.length === 0) ctx.addIssue({ code: "custom", path: ["sizes"], message: "Add at least one size" });
  });
type Values = z.infer<typeof schema>;

const DEFAULT_SIZES = [
  { id: "size_s", label: "Small", inches: 10, price: 12 },
  { id: "size_m", label: "Medium", inches: 12, price: 16 },
  { id: "size_l", label: "Large", inches: 14, price: 19.5 },
];

export function ProductFormDialog({ product, open, onOpenChange }: { product: Product | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{product ? `Edit ${product.name}` : "Add a new product"}</DialogTitle>
          <DialogDescription>Changes appear on the customer menu immediately.</DialogDescription>
        </DialogHeader>
        {open && <ProductForm key={product?.id ?? "new"} product={product} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function ProductForm({ product, onDone }: { product: Product | null; onDone: () => void }) {
  const rawCategories = useDataStore((s) => s.categories);
  const categories = useMemo(() => [...rawCategories].sort((a, b) => a.sortOrder - b.sortOrder), [rawCategories]);
  const toppings = useDataStore((s) => s.toppings);
  const addons = useDataStore((s) => s.addons);
  const products = useDataStore((s) => s.products);
  const saveProduct = useDataStore((s) => s.saveProduct);

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? { ...product, tags: product.tags }
      : {
          name: "",
          description: "",
          categoryId: categories[0]?.id ?? "",
          kind: "pizza",
          image: "",
          price: 12,
          sizes: DEFAULT_SIZES,
          toppingIds: toppings.map((t) => t.id),
          addonIds: addons.map((a) => a.id),
          tags: [],
          available: true,
          featured: false,
          bestSeller: false,
        },
  });
  const sizes = useFieldArray({ control, name: "sizes" });
  const kind = useWatch({ control, name: "kind" });
  const toppingIds = useWatch({ control, name: "toppingIds" });
  const addonIds = useWatch({ control, name: "addonIds" });
  const tags = useWatch({ control, name: "tags" });

  const toggleIn = (field: "toppingIds" | "addonIds" | "tags", list: string[], id: string) =>
    setValue(field, list.includes(id) ? list.filter((x) => x !== id) : [...list, id], { shouldDirty: true });

  const onSubmit = (v: Values) => {
    let slug = product?.slug ?? slugify(v.name);
    if (!product) {
      const base = slug;
      let n = 2;
      while (products.some((p) => p.slug === slug)) slug = `${base}-${n++}`;
    }
    const sizesSorted = [...v.sizes].sort((a, b) => a.price - b.price);
    const next: Product = {
      id: product?.id ?? uid("prd"),
      slug,
      name: v.name,
      description: v.description,
      categoryId: v.categoryId,
      image: v.image,
      kind: v.kind,
      price: v.kind === "pizza" ? sizesSorted[0]!.price : v.price,
      sizes: v.kind === "pizza" ? sizesSorted : [],
      toppingIds: v.kind === "pizza" ? v.toppingIds : [],
      addonIds: v.addonIds,
      available: v.available,
      featured: v.featured,
      bestSeller: v.bestSeller,
      tags: v.tags as ProductTag[],
      rating: product?.rating ?? 5,
      reviewCount: product?.reviewCount ?? 0,
      calories: product?.calories,
      popularity: product?.popularity ?? 3,
    };
    saveProduct(next);
    toast.success(product ? `${v.name} updated` : `${v.name} added to the menu`, { description: "Live on the customer website now." });
    onDone();
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit, () => toast.error("Please fix the highlighted fields"))} className="flex max-h-[calc(92svh-5rem)] flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Product name" required error={errors.name?.message} className="sm:col-span-2">
            <Input className="h-10" {...register("name")} />
          </FormField>
          <FormField label="Description" required error={errors.description?.message} className="sm:col-span-2">
            <Textarea className="min-h-20" {...register("description")} />
          </FormField>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <FormField label="Category" required error={errors.categoryId?.message}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10 w-full"><SelectValue placeholder="Choose category" /></SelectTrigger>
                  <SelectContent position="popper">
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}{!c.enabled && " (hidden)"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
            )}
          />
          <Controller
            control={control}
            name="kind"
            render={({ field }) => (
              <FormField label="Product type" required>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="pizza">Pizza (sizes, crust & toppings)</SelectItem>
                    <SelectItem value="item">Item (fixed price)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            )}
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Image <span className="text-primary" aria-hidden="true">*</span></legend>
          <Controller control={control} name="image" render={({ field }) => <ImagePicker value={field.value} onChange={field.onChange} />} />
          {errors.image && <p role="alert" className="text-xs font-medium text-destructive">{errors.image.message}</p>}
        </fieldset>

        {kind === "pizza" ? (
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Sizes & pricing</legend>
            <div className="space-y-2">
              {sizes.fields.map((f, i) => (
                <div key={f.id} className="grid grid-cols-[1fr_5.5rem_6.5rem_auto] items-start gap-2">
                  <div>
                    <Input aria-label={`Size ${i + 1} label`} placeholder="Label" className="h-10" aria-invalid={!!errors.sizes?.[i]?.label} {...register(`sizes.${i}.label`)} />
                    {errors.sizes?.[i]?.label && <p className="mt-1 text-xs text-destructive">{errors.sizes[i]?.label?.message}</p>}
                  </div>
                  <div>
                    <Input aria-label={`Size ${i + 1} inches`} type="number" className="h-10" aria-invalid={!!errors.sizes?.[i]?.inches} {...register(`sizes.${i}.inches`, { valueAsNumber: true })} />
                    {errors.sizes?.[i]?.inches && <p className="mt-1 text-xs text-destructive">{errors.sizes[i]?.inches?.message}</p>}
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input aria-label={`Size ${i + 1} price`} type="number" step="0.01" className="h-10 pl-6" aria-invalid={!!errors.sizes?.[i]?.price} {...register(`sizes.${i}.price`, { valueAsNumber: true })} />
                    {errors.sizes?.[i]?.price && <p className="mt-1 text-xs text-destructive">{errors.sizes[i]?.price?.message}</p>}
                  </div>
                  <Button type="button" variant="ghost" size="icon-lg" className="size-10 text-muted-foreground hover:text-destructive" onClick={() => sizes.remove(i)} aria-label={`Remove size ${i + 1}`}>
                    <Trash2 />
                  </Button>
                </div>
              ))}
              <p className="grid grid-cols-[1fr_5.5rem_6.5rem_auto] gap-2 px-1 text-[11px] text-muted-foreground" aria-hidden="true"><span>Label</span><span>Inches</span><span>Price</span><span className="w-10" /></p>
            </div>
            {errors.sizes?.root?.message || errors.sizes?.message ? <p role="alert" className="text-xs font-medium text-destructive">{errors.sizes?.root?.message ?? errors.sizes?.message}</p> : null}
            <Button type="button" variant="outline" className="h-9" onClick={() => sizes.append({ id: uid("size"), label: "", inches: 16, price: 20 })} disabled={sizes.fields.length >= 5}>
              <Plus /> Add size
            </Button>
          </fieldset>
        ) : (
          <FormField label="Price" required error={errors.price?.message} className="max-w-48">
            <Input type="number" step="0.01" className="h-10" {...register("price", { valueAsNumber: true })} />
          </FormField>
        )}

        {kind === "pizza" && (
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Available extra toppings <span className="font-normal text-muted-foreground">({toppingIds.length} selected)</span></legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {toppings.map((t) => (
                <label key={t.id} className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted/50">
                  <Checkbox checked={toppingIds.includes(t.id)} onCheckedChange={() => toggleIn("toppingIds", toppingIds, t.id)} />
                  <span className="flex-1 truncate">{t.name}</span>
                  <span className="text-xs text-muted-foreground">${t.price.toFixed(2)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Add-ons offered</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {addons.map((a) => (
              <label key={a.id} className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted/50">
                <Checkbox checked={addonIds.includes(a.id)} onCheckedChange={() => toggleIn("addonIds", addonIds, a.id)} />
                <span className="flex-1 truncate">{a.name}</span>
                <span className="text-xs text-muted-foreground">${a.price.toFixed(2)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Labels</legend>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((t) => (
              <label key={t.value} className="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:bg-muted/50">
                <Checkbox checked={tags.includes(t.value)} onCheckedChange={() => toggleIn("tags", tags, t.value)} />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-3">
          {([
            ["available", "Available to order", "Show as in stock"],
            ["featured", "Featured", "Show on the homepage"],
            ["bestSeller", "Bestseller badge", "Highlight as popular"],
          ] as const).map(([name, label, hint]) => (
            <Controller
              key={name}
              control={control}
              name={name}
              render={({ field }) => (
                <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
                  <div>
                    <Label htmlFor={`pf-${name}`} className="text-sm">{label}</Label>
                    <p className="text-xs text-muted-foreground">{hint}</p>
                  </div>
                  <Switch id={`pf-${name}`} checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />
          ))}
        </div>
      </div>
      <DialogFooter className="mx-0 mb-0 border-t px-6 py-4">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit">{product ? "Save changes" : "Add product"}</Button>
      </DialogFooter>
    </form>
  );
}

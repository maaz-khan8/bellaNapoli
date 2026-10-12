"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import { ArrowDown, ArrowUp, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/dashboard/primitives";
import { ImagePicker } from "@/components/dashboard/image-picker";
import { FormField } from "@/components/shared/form-field";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDataStore } from "@/store/data-store";
import { slugify, uid } from "@/lib/format";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Enter a category name"),
  description: z.string().trim().min(3, "Add a short description").max(60, "Keep it under 60 characters"),
  image: z.string().min(1, "Choose an image"),
  enabled: z.boolean(),
});
type Values = z.infer<typeof schema>;

function CategoryForm({ initial, onSubmit, onCancel }: { initial: Values; onSubmit: (v: Values) => void; onCancel: () => void }) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: initial });
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <FormField label="Name" required error={errors.name?.message}><Input className="h-10" {...register("name")} /></FormField>
      <FormField label="Short description" required error={errors.description?.message}><Input className="h-10" {...register("description")} /></FormField>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Cover image</legend>
        <Controller control={control} name="image" render={({ field }) => <ImagePicker value={field.value} onChange={field.onChange} />} />
        {errors.image && <p role="alert" className="text-xs font-medium text-destructive">{errors.image.message}</p>}
      </fieldset>
      <Controller control={control} name="enabled" render={({ field }) => (
        <div className="flex items-center justify-between rounded-xl border p-3">
          <Label htmlFor="cat-enabled">Visible on the customer menu</Label>
          <Switch id="cat-enabled" checked={field.value} onCheckedChange={field.onChange} />
        </div>
      )} />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save category</Button>
      </DialogFooter>
    </form>
  );
}

export default function CategoriesPage() {
  const rawCategories = useDataStore((s) => s.categories);
  const products = useDataStore((s) => s.products);
  const saveCategory = useDataStore((s) => s.saveCategory);
  const patchCategory = useDataStore((s) => s.patchCategory);
  const deleteCategory = useDataStore((s) => s.deleteCategory);
  const moveCategory = useDataStore((s) => s.moveCategory);
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const categories = useMemo(() => [...rawCategories].sort((a, b) => a.sortOrder - b.sortOrder), [rawCategories]);

  return (
    <>
      <PageHeader
        title="Categories"
        description="Reorder categories to change how the customer menu is organised. Hidden categories (and their products) disappear from the website."
        actions={<Button className="h-10 rounded-xl" onClick={() => setEditing("new")}><Plus /> Add category</Button>}
      />
      <ol className="space-y-3">
        {categories.map((c, i) => {
          const count = products.filter((p) => p.categoryId === c.id).length;
          return (
            <motion.li layout key={c.id} transition={{ type: "spring", stiffness: 500, damping: 40 }} className={cn("flex flex-wrap items-center gap-4 rounded-2xl bg-card p-3 pr-4 shadow-xs ring-1 ring-border", !c.enabled && "opacity-70")}>
              <div className="flex flex-col gap-1">
                <Button variant="ghost" size="icon-sm" disabled={i === 0} onClick={() => moveCategory(c.id, -1)} aria-label={`Move ${c.name} up`}><ArrowUp /></Button>
                <Button variant="ghost" size="icon-sm" disabled={i === categories.length - 1} onClick={() => moveCategory(c.id, 1)} aria-label={`Move ${c.name} down`}><ArrowDown /></Button>
              </div>
              <span className="tabular w-6 text-center text-sm font-bold text-muted-foreground">{i + 1}</span>
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image src={c.image} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold">{c.name}{!c.enabled && <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"><EyeOff className="size-3" aria-hidden="true" /> Hidden</span>}</p>
                <p className="text-sm text-muted-foreground">{c.description} · {count} product{count === 1 ? "" : "s"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={c.enabled}
                  aria-label={`${c.name} visible`}
                  onCheckedChange={(v) => { patchCategory(c.id, { enabled: v }); toast.success(`${c.name} ${v ? "is visible" : "hidden from the menu"}`); }}
                />
                <Button variant="ghost" size="icon-lg" className="size-9" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}><Pencil /></Button>
                <ConfirmDialog
                  trigger={<Button variant="ghost" size="icon-lg" className="size-9 text-muted-foreground hover:text-destructive" aria-label={`Delete ${c.name}`}><Trash2 /></Button>}
                  title={`Delete ${c.name}?`}
                  description={count ? `This category still has ${count} product(s). You'll need to move or delete them first.` : "This category will be removed permanently."}
                  confirmLabel="Delete"
                  destructive
                  onConfirm={() => {
                    const res = deleteCategory(c.id);
                    if (res.ok) toast.success(`${c.name} deleted`);
                    else toast.error(`Can't delete ${c.name}`, { description: res.reason });
                  }}
                />
              </div>
            </motion.li>
          );
        })}
      </ol>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Add category" : "Edit category"}</DialogTitle>
            <DialogDescription>Categories group products on the customer menu.</DialogDescription>
          </DialogHeader>
          {editing !== null && (
            <CategoryForm
              key={editing === "new" ? "new" : editing.id}
              initial={editing === "new" ? { name: "", description: "", image: "", enabled: true } : { name: editing.name, description: editing.description, image: editing.image, enabled: editing.enabled }}
              onCancel={() => setEditing(null)}
              onSubmit={(v) => {
                if (editing === "new") {
                  saveCategory({ id: uid("cat"), slug: slugify(v.name), sortOrder: 0, ...v });
                  toast.success(`${v.name} added`);
                } else {
                  saveCategory({ ...editing, ...v });
                  toast.success(`${v.name} updated`);
                }
                setEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/shared/form-field";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatCurrency, uid } from "@/lib/format";

export interface OptionRow {
  id: string;
  name: string;
  price: number;
  available: boolean;
  veg?: boolean;
}

const schema = z.object({
  name: z.string().trim().min(2, "Enter a name"),
  price: z.number({ message: "Enter a price" }).min(0, "Price can't be negative").max(50, "Keep extras under $50"),
  veg: z.boolean(),
  available: z.boolean(),
});
type Values = z.infer<typeof schema>;

/** CRUD table for toppings / add-ons. */
export function OptionManager<T extends OptionRow>({
  noun,
  rows,
  showVeg = false,
  usage,
  onSave,
  onDelete,
}: {
  noun: string;
  rows: T[];
  showVeg?: boolean;
  usage: (id: string) => number;
  onSave: (row: T) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState<T | "new" | null>(null);

  return (
    <div className="rounded-2xl bg-card shadow-xs ring-1 ring-border">
      <div className="flex items-center justify-between gap-3 border-b p-4">
        <p className="text-sm text-muted-foreground">{rows.length} {noun.toLowerCase()}s · prices apply to new orders immediately</p>
        <Button className="h-9" onClick={() => setEditing("new")}><Plus /> Add {noun.toLowerCase()}</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden sm:table-cell">Used by</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="pr-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="pl-5 font-medium">
                  {r.name}
                  {showVeg && r.veg && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">Veg</span>}
                </TableCell>
                <TableCell className="tabular">{r.price ? formatCurrency(r.price) : "Free"}</TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">{usage(r.id)} products</TableCell>
                <TableCell>
                  <Switch
                    checked={r.available}
                    aria-label={`${r.name} available`}
                    onCheckedChange={(v) => {
                      onSave({ ...r, available: v });
                      toast.success(`${r.name} ${v ? "available" : "marked unavailable"}`);
                    }}
                  />
                </TableCell>
                <TableCell className="pr-5 text-right">
                  <Button variant="ghost" size="icon-lg" className="size-9" onClick={() => setEditing(r)} aria-label={`Edit ${r.name}`}><Pencil /></Button>
                  <ConfirmDialog
                    trigger={<Button variant="ghost" size="icon-lg" className="size-9 text-muted-foreground hover:text-destructive" aria-label={`Delete ${r.name}`}><Trash2 /></Button>}
                    title={`Delete ${r.name}?`}
                    description={`It will be removed from ${usage(r.id)} product(s). Existing orders are not affected.`}
                    confirmLabel="Delete"
                    destructive
                    onConfirm={() => {
                      onDelete(r.id);
                      toast.success(`${r.name} deleted`);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing === "new" ? `Add ${noun.toLowerCase()}` : `Edit ${noun.toLowerCase()}`}</DialogTitle>
            <DialogDescription>Customers see changes on product pages right away.</DialogDescription>
          </DialogHeader>
          {editing !== null && (
            <OptionForm
              key={editing === "new" ? "new" : editing.id}
              initial={editing === "new" ? { name: "", price: 1, veg: true, available: true } : { name: editing.name, price: editing.price, veg: !!editing.veg, available: editing.available }}
              showVeg={showVeg}
              onCancel={() => setEditing(null)}
              onSubmit={(v) => {
                const base = editing === "new" ? { id: uid(noun === "Topping" ? "top" : "add") } : editing;
                onSave({ ...(base as T), name: v.name, price: v.price, available: v.available, ...(showVeg ? { veg: v.veg } : {}) });
                toast.success(editing === "new" ? `${v.name} added` : `${v.name} updated`);
                setEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OptionForm({ initial, showVeg, onSubmit, onCancel }: { initial: Values; showVeg: boolean; onSubmit: (v: Values) => void; onCancel: () => void }) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: initial });
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <FormField label="Name" required error={errors.name?.message}>
        <Input className="h-10" {...register("name")} />
      </FormField>
      <FormField label="Price ($)" required error={errors.price?.message}>
        <Input type="number" step="0.01" className="h-10" {...register("price", { valueAsNumber: true })} />
      </FormField>
      {showVeg && (
        <div className="flex items-center gap-2">
          <Checkbox id="opt-veg" defaultChecked={initial.veg} onCheckedChange={(v) => setValue("veg", v === true)} />
          <Label htmlFor="opt-veg" className="font-normal">Vegetarian</Label>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Checkbox id="opt-available" defaultChecked={initial.available} onCheckedChange={(v) => setValue("available", v === true)} />
        <Label htmlFor="opt-available" className="font-normal">Available</Label>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}

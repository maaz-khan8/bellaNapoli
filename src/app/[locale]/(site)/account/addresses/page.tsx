"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Home, MapPin, MapPinPlus, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Address } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/shared/form-field";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useCurrentCustomer } from "@/hooks/use-session";
import { useDataStore } from "@/store/data-store";
import { addressSchema, type AddressValues } from "@/lib/validation";
import { uid } from "@/lib/format";

function AddressForm({ initial, onSubmit, onCancel }: { initial: AddressValues; onSubmit: (v: AddressValues) => void; onCancel: () => void }) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: initial,
  });
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-[1fr_9rem]">
      <FormField label="Label" required error={errors.label?.message} className="sm:col-span-2">
        <Input placeholder="Home, Work, Mum's place…" className="h-11 rounded-xl" {...register("label")} />
      </FormField>
      <FormField label="Street address" required error={errors.line1?.message} className="sm:col-span-2">
        <Input autoComplete="address-line1" className="h-11 rounded-xl" {...register("line1")} />
      </FormField>
      <FormField label="Apartment, suite (optional)" error={errors.line2?.message} className="sm:col-span-2">
        <Input autoComplete="address-line2" className="h-11 rounded-xl" {...register("line2")} />
      </FormField>
      <FormField label="City" required error={errors.city?.message}>
        <Input autoComplete="address-level2" className="h-11 rounded-xl" {...register("city")} />
      </FormField>
      <FormField label="ZIP" required error={errors.postalCode?.message}>
        <Input inputMode="numeric" autoComplete="postal-code" className="h-11 rounded-xl" {...register("postalCode")} />
      </FormField>
      <FormField label="Delivery notes (optional)" error={errors.notes?.message} className="sm:col-span-2">
        <Input placeholder="Buzzer, gate code…" className="h-11 rounded-xl" {...register("notes")} />
      </FormField>
      <div className="flex items-center gap-2 sm:col-span-2">
        <Checkbox id="addr-default" defaultChecked={initial.isDefault} onCheckedChange={(v) => setValue("isDefault", v === true)} />
        <Label htmlFor="addr-default" className="font-normal">Set as default delivery address</Label>
      </div>
      <DialogFooter className="mt-2 sm:col-span-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save address</Button>
      </DialogFooter>
    </form>
  );
}

const EMPTY: AddressValues = { label: "", line1: "", line2: "", city: "New York, NY", postalCode: "", notes: "", isDefault: false };

export default function AddressesPage() {
  const customer = useCurrentCustomer();
  const saveAddress = useDataStore((s) => s.saveAddress);
  const deleteAddress = useDataStore((s) => s.deleteAddress);
  const [editing, setEditing] = useState<Address | "new" | null>(null);

  if (!customer) return null;

  const initial: AddressValues = editing && editing !== "new"
    ? { label: editing.label, line1: editing.line1, line2: editing.line2 ?? "", city: editing.city, postalCode: editing.postalCode, notes: editing.notes ?? "", isDefault: editing.isDefault }
    : { ...EMPTY, isDefault: customer.addresses.length === 0 };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Saved addresses</h2>
          <p className="text-sm text-muted-foreground">Choose one at checkout for faster ordering.</p>
        </div>
        <Button className="h-11 rounded-full px-5" onClick={() => setEditing("new")}><MapPinPlus /> Add address</Button>
      </div>

      {customer.addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No saved addresses" description="Add your home or work address to check out in seconds." className="rounded-3xl bg-card ring-1 ring-border" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {customer.addresses.map((a) => (
            <motion.article layout key={a.id} className="flex flex-col rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border">
              <div className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Home className="size-5" aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-2 font-semibold">
                    {a.label}
                    {a.isDefault && <span className="inline-flex items-center gap-1 rounded-full bg-basil-50 px-2 py-0.5 text-[11px] font-semibold text-basil-700"><Star className="size-3" aria-hidden="true" /> Default</span>}
                  </h3>
                  <p className="text-sm text-muted-foreground">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
                  <p className="text-sm text-muted-foreground">{a.city} {a.postalCode}</p>
                  {a.notes && <p className="mt-2 text-xs italic text-muted-foreground">“{a.notes}”</p>}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
                <Button variant="outline" size="sm" className="h-9" onClick={() => setEditing(a)}><Pencil /> Edit</Button>
                {!a.isDefault && (
                  <Button variant="ghost" size="sm" className="h-9" onClick={() => { saveAddress(customer.id, { ...a, isDefault: true }); toast.success(`${a.label} is now your default address`); }}>Make default</Button>
                )}
                <ConfirmDialog
                  trigger={<Button variant="ghost" size="sm" className="ml-auto h-9 text-destructive hover:text-destructive"><Trash2 /> Delete</Button>}
                  title={`Delete "${a.label}"?`}
                  description="This address will be removed from your account."
                  confirmLabel="Delete"
                  destructive
                  onConfirm={() => { deleteAddress(customer.id, a.id); toast.success("Address deleted"); }}
                />
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Add a new address" : "Edit address"}</DialogTitle>
            <DialogDescription>Demo addresses are stored only in this browser.</DialogDescription>
          </DialogHeader>
          {editing !== null && (
            <AddressForm
              key={editing === "new" ? "new" : editing.id}
              initial={initial}
              onCancel={() => setEditing(null)}
              onSubmit={(v) => {
                const id = editing === "new" ? uid("addr") : editing.id;
                saveAddress(customer.id, { id, ...v, line2: v.line2 || undefined, notes: v.notes || undefined });
                toast.success(editing === "new" ? "Address added" : "Address updated");
                setEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

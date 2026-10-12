"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "motion/react";
import { ExternalLink, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Restaurant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageHeader, Panel } from "@/components/dashboard/primitives";
import { ImagePicker } from "@/components/dashboard/image-picker";
import { FormField } from "@/components/shared/form-field";
import { useDataStore } from "@/store/data-store";
import { isValidPhone } from "@/lib/validation";
import { cn } from "@/lib/utils";

const time = z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM");
const money = (label: string) => z.number({ message: `Enter ${label}` }).min(0, "Can't be negative").max(500, "Too high");

const schema = z.object({
  name: z.string().trim().min(2, "Enter the restaurant name"),
  tagline: z.string().trim().min(5, "Add a short tagline").max(90, "Keep it under 90 characters"),
  description: z.string().trim().min(20, "Write at least 20 characters"),
  logo: z.string(),
  coverImage: z.string().min(1, "Choose a cover image"),
  address: z.string().trim().min(5, "Enter the street address"),
  city: z.string().trim().min(2, "Enter the city"),
  phone: z.string().trim().refine(isValidPhone, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email"),
  hours: z.array(z.object({ day: z.string(), open: time, close: time, closed: z.boolean() })),
  delivery: z.object({
    enabled: z.boolean(),
    fee: money("a fee"),
    freeDeliveryOver: money("a threshold"),
    minOrder: money("a minimum"),
    radiusKm: z.number({ message: "Enter a radius" }).min(1, "At least 1 km").max(30, "Max 30 km"),
    estimatedMinutes: z.number({ message: "Enter minutes" }).min(10, "At least 10 min").max(120, "Max 120 min"),
  }),
  pickup: z.object({
    enabled: z.boolean(),
    estimatedMinutes: z.number({ message: "Enter minutes" }).min(5, "At least 5 min").max(90, "Max 90 min"),
  }),
});
type Values = z.infer<typeof schema>;

function toValues(r: Restaurant): Values {
  const { name, tagline, description, logo, coverImage, address, city, phone, email, hours, delivery, pickup } = r;
  return { name, tagline, description, logo, coverImage, address, city, phone, email, hours, delivery, pickup };
}

function ProfileForm({ restaurant }: { restaurant: Restaurant }) {
  const updateRestaurant = useDataStore((s) => s.updateRestaurant);
  const accepting = useDataStore((s) => s.restaurant.acceptingOrders);
  const setAccepting = useDataStore((s) => s.setAcceptingOrders);
  const { register, control, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: toValues(restaurant),
  });
  const deliveryEnabled = useWatch({ control, name: "delivery.enabled" });
  const pickupEnabled = useWatch({ control, name: "pickup.enabled" });
  const hours = useWatch({ control, name: "hours" });

  const onSubmit = async (v: Values) => {
    await new Promise((r) => setTimeout(r, 500));
    if (!v.delivery.enabled && !v.pickup.enabled) {
      toast.error("Enable delivery or pickup", { description: "Customers need at least one way to receive orders." });
      return;
    }
    updateRestaurant({ ...v, hours: v.hours as Restaurant["hours"] });
    reset(v);
    toast.success("Restaurant profile saved", { description: "The customer website reflects your changes now." });
  };

  const num = { valueAsNumber: true } as const;

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit, () => toast.error("Please fix the highlighted fields"))} className="space-y-6 pb-24">
      <Panel title="Availability" description="Takes effect instantly — customers can still browse the menu while ordering is paused.">
        <div className={cn("flex items-center justify-between gap-4 rounded-xl p-4 ring-1", accepting ? "bg-emerald-50 ring-emerald-600/20" : "bg-amber-50 ring-amber-600/20")}>
          <div>
            <Label htmlFor="r-accepting" className="text-base font-semibold">{accepting ? "Open for online orders" : "Online ordering paused"}</Label>
            <p className="text-sm text-muted-foreground">Toggle off during rushes, private events or closures.</p>
          </div>
          <Switch
            id="r-accepting"
            checked={accepting}
            onCheckedChange={(v) => {
              setAccepting(v);
              toast.success(v ? "Online ordering is live" : "Online ordering paused");
            }}
          />
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Restaurant details">
          <div className="grid gap-4">
            <FormField label="Restaurant name" required error={errors.name?.message}><Input className="h-10" {...register("name")} /></FormField>
            <FormField label="Tagline" required error={errors.tagline?.message}><Input className="h-10" {...register("tagline")} /></FormField>
            <FormField label="Description" required error={errors.description?.message}><Textarea className="min-h-28" {...register("description")} /></FormField>
          </div>
        </Panel>
        <Panel title="Branding">
          <div className="grid gap-6">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Logo</legend>
              <Controller control={control} name="logo" render={({ field }) => <ImagePicker label="Logo" round library={false} maxSize={320} value={field.value} onChange={field.onChange} />} />
              <p className="text-xs text-muted-foreground">Leave empty to use the built-in Bella Napoli mark.</p>
            </fieldset>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Cover image</legend>
              <Controller control={control} name="coverImage" render={({ field }) => <ImagePicker label="Cover" value={field.value} onChange={field.onChange} />} />
              {errors.coverImage && <p role="alert" className="text-xs font-medium text-destructive">{errors.coverImage.message}</p>}
            </fieldset>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Contact information">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Street address" required error={errors.address?.message} className="sm:col-span-2"><Input className="h-10" {...register("address")} /></FormField>
            <FormField label="City, state & ZIP" required error={errors.city?.message} className="sm:col-span-2"><Input className="h-10" {...register("city")} /></FormField>
            <FormField label="Phone" required error={errors.phone?.message}><Input type="tel" className="h-10" {...register("phone")} /></FormField>
            <FormField label="Email" required error={errors.email?.message}><Input type="email" className="h-10" {...register("email")} /></FormField>
          </div>
        </Panel>
        <Panel title="Opening hours">
          <ul className="space-y-2">
            {hours.map((h, i) => (
              <li key={h.day} className="grid grid-cols-[6.5rem_1fr] items-center gap-3 sm:grid-cols-[7rem_auto_1fr]">
                <span className="text-sm font-medium">{h.day}</span>
                <Controller control={control} name={`hours.${i}.closed`} render={({ field }) => (
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch checked={!field.value} onCheckedChange={(v) => field.onChange(!v)} aria-label={`${h.day} open`} size="sm" />
                    {field.value ? "Closed" : "Open"}
                  </label>
                )} />
                <div className={cn("col-span-2 flex items-center gap-2 sm:col-span-1", h.closed && "pointer-events-none opacity-40")}>
                  <Input type="time" aria-label={`${h.day} opening time`} className="h-9" {...register(`hours.${i}.open`)} />
                  <span className="text-muted-foreground" aria-hidden="true">–</span>
                  <Input type="time" aria-label={`${h.day} closing time`} className="h-9" {...register(`hours.${i}.close`)} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Delivery settings" actions={<Controller control={control} name="delivery.enabled" render={({ field }) => (
          <label className="flex items-center gap-2 text-sm font-medium"><Switch checked={field.value} onCheckedChange={field.onChange} />{field.value ? "Enabled" : "Disabled"}</label>
        )} />}>
          <div className={cn("grid gap-4 sm:grid-cols-3", !deliveryEnabled && "opacity-50")}>
            <FormField label="Delivery fee ($)" error={errors.delivery?.fee?.message}><Input type="number" step="0.01" className="h-10" {...register("delivery.fee", num)} /></FormField>
            <FormField label="Free delivery over ($)" error={errors.delivery?.freeDeliveryOver?.message}><Input type="number" step="1" className="h-10" {...register("delivery.freeDeliveryOver", num)} /></FormField>
            <FormField label="Minimum order ($)" error={errors.delivery?.minOrder?.message}><Input type="number" step="1" className="h-10" {...register("delivery.minOrder", num)} /></FormField>
            <FormField label="Delivery radius (km)" error={errors.delivery?.radiusKm?.message}><Input type="number" className="h-10" {...register("delivery.radiusKm", num)} /></FormField>
            <FormField label="Est. delivery time (min)" error={errors.delivery?.estimatedMinutes?.message}><Input type="number" className="h-10" {...register("delivery.estimatedMinutes", num)} /></FormField>
          </div>
        </Panel>
        <Panel title="Pickup settings" actions={<Controller control={control} name="pickup.enabled" render={({ field }) => (
          <label className="flex items-center gap-2 text-sm font-medium"><Switch checked={field.value} onCheckedChange={field.onChange} />{field.value ? "Enabled" : "Disabled"}</label>
        )} />}>
          <div className={cn(!pickupEnabled && "opacity-50")}>
            <FormField label="Est. pickup time (min)" error={errors.pickup?.estimatedMinutes?.message}><Input type="number" className="h-10" {...register("pickup.estimatedMinutes", num)} /></FormField>
          </div>
        </Panel>
      </div>

      <AnimatePresence>
        {isDirty && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-2xl items-center gap-3 rounded-2xl bg-charcoal-900 p-3 pl-5 text-white shadow-2xl lg:left-72">
            <p className="flex-1 text-sm font-medium">You have unsaved changes</p>
            <Button type="button" variant="ghost" className="h-10 text-white hover:bg-white/10 hover:text-white" onClick={() => reset(toValues(restaurant))}>Discard</Button>
            <Button type="submit" disabled={isSubmitting} className="h-10">{isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} Save changes</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

export default function RestaurantProfilePage() {
  const restaurant = useDataStore((s) => s.restaurant);
  return (
    <>
      <PageHeader
        title="Restaurant profile"
        description="Update how Bella Napoli appears to customers. Saved changes are reflected on the website immediately."
        actions={<Button asChild variant="outline" className="h-10 rounded-xl"><Link href="/" target="_blank"><ExternalLink /> View website</Link></Button>}
      />
      <ProfileForm restaurant={restaurant} />
    </>
  );
}

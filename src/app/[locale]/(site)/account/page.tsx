"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CalendarDays, Package, Receipt, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { OrderCard } from "@/components/site/order-card";
import { useCurrentCustomer } from "@/hooks/use-session";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";
import { profileSchema, type ProfileValues } from "@/lib/validation";
import { ACTIVE_STATUSES } from "@/lib/order-status";
import { isRevenueOrder } from "@/lib/metrics";
import { formatCurrency, formatDate } from "@/lib/format";

function ProfileForm({ initial, onSave }: { initial: ProfileValues; onSave: (v: ProfileValues) => void }) {
  const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial,
  });
  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (v) => {
        await new Promise((r) => setTimeout(r, 400));
        onSave(v);
        reset(v);
      })}
      className="grid gap-4 sm:grid-cols-2"
    >
      <FormField label="Full name" required error={errors.name?.message} className="sm:col-span-2">
        <Input autoComplete="name" className="h-11 rounded-xl" {...register("name")} />
      </FormField>
      <FormField label="Email" required error={errors.email?.message}>
        <Input type="email" autoComplete="email" className="h-11 rounded-xl" {...register("email")} />
      </FormField>
      <FormField label="Phone" required error={errors.phone?.message}>
        <Input type="tel" autoComplete="tel" className="h-11 rounded-xl" {...register("phone")} />
      </FormField>
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" disabled={!isDirty || isSubmitting} className="h-11 rounded-full px-6"><Save /> Save changes</Button>
      </div>
    </form>
  );
}

export default function AccountPage() {
  const customer = useCurrentCustomer();
  const allOrders = useDataStore((s) => s.orders);
  const updateCustomer = useDataStore((s) => s.updateCustomer);
  const updateSessionName = useAuthStore((s) => s.updateSessionName);

  const orders = useMemo(
    () => allOrders.filter((o) => o.customerId === customer?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [allOrders, customer?.id],
  );
  if (!customer) return null;

  const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const spent = orders.filter(isRevenueOrder).reduce((s, o) => s + o.total, 0);
  const stats = [
    { icon: Package, label: "Orders placed", value: orders.length.toString() },
    { icon: Receipt, label: "Total spent", value: formatCurrency(spent) },
    { icon: CalendarDays, label: "Member since", value: formatDate(customer.joinedAt, { month: "short", year: "numeric" }) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border">
            <s.icon className="size-5 text-primary" aria-hidden="true" />
            <p className="mt-3 text-2xl font-bold tracking-tight">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {active.length > 0 && (
        <section aria-labelledby="active-heading">
          <h2 id="active-heading" className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <span className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" /><span className="relative size-2.5 rounded-full bg-primary" /></span>
            Active order{active.length > 1 ? "s" : ""}
          </h2>
          <div className="grid gap-4">{active.map((o) => <OrderCard key={o.id} order={o} />)}</div>
        </section>
      )}

      <section aria-labelledby="profile-heading" className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border sm:p-7">
        <h2 id="profile-heading" className="text-lg font-semibold">Personal information</h2>
        <p className="mb-6 text-sm text-muted-foreground">Used to pre-fill checkout. Changes are saved to this browser.</p>
        <ProfileForm
          key={customer.id}
          initial={{ name: customer.name, email: customer.email, phone: customer.phone }}
          onSave={(v) => {
            updateCustomer(customer.id, v);
            updateSessionName("customer", v.name, v.email);
            toast.success("Profile updated");
          }}
        />
      </section>

      <section aria-labelledby="recent-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-heading" className="text-lg font-semibold">Recent orders</h2>
          <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">View all <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
        {orders.length ? (
          <div className="grid gap-4">{orders.filter((o) => !ACTIVE_STATUSES.includes(o.status)).slice(0, 2).map((o) => <OrderCard key={o.id} order={o} />)}</div>
        ) : (
          <p className="rounded-3xl bg-card p-8 text-center text-sm text-muted-foreground ring-1 ring-border">No orders yet — <Link href="/menu" className="font-semibold text-primary">order your first pizza</Link>.</p>
        )}
      </section>
    </div>
  );
}

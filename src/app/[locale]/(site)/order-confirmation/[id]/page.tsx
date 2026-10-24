"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, Banknote, Bike, Clock, FileQuestion, MapPin, Store, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/role-guard";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderItems, OrderTotals } from "@/components/shared/order-items";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCustomerOrder } from "@/hooks/use-customer-order";
import { useDataStore } from "@/store/data-store";
import { formatDateTime, formatTime } from "@/lib/format";

const CONFETTI = ["#d63a26", "#f28c28", "#2f7a4a", "#f2b929", "#e5604a", "#fdcf9c"];

function SuccessMark() {
  return (
    <div className="relative mx-auto size-24">
      {CONFETTI.concat(CONFETTI).map((c, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute top-1/2 left-1/2 size-2.5 rounded-sm"
            style={{ background: c }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ x: Math.cos(angle) * 80, y: Math.sin(angle) * 80, opacity: 0, scale: 1, rotate: 180 }}
            transition={{ duration: 1.1, delay: 0.35, ease: "easeOut" }}
            aria-hidden="true"
          />
        );
      })}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="flex size-24 items-center justify-center rounded-full bg-basil-500 shadow-xl shadow-basil-500/30">
        <svg viewBox="0 0 52 52" className="size-12 text-white" aria-hidden="true">
          <motion.path d="M14 27 l8 8 l16 -18" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.45 }} />
        </svg>
      </motion.div>
    </div>
  );
}

function Confirmation() {
  const { id } = useParams<{ id: string }>();
  const order = useCustomerOrder(id);
  const restaurant = useDataStore((s) => s.restaurant);

  if (!order) {
    return (
      <EmptyState icon={FileQuestion} title="Order not found" description="We couldn't find this order on your account." action={<Button asChild className="h-11 rounded-full px-6"><Link href="/account/orders">View my orders</Link></Button>} className="min-h-[60vh]" />
    );
  }

  const eta = new Date(new Date(order.createdAt).getTime() + order.estimatedMinutes * 60_000);
  const firstName = order.customer.name.split(" ")[0];

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-linear-to-b from-basil-50 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="text-center">
          <SuccessMark />
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <span className="mt-6 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold tracking-wide text-amber-900 uppercase">Demo transaction</span>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Grazie, {firstName}! Your order is in.</h1>
            <p className="mt-3 text-muted-foreground" role="status">
              Order <strong className="text-foreground">{order.number}</strong> was sent to the Bella Napoli kitchen at {formatTime(order.createdAt)}.
            </p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
            <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase"><Clock className="size-4 text-primary" aria-hidden="true" /> Estimated {order.fulfillment === "delivery" ? "arrival" : "ready"}</p>
            <p className="mt-2 text-2xl font-bold">{formatTime(eta)}</p>
            <p className="text-xs text-muted-foreground">about {order.estimatedMinutes} minutes</p>
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
            <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">{order.fulfillment === "delivery" ? <Bike className="size-4 text-primary" aria-hidden="true" /> : <Store className="size-4 text-primary" aria-hidden="true" />} {order.fulfillment === "delivery" ? "Delivery" : "Pickup"}</p>
            <p className="mt-2 text-sm font-medium">{order.fulfillment === "delivery" ? order.address : `${restaurant.address}, ${restaurant.city}`}</p>
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Current status</p>
            <div className="mt-2"><StatusBadge status={order.status} fulfillment={order.fulfillment} pulse /></div>
            <p className="mt-2 text-xs text-muted-foreground">Updates live as the kitchen works</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
          <section className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border" aria-labelledby="items-heading">
            <h2 id="items-heading" className="mb-4 font-semibold">Your items</h2>
            <OrderItems order={order} />
            <div className="mt-5 border-t pt-5"><OrderTotals order={order} /></div>
          </section>
          <section className="space-y-4 rounded-3xl bg-card p-6 text-sm shadow-sm ring-1 ring-border" aria-labelledby="details-heading">
            <h2 id="details-heading" className="font-semibold">Details</h2>
            <p className="flex gap-2"><User className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span>{order.customer.name}<br /><span className="text-muted-foreground">{order.customer.phone}<br />{order.customer.email}</span></span></p>
            {order.address && <p className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />{order.address}</p>}
            <p className="flex gap-2"><Banknote className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />Cash on Delivery</p>
            {order.instructions && <p className="rounded-xl bg-muted p-3 text-xs italic">“{order.instructions}”</p>}
            <p className="text-xs text-muted-foreground">Placed {formatDateTime(order.createdAt)}</p>
          </section>
        </motion.div>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="h-13 rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/25">
            <Link href={`/orders/${order.id}`}>Track order <ArrowRight /></Link>
          </Button>
          <Button asChild variant="outline" className="h-13 rounded-full px-8 text-base">
            <Link href="/menu">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <RoleGuard role="customer">
      <Confirmation />
    </RoleGuard>
  );
}

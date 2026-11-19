"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Pizza,
  XCircle,
} from "lucide-react";

import { useSession } from "@/lib/auth-client";
import {
  parseCustomerOrdersResponse,
  type CustomerOrder,
} from "@/lib/customer-orders";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

export default function CustomerOverview() {
  const { data: session, isPending } = useSession();
  const firstName = session?.user.name?.trim().split(/\s+/)[0] || "there";
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (isPending) return;

    const controller = new AbortController();
    async function loadOrders() {
      setIsLoadingOrders(true);
      setOrdersError(null);
      try {
        const response = await fetch("/api/customer-orders", {
          signal: controller.signal,
        });
        const value: unknown = await response.json();
        if (!response.ok) {
          throw new Error(
            typeof value === "object" &&
              value !== null &&
              "error" in value &&
              typeof value.error === "string"
              ? value.error
              : "Could not load your orders.",
          );
        }
        setOrders(parseCustomerOrdersResponse(value));
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setOrdersError(
          error instanceof Error ? error.message : "Could not load your orders.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoadingOrders(false);
      }
    }

    void loadOrders();
    return () => controller.abort();
  }, [isPending]);

  return (
    <section className="mx-auto max-w-6xl">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#C9432D]">
          Your pizza nights
        </p>
        <h1 className="mt-2 font-serif text-3xl leading-tight text-[#281E18] sm:text-4xl">
          Ready to order, {firstName}?
        </h1>
        <p className="mt-2 text-sm text-[#766A60]">
          Browse the menu and choose something fresh for your next meal.
        </p>
      </header>

      <article className="mt-8 flex max-w-3xl flex-col items-start gap-5 rounded-xl border border-[#E6D8CA] bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#FCE9E3] text-[#C9432D]">
            <Pizza aria-hidden="true" className="size-6" />
          </span>
          <div>
            <h2 className="font-serif text-xl text-[#281E18]">
              Find your next favorite
            </h2>
            <p className="mt-1 max-w-md text-sm leading-6 text-[#766A60]">
              Pick a menu item, then add your delivery date and address to
              continue.
            </p>
          </div>
        </div>

        <Link
          href="/menu"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#C9432D] px-5 text-sm font-bold text-white transition hover:bg-[#A93422] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B34B31] focus-visible:ring-offset-2"
        >
          Browse menu
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </article>

      <section
        aria-label="Order overview"
        className="mt-6 grid max-w-5xl gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          {
            label: "Total orders",
            count: orders.length,
            icon: ClipboardList,
            color: "bg-[#FCE9E3] text-[#A93422]",
          },
          {
            label: "Pending",
            count: orders.filter((order) => order.status === "pending").length,
            icon: Clock3,
            color: "bg-amber-50 text-amber-700",
          },
          {
            label: "Accepted",
            count: orders.filter((order) => order.status === "accepted").length,
            icon: CheckCircle2,
            color: "bg-green-50 text-green-700",
          },
          {
            label: "Rejected",
            count: orders.filter((order) => order.status === "rejected").length,
            icon: XCircle,
            color: "bg-red-50 text-red-700",
          },
        ].map(({ label, count, icon: Icon, color }) => (
          <article
            key={label}
            className="flex items-center gap-4 rounded-xl border border-[#E6D8CA] bg-white p-4"
          >
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-xl ${color}`}
            >
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-[#766A60]">{label}</p>
              <p className="mt-0.5 text-2xl font-bold text-[#281E18]">
                {isLoadingOrders || ordersError ? "—" : count}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 max-w-3xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl text-[#281E18]">Recent orders</h2>
            <p className="mt-1 text-sm text-[#766A60]">
              Track responses from your restaurants.
            </p>
          </div>
          <Link
            href="/dashboard/customer/orders"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#A93422] hover:text-[#81271B]"
          >
            My Orders
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        {ordersError ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {ordersError}
          </p>
        ) : isLoadingOrders ? (
          <div className="h-24 animate-pulse rounded-xl border border-[#E6D8CA] bg-white" />
        ) : orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <article
                key={order.id}
                className="flex items-start gap-4 rounded-xl border border-[#E6D8CA] bg-white p-4"
              >
                {order.image ? (
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-[#F1E7DE]">
                    <Image
                      src={order.image}
                      alt={order.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-[#FCE9E3] text-[#C9432D]">
                    <Pizza aria-hidden="true" className="size-6" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-semibold text-[#281E18]">
                      {order.name}
                    </h3>
                    <p className="text-sm font-bold text-[#A93422]">
                      {formatPrice(order.price)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs font-medium text-[#766A60]">
                    {order.vendorName || "Restaurant"}
                    <span
                      className={`ml-2 inline-flex rounded-full px-2 py-0.5 font-semibold capitalize ${
                        order.status === "accepted"
                          ? "bg-green-50 text-green-700"
                          : order.status === "rejected"
                            ? "bg-red-50 text-red-700"
                            : order.status === "cancelled"
                              ? "bg-stone-100 text-stone-700"
                              : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {order.status || "pending"}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-[#766A60]">
                    Delivery date: {order.deliveryDate}
                  </p>
                  <p className="mt-1 break-words text-xs text-[#766A60]">
                    Deliver to: {order.deliveryAddress}
                  </p>
                  {order.specialInstructions && (
                    <p className="mt-1 text-xs text-[#766A60]">
                      Note: {order.specialInstructions}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#D8C8BA] bg-white/70 px-5 py-8 text-center">
            <p className="text-sm font-semibold text-[#4D4037]">
              You haven&apos;t placed an order yet.
            </p>
            <p className="mt-1 text-xs text-[#766A60]">
              Browse the menu to add your first order here.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}

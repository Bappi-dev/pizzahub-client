"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  LoaderCircle,
  MapPin,
  Pizza,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  parseCustomerOrdersResponse,
  type CustomerOrder,
} from "@/lib/customer-orders";

const statusClassNames: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-stone-100 text-stone-700",
  unknown: "bg-stone-100 text-stone-700",
};

function getErrorMessage(value: unknown, fallback: string) {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  )
    ? value.error
    : fallback;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function CustomerOrders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrders() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch("/api/customer-orders", {
          signal: controller.signal,
        });
        const value: unknown = await response.json();
        if (!response.ok) {
          throw new Error(getErrorMessage(value, "Could not load your orders."));
        }
        setOrders(parseCustomerOrdersResponse(value));
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Could not load your orders.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadOrders();
    return () => controller.abort();
  }, [reloadKey]);

  async function cancelOrder(order: CustomerOrder) {
    if (
      order.status !== "pending" ||
      !window.confirm(
        `Cancel the pending order for ${order.name || "this item"}?`,
      )
    ) {
      return;
    }

    setBusyOrderId(order.id);
    try {
      const response = await fetch(`/api/customer-orders/${order.id}`, {
        method: "PATCH",
      });
      const value: unknown = await response.json();
      if (!response.ok) {
        throw new Error(getErrorMessage(value, "Could not cancel this order."));
      }
      if (
        typeof value !== "object" ||
        value === null ||
        !("id" in value) ||
        value.id !== order.id ||
        !("status" in value) ||
        value.status !== "cancelled"
      ) {
        throw new Error("The server returned an invalid cancellation response.");
      }

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id ? { ...item, status: "cancelled" } : item,
        ),
      );
      toast.success("Order cancelled.");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not cancel this order.",
      );
    } finally {
      setBusyOrderId(null);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl py-2 sm:py-4">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/dashboard/customer"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#A93422] hover:text-[#81271B]"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Overview
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A4442F]">
            Your pizza nights
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#30231B] sm:text-4xl">
            My Orders
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#75685F]">
            Review your order details and cancel any order while it is still
            pending.
          </p>
        </div>
        <Button
          variant="outline"
          render={<Link href="/menu" />}
          className="h-10 rounded-lg border-[#E8DED3] px-4 font-semibold text-[#8F321F] hover:bg-[#FFF8F3]"
        >
          Browse menu
        </Button>
      </header>

      {errorMessage && (
        <div
          role="alert"
          className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
          <Button
            type="button"
            variant="outline"
            onClick={() => setReloadKey((current) => current + 1)}
            className="h-9 rounded-lg border-red-200 bg-white text-red-700 hover:bg-red-100"
          >
            Try again
          </Button>
        </div>
      )}

      {isLoading ? (
        <div
          role="status"
          className="flex items-center justify-center gap-2 rounded-xl border border-[#E6D8CA] bg-white py-12 text-sm text-[#766A60]"
        >
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          Loading your orders...
        </div>
      ) : errorMessage ? null : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = order.status ?? "unknown";
            return (
              <article
                key={order.id}
                className="flex flex-col gap-4 rounded-2xl border border-[#E6D8CA] bg-white p-4 shadow-sm sm:flex-row sm:p-5"
              >
                {order.image ? (
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-[#F1E7DE]">
                    <Image
                      src={order.image}
                      alt={order.name || "Menu item"}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <span className="grid size-20 shrink-0 place-items-center rounded-xl bg-[#FCE9E3] text-[#C9432D]">
                    <Pizza aria-hidden="true" className="size-7" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-semibold text-[#281E18]">
                      {order.name || "Menu item details unavailable"}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#A93422]">
                        {order.price === undefined
                          ? "Price unavailable"
                          : formatPrice(order.price)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${statusClassNames[status] ?? statusClassNames.unknown}`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs font-medium text-[#766A60]">
                    {order.vendorName || "Restaurant"}
                  </p>
                  <div className="mt-3 grid gap-x-6 gap-y-2 text-xs text-[#766A60] sm:grid-cols-2">
                    <p>
                      <span className="font-semibold text-[#4D4037]">
                        Delivery date:
                      </span>{" "}
                      {order.deliveryDate || "Date unavailable"}
                    </p>
                    <p>
                      <span className="font-semibold text-[#4D4037]">
                        Placed:
                      </span>{" "}
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="flex items-start gap-1.5 sm:col-span-2">
                      <MapPin
                        aria-hidden="true"
                        className="mt-0.5 size-3.5 shrink-0 text-[#B34B31]"
                      />
                      <span>
                        <span className="font-semibold text-[#4D4037]">
                          Delivery address:
                        </span>{" "}
                        {order.deliveryAddress || "Address unavailable"}
                      </span>
                    </p>
                    {order.specialInstructions && (
                      <p className="sm:col-span-2">
                        <span className="font-semibold text-[#4D4037]">
                          Instructions:
                        </span>{" "}
                        {order.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>
                {status === "pending" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void cancelOrder(order)}
                    disabled={busyOrderId === order.id}
                    className="h-10 shrink-0 self-start rounded-lg border-red-200 px-4 text-red-700 hover:bg-red-50"
                  >
                    {busyOrderId === order.id ? (
                      <LoaderCircle
                        aria-hidden="true"
                        className="size-4 animate-spin"
                      />
                    ) : (
                      <XCircle aria-hidden="true" className="size-4" />
                    )}
                    Cancel order
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#D8C7B6] bg-white px-6 py-14 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#FCE9E3] text-[#B34B31]">
            <ClipboardList aria-hidden="true" className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-[#30231B]">
            No orders yet
          </h2>
          <p className="mt-2 text-sm text-[#75685F]">
            Orders you place from the menu will appear here.
          </p>
        </div>
      )}
    </section>
  );
}

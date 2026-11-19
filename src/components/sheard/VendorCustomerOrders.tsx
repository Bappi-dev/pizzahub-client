"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Check,
  ClipboardList,
  Clock3,
  LoaderCircle,
  MapPin,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type VendorOrder = {
  id: string;
  menuItemId: string;
  customerName: string;
  customerEmail: string;
  vendorId: string;
  vendorName: string;
  name: string;
  image?: string;
  price: number;
  deliveryDate: string;
  deliveryAddress: string;
  specialInstructions?: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isVendorOrder(value: unknown): value is VendorOrder {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.menuItemId === "string" &&
    typeof value.customerName === "string" &&
    typeof value.customerEmail === "string" &&
    typeof value.vendorId === "string" &&
    typeof value.vendorName === "string" &&
    typeof value.name === "string" &&
    (value.image === undefined || typeof value.image === "string") &&
    typeof value.price === "number" &&
    typeof value.deliveryDate === "string" &&
    typeof value.deliveryAddress === "string" &&
    (value.specialInstructions === undefined ||
      typeof value.specialInstructions === "string") &&
    (value.status === "pending" ||
      value.status === "accepted" ||
      value.status === "rejected" ||
      value.status === "cancelled") &&
    typeof value.createdAt === "string"
  );
}

function getErrorMessage(value: unknown, fallback: string) {
  return isRecord(value) && typeof value.error === "string"
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

const statusClassNames: Record<VendorOrder["status"], string> = {
  pending: "bg-amber-50 text-amber-800",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-stone-100 text-stone-700",
};

export default function VendorCustomerOrders() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
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
        const response = await fetch("/api/vendor/orders", {
          signal: controller.signal,
        });
        const value: unknown = await response.json();

        if (!response.ok) {
          throw new Error(
            getErrorMessage(value, "Could not load customer orders."),
          );
        }
        if (
          !isRecord(value) ||
          !Array.isArray(value.orders) ||
          !value.orders.every(isVendorOrder)
        ) {
          throw new Error("The server returned invalid order data.");
        }

        setOrders(value.orders);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not load customer orders.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadOrders();
    return () => controller.abort();
  }, [reloadKey]);

  async function decideOrder(order: VendorOrder, action: "accept" | "reject") {
    setBusyOrderId(order.id);

    try {
      const response = await fetch(`/api/vendor/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const value: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(value, "Could not update this order."),
        );
      }
      if (
        !isRecord(value) ||
        value.id !== order.id ||
        (value.status !== "accepted" && value.status !== "rejected")
      ) {
        throw new Error("The server returned an invalid order status.");
      }

      const updatedOrder: VendorOrder = {
        ...order,
        status: value.status,
      };
      setOrders((current) =>
        current.map((item) => (item.id === order.id ? updatedOrder : item)),
      );
      setSelectedOrder(updatedOrder);
      toast.success(
        action === "accept" ? "Order accepted." : "Order rejected.",
        { description: "This order can no longer be changed." },
      );
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not update this order.",
      );
    } finally {
      setBusyOrderId(null);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl py-2 sm:py-4">
      <header className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A4442F]">
          Vendor workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#30231B] sm:text-4xl">
          Customer Orders
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#75685F]">
          Review each order before responding. Pending orders can be accepted or
          rejected once.
        </p>
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
        <div className="space-y-3">
          {[0, 1].map((skeleton) => (
            <div
              key={skeleton}
              className="h-28 animate-pulse rounded-2xl border border-[#E8DED3] bg-white"
            />
          ))}
        </div>
      ) : orders.length === 0 && !errorMessage ? (
        <div className="rounded-3xl border border-dashed border-[#D8C7B6] bg-white px-6 py-14 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#FCE9E3] text-[#B34B31]">
            <ClipboardList aria-hidden="true" className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-[#30231B]">
            No customer orders yet
          </h2>
          <p className="mt-2 text-sm text-[#75685F]">
            New orders for your approved menu items will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <article
              key={order.id}
              className="flex flex-col gap-4 rounded-2xl border border-[#E8DED3] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5"
            >
              {order.image ? (
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[#F5EFEA]">
                  <Image
                    src={order.image}
                    alt={order.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-[#FCE9E3] text-[#B34B31]">
                  <ClipboardList aria-hidden="true" className="size-6" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-[#30231B]">{order.name}</h2>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${statusClassNames[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#75685F]">
                  {order.customerName} · {formatPrice(order.price)}
                </p>
                <p className="mt-1 text-xs text-[#8B7D72]">
                  Delivery {order.deliveryDate} · Placed{" "}
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedOrder(order)}
                className="h-10 shrink-0 rounded-lg border-[#E8DED3] px-4 text-xs font-semibold text-[#55473D] hover:bg-[#FFF8F3]"
              >
                View details
              </Button>
            </article>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1B120E]/65 px-3 py-6 backdrop-blur-sm sm:px-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedOrder(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-detail-title"
            className="relative my-auto w-full max-w-xl rounded-3xl border border-[#E8DED3] bg-[#FFFAF5] p-5 shadow-2xl sm:p-7"
          >
            <button
              type="button"
              aria-label="Close order details"
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-[#75685F] transition hover:bg-[#F4ECE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B34B31]"
            >
              <X aria-hidden="true" className="size-4" />
            </button>

            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#A4442F]">
              Order details
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 pr-10">
              <h2
                id="order-detail-title"
                className="font-serif text-2xl font-bold text-[#30231B]"
              >
                {selectedOrder.name}
              </h2>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${statusClassNames[selectedOrder.status]}`}
              >
                {selectedOrder.status}
              </span>
            </div>

            <dl className="mt-6 grid gap-4 rounded-2xl border border-[#E8DED3] bg-white p-4 sm:grid-cols-2 sm:p-5">
              <div>
                <dt className="text-xs font-semibold text-[#8B7D72]">Customer</dt>
                <dd className="mt-1 text-sm font-medium text-[#30231B]">
                  {selectedOrder.customerName}
                </dd>
                <dd className="mt-0.5 break-all text-xs text-[#75685F]">
                  {selectedOrder.customerEmail}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#8B7D72]">Total</dt>
                <dd className="mt-1 text-sm font-bold text-[#B34B31]">
                  {formatPrice(selectedOrder.price)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#8B7D72]">
                  Delivery date
                </dt>
                <dd className="mt-1 text-sm text-[#30231B]">
                  {selectedOrder.deliveryDate}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#8B7D72]">
                  Delivery address
                </dt>
                <dd className="mt-1 flex items-start gap-1.5 text-sm text-[#30231B]">
                  <MapPin
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-[#B34B31]"
                  />
                  {selectedOrder.deliveryAddress}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-[#8B7D72]">
                  Special instructions
                </dt>
                <dd className="mt-1 text-sm text-[#30231B]">
                  {selectedOrder.specialInstructions || "None"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-[#8B7D72]">
                  Order placed
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm text-[#30231B]">
                  <Clock3 aria-hidden="true" className="size-4 text-[#A4442F]" />
                  {formatDate(selectedOrder.createdAt)}
                </dd>
              </div>
            </dl>

            {selectedOrder.status === "pending" ? (
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => decideOrder(selectedOrder, "reject")}
                  disabled={busyOrderId === selectedOrder.id}
                  className="h-11 rounded-xl border-red-200 px-5 text-sm font-bold text-red-700 hover:bg-red-50"
                >
                  {busyOrderId === selectedOrder.id ? (
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-4 animate-spin"
                    />
                  ) : (
                    <XCircle aria-hidden="true" className="size-4" />
                  )}
                  Reject
                </Button>
                <Button
                  type="button"
                  onClick={() => decideOrder(selectedOrder, "accept")}
                  disabled={busyOrderId === selectedOrder.id}
                  className="h-11 rounded-xl bg-[#B34B31] px-5 text-sm font-bold text-white hover:bg-[#963D29]"
                >
                  {busyOrderId === selectedOrder.id ? (
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-4 animate-spin"
                    />
                  ) : (
                    <Check aria-hidden="true" className="size-4" />
                  )}
                  Accept
                </Button>
              </div>
            ) : (
              <p className="mt-5 text-right text-xs font-medium text-[#75685F]">
                {selectedOrder.status === "cancelled"
                  ? "The customer cancelled this order."
                  : "This order has already been decided and cannot be changed."}
              </p>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

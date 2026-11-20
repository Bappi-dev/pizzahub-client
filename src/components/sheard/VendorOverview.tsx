"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Crown,
  LoaderCircle,
  Pizza,
  Utensils,
} from "lucide-react";

type OverviewData = {
  totalItems: number;
  activeItems: number;
  pendingOrders: number;
  acceptedOrders: number;
  plan: "free" | "premium";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(value: unknown, fallback: string) {
  return isRecord(value) && typeof value.error === "string"
    ? value.error
    : fallback;
}

function isOverviewData(value: unknown): value is OverviewData {
  return (
    isRecord(value) &&
    typeof value.totalItems === "number" &&
    typeof value.activeItems === "number" &&
    typeof value.pendingOrders === "number" &&
    typeof value.acceptedOrders === "number" &&
    (value.plan === "free" || value.plan === "premium")
  );
}

export default function VendorOverview() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOverview() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch("/api/vendor/overview", {
          signal: controller.signal,
        });
        const value: unknown = await response.json();

        if (!response.ok) {
          throw new Error(
            getErrorMessage(value, "Could not load your vendor overview."),
          );
        }
        if (!isOverviewData(value)) {
          throw new Error("The server returned invalid overview data.");
        }

        setOverview(value);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not load your vendor overview.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadOverview();
    return () => controller.abort();
  }, [reloadKey]);

  const metrics = overview
    ? [
        {
          label: "Total items",
          value: overview.totalItems,
          description: "All your menu items",
          href: "/dashboard/vendor/my-menu",
          icon: Utensils,
          color: "bg-[#FCE9E3] text-[#B34B31]",
        },
        {
          label: "Active items",
          value: overview.activeItems,
          description: "Approved and available",
          href: "/dashboard/vendor/my-menu",
          icon: BadgeCheck,
          color: "bg-green-50 text-green-700",
        },
        {
          label: "Pending orders",
          value: overview.pendingOrders,
          description: "Need your response",
          href: "/dashboard/vendor/customer",
          icon: Clock3,
          color: "bg-amber-50 text-amber-800",
        },
        {
          label: "Accepted orders",
          value: overview.acceptedOrders,
          description: "Orders you accepted",
          href: "/dashboard/vendor/customer",
          icon: CheckCircle2,
          color: "bg-blue-50 text-blue-700",
        },
      ]
    : [];

  return (
    <section className="mx-auto w-full max-w-6xl py-2 sm:py-4">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A4442F]">
            Vendor workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#30231B] sm:text-4xl">
            Overview
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#75685F]">
            A quick look at your menu, orders, and subscription.
          </p>
        </div>
        <Link
          href="/dashboard/vendor/add-menu"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#B34B31] px-5 text-sm font-bold text-white transition hover:bg-[#963D29] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B34B31] focus-visible:ring-offset-2"
        >
          <Pizza aria-hidden="true" className="size-4" />
          Add menu item
        </Link>
      </header>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
          <button
            type="button"
            onClick={() => setReloadKey((current) => current + 1)}
            className="font-semibold underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {isLoading ? (
        <div
          role="status"
          className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border border-[#E8DED3] bg-white text-sm text-[#75685F]"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-5 animate-spin text-[#B34B31]"
          />
          Loading your overview...
        </div>
      ) : (
        <>
          {overview && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {metrics.map(({ label, value, description, href, icon: Icon, color }) => (
                <Link
                  key={label}
                  href={href}
                  className="group rounded-2xl border border-[#E8DED3] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#D8C7B6] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B34B31]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`grid size-11 place-items-center rounded-xl ${color}`}
                    >
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 text-[#A69A8F] transition group-hover:text-[#B34B31]"
                    />
                  </div>
                  <p className="mt-5 text-sm font-medium text-[#75685F]">
                    {label}
                  </p>
                  <p
                    aria-live="polite"
                    className="mt-1 text-3xl font-extrabold tracking-tight text-[#30231B]"
                  >
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-[#8B7D72]">{description}</p>
                </Link>
              ))}

              <Link
                href="/dashboard/vendor/subscription"
                className="group rounded-2xl border border-[#E8DED3] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#D8C7B6] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B34B31]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`grid size-11 place-items-center rounded-xl ${
                      overview.plan === "premium"
                        ? "bg-[#FFF1D8] text-[#A96821]"
                        : "bg-[#F8F3ED] text-[#75685F]"
                    }`}
                  >
                    <Crown aria-hidden="true" className="size-5" />
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 text-[#A69A8F] transition group-hover:text-[#B34B31]"
                  />
                </div>
                <p className="mt-5 text-sm font-medium text-[#75685F]">
                  Subscription plan
                </p>
                <p className="mt-1 text-2xl font-extrabold capitalize tracking-tight text-[#30231B]">
                  {overview.plan}
                </p>
                <p className="mt-1 text-xs text-[#8B7D72]">
                  No menu item limit
                </p>
              </Link>
            </div>
          )}

          {!overview && !errorMessage && (
            <p className="rounded-xl border border-[#E8DED3] bg-white p-5 text-sm text-[#75685F]">
              Overview data is not available yet.
            </p>
          )}
        </>
      )}
    </section>
  );
}

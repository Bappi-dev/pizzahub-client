"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, Pizza } from "lucide-react";

import MenuCard from "@/components/sheard/MenuCard";
import { Button } from "@/components/ui/button";

type FeaturedMenuItem = {
  _id: string;
  name: string;
  itemImage: string;
  category: string;
  price: number;
  location: string;
  vendorName: string;
  premium?: boolean;
};

function isFeaturedMenuItem(value: unknown): value is FeaturedMenuItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item._id === "string" &&
    typeof item.name === "string" &&
    typeof item.itemImage === "string" &&
    typeof item.category === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    typeof item.location === "string" &&
    typeof item.vendorName === "string"
    &&
    (item.premium === undefined || typeof item.premium === "boolean")
  );
}

function parseFeaturedMenuItems(value: unknown): FeaturedMenuItem[] | null {
  if (!Array.isArray(value)) return null;

  const items: FeaturedMenuItem[] = [];
  for (const item of value.slice(0, 6)) {
    if (!isFeaturedMenuItem(item)) return null;
    items.push(item);
  }
  return items;
}

function getErrorMessage(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }
  return "Could not load featured menu items.";
}

export default function FeaturedMenu() {
  const [items, setItems] = useState<FeaturedMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeaturedItems() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
        const response = await fetch(`${apiBaseUrl}/menuItems`, {
          signal: controller.signal,
        });
        const result: unknown = await response.json();
        const featuredItems = parseFeaturedMenuItems(result);

        if (!response.ok) {
          throw new Error(getErrorMessage(result));
        }
        if (!featuredItems) {
          throw new Error("The server returned invalid featured menu data.");
        }

        setItems(featuredItems);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not load featured menu items.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadFeaturedItems();
    return () => controller.abort();
  }, [retryKey]);

  return (
    <section
      aria-labelledby="featured-menu-heading"
      className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20"
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5 sm:mb-10">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#B34B31]">
            <Pizza aria-hidden="true" className="size-4" />
            FROM LOCAL PIZZERIAS
          </p>
          <h2
            id="featured-menu-heading"
            className="font-serif text-3xl font-bold tracking-tight text-[#281E18] sm:text-4xl"
          >
            Menu Items
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#75685F] sm:text-base">
            Browse every approved and available item from local pizzerias.
          </p>
        </div>
        <Button
          variant="outline"
          render={<Link href="/menu" />}
          className="h-10 gap-2 rounded-xl border-[#E8DED3] px-4 font-bold text-[#8F321F] hover:bg-[#FFF5EE]"
        >
          Explore all
          <ArrowRight
            aria-hidden="true"
            className="size-4"
            data-icon="inline-end"
          />
        </Button>
      </div>

      {isLoading ? (
        <div
          role="status"
          className="flex items-center justify-center gap-2 py-16 text-sm font-medium text-[#75685F]"
        >
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          Loading featured menu items...
        </div>
      ) : errorMessage ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center"
        >
          <p className="text-sm font-semibold text-red-800">{errorMessage}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setRetryKey((current) => current + 1)}
            className="mt-4 rounded-lg border-red-300 bg-white text-red-800 hover:bg-red-100"
          >
            Try again
          </Button>
        </div>
      ) : items.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <MenuCard key={item._id} menu={{ ...item, premium: item.premium }} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#D8C8BA] bg-[#FBF7F2] px-6 py-12 text-center">
          <p className="font-serif text-xl text-[#332923]">
            No featured items yet
          </p>
          <p className="mt-1 text-sm text-[#777068]">
            Approved and available menu items will appear here.
          </p>
        </div>
      )}
    </section>
  );
}

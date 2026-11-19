"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Crown,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type SubscriptionInfo = {
  plan: "free" | "premium";
  premiumPrice: {
    amount: number | null;
    currency: string;
    interval: string;
  } | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(value: unknown, fallback: string) {
  return isRecord(value) && typeof value.error === "string"
    ? value.error
    : fallback;
}

function isSubscriptionInfo(value: unknown): value is SubscriptionInfo {
  return (
    isRecord(value) &&
    (value.plan === "free" || value.plan === "premium") &&
    (value.premiumPrice === null ||
      (isRecord(value.premiumPrice) &&
        (typeof value.premiumPrice.amount === "number" ||
          value.premiumPrice.amount === null) &&
        typeof value.premiumPrice.currency === "string" &&
        typeof value.premiumPrice.interval === "string"))
  );
}

function formatPrice(
  amount: number | null,
  currency: string,
  interval: string,
) {
  if (amount === null) return `Stripe price · ${interval}`;

  return `${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100)} / ${interval}`;
}

const freeFeatures = [
  "Up to 3 pending, submitted, or active menu items",
  "ImgBB photo uploads",
  "Customer order management",
];

const premiumFeatures = [
  "Unlimited pending, submitted, and active menu items",
  "ImgBB photo uploads",
  "Customer order management",
  "Subscription managed securely by Stripe",
];

export default function VendorSubscription({
  checkoutState,
}: {
  checkoutState: "success" | "cancelled" | null;
}) {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    async function loadSubscription() {
      try {
        const response = await fetch("/api/subscription", {
          signal: controller.signal,
        });
        const value: unknown = await response.json();
        if (!response.ok) {
          throw new Error(
            getErrorMessage(value, "Could not load subscription details."),
          );
        }
        if (!isSubscriptionInfo(value)) {
          throw new Error("The server returned invalid subscription details.");
        }

        setSubscription(value);
        setErrorMessage(null);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not load subscription details.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadSubscription();
    return () => controller.abort();
  }, []);

  async function startCheckout() {
    setIsStartingCheckout(true);
    try {
      const response = await fetch("/api/subscription", { method: "POST" });
      const value: unknown = await response.json();
      if (!response.ok) {
        throw new Error(
          getErrorMessage(value, "Could not start Premium checkout."),
        );
      }
      if (!isRecord(value) || typeof value.url !== "string") {
        throw new Error("Stripe did not return a checkout URL.");
      }

      window.location.assign(value.url);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not start Premium checkout.",
      );
      setIsStartingCheckout(false);
    }
  }

  const currentPlan = subscription?.plan ?? "free";
  const price = subscription?.premiumPrice;

  return (
    <section className="mx-auto w-full max-w-6xl py-2 sm:py-4">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A4442F]">
          Vendor workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#30231B] sm:text-4xl">
          Subscription
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#75685F]">
          Compare plans and choose the item limit that fits your restaurant.
          Premium checkout is handled securely by Stripe.
        </p>
      </header>

      {checkoutState === "success" && (
        <div
          role="status"
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          <span>
            Checkout completed. Stripe is confirming your subscription; refresh
            this page shortly if your plan has not updated.
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
            className="h-9 rounded-lg border-green-300 bg-white text-green-800 hover:bg-green-100"
          >
            Refresh status
          </Button>
        </div>
      )}
      {checkoutState === "cancelled" && (
        <p className="mb-6 rounded-xl border border-[#E8DED3] bg-white px-4 py-3 text-sm text-[#75685F]">
          Checkout was cancelled. Your current plan has not changed.
        </p>
      )}
      {errorMessage && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </p>
      )}

      <div className="grid items-stretch gap-5 lg:grid-cols-2">
        <article className="flex flex-col rounded-3xl border border-[#E8DED3] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#75685F]">Free</p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#30231B]">
                $0
                <span className="ml-1 text-sm font-medium text-[#8B7D72]">
                  / always
                </span>
              </h2>
            </div>
            <span className="grid size-12 place-items-center rounded-2xl bg-[#F8F3ED] text-[#75685F]">
              <ShieldCheck aria-hidden="true" className="size-6" />
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#75685F]">
            Get started and serve a few neighborhood favorites.
          </p>
          <ul className="mt-6 flex-1 space-y-3">
            {freeFeatures.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-sm text-[#55473D]"
              >
                <Check
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-[#4D8A59]"
                />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || currentPlan === "free"}
            className="mt-8 h-12 rounded-xl border-[#E8DED3] text-sm font-bold text-[#55473D]"
          >
            {currentPlan === "free" ? "Current plan" : "Free plan"}
          </Button>
        </article>

        <article className="relative flex flex-col overflow-hidden rounded-3xl border border-[#C85A3F] bg-[#FFF9F3] p-6 shadow-[0_20px_55px_-35px_rgba(179,75,49,0.65)] sm:p-8">
          <div className="absolute right-0 top-0 rounded-bl-2xl bg-[#B34B31] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
            More room to grow
          </div>
          <div className="flex items-start justify-between gap-4 pt-5">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-[#A4442F]">
                <Crown aria-hidden="true" className="size-4" />
                Premium
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-[#30231B]">
                {price
                  ? formatPrice(price.amount, price.currency, price.interval)
                  : "Stripe pricing"}
              </h2>
            </div>
            <span className="grid size-12 place-items-center rounded-2xl bg-[#FCE9E3] text-[#B34B31]">
              <Sparkles aria-hidden="true" className="size-6" />
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#75685F]">
            Grow your menu without worrying about the item cap.
          </p>
          <ul className="mt-6 flex-1 space-y-3">
            {premiumFeatures.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-sm text-[#55473D]"
              >
                <Check
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-[#B34B31]"
                />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            type="button"
            onClick={startCheckout}
            disabled={
              isLoading ||
              isStartingCheckout ||
              currentPlan === "premium" ||
              checkoutState === "success"
            }
            className="mt-8 h-12 rounded-xl bg-[#B34B31] text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(179,75,49,0.75)] hover:bg-[#963D29]"
          >
            {isStartingCheckout ? (
              <>
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
                Opening secure checkout...
              </>
            ) : currentPlan === "premium" ? (
              "Current plan"
            ) : (
              "Upgrade to Premium"
            )}
          </Button>
          <p className="mt-3 text-center text-[11px] text-[#8B7D72]">
            Secure recurring billing is processed by Stripe.
          </p>
        </article>
      </div>
    </section>
  );
}

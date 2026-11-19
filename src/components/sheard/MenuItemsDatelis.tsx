"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  Pizza,
  Star,
  Store,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { isDashboardRole } from "@/lib/dashboard-roles";
import type { MenuItemDetails } from "@/lib/menu-item";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

export default function MenuItemsDatelis({
  item,
}: {
  item: MenuItemDetails;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(item.images[0]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const today = new Date();
  const todayDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const role = isDashboardRole(session?.user.role)
    ? session.user?.role
    : undefined;
  const isApproved = item.approvalStatus?.toLowerCase() === "approved";
  const isActive = item.status?.toLowerCase() === "active";
  const isOrderable = isApproved && isActive;
  const canOrder = role === "customer" && isOrderable;
  const price = formatPrice(item.price);

  async function handleOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const customerId = session?.user.id;
    if (!canOrder || !customerId) {
      toast.error("This item is not available for your account.");
      return;
    }

    if (!deliveryDate || deliveryDate < todayDate) {
      toast.error("Choose today or a future delivery date.");
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error("Enter a delivery address.");
      return;
    }

    setIsSavingOrder(true);
    try {
      const response = await fetch("/api/customer-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuItemId: item.id,
          deliveryDate,
          deliveryAddress: deliveryAddress.trim(),
          specialInstructions: specialInstructions.trim() || undefined,
        }),
      });

      let result: unknown;
      try {
        result = await response.json();
      } catch {
        throw new Error("The server returned an invalid order response.");
      }

      if (!response.ok) {
        throw new Error(
          typeof result === "object" &&
            result !== null &&
            "error" in result &&
            typeof result.error === "string"
            ? result.error
            : "Could not place your order.",
        );
      }

      toast.success("Order sent to the restaurant.", {
        description: "You can track its status on your customer dashboard.",
      });
      router.push("/dashboard/customer");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not save your order.",
      );
    } finally {
      setIsSavingOrder(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1B120E]/65 px-3 py-4 backdrop-blur-sm sm:px-6 sm:py-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-detail-title"
        className="relative mx-auto max-h-[calc(100dvh-2rem)] w-full max-w-4xl overflow-y-auto rounded-xl border border-[#E8DED3] bg-[#FFFAF5] p-5 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-6"
      >
        <Link
          href="/menu"
          aria-label="Close item details"
          className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-full text-[#5D5047] transition hover:bg-[#F4ECE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B34B31] sm:right-5 sm:top-5"
        >
          <X aria-hidden="true" className="size-4" />
        </Link>

        <div className="mb-4 flex flex-col items-start gap-3 pr-10">
          <span className="grid size-8 place-items-center rounded-lg bg-[#C9432D] text-white">
            <Pizza aria-hidden="true" className="size-4" />
          </span>
          <h1
            id="menu-detail-title"
            className="font-serif text-3xl leading-tight text-[#281E18]"
          >
            Your next favorite
          </h1>
        </div>


        <div className="grid gap-6 lg:grid-cols-[0.82fr_1fr]">
          <div className="min-w-0">
            <div className="relative aspect-[1.05] overflow-hidden rounded-lg bg-[#F1E7DE] sm:aspect-[1.2] lg:aspect-[0.72]">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={item.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-sm text-[#88796D]">
                  <span className="flex flex-col items-center gap-2">
                    <Pizza aria-hidden="true" className="size-9 text-[#B34B31]" />
                    Image unavailable
                  </span>
                </div>
              )}
            </div>

            {item.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {item.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={selectedImage === image}
                    onClick={() => setSelectedImage(image)}
                    className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      selectedImage === image
                        ? "border-[#B34B31]"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0">
            {item.category && (
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#B34B31]">
                {item.category}
              </p>
            )}
            <h2 className="mt-2 font-serif text-3xl leading-tight tracking-tight text-[#281E18]">
              {item.name}
            </h2>

            {item.rating !== undefined && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                <span
                  aria-label={`${item.rating.toFixed(1)} out of 5 stars`}
                  className="flex items-center gap-0.5 text-[#D97921]"
                >
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      aria-hidden="true"
                      className="size-3 fill-current"
                    />
                  ))}
                </span>
                <span className="font-semibold text-[#4D4037]">
                  {item.rating.toFixed(1)}
                </span>
                {item.reviewCount !== undefined && (
                  <span className="text-[#8A7B70]">
                    · {item.reviewCount}+ local reviews
                  </span>
                )}
              </div>
            )}

            <p className="mt-1 text-xs leading-5 text-[#665B52]">
              {item.description || "A local favorite, made fresh to order."}
            </p>

            <div className="mt-2 space-y-2">
              {item.location && (
                <p className="flex items-center gap-2 text-[10px] text-[#665B52]">
                  <MapPin
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-[#B34B31]"
                  />
                  {item.location}
                </p>
              )}
              <p className="flex items-center gap-2 text-[10px] text-[#665B52]">
                {item.vendorName ? (
                  <>
                    <BadgeCheck
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-[#B34B31]"
                    />
                    {item.vendorName}
                  </>
                ) : (
                  <>
                    <Store
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-[#B34B31]"
                    />
                    Vendor details unavailable
                  </>
                )}
              </p>
            </div>

            <div className="my-4 border-t border-[#E8DED3]" />

            <div className="flex items-baseline gap-2">
              <p className="font-serif text-2xl text-[#281E18]">
                {price}
              </p>
              <p className="text-[10px] text-[#8A7B70]">made fresh to order</p>
            </div>

            {canOrder ? (
              <form className="mt-3 space-y-2" onSubmit={handleOrder}>
                <label className="block space-y-1 text-[10px] font-semibold text-[#4D4037]">
                  Delivery date
                  <span className="relative block">
                    <input
                      id="delivery-date"
                      name="deliveryDate"
                      required
                      type="date"
                      min={todayDate}
                      value={deliveryDate}
                      onChange={(event) => setDeliveryDate(event.target.value)}
                      className="h-9 w-full rounded-lg border border-[#E3D5C9] bg-white px-3 text-xs font-normal text-[#332923] outline-none focus:border-[#B34B31] focus:ring-3 focus:ring-[#B34B31]/10"
                    />
                  </span>
                </label>

                <label className="block space-y-1 text-[10px] font-semibold text-[#4D4037]">
                  Delivery address
                  <input
                    id="delivery-address"
                    name="deliveryAddress"
                    required
                    autoComplete="street-address"
                    maxLength={200}
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    placeholder="Street, apartment, city"
                    className="h-9 w-full rounded-lg border border-[#E3D5C9] bg-white px-3 text-xs font-normal text-[#332923] outline-none placeholder:text-[#A59B91] focus:border-[#B34B31] focus:ring-3 focus:ring-[#B34B31]/10"
                  />
                </label>

                <label className="block space-y-1 text-[10px] font-semibold text-[#4D4037]">
                  Special instructions
                  <span className="block text-[10px] font-normal text-[#8A7B70]">
                    optional
                  </span>
                  <textarea
                    id="special-instructions"
                    name="specialInstructions"
                    rows={2}
                    maxLength={300}
                    value={specialInstructions}
                    onChange={(event) =>
                      setSpecialInstructions(event.target.value)
                    }
                    placeholder="Extra crispy, please..."
                    className="w-full resize-y rounded-lg border border-[#E3D5C9] bg-white px-3 py-2 text-xs font-normal text-[#332923] outline-none placeholder:text-[#A59B91] focus:border-[#B34B31] focus:ring-3 focus:ring-[#B34B31]/10"
                  />
                </label>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSavingOrder}
                  className="h-12 w-full rounded-lg bg-[#C9432D] text-xs font-bold text-white hover:bg-[#A93422]"
                >
                  {isSavingOrder ? "Saving order..." : `Place order · ${price}`}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4"
                    data-icon="inline-end"
                  />
                </Button>
                <p className="text-[9px] leading-4 text-[#8A7B70]">
                  The restaurant will review your order. No payment is taken.
                </p>
              </form>
            ) : (
              <div className="mt-4 rounded-lg border border-[#E8DED3] bg-white p-4">
                <p className="text-sm font-semibold text-[#332923]">
                  {isPending
                    ? "Checking your account..."
                    : !session
                      ? "Sign in as a customer to order"
                      : role !== "customer"
                        ? "Only customer accounts can place orders"
                        : "This item is not available to order"}
                </p>
                {!isPending && !session && (
                  <Link
                    href="/sign-in"
                    className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-[#D8C7B6] px-3 text-xs font-semibold text-[#963D29] hover:bg-[#FBF3EB]"
                  >
                    Sign in to continue
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

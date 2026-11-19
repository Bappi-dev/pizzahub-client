"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleDollarSign,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Pizza,
  Sparkles,
  Tag,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const categories = [
  "Classic Pizzas",
  "Vegetarian Pizzas",
  "Meat Lovers",
  "Specialty / Gourmet Pizzas",
  "Sides & Appetizers",
  "Beverages & Desserts",
];

const inputClassName =
  "h-12 w-full rounded-xl border border-[#E8DED3] bg-white px-4 text-sm text-[#30231B] outline-none transition placeholder:text-[#A69A8F] focus:border-[#B34B31] focus:ring-4 focus:ring-[#B34B31]/10";

function getErrorMessage(value: unknown, fallback: string) {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }

  return fallback;
}

function isImageUploadResponse(
  value: unknown,
): value is { imageUrl: string } {
  if (
    typeof value !== "object" ||
    value === null ||
    !("imageUrl" in value) ||
    typeof value.imageUrl !== "string"
  ) {
    return false;
  }

  return value.imageUrl.startsWith("https://");
}

type MenuPlanUsage = {
  plan: "free" | "premium";
  activeItems: number;
  limit: number | null;
};

function isMenuPlanUsage(value: unknown): value is MenuPlanUsage {
  return (
    typeof value === "object" &&
    value !== null &&
    "plan" in value &&
    (value.plan === "free" || value.plan === "premium") &&
    "activeItems" in value &&
    typeof value.activeItems === "number" &&
    "limit" in value &&
    (typeof value.limit === "number" || value.limit === null)
  );
}

export default function VendorWorkspaceForm() {
  const [itemName, setItemName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [submissionStep, setSubmissionStep] = useState<
    "uploading" | "saving" | null
  >(null);
  const [imageFailed, setImageFailed] = useState(false);
  const imagePreviewUrlRef = useRef<string | null>(null);
  const [menuPlanUsage, setMenuPlanUsage] = useState<MenuPlanUsage | null>(null);
  const [isLoadingPlanUsage, setIsLoadingPlanUsage] = useState(true);
  const [planUsageError, setPlanUsageError] = useState<string | null>(null);

  const isSubmitting = submissionStep !== null;
  const hasPreview = Boolean(imagePreviewUrl) && !imageFailed;
  const hasReachedFreeLimit =
    menuPlanUsage?.plan === "free" &&
    menuPlanUsage.limit !== null &&
    menuPlanUsage.activeItems >= menuPlanUsage.limit;

  useEffect(() => {
    const controller = new AbortController();

    async function loadMenuPlanUsage() {
      try {
        const response = await fetch("/api/menu-items", {
          signal: controller.signal,
        });
        const value: unknown = await response.json();

        if (!response.ok) {
          throw new Error(
            getErrorMessage(value, "Could not check your plan usage."),
          );
        }

        if (!isMenuPlanUsage(value)) {
          throw new Error("The server returned invalid plan usage.");
        }

        setMenuPlanUsage(value);
        setPlanUsageError(null);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;

        setPlanUsageError(
          error instanceof Error
            ? error.message
            : "Could not check your plan usage.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingPlanUsage(false);
        }
      }
    }

    void loadMenuPlanUsage();
    return () => controller.abort();
  }, []);

  useEffect(
    () => () => {
      if (imagePreviewUrlRef.current) {
        URL.revokeObjectURL(imagePreviewUrlRef.current);
      }
    },
    [],
  );

  function updateImageSelection(file: File | null) {
    if (imagePreviewUrlRef.current) {
      URL.revokeObjectURL(imagePreviewUrlRef.current);
    }

    const previewUrl = file ? URL.createObjectURL(file) : null;
    imagePreviewUrlRef.current = previewUrl;
    setImageFile(file);
    setImagePreviewUrl(previewUrl);
    setImageFailed(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!imageFile) {
      toast.error("Choose an image file to upload.");
      return;
    }

    setSubmissionStep("uploading");

    try {
      const uploadData = new FormData();
      uploadData.append("image", imageFile);

      const uploadResponse = await fetch("/api/upload-image", {
        method: "POST",
        body: uploadData,
      });

      let uploadResult: unknown;
      try {
        uploadResult = await uploadResponse.json();
      } catch {
        throw new Error("ImgBB returned an invalid upload response.");
      }

      if (!uploadResponse.ok) {
        throw new Error(
          getErrorMessage(uploadResult, "Could not upload the image to ImgBB."),
        );
      }

      if (!isImageUploadResponse(uploadResult)) {
        throw new Error("ImgBB did not return a valid image URL.");
      }

      setSubmissionStep("saving");
      const response = await fetch("/api/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemImage: uploadResult.imageUrl,
          name: itemName.trim(),
          category,
          price: Number(price),
          location: location.trim(),
        }),
      });

      let saveResult: unknown;
      try {
        saveResult = await response.json();
      } catch {
        throw new Error("The server returned an invalid menu item response.");
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            saveResult,
            `The server returned an error (${response.status}).`,
          ),
        );
      }

      if (!isMenuPlanUsage(saveResult)) {
        throw new Error("The server returned invalid plan usage.");
      }

      setMenuPlanUsage(saveResult);
      toast.success("Menu item submitted for review.", {
        description: `${itemName.trim()} is pending approval. Its image is hosted on ImgBB.`,
      });
      form.reset();
      setItemName("");
      updateImageSelection(null);
      setCategory("");
      setPrice("");
      setLocation("");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not add this menu item. Please try again.",
      );
    } finally {
      setSubmissionStep(null);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl py-2 sm:py-4">
      <header className="mb-7 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#F0D8C8] bg-white px-3 py-1.5 text-xs font-semibold text-[#A4442F] shadow-sm">
            <span className="grid size-5 place-items-center rounded-full bg-[#FCE9E3]">
              <Pizza aria-hidden="true" className="size-3" />
            </span>
            VENDOR WORKSPACE
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#30231B] sm:text-4xl">
            Add a menu item
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#75685F] sm:text-base">
            Share a fresh favorite with your neighborhood. Add the details below
            to put it on your menu.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#75685F]">
          <span className="grid size-8 place-items-center rounded-full bg-[#EAF4EA] text-[#3F7A49]">
            <Check aria-hidden="true" className="size-4" />
          </span>
          New items are submitted for approval
        </div>
      </header>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#E8DED3] bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[#30231B]">
            {menuPlanUsage?.plan === "premium" ? "Premium plan" : "Free plan"}
          </p>
          <p className="mt-1 text-xs leading-5 text-[#75685F]">
            {menuPlanUsage?.plan === "premium"
              ? "Unlimited menu items."
              : "Pending and active items count toward your 3-item limit."}
          </p>
          {planUsageError && (
            <p role="alert" className="mt-1 text-xs text-red-700">
              {planUsageError}
            </p>
          )}
        </div>
        <p className="text-sm font-semibold text-[#A4442F]">
          {isLoadingPlanUsage
            ? "Checking plan..."
            : menuPlanUsage?.plan === "premium"
              ? `${menuPlanUsage.activeItems} items submitted`
              : `${menuPlanUsage?.activeItems ?? 0}/3 items used`}
        </p>
        {hasReachedFreeLimit && (
          <div className="flex flex-wrap items-center gap-3">
            <p role="alert" className="text-sm font-semibold text-red-700">
              Free plan limit reached.
            </p>
            <Link
              href="/dashboard/vendor/subscription"
              className="text-sm font-bold text-[#A4442F] underline underline-offset-4 hover:text-[#7E2D20]"
            >
              Upgrade to Premium
            </Link>
          </div>
        )}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <form
          onSubmit={handleSubmit}
          aria-busy={isSubmitting}
          className="rounded-3xl border border-[#E8DED3] bg-white p-5 shadow-[0_16px_50px_-35px_rgba(67,43,28,0.45)] sm:p-8"
        >
          <div className="mb-7 flex items-center gap-3 border-b border-[#F0E9E2] pb-5">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#FCE9E3] text-[#B34B31]">
              <UtensilsCrossed aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold text-[#30231B]">Item details</h2>
              <p className="mt-0.5 text-xs text-[#8B7D72]">
                Fields marked with * are required
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="item-image"
                className="text-sm font-semibold text-[#44382F]"
              >
                Item image <span className="text-[#B34B31]">*</span>
              </label>
              <div className="relative">
                <input
                  id="item-image"
                  name="itemImage"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  required
                  aria-describedby="image-hint"
                  onChange={(event) =>
                    updateImageSelection(event.currentTarget.files?.[0] ?? null)
                  }
                  className="peer sr-only"
                />
                <label
                  htmlFor="item-image"
                  className="flex min-h-20 cursor-pointer items-center gap-4 rounded-xl border border-dashed border-[#D8C7B6] bg-[#FFFCF9] px-4 py-4 transition hover:border-[#B34B31] hover:bg-[#FFF8F3] peer-focus-visible:ring-4 peer-focus-visible:ring-[#B34B31]/15"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#FCE9E3] text-[#B34B31]">
                    <ImagePlus aria-hidden="true" className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#44382F]">
                      {imageFile?.name || "Choose an image file"}
                    </span>
                    <span className="mt-1 block text-xs text-[#8B7D72]">
                      JPEG, PNG, WebP or GIF · up to 32 MB
                    </span>
                  </span>
                  <span className="shrink-0 rounded-lg border border-[#E8DED3] bg-white px-3 py-2 text-xs font-semibold text-[#A4442F]">
                    Browse
                  </span>
                </label>
              </div>
              <p id="image-hint" className="text-xs leading-5 text-[#8B7D72]">
                Your file is uploaded to ImgBB when you add this menu item.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="item-name"
                className="text-sm font-semibold text-[#44382F]"
              >
                Item name <span className="text-[#B34B31]">*</span>
              </label>
              <div className="relative">
                <Pizza
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#9A8B80]"
                />
                <input
                  id="item-name"
                  name="name"
                  type="text"
                  value={itemName}
                  onChange={(event) => setItemName(event.target.value)}
                  placeholder="e.g. Garden Margherita"
                  required
                  maxLength={100}
                  className={`${inputClassName} pl-11`}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="item-category"
                  className="text-sm font-semibold text-[#44382F]"
                >
                  Category <span className="text-[#B34B31]">*</span>
                </label>
                <div className="relative">
                  <Tag
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#9A8B80]"
                  />
                  <select
                    id="item-category"
                    name="category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                    className={`${inputClassName} appearance-none pl-11 pr-10`}
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((itemCategory) => (
                      <option key={itemCategory} value={itemCategory}>
                        {itemCategory}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#8B7D72]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="item-price"
                  className="text-sm font-semibold text-[#44382F]"
                >
                  Price <span className="text-[#B34B31]">*</span>
                </label>
                <div className="relative">
                  <CircleDollarSign
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#9A8B80]"
                  />
                  <input
                    id="item-price"
                    name="price"
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="0.00"
                    required
                    className={`${inputClassName} pl-11`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="item-location"
                className="text-sm font-semibold text-[#44382F]"
              >
                Restaurant area / city{" "}
                <span className="text-[#B34B31]">*</span>
              </label>
              <div className="relative">
                <MapPin
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#9A8B80]"
                />
                <input
                  id="item-location"
                  name="location"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="e.g. Dhanmondi, Dhaka"
                  required
                  maxLength={120}
                  className={`${inputClassName} pl-11`}
                />
              </div>
              <p className="text-xs leading-5 text-[#8B7D72]">
                Add the neighborhood and city so nearby customers can find you.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#F0E9E2] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-[#8B7D72]">
              Double-check your details before publishing.
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={
                isSubmitting || isLoadingPlanUsage || hasReachedFreeLimit
              }
              className="h-12 rounded-xl bg-[#B34B31] px-6 text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(179,75,49,0.75)] transition hover:bg-[#963D29]"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                  {submissionStep === "uploading"
                    ? "Uploading image..."
                    : "Saving item..."}
                </>
              ) : (
                <>
                  Submit for review
                  <ArrowRight
                    aria-hidden="true"
                    data-icon="inline-end"
                    className="size-4"
                  />
                </>
              )}
            </Button>
          </div>
        </form>

        <aside className="overflow-hidden rounded-3xl border border-[#E8DED3] bg-[#FFFDFB] shadow-[0_16px_50px_-35px_rgba(67,43,28,0.45)] lg:sticky lg:top-8">
          <div className="flex items-center gap-3 border-b border-[#F0E9E2] px-5 py-5 sm:px-6">
            <span className="grid size-10 place-items-center rounded-xl bg-[#FFF1D8] text-[#A96821]">
              <Sparkles aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#30231B]">Live preview</h2>
              <p className="mt-0.5 text-xs text-[#8B7D72]">
                Updates as you fill in the form
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <article className="overflow-hidden rounded-2xl border border-[#E8DED3] bg-white shadow-sm">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#F5EFEA]">
                {hasPreview && imagePreviewUrl ? (
                  <Image
                    src={imagePreviewUrl}
                    alt={`Preview of ${itemName || "your menu item"}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 320px"
                    className="object-cover"
                    unoptimized
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#9A8B80]">
                    <span className="grid size-14 place-items-center rounded-2xl bg-white text-[#B34B31] shadow-sm">
                      <ImagePlus aria-hidden="true" className="size-6" />
                    </span>
                    <span className="text-xs font-medium">
                      Your item image will appear here
                    </span>
                  </div>
                )}
                {category && (
                  <span className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#A4442F] shadow-sm">
                    {category}
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 break-words font-serif text-lg leading-tight text-[#30231B]">
                    {itemName.trim() || "Your item name"}
                  </h3>
                  <p className="shrink-0 text-base font-extrabold text-[#B34B31]">
                    ${price ? Number(price).toFixed(2) : "0.00"}
                  </p>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-[#777068]">
                  <MapPin
                    aria-hidden="true"
                    className="size-3.5 text-[#B34B31]"
                  />
                  {location.trim() || "Restaurant area / city"}
                </p>
              </div>
            </article>

            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#F8F3ED] p-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-[#B34B31]">
                <Check aria-hidden="true" className="size-4" />
              </span>
              <p className="text-xs leading-5 text-[#75685F]">
                A clear photo and accurate location help hungry neighbors
                choose your restaurant.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

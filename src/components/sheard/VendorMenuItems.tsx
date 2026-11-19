"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Clock3,
  LoaderCircle,
  MapPin,
  Pencil,
  Pizza,
  Plus,
  Trash2,
  X,
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
  "h-11 w-full rounded-xl border border-[#E8DED3] bg-white px-3 text-sm text-[#30231B] outline-none transition placeholder:text-[#A69A8F] focus:border-[#B34B31] focus:ring-4 focus:ring-[#B34B31]/10";

type VendorMenuItem = {
  id: string;
  name: string;
  itemImage: string;
  category: string;
  price: number;
  location: string;
  status: string;
  approvalStatus: string;
};

type MenuPlanUsage = {
  plan: "free" | "premium";
  activeItems: number;
  limit: number | null;
};

type ItemDraft = {
  name: string;
  itemImage: string;
  category: string;
  price: string;
  location: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(value: unknown, fallback: string) {
  if (
    isRecord(value) &&
    typeof value.error === "string"
  ) {
    return value.error;
  }
  return fallback;
}

function isMenuPlanUsage(value: unknown): value is MenuPlanUsage & {
  items: VendorMenuItem[];
} {
  return (
    isRecord(value) &&
    (value.plan === "free" || value.plan === "premium") &&
    typeof value.activeItems === "number" &&
    (typeof value.limit === "number" || value.limit === null) &&
    Array.isArray(value.items) &&
    value.items.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.itemImage === "string" &&
        typeof item.category === "string" &&
        typeof item.price === "number" &&
        typeof item.location === "string" &&
        typeof item.status === "string" &&
        typeof item.approvalStatus === "string",
    )
  );
}

function isImgBBUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "ibb.co" || url.hostname.endsWith(".ibb.co"))
    );
  } catch {
    return false;
  }
}

function isMenuItem(value: unknown): value is VendorMenuItem {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.itemImage === "string" &&
    typeof value.category === "string" &&
    typeof value.price === "number" &&
    typeof value.location === "string" &&
    typeof value.status === "string" &&
    typeof value.approvalStatus === "string"
  );
}

function getItemState(item: VendorMenuItem) {
  const status = item.status.toLowerCase();
  const approvalStatus = item.approvalStatus.toLowerCase();

  if (status === "rejected" || approvalStatus === "rejected") {
    return { label: "Rejected", style: "bg-red-50 text-red-700" };
  }
  if (approvalStatus !== "approved") {
    return { label: "Pending review", style: "bg-amber-50 text-amber-800" };
  }
  return status === "active"
    ? { label: "Available", style: "bg-green-50 text-green-700" }
    : { label: "Unavailable", style: "bg-stone-100 text-stone-700" };
}

function countsTowardLimit(item: VendorMenuItem) {
  return (
    ["pending", "submitted", "active"].includes(item.status.toLowerCase()) &&
    item.approvalStatus.toLowerCase() !== "rejected"
  );
}

export default function VendorMenuItems() {
  const [items, setItems] = useState<VendorMenuItem[]>([]);
  const [planUsage, setPlanUsage] = useState<MenuPlanUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ItemDraft | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadItems() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch("/api/menu-items", {
          signal: controller.signal,
        });
        const value: unknown = await response.json();

        if (!response.ok) {
          throw new Error(getErrorMessage(value, "Could not load your menu items."));
        }
        if (!isMenuPlanUsage(value)) {
          throw new Error("The server returned invalid menu item data.");
        }

        setItems(value.items);
        setPlanUsage({
          plan: value.plan,
          activeItems: value.activeItems,
          limit: value.limit,
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not load your menu items.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadItems();
    return () => controller.abort();
  }, [reloadKey]);

  function startEditing(item: VendorMenuItem) {
    setEditingId(item.id);
    setDraft({
      name: item.name,
      itemImage: item.itemImage,
      category: item.category,
      price: String(item.price),
      location: item.location,
    });
    setEditImageFile(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setDraft(null);
    setEditImageFile(null);
  }

  async function saveItem(
    event: FormEvent<HTMLFormElement>,
    item: VendorMenuItem,
  ) {
    event.preventDefault();
    if (!draft) return;

    setSavingId(item.id);
    try {
      let itemImage = draft.itemImage;

      if (editImageFile) {
        const uploadData = new FormData();
        uploadData.append("image", editImageFile);
        const uploadResponse = await fetch("/api/upload-image", {
          method: "POST",
          body: uploadData,
        });
        const uploadResult: unknown = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(
            getErrorMessage(
              uploadResult,
              "Could not upload the image to ImgBB.",
            ),
          );
        }
        if (!isRecord(uploadResult) || !isImgBBUrl(uploadResult.imageUrl)) {
          throw new Error("ImgBB did not return a valid image URL.");
        }
        itemImage = uploadResult.imageUrl;
      }

      const response = await fetch(`/api/menu-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          ...draft,
          itemImage,
          price: Number(draft.price),
        }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, "Could not update this item."),
        );
      }
      if (!isMenuItem(result)) {
        throw new Error("The server returned invalid menu item data.");
      }

      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? result : entry)),
      );
      setPlanUsage((current) =>
        current
          ? {
              ...current,
              activeItems:
                countsTowardLimit(item) || !countsTowardLimit(result)
                  ? current.activeItems
                  : current.activeItems + 1,
            }
          : current,
      );
      toast.success(
        getItemState(item).label === "Rejected"
          ? "Item updated and resubmitted for review."
          : "Menu item updated.",
      );
      cancelEditing();
      setReloadKey((current) => current + 1);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not update this item.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function toggleAvailability(item: VendorMenuItem) {
    const available = item.status.toLowerCase() !== "active";
    setBusyId(item.id);

    try {
      const response = await fetch(`/api/menu-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "availability", available }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, "Could not update item availability."),
        );
      }
      if (
        !isRecord(result) ||
        typeof result.status !== "string" ||
        result.status !== (available ? "active" : "inactive")
      ) {
        throw new Error("The server returned an invalid availability status.");
      }

      const status = result.status;
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, status } : entry,
        ),
      );
      setReloadKey((current) => current + 1);
      toast.success(available ? "Item is now available." : "Item is unavailable.");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update item availability.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteItem(item: VendorMenuItem) {
    if (!window.confirm(`Delete "${item.name}" from your menu?`)) return;
    setBusyId(item.id);

    try {
      const response = await fetch(`/api/menu-items/${item.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result: unknown = await response.json();
        throw new Error(getErrorMessage(result, "Could not delete this item."));
      }

      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (countsTowardLimit(item)) {
        setPlanUsage((current) =>
          current
            ? { ...current, activeItems: Math.max(0, current.activeItems - 1) }
            : current,
        );
      }
      if (editingId === item.id) cancelEditing();
      toast.success("Menu item deleted.");
      setReloadKey((current) => current + 1);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete this item.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl py-2 sm:py-4">
      <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A4442F]">
            Vendor workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#30231B] sm:text-4xl">
            My Menu Items
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#75685F]">
            Edit your menu, remove items, or manage availability. Rejected items
            are only visible here.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[#E8DED3] bg-white px-4 py-3 text-sm font-semibold text-[#6D5E53] shadow-sm">
          <Pizza aria-hidden="true" className="size-4 text-[#B34B31]" />
          {planUsage?.plan === "premium"
            ? `${planUsage.activeItems} items · Premium`
            : `${planUsage?.activeItems ?? 0}/3 items · Free`}
        </div>
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
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1].map((skeleton) => (
            <div
              key={skeleton}
              className="h-52 animate-pulse rounded-2xl border border-[#E8DED3] bg-white"
            />
          ))}
        </div>
      ) : items.length === 0 && !errorMessage ? (
        <div className="rounded-3xl border border-dashed border-[#D8C7B6] bg-white px-6 py-14 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#FCE9E3] text-[#B34B31]">
            <Pizza aria-hidden="true" className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-[#30231B]">
            Your menu is waiting
          </h2>
          <p className="mt-2 text-sm text-[#75685F]">
            Add your first item to start sharing your menu.
          </p>
          <Button
            type="button"
            render={<Link href="/dashboard/vendor/add-menu" />}
            className="mt-5 h-11 rounded-xl bg-[#B34B31] px-5 text-sm font-bold text-white hover:bg-[#963D29]"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add menu item
          </Button>
        </div>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-2">
          {items.map((item) => {
            const itemState = getItemState(item);
            const isEditing = editingId === item.id && draft !== null;
            const canManageAvailability =
              item.approvalStatus.toLowerCase() === "approved" &&
              item.status.toLowerCase() !== "rejected";
            const isBusy = busyId === item.id || savingId === item.id;

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-[#E8DED3] bg-white shadow-[0_12px_36px_-26px_rgba(67,43,28,0.5)]"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-[#F5EFEA] sm:aspect-auto sm:min-h-56 sm:w-44">
                    <Image
                      src={item.itemImage}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 176px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${itemState.style}`}
                        >
                          {itemState.label === "Pending review" ? (
                            <Clock3 aria-hidden="true" className="size-3" />
                          ) : (
                            <Check aria-hidden="true" className="size-3" />
                          )}
                          {itemState.label}
                        </span>
                        <h2 className="mt-2 break-words font-serif text-xl font-bold text-[#30231B]">
                          {item.name}
                        </h2>
                      </div>
                      <p className="shrink-0 text-lg font-extrabold text-[#B34B31]">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    <p className="mt-2 text-xs font-semibold text-[#8B7D72]">
                      {item.category}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-[#75685F]">
                      <MapPin
                        aria-hidden="true"
                        className="size-3.5 text-[#B34B31]"
                      />
                      {item.location}
                    </p>

                    {isEditing && draft ? (
                      <form
                        onSubmit={(event) => saveItem(event, item)}
                        className="mt-5 space-y-3 border-t border-[#F0E9E2] pt-5"
                      >
                        <input
                          aria-label="Item name"
                          value={draft.name}
                          onChange={(event) =>
                            setDraft({ ...draft, name: event.target.value })
                          }
                          maxLength={100}
                          required
                          className={inputClassName}
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <select
                            aria-label="Category"
                            value={draft.category}
                            onChange={(event) =>
                              setDraft({ ...draft, category: event.target.value })
                            }
                            required
                            className={inputClassName}
                          >
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                          <input
                            aria-label="Price"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={draft.price}
                            onChange={(event) =>
                              setDraft({ ...draft, price: event.target.value })
                            }
                            required
                            className={inputClassName}
                          />
                        </div>
                        <input
                          aria-label="Restaurant area or city"
                          value={draft.location}
                          onChange={(event) =>
                            setDraft({ ...draft, location: event.target.value })
                          }
                          maxLength={120}
                          required
                          className={inputClassName}
                        />
                        <label className="block rounded-xl border border-dashed border-[#D8C7B6] bg-[#FFFCF9] px-3 py-3 text-xs text-[#75685F]">
                          Replace item photo (optional)
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={(event) =>
                              setEditImageFile(
                                event.currentTarget.files?.[0] ?? null,
                              )
                            }
                            className="mt-2 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#FCE9E3] file:px-3 file:py-2 file:font-semibold file:text-[#A4442F]"
                          />
                        </label>
                        {editImageFile && (
                          <p className="truncate text-xs text-[#75685F]">
                            Selected: {editImageFile.name}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="submit"
                            disabled={isBusy}
                            className="h-10 rounded-lg bg-[#B34B31] px-4 text-xs font-bold text-white hover:bg-[#963D29]"
                          >
                            {isBusy ? (
                              <LoaderCircle
                                aria-hidden="true"
                                className="size-4 animate-spin"
                              />
                            ) : (
                              <Check aria-hidden="true" className="size-4" />
                            )}
                            Save changes
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={cancelEditing}
                            className="h-10 rounded-lg px-4 text-xs font-semibold"
                          >
                            <X aria-hidden="true" className="size-4" />
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-5 flex flex-wrap gap-2 border-t border-[#F0E9E2] pt-5">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => startEditing(item)}
                          disabled={isBusy}
                          className="h-10 rounded-lg border-[#E8DED3] px-3 text-xs font-semibold text-[#55473D] hover:bg-[#FFF8F3]"
                        >
                          <Pencil aria-hidden="true" className="size-3.5" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => toggleAvailability(item)}
                          disabled={!canManageAvailability || isBusy}
                          className="h-10 rounded-lg border-[#E8DED3] px-3 text-xs font-semibold text-[#55473D] hover:bg-[#FFF8F3]"
                        >
                          {isBusy ? (
                            <LoaderCircle
                              aria-hidden="true"
                              className="size-3.5 animate-spin"
                            />
                          ) : item.status.toLowerCase() === "active" ? (
                            "Mark unavailable"
                          ) : (
                            "Mark available"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => deleteItem(item)}
                          disabled={isBusy}
                          className="h-10 rounded-lg border-red-200 px-3 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          <Trash2 aria-hidden="true" className="size-3.5" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

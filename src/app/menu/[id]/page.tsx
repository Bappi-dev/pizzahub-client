import { Suspense } from "react";
import { notFound } from "next/navigation";

import MenuItemsDatelis from "@/components/sheard/MenuItemsDatelis";
import { parseMenuItemDetails } from "@/lib/menu-item";

export default function MenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<MenuItemLoading />}>
      <MenuItemDetailsPage params={params} />
    </Suspense>
  );
}

async function MenuItemDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await fetch(
    `http://localhost:5000/menuItems/${encodeURIComponent(id)}`,
    { cache: "no-store" },
  );

  if (response.status === 404) notFound();
  if (!response.ok) {
    throw new Error(`Could not load menu item (${response.status})`);
  }

  const data: unknown = await response.json();
  const item = parseMenuItemDetails(data);

  if (!item) notFound();

  return <MenuItemsDatelis item={item} />;
}

function MenuItemLoading() {
  return (
    <div
      role="status"
      className="fixed inset-0 z-50 grid place-items-center bg-[#1B120E]/65 px-4"
    >
      <div className="flex items-center gap-3 rounded-xl bg-[#FFFAF5] px-5 py-4 text-sm font-medium text-[#5D5047] shadow-xl">
        <span className="size-5 animate-spin rounded-full border-2 border-[#E8D4C4] border-t-[#B34B31]" />
        Loading item details...
      </div>
    </div>
  );
}

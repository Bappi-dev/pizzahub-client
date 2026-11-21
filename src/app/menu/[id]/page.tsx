import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { ObjectId } from "mongodb";

import MenuItemsDatelis from "@/components/sheard/MenuItemsDatelis";
import { db } from "@/lib/auth";
import { parseMenuItemDetails } from "@/lib/menu-item";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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
  if (!/^[\da-f]{24}$/i.test(id)) notFound();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const menuItem = await db.collection("menu").findOne({
    _id: new ObjectId(id),
    approvalStatus: "approved",
    status: "active",
  });
  if (!menuItem) notFound();

  const item = parseMenuItemDetails({
    ...menuItem,
    _id: menuItem._id.toString(),
  });
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

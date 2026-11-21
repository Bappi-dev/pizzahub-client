import { db } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = (url.searchParams.get("search") ?? "").trim().toLowerCase();
  const category = (url.searchParams.get("category") ?? "").trim().toLowerCase();
  const location = (url.searchParams.get("location") ?? "").trim().toLowerCase();
  const sort = (url.searchParams.get("sort") ?? "").toLowerCase();

  const items = await db
    .collection("menu")
    .find({
      approvalStatus: "approved",
      status: "active",
      name: { $type: "string", $ne: "" },
      itemImage: { $type: "string", $ne: "" },
      category: { $type: "string", $ne: "" },
      location: { $type: "string", $ne: "" },
      price: { $type: "number", $gt: 0 },
    })
    .sort({ createdAt: -1 })
    .toArray();

  const normalizeCategory = (value: unknown) =>
    String(value ?? "")
      .toLowerCase()
      .replace(/&/g, "/")
      .replace(/\s+/g, " ")
      .trim();

  const filtered = items.filter((item) => {
    const searchable = `${item.name ?? ""} ${item.category ?? ""} ${item.location ?? ""}`.toLowerCase();
    return (
      (!search || searchable.includes(search)) &&
      (!category || normalizeCategory(item.category).replace(/\s*\/\s*/g, "/") === normalizeCategory(category).replace(/\s*\/\s*/g, "/")) &&
      (!location || String(item.location ?? "").toLowerCase() === location)
    );
  });
  if (sort === "price-asc") filtered.sort((a, b) => Number(a.price) - Number(b.price));
  if (sort === "price-desc") filtered.sort((a, b) => Number(b.price) - Number(a.price));

  const vendorIds = Array.from(
    new Set(
      filtered
        .map((item) => typeof item.vendorId === "string" ? item.vendorId : "")
        .filter(Boolean),
    ),
  );
  const vendorIdentities: Record<string, unknown>[] = vendorIds.map((id) => ({ id }));
  for (const id of vendorIds) {
    if (/^[\da-f]{24}$/i.test(id)) vendorIdentities.push({ _id: new ObjectId(id) });
  }
  const vendors = vendorIds.length
    ? await db.collection("user").find({ $or: vendorIdentities }).toArray()
    : [];
  const premiumVendorIds = new Set(
    vendors
      .filter((user) => user.plan === "premium" || user.subscriptionPlan === "premium")
      .map((user) => user.id ?? user._id?.toString()),
  );

  return Response.json(
    filtered.map((item) => ({
      _id: item._id.toString(),
      name: item.name,
      itemImage: item.itemImage,
      category: item.category,
      price: item.price,
      location: item.location,
      vendorName:
        typeof item.vendorName === "string" && item.vendorName.trim()
          ? item.vendorName.trim()
          : "Local restaurant",
      premium: typeof item.vendorId === "string" && premiumVendorIds.has(item.vendorId),
    })),
  );
}

import { db } from "@/lib/auth";

export async function GET() {
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

  return Response.json(
    items.map((item) => ({
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
    })),
  );
}

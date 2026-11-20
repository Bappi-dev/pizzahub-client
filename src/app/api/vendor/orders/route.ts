import { headers } from "next/headers";
import { ObjectId, type Document } from "mongodb";

import { auth, db } from "@/lib/auth";

function serializeOrder(order: Document) {
  const menuItemId =
    order.menuItemId instanceof ObjectId
      ? order.menuItemId.toString()
      : typeof order.menuItemId === "string"
        ? order.menuItemId
        : undefined;
  const price = Number(order.price);
  const deliveryDate =
    order.deliveryDate instanceof Date
      ? order.deliveryDate.toISOString().slice(0, 10)
      : typeof order.deliveryDate === "string"
        ? order.deliveryDate
        : undefined;

  return {
    id: order._id.toString(),
    ...(menuItemId ? { menuItemId } : {}),
    ...(typeof order.customerName === "string"
      ? { customerName: order.customerName }
      : {}),
    ...(typeof order.customerEmail === "string"
      ? { customerEmail: order.customerEmail }
      : {}),
    ...(typeof order.vendorId === "string" ? { vendorId: order.vendorId } : {}),
    ...(typeof order.vendorName === "string"
      ? { vendorName: order.vendorName }
      : {}),
    ...(typeof order.name === "string" ? { name: order.name } : {}),
    ...(typeof order.image === "string" ? { image: order.image } : {}),
    ...(Number.isFinite(price) ? { price } : {}),
    ...(deliveryDate !== undefined ? { deliveryDate } : {}),
    ...(typeof order.deliveryAddress === "string"
      ? { deliveryAddress: order.deliveryAddress }
      : {}),
    ...(typeof order.specialInstructions === "string"
      ? { specialInstructions: order.specialInstructions }
      : {}),
    ...(typeof order.status === "string" ? { status: order.status } : {}),
    createdAt:
      order.createdAt instanceof Date
        ? order.createdAt.toISOString()
        : String(order.createdAt ?? ""),
  };
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Sign in to view customer orders." }, { status: 401 });
  }
  if (session.user.role !== "vendor") {
    return Response.json(
      { error: "Only vendors can view customer orders." },
      { status: 403 },
    );
  }

  const orders = await db
    .collection("oder")
    .find({ vendorId: session.user.id })
    .sort({ createdAt: -1 })
    .toArray();

  return Response.json({ orders: orders.map(serializeOrder) });
}

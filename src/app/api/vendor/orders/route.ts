import { headers } from "next/headers";
import type { Document } from "mongodb";

import { auth, db } from "@/lib/auth";

function serializeOrder(order: Document) {
  return {
    id: order._id.toString(),
    menuItemId: order.menuItemId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    vendorId: order.vendorId,
    vendorName: order.vendorName,
    name: order.name,
    image: order.image,
    price: order.price,
    deliveryDate: order.deliveryDate,
    deliveryAddress: order.deliveryAddress,
    specialInstructions: order.specialInstructions,
    status: order.status,
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

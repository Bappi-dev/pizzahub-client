import { headers } from "next/headers";
import { ObjectId, type Document } from "mongodb";

import { auth, db } from "@/lib/auth";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function serializeOrder(order: Document) {
  return {
    id: order._id.toString(),
    menuItemId: order.menuItemId,
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

async function getCustomerSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Sign in to view your orders.", status: 401 as const };
  }
  if (session.user.role !== "customer") {
    return {
      error: "Only customer accounts can access customer orders.",
      status: 403 as const,
    };
  }

  return { session };
}

export async function GET() {
  const result = await getCustomerSession();
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const orders = await db
    .collection("oder")
    .find({ customerId: result.session.user.id })
    .sort({ createdAt: -1 })
    .toArray();

  return Response.json({ orders: orders.map(serializeOrder) });
}

export async function POST(request: Request) {
  const result = await getCustomerSession();
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  let value: unknown;
  try {
    value = await request.json();
  } catch {
    return Response.json({ error: "Enter valid order details." }, { status: 400 });
  }

  if (!isRecord(value)) {
    return Response.json({ error: "Enter valid order details." }, { status: 400 });
  }

  const menuItemId =
    typeof value.menuItemId === "string" ? value.menuItemId : "";
  const deliveryDate =
    typeof value.deliveryDate === "string" ? value.deliveryDate : "";
  const deliveryAddress =
    typeof value.deliveryAddress === "string" ? value.deliveryAddress : "";
  const specialInstructions = value.specialInstructions;

  if (
    !/^[\da-f]{24}$/i.test(menuItemId) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate) ||
    !deliveryAddress.trim() ||
    deliveryAddress.length > 200 ||
    (specialInstructions !== undefined &&
      (typeof specialInstructions !== "string" ||
        specialInstructions.length > 300))
  ) {
    return Response.json(
      { error: "Check the menu item, delivery date, and address." },
      { status: 400 },
    );
  }

  const item = await db.collection("menu").findOne({
    _id: new ObjectId(menuItemId),
    status: "active",
    approvalStatus: "approved",
  });
  if (!item) {
    return Response.json(
      { error: "This menu item is not available to order." },
      { status: 409 },
    );
  }
  if (typeof item.vendorId !== "string" || !item.vendorId) {
    return Response.json(
      { error: "This menu item is missing its restaurant details." },
      { status: 409 },
    );
  }

  const deliveryDay = new Date(`${deliveryDate}T00:00:00.000Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (
    Number.isNaN(deliveryDay.getTime()) ||
    deliveryDay.toISOString().slice(0, 10) !== deliveryDate ||
    deliveryDay < today
  ) {
    return Response.json(
      { error: "Choose today or a future delivery date." },
      { status: 400 },
    );
  }

  const order = {
    customerId: result.session.user.id,
    customerName: result.session.user.name,
    customerEmail: result.session.user.email,
    vendorId: item.vendorId,
    vendorName:
      typeof item.vendorName === "string" ? item.vendorName : "Local restaurant",
    menuItemId: item._id.toString(),
    name: item.name,
    image: item.itemImage,
    price: Number(item.price),
    deliveryDate,
    deliveryAddress: deliveryAddress.trim(),
    specialInstructions:
      typeof value.specialInstructions === "string"
        ? value.specialInstructions.trim() || undefined
        : undefined,
    status: "pending",
    createdAt: new Date(),
  };

  const inserted = await db.collection("oder").insertOne(order);
  return Response.json(
    { order: serializeOrder({ ...order, _id: inserted.insertedId }) },
    { status: 201 },
  );
}

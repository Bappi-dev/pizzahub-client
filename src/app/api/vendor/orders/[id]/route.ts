import { headers } from "next/headers";
import { ObjectId } from "mongodb";

import { auth, db } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json(
      { error: "Sign in to update customer orders." },
      { status: 401 },
    );
  }
  if (session.user.blocked === true) {
    return Response.json({ error: "This account is blocked." }, { status: 403 });
  }
  if (session.user.role !== "vendor") {
    return Response.json(
      { error: "Only vendors can update customer orders." },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  if (!/^[\da-f]{24}$/i.test(id)) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }

  let value: unknown;
  try {
    value = await request.json();
  } catch {
    return Response.json({ error: "Choose Accept or Reject." }, { status: 400 });
  }
  if (
    typeof value !== "object" ||
    value === null ||
    !("action" in value) ||
    (value.action !== "accept" && value.action !== "reject")
  ) {
    return Response.json({ error: "Choose Accept or Reject." }, { status: 400 });
  }

  const status = value.action === "accept" ? "accepted" : "rejected";
  const orderCollection = db.collection("oder");
  const orderFilter = {
    _id: new ObjectId(id),
    vendorId: session.user.id,
    status: "pending",
  };
  const update = await orderCollection.updateOne(
    orderFilter,
    status === "rejected"
      ? {
          $set: { status, decidedAt: new Date(), updatedAt: new Date() },
          $unset: { activeOrderKey: "" },
        }
      : {
          $set: { status, decidedAt: new Date(), updatedAt: new Date() },
        },
  );

  if (update.matchedCount === 0) {
    const existing = await orderCollection.findOne({
      _id: new ObjectId(id),
      vendorId: session.user.id,
    });
    if (!existing) {
      return Response.json({ error: "Order not found." }, { status: 404 });
    }

    return Response.json(
      { error: "This order has already been accepted or rejected." },
      { status: 409 },
    );
  }

  return Response.json({ id, status });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json(
      { error: "Sign in to delete customer orders." },
      { status: 401 },
    );
  }
  if (session.user.blocked === true) {
    return Response.json({ error: "This account is blocked." }, { status: 403 });
  }
  if (session.user.role !== "vendor") {
    return Response.json(
      { error: "Only vendors can delete customer orders." },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  if (!/^[\da-f]{24}$/i.test(id)) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }

  const result = await db.collection("oder").deleteOne({
    _id: new ObjectId(id),
    vendorId: session.user.id,
  });
  if (result.deletedCount === 0) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }

  return Response.json({ id });
}

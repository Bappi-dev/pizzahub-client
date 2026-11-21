import { headers } from "next/headers";
import { ObjectId } from "mongodb";

import { auth, db } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json(
      { error: "Sign in to cancel your order." },
      { status: 401 },
    );
  }
  if (session.user.blocked === true) {
    return Response.json({ error: "This account is blocked." }, { status: 403 });
  }
  if (session.user.role !== "customer") {
    return Response.json(
      { error: "Only customers can cancel customer orders." },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  if (!/^[\da-f]{24}$/i.test(id)) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }

  const orderCollection = db.collection("oder");
  const update = await orderCollection.updateOne(
    {
      _id: new ObjectId(id),
      customerId: session.user.id,
      status: "pending",
    },
    {
      $set: {
        status: "cancelled",
        cancelledAt: new Date(),
        updatedAt: new Date(),
      },
      $unset: { activeOrderKey: "" },
    },
  );

  if (update.matchedCount === 0) {
    const existing = await orderCollection.findOne({
      _id: new ObjectId(id),
      customerId: session.user.id,
    });
    if (!existing) {
      return Response.json({ error: "Order not found." }, { status: 404 });
    }

    return Response.json(
      { error: "Only pending orders can be cancelled." },
      { status: 409 },
    );
  }

  return Response.json({ id, status: "cancelled" });
}

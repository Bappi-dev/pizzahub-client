import { headers } from "next/headers";

import { auth, db } from "@/lib/auth";
import { getPlan } from "@/lib/vendor-menu";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json(
      { error: "Sign in to view your vendor overview." },
      { status: 401 },
    );
  }
  if (session.user.role !== "vendor") {
    return Response.json(
      { error: "Only vendors can view this overview." },
      { status: 403 },
    );
  }

  const vendorId = session.user.id;
  const [totalItems, activeItems, pendingOrders, acceptedOrders] =
    await Promise.all([
      db.collection("menu").countDocuments({ vendorId }),
      db.collection("menu").countDocuments({
        vendorId,
        status: "active",
        approvalStatus: "approved",
      }),
      db.collection("oder").countDocuments({ vendorId, status: "pending" }),
      db.collection("oder").countDocuments({ vendorId, status: "accepted" }),
    ]);

  return Response.json({
    totalItems,
    activeItems,
    pendingOrders,
    acceptedOrders,
    plan: getPlan(session.user),
  });
}

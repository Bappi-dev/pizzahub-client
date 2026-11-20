import { headers } from "next/headers";
import { ObjectId } from "mongodb";

import { auth, db } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Sign in to manage menu items.", status: 401 as const };
  if (session.user.role !== "admin") {
    return { error: "Only admins can manage menu items.", status: 403 as const };
  }
  return { session };
}

export async function PATCH(request: Request, context: RouteContext) {
  const access = await requireAdmin();
  if ("error" in access) {
    return Response.json({ error: access.error }, { status: access.status });
  }
  const { id } = await context.params;
  if (!/^[\da-f]{24}$/i.test(id)) {
    return Response.json({ error: "Menu item not found." }, { status: 404 });
  }
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    return Response.json({ error: "Enter a valid menu action." }, { status: 400 });
  }
  if (typeof value !== "object" || value === null) {
    return Response.json({ error: "Enter a valid menu action." }, { status: 400 });
  }

  const menu = db.collection("menu");
  let update: Record<string, unknown> | null = null;
  if ("approvalStatus" in value) {
    const approvalStatus = String(value.approvalStatus).toLowerCase();
    if (approvalStatus === "approved") {
      update = { approvalStatus: "approved", status: "active", updatedAt: new Date() };
    } else if (approvalStatus === "rejected") {
      update = { approvalStatus: "rejected", status: "rejected", updatedAt: new Date() };
    }
  } else if ("status" in value) {
    const status = String(value.status).toLowerCase();
    if (status === "active" || status === "inactive") {
      update = { status, updatedAt: new Date() };
    }
  }
  if (!update) {
    return Response.json({ error: "Unsupported menu item action." }, { status: 400 });
  }

  const updated = await menu.updateOne({ _id: new ObjectId(id) }, { $set: update });
  if (!updated.matchedCount) {
    return Response.json({ error: "Menu item not found." }, { status: 404 });
  }
  return Response.json({ id, ...update });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const access = await requireAdmin();
  if ("error" in access) {
    return Response.json({ error: access.error }, { status: access.status });
  }
  const { id } = await context.params;
  if (!/^[\da-f]{24}$/i.test(id)) {
    return Response.json({ error: "Menu item not found." }, { status: 404 });
  }
  const deleted = await db.collection("menu").deleteOne({ _id: new ObjectId(id) });
  if (!deleted.deletedCount) {
    return Response.json({ error: "Menu item not found." }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}

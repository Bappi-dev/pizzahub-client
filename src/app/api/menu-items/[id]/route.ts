import { ObjectId, type Document } from "mongodb";

import { db, mongoClient } from "@/lib/auth";
import {
  getImgBBImageUrl,
  getVendorMenuSession,
} from "@/lib/vendor-menu";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UnknownRecord = Record<string, unknown>;

class MenuItemNotFoundError extends Error {}
class RejectedMenuItemError extends Error {}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function isRejected(item: Document) {
  return (
    String(item.status ?? "").toLowerCase() === "rejected" ||
    String(item.approvalStatus ?? "").toLowerCase() === "rejected"
  );
}

function serializeItem(item: Document) {
  return {
    id: item._id.toString(),
    name: item.name,
    itemImage: item.itemImage,
    category: item.category,
    price: item.price,
    location: item.location,
    status: item.status,
    approvalStatus: item.approvalStatus,
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  const result = await getVendorMenuSession();
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const { id } = await context.params;
  if (!/^[\da-f]{24}$/i.test(id)) {
    return Response.json({ error: "Menu item not found." }, { status: 404 });
  }

  let value: unknown;
  try {
    value = await request.json();
  } catch {
    return Response.json({ error: "Enter valid menu item details." }, { status: 400 });
  }

  if (!isRecord(value)) {
    return Response.json({ error: "Enter valid menu item details." }, { status: 400 });
  }

  const menuCollection = db.collection("menu");
  const itemId = new ObjectId(id);
  const ownerFilter = {
    _id: itemId,
    vendorId: result.session.user.id,
  };

  if (value.action === "availability") {
    if (typeof value.available !== "boolean") {
      return Response.json(
        { error: "Choose whether this item is available." },
        { status: 400 },
      );
    }

    const nextStatus = value.available ? "active" : "inactive";
    try {
      await mongoClient.withSession(async (mongoSession) => {
        await mongoSession.withTransaction(async () => {
          const item = await menuCollection.findOne(ownerFilter, {
            session: mongoSession,
          });
          if (!item) throw new MenuItemNotFoundError();
          if (isRejected(item)) throw new RejectedMenuItemError();

          await menuCollection.updateOne(
            ownerFilter,
            {
              $set: {
                status: nextStatus,
                ...(value.available ? { approvalStatus: "approved" } : {}),
                updatedAt: new Date(),
              },
            },
            { session: mongoSession },
          );
        });
      });
    } catch (error: unknown) {
      if (error instanceof MenuItemNotFoundError) {
        return Response.json({ error: "Menu item not found." }, { status: 404 });
      }
      if (error instanceof RejectedMenuItemError) {
        return Response.json(
          { error: "Rejected items cannot be made available." },
          { status: 409 },
        );
      }
      throw error;
    }

    return Response.json({ id, status: nextStatus });
  }

  if (value.action !== "edit") {
    return Response.json({ error: "Unsupported menu item action." }, { status: 400 });
  }

  const name = typeof value.name === "string" ? value.name.trim() : "";
  const category =
    typeof value.category === "string" ? value.category.trim() : "";
  const location =
    typeof value.location === "string" ? value.location.trim() : "";
  const itemImage = getImgBBImageUrl(value.itemImage);
  const price = value.price;

  if (
    !name ||
    name.length > 100 ||
    !category ||
    !location ||
    location.length > 120 ||
    !itemImage ||
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    return Response.json(
      { error: "Check the image, name, category, price, and location." },
      { status: 400 },
    );
  }

  let updatedItem: Document | null = null;
  try {
    await mongoClient.withSession(async (mongoSession) => {
      await mongoSession.withTransaction(async () => {
        const currentItem = await menuCollection.findOne(ownerFilter, {
          session: mongoSession,
        });
        if (!currentItem) throw new MenuItemNotFoundError();

        const update: Document = {
          name,
          category,
          location,
          itemImage,
          price,
          updatedAt: new Date(),
        };

        if (isRejected(currentItem)) {
          update.status = "pending";
          update.approvalStatus = "pending";
        }

        await menuCollection.updateOne(
          ownerFilter,
          { $set: update },
          { session: mongoSession },
        );
        updatedItem = await menuCollection.findOne(ownerFilter, {
          session: mongoSession,
        });
      });
    });
  } catch (error: unknown) {
    if (error instanceof MenuItemNotFoundError) {
      return Response.json({ error: "Menu item not found." }, { status: 404 });
    }
    throw error;
  }

  if (!updatedItem) {
    return Response.json(
      { error: "Could not update the menu item." },
      { status: 500 },
    );
  }

  return Response.json(serializeItem(updatedItem));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const result = await getVendorMenuSession();
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const { id } = await context.params;
  if (!/^[\da-f]{24}$/i.test(id)) {
    return Response.json({ error: "Menu item not found." }, { status: 404 });
  }

  const deletion = await db.collection("menu").deleteOne({
    _id: new ObjectId(id),
    vendorId: result.session.user.id,
  });
  if (deletion.deletedCount === 0) {
    return Response.json({ error: "Menu item not found." }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}

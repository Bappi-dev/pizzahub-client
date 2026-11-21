import { db, mongoClient } from "@/lib/auth";
import {
  getImgBBImageUrl,
  getPlan,
  getVendorMenuSession,
} from "@/lib/vendor-menu";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

export async function GET() {
  const result = await getVendorMenuSession();
  if ("error" in result) {
    return Response.json(
      { error: result.error },
      { status: result.status },
    );
  }

  const plan = getPlan(result.session.user);
  const itemFilter = {
    vendorId: result.session.user.id,
    status: "active",
    approvalStatus: "approved",
  };
  const [activeItems, items] = await Promise.all([
    db.collection("menu").countDocuments(itemFilter),
    db
      .collection("menu")
      .find({ vendorId: result.session.user.id })
      .sort({ createdAt: -1 })
      .toArray(),
  ]);

  return Response.json({
    plan,
    activeItems,
    limit: plan === "premium" ? null : 3,
    items: items.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      itemImage: item.itemImage,
      category: item.category,
      price: item.price,
      location: item.location,
      status: item.status,
      approvalStatus: item.approvalStatus,
    })),
  });
}

export async function POST(request: Request) {
  const result = await getVendorMenuSession();
  if ("error" in result) {
    return Response.json(
      { error: result.error },
      { status: result.status },
    );
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

  const name = typeof value.name === "string" ? value.name.trim() : "";
  const category =
    typeof value.category === "string" ? value.category.trim() : "";
  const location =
    typeof value.location === "string" ? value.location.trim() : "";
  const description =
    typeof value.description === "string" ? value.description.trim() : "";
  const itemImage = getImgBBImageUrl(value.itemImage);
  const price = value.price;

  if (
    !name ||
    name.length > 100 ||
    !category ||
    !location ||
    location.length > 120 ||
    !description ||
    description.length > 500 ||
    !itemImage ||
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    return Response.json(
      { error: "Check the image, name, description, category, price, and location." },
      { status: 400 },
    );
  }

  const plan = getPlan(result.session.user);
  const menuCollection = db.collection("menu");
  const itemFilter = {
    vendorId: result.session.user.id,
    status: "active",
    approvalStatus: "approved",
  };
  let activeItems = 0;
  let itemId = "";

  try {
    await mongoClient.withSession(async (mongoSession) => {
      await mongoSession.withTransaction(async () => {
        const currentCount = await menuCollection.countDocuments(itemFilter, {
          session: mongoSession,
        });
        if (plan === "free" && currentCount >= 3) {
          throw new Error("FREE_PLAN_LIMIT");
        }

        const inserted = await menuCollection.insertOne(
          {
            itemImage,
            name,
            category,
            price,
            location,
            description,
            vendorId: result.session.user.id,
            vendorName: result.session.user.name,
            status: "pending",
            approvalStatus: "pending",
            createdAt: new Date(),
          },
          { session: mongoSession },
        );

        itemId = inserted.insertedId.toString();
        activeItems = currentCount;
      });
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "FREE_PLAN_LIMIT") {
      return Response.json(
        {
          error:
            "Free plan allows up to 3 active menu items. Upgrade to Premium for unlimited active items.",
        },
        { status: 409 },
      );
    }
    throw error;
  }

  return Response.json(
  {
    itemId,
    status: "pending",
    approvalStatus: "pending",
    plan,
    activeItems: activeItems,
    limit: plan === "premium" ? null : 3,
  },
  { status: 201 },
  );
}

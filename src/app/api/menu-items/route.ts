import { db, mongoClient } from "@/lib/auth";
import {
  getImgBBImageUrl,
  getPlan,
  getVendorMenuSession,
  submittedStatuses,
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
    status: { $in: submittedStatuses },
    approvalStatus: { $not: /^rejected$/i },
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
    limit: null,
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

  const plan = getPlan(result.session.user);
  const menuCollection = db.collection("menu");
  const itemFilter = {
    vendorId: result.session.user.id,
    status: { $in: submittedStatuses },
    approvalStatus: { $not: /^rejected$/i },
  };
  let activeItems = 0;
  let itemId = "";

  await mongoClient.withSession(async (mongoSession) => {
    await mongoSession.withTransaction(async () => {
      const currentCount = await menuCollection.countDocuments(itemFilter, {
        session: mongoSession,
      });

      const inserted = await menuCollection.insertOne(
        {
          itemImage,
          name,
          category,
          price,
          location,
          vendorId: result.session.user.id,
          vendorName: result.session.user.name,
          status: "active",
          approvalStatus: "approved",
          createdAt: new Date(),
        },
        { session: mongoSession },
      );

      itemId = inserted.insertedId.toString();
      activeItems = currentCount + 1;
    });
  });

  return Response.json(
    {
      itemId,
      status: "active",
      plan,
      activeItems,
      limit: null,
    },
    { status: 201 },
  );
}

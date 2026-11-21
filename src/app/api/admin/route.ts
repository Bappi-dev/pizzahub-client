import { headers } from "next/headers";
import type { Document } from "mongodb";

import { auth, db } from "@/lib/auth";

function serializeDate(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return "";
}

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Sign in to access the admin dashboard.", status: 401 as const };
  }
  if (session.user.blocked === true) {
    return { error: "This account is blocked.", status: 403 as const };
  }
  if (session.user.role !== "admin") {
    return { error: "Only admins can access this workspace.", status: 403 as const };
  }
  return { session };
}

function serializeUser(user: Document) {
  return {
    id: user._id?.toString() ?? user.id?.toString() ?? "",
    name: typeof user.name === "string" ? user.name : "Unknown user",
    email: typeof user.email === "string" ? user.email : "",
    role: typeof user.role === "string" ? user.role : "customer",
    plan:
      user.subscriptionPlan === "premium" || user.plan === "premium"
        ? "premium"
        : "free",
    blocked: Boolean(user.blocked),
    createdAt: serializeDate(user.createdAt),
  };
}

export async function GET(request: Request) {
  const access = await requireAdmin();
  if ("error" in access) {
    return Response.json({ error: access.error }, { status: access.status });
  }

  const resource = new URL(request.url).searchParams.get("resource") ?? "overview";

  if (resource === "overview") {
    const [totalUsers, vendors, customers, menuItems, pendingItems, transactions] =
      await Promise.all([
        db.collection("user").countDocuments({}),
        db.collection("user").countDocuments({ role: "vendor" }),
        db.collection("user").countDocuments({ role: "customer" }),
        db.collection("menu").countDocuments({}),
        db.collection("menu").countDocuments({
          $or: [
            { approvalStatus: /^pending$/i },
            { status: /^pending$/i },
          ],
        }),
        db.collection("transactions").countDocuments({}),
      ]);

    const recentTransactions = await db
      .collection("transactions")
      .find({})
      .sort({ createdAt: -1 })
      .limit(7)
      .toArray();
    const chart = recentTransactions
      .filter((transaction) => typeof transaction.amount === "number")
      .map((transaction) => ({
        date: serializeDate(transaction.createdAt).slice(0, 10),
        amount: transaction.amount,
      }));

    return Response.json({
      totals: {
        users: totalUsers,
        vendors,
        customers,
        menuItems,
        pendingItems,
        transactions,
      },
      chart,
    });
  }

  if (resource === "users") {
    const users = await db
      .collection("user")
      .find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();
    return Response.json({ users: users.map(serializeUser) });
  }

  if (resource === "menu") {
    const items = await db
      .collection("menu")
      .find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();
    return Response.json({
      items: items.map((item) => ({
        id: item._id.toString(),
        name: typeof item.name === "string" ? item.name : "",
        itemImage: typeof item.itemImage === "string" ? item.itemImage : "",
        category: typeof item.category === "string" ? item.category : "",
        price: Number(item.price) || 0,
        location: typeof item.location === "string" ? item.location : "",
        vendorName:
          typeof item.vendorName === "string" ? item.vendorName : "Unknown vendor",
        status: typeof item.status === "string" ? item.status : "inactive",
        approvalStatus:
          typeof item.approvalStatus === "string"
            ? item.approvalStatus
            : "pending",
        createdAt: serializeDate(item.createdAt),
      })),
    });
  }

  if (resource === "transactions") {
    const transactions = await db
      .collection("transactions")
      .find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();

    return Response.json({
      transactions: transactions.map((transaction) => ({
        id: transaction._id.toString(),
        vendor:
          typeof transaction.vendorName === "string"
            ? transaction.vendorName
            : "PizzaHub",
        plan: typeof transaction.plan === "string" ? transaction.plan : "premium",
        amount: Number(transaction.amount) || 0,
        currency:
          typeof transaction.currency === "string"
            ? transaction.currency
            : "usd",
        status:
          typeof transaction.status === "string"
            ? transaction.status
            : "completed",
        createdAt: serializeDate(transaction.createdAt),
      })),
    });
  }

  return Response.json({ error: "Unknown admin resource." }, { status: 400 });
}


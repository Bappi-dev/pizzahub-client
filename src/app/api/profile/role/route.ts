import { headers } from "next/headers";
import { ObjectId } from "mongodb";

import { auth, db } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Sign in to set up your account." }, { status: 401 });
  }

  let value: unknown;
  try {
    value = await request.json();
  } catch {
    return Response.json({ error: "Choose a valid account role." }, { status: 400 });
  }

  const role =
    typeof value === "object" && value !== null && "role" in value
      ? value.role
      : undefined;
  if (role !== "customer" && role !== "vendor") {
    return Response.json({ error: "Choose Customer or Vendor." }, { status: 400 });
  }

  const identities: Record<string, unknown>[] = [{ id: session.user.id }];
  if (/^[\da-f]{24}$/i.test(session.user.id)) {
    identities.push({ _id: new ObjectId(session.user.id) });
  }
  const identity = { $or: identities };
  const user = await db.collection("user").findOne(identity);
  if (!user) {
    return Response.json({ error: "Account not found." }, { status: 404 });
  }
  if (user.roleSetupComplete === true || user.role === "admin") {
    return Response.json(
      { error: "Your account role cannot be changed." },
      { status: 403 },
    );
  }

  await db.collection("user").updateOne(identity, {
    $set: {
      role,
      roleSetupComplete: true,
      updatedAt: new Date(),
    },
  });

  return Response.json({ role });
}

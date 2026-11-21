import { headers } from "next/headers";
import { ObjectId } from "mongodb";

import { auth, db } from "@/lib/auth";

function getIdentity(id: string) {
  const identities: Record<string, unknown>[] = [{ id }];
  if (/^[\da-f]{24}$/i.test(id)) identities.push({ _id: new ObjectId(id) });
  return { $or: identities };
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Sign in to update your profile." }, { status: 401 });
  }
  if (session.user.blocked === true) {
    return Response.json({ error: "This account is blocked." }, { status: 403 });
  }

  let value: unknown;
  try {
    value = await request.json();
  } catch {
    return Response.json({ error: "Enter valid profile details." }, { status: 400 });
  }
  if (typeof value !== "object" || value === null) {
    return Response.json({ error: "Enter valid profile details." }, { status: 400 });
  }

  const name =
    "name" in value && typeof value.name === "string"
      ? value.name.trim()
      : "";
  const image =
    "image" in value && typeof value.image === "string"
      ? value.image.trim()
      : "";

  if (!name || name.length > 100) {
    return Response.json({ error: "Name must be between 1 and 100 characters." }, { status: 400 });
  }
  if (image) {
    try {
      const url = new URL(image);
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    } catch {
      return Response.json({ error: "Enter a valid profile image URL." }, { status: 400 });
    }
  }

  await db.collection("user").updateOne(getIdentity(session.user.id), {
    $set: { name, image: image || null, updatedAt: new Date() },
  });

  return Response.json({ name, image: image || null });
}

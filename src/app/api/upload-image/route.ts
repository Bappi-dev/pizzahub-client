import { headers } from "next/headers";

import { auth } from "@/lib/auth";

const maxImageSize = 32 * 1024 * 1024;
const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return Response.json({ error: "Sign in to upload a menu image." }, { status: 401 });
  }

  if (session.user.role !== "vendor") {
    return Response.json(
      { error: "Only vendors can upload menu images." },
      { status: 403 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Choose an image file to upload." }, { status: 400 });
  }

  const image = formData.get("image");
  if (!(image instanceof File)) {
    return Response.json({ error: "Choose an image file to upload." }, { status: 400 });
  }

  if (!allowedImageTypes.has(image.type)) {
    return Response.json(
      { error: "Choose a JPEG, PNG, WebP, or GIF image." },
      { status: 415 },
    );
  }

  if (image.size === 0) {
    return Response.json({ error: "The selected image is empty." }, { status: 400 });
  }

  if (image.size > maxImageSize) {
    return Response.json(
      { error: "The image must be smaller than 32 MB." },
      { status: 413 },
    );
  }

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "ImgBB is not configured. Add IMGBB_API_KEY to pizzahub-client/.env.local and restart Next.js.",
      },
      { status: 500 },
    );
  }

  const uploadData = new FormData();
  uploadData.set("image", image, image.name);
  const uploadUrl = new URL("https://api.imgbb.com/1/upload");
  uploadUrl.searchParams.set("key", apiKey);

  let uploadResponse: Response;
  try {
    uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: uploadData,
    });
  } catch {
    return Response.json(
      { error: "Could not connect to ImgBB. Please try again." },
      { status: 502 },
    );
  }

  if (!uploadResponse.ok) {
    return Response.json(
      { error: "ImgBB rejected the image upload. Check your API key and try again." },
      { status: 502 },
    );
  }

  let uploadResult: unknown;
  try {
    uploadResult = await uploadResponse.json();
  } catch {
    return Response.json(
      { error: "ImgBB returned an invalid upload response." },
      { status: 502 },
    );
  }

  const imageUrl =
    isRecord(uploadResult) &&
    isRecord(uploadResult.data) &&
    typeof uploadResult.data.url === "string"
      ? uploadResult.data.url
      : null;

  if (!imageUrl || !imageUrl.startsWith("https://")) {
    return Response.json(
      { error: "ImgBB did not return a valid image URL." },
      { status: 502 },
    );
  }

  return Response.json({ imageUrl }, { status: 201 });
}

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export const submittedStatuses = ["pending", "submitted", "active"];

export function getPlan(value: unknown): "free" | "premium" {
  if (typeof value === "object" && value !== null) {
    return (
      ("subscriptionPlan" in value && value.subscriptionPlan === "premium") ||
      ("plan" in value && value.plan === "premium")
    )
      ? "premium"
      : "free";
  }
  return value === "premium" ? "premium" : "free";
}

export function getImgBBImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value);
    if (
      url.protocol === "https:" &&
      (url.hostname === "ibb.co" || url.hostname.endsWith(".ibb.co"))
    ) {
      return url.toString();
    }
  } catch {
    return null;
  }

  return null;
}

export async function getVendorMenuSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return {
      error: "Sign in to manage menu items.",
      status: 401 as const,
    };
  }
  if (session.user.role !== "vendor") {
    return {
      error: "Only vendors can manage menu items.",
      status: 403 as const,
    };
  }

  return { session };
}

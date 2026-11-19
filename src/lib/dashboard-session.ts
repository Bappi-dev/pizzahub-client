import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { isDashboardRole } from "@/lib/dashboard-roles";

export async function getCurrentDashboardRole() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return null;

  return isDashboardRole(session.user.role) ? session.user.role : "customer";
}

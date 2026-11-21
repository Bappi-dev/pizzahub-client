import { redirect } from "next/navigation";

import { getCurrentDashboardRole } from "@/lib/dashboard-session";

export const instant = false;

export default async function PaymentSuccessPage() {
  const role = await getCurrentDashboardRole();
  if (role !== "vendor") redirect("/dashboard");
  redirect("/dashboard/vendor/subscription?checkout=success");
}

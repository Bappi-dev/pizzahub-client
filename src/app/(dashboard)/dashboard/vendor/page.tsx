import VendorOverview from "@/components/sheard/VendorOverview";
import { redirect } from "next/navigation";
import { getCurrentDashboardRole } from "@/lib/dashboard-session";

export default async function VendorDashboardPage() {
  const role = await getCurrentDashboardRole();
  if (role !== "vendor") redirect("/dashboard");
  return <VendorOverview />;
}

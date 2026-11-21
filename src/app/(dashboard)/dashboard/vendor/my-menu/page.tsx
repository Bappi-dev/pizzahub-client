import VendorMenuItems from "@/components/sheard/VendorMenuItems";
import { redirect } from "next/navigation";
import { getCurrentDashboardRole } from "@/lib/dashboard-session";

export default async function VendorMenuItemsPage() {
  const role = await getCurrentDashboardRole();
  if (role !== "vendor") redirect("/dashboard");
  return <VendorMenuItems />;
}

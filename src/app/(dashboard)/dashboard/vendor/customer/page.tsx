import VendorCustomerOrders from "@/components/sheard/VendorCustomerOrders";
import { redirect } from "next/navigation";
import { getCurrentDashboardRole } from "@/lib/dashboard-session";

export default async function VendorCustomerOrdersPage() {
  const role = await getCurrentDashboardRole();
  if (role !== "vendor") redirect("/dashboard");
  return <VendorCustomerOrders />;
}

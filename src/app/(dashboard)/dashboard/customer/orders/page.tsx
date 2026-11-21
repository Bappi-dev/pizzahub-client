import CustomerOrders from "@/components/sheard/CustomerOrders";
import { redirect } from "next/navigation";
import { getCurrentDashboardRole } from "@/lib/dashboard-session";

export default async function CustomerOrdersPage() {
  const role = await getCurrentDashboardRole();
  if (role !== "customer") redirect("/dashboard");
  return <CustomerOrders />;
}

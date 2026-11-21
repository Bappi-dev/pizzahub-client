import CustomerOverview from "@/components/sheard/CustomerOverview";
import { redirect } from "next/navigation";
import { getCurrentDashboardRole } from "@/lib/dashboard-session";

export default async function CustomerDashboardPage() {
  const role = await getCurrentDashboardRole();
  if (role !== "customer") redirect("/dashboard");
  return <CustomerOverview />;
}

import AdminDashboard from "@/components/sheard/AdminDashboard";
import { redirect } from "next/navigation";
import { getCurrentDashboardRole } from "@/lib/dashboard-session";

export default async function AdminDashboardPage() {
  const role = await getCurrentDashboardRole();
  if (role !== "admin") redirect("/dashboard");
  return <AdminDashboard />;
}

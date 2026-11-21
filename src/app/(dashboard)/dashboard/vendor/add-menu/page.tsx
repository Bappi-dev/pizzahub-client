import VendorWorkspaceForm from "@/components/sheard/VendorWorkspaceForm";
import { redirect } from "next/navigation";
import { getCurrentDashboardRole } from "@/lib/dashboard-session";

export default async function AddVendorMenuItemPage() {
  const role = await getCurrentDashboardRole();
  if (role !== "vendor") redirect("/dashboard");
  return <VendorWorkspaceForm />;
}

import ProfileSettings from "@/components/sheard/ProfileSettings";
import { redirect } from "next/navigation";
import { getCurrentDashboardRole } from "@/lib/dashboard-session";

export default async function ProfileSettingsPage() {
  const role = await getCurrentDashboardRole();
  if (!role) redirect("/sign-in");
  return <ProfileSettings />;
}

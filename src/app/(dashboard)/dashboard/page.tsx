import VendorWorkspaceForm from "@/components/sheard/VendorWorkspaceForm";

import { redirect } from "next/navigation";

import { getCurrentDashboardRole } from "@/lib/dashboard-session";

export default async function DashboardPage() {
  const role = await getCurrentDashboardRole();
  if (role) {
    redirect(`/dashboard/${role}`);
  }

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
        Workspace
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950">
        Your dashboard
      </h1>
      <p className="mt-2 text-sm text-stone-600">
        Choose a section from the workspace menu to get started.
      </p>
      <VendorWorkspaceForm/>
    </section>
  );
}

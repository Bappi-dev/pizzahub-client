import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";

import DashboardHome from "@/components/sheard/DashboardHome";
import {
  dashboardRoles,
  isDashboardRole,
} from "@/lib/dashboard-roles";
import { getCurrentDashboardRole } from "@/lib/dashboard-session";

export function generateStaticParams() {
  return dashboardRoles.map((role) => ({ role }));
}

export default function RoleDashboardPage(props: {
  params: Promise<{ role: string }>;
}) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-stone-600">Loading your dashboard...</p>
      }
    >
      <RoleDashboardContent params={props.params} />
    </Suspense>
  );
}

async function RoleDashboardContent({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;

  if (!isDashboardRole(role)) notFound();

  const currentRole = await getCurrentDashboardRole();
  if (!currentRole) redirect("/sign-in");
  if (currentRole !== role) redirect(`/dashboard/${currentRole}`);

  return <DashboardHome role={role} />;
}

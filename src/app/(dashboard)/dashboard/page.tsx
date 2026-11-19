import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getCurrentDashboardRole } from "@/lib/dashboard-session";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-stone-600">Opening your dashboard...</p>
      }
    >
      <DashboardRedirect />
    </Suspense>
  );
}

async function DashboardRedirect(): Promise<never> {
  const role = await getCurrentDashboardRole();

  if (!role) redirect("/sign-in");
  redirect(`/dashboard/${role}`);
}
import type { ReactNode } from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/sheard/DashboardSidebar";
import { getCurrentDashboardRole } from "@/lib/dashboard-session";

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const role = await getCurrentDashboardRole();
  if (!role) redirect("/sign-in");
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <Suspense fallback={null}>
        <DashboardSidebar />
      </Suspense>
      <main className="min-w-0 flex-1 bg-[#fff9f2] p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
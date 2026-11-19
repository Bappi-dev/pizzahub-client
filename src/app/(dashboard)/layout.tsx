import type { ReactNode } from "react";
import { Suspense } from "react";
import DashboardSidebar from "@/components/sheard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
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
import VendorSubscription from "@/components/sheard/VendorSubscription";
import { redirect } from "next/navigation";
import { getCurrentDashboardRole } from "@/lib/dashboard-session";

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function VendorSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const role = await getCurrentDashboardRole();
  if (role !== "vendor") redirect("/dashboard");
  const { checkout } = await searchParams;
  const checkoutValue = Array.isArray(checkout) ? checkout[0] : checkout;
  const checkoutState =
    checkoutValue === "success" || checkoutValue === "cancelled"
      ? checkoutValue
      : null;

  return <VendorSubscription checkoutState={checkoutState} />;
}

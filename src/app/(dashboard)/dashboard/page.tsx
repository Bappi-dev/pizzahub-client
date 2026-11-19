import Link from "next/link";
import { ArrowRight, ClipboardList, Settings } from "lucide-react";

const dashboardLinks = [
  {
    href: "/dashboard/orders",
    title: "My orders",
    description: "View your order history and delivery updates.",
    Icon: ClipboardList,
  },
  {
    href: "/profile/settings",
    title: "Profile settings",
    description: "Manage your account details and preferences.",
    Icon: Settings,
  },
];

export default function DashboardPage() {
  return (
    <section className="mx-auto max-w-5xl">
      <p className="text-sm font-medium text-orange-700">PIZZAHUB ACCOUNT</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950">
        Dashboard
      </h1>
      <p className="mt-2 text-stone-600">
        Manage your orders and account from one place.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {dashboardLinks.map(({ href, title, description, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-orange-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-700">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <span className="mt-4 flex items-center justify-between gap-3">
              <span className="font-semibold text-stone-900">{title}</span>
              <ArrowRight
                aria-hidden="true"
                className="size-4 text-stone-400 transition group-hover:translate-x-1 group-hover:text-orange-600"
              />
            </span>
            <span className="mt-1 block text-sm leading-6 text-stone-600">
              {description}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
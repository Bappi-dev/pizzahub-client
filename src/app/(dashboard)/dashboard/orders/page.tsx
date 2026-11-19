import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";

export default function OrdersPage() {
  return (
    <section className="mx-auto max-w-5xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to dashboard
      </Link>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-stone-950">
        My orders
      </h1>
      <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-orange-50 text-orange-700">
          <ClipboardList aria-hidden="true" className="size-6" />
        </span>
        <h2 className="mt-4 font-semibold text-stone-900">Order history</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
          Your orders and delivery updates will be available here.
        </p>
      </div>
    </section>
  );
}

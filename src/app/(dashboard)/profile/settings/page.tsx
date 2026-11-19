import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";

export default function ProfileSettingsPage() {
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
        Profile settings
      </h1>
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
        <span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-700">
          <Settings aria-hidden="true" className="size-5" />
        </span>
        <h2 className="mt-4 font-semibold text-stone-900">Account details</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your profile information and preferences will be managed here.
        </p>
      </div>
    </section>
  );
}

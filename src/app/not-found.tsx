import Link from "next/link";
import { ArrowLeft, Pizza } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-[65vh] place-items-center bg-[#FFFAF4] px-4 py-16">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#F6E8DA] text-[#B34B31]">
          <Pizza aria-hidden="true" className="size-7" />
        </span>
        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#B34B31]">
          404 · Slice not found
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-[#281E18]">
          This pie isn&apos;t on the menu.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#766A60]">
          It may have been removed or the link may be incorrect. Browse the
          menu to find another favorite.
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#B34B31] px-5 text-sm font-bold text-white transition-colors hover:bg-[#963D29] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B34B31] focus-visible:ring-offset-2"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to menu
        </Link>
      </div>
    </main>
  );
}

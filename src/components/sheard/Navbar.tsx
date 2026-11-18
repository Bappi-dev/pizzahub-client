"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pizza } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  const navLinkClassName = (href: string) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive(href)
        ? "bg-orange-100 text-orange-800"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 bg-[#FFFAF4] z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight"
          aria-label="PizzaHub home"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
            <Pizza aria-hidden="true" className="size-5" />
          </span>
          <span>
            Pizza<span className="text-orange-600">Hub</span>
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="order-3 flex basis-full items-center justify-center gap-1 border-t pt-2 md:order-0 md:basis-auto md:border-0 md:pt-0"
        >
          <Link
            href="/"
            className={navLinkClassName("/")}
            aria-current={isActive("/") ? "page" : undefined}
          >
            Home
          </Link>
          <Link
            href="/menu"
            className={navLinkClassName("/menu")}
            aria-current={isActive("/menu") ? "page" : undefined}
          >
            Browse Menu
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
              <Link
                href="/sign-in"
                className="ml-10"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className={`rounded-md px-3 py-2 text-sm font-medium text-white transition-colors ${
                  isActive("/sign-up")
                    ? "bg-orange-700"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
                aria-current={isActive("/sign-up") ? "page" : undefined}
              >
                Sign Up
              </Link>
        </div>
      </div>
    </header>
  );
}

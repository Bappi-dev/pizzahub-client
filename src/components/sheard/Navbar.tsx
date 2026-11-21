"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Pizza,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { Menu } from "@base-ui/react/menu";
import { signOut, useSession } from "@/lib/auth-client";
import ThemeToggle from "@/components/sheard/ThemeToggle";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setSignOutError(null);
    setIsSigningOut(true);

    try {
      const { error } = await signOut();

      if (error) {
        setSignOutError(
          error.message ?? "We couldn't sign you out. Please try again.",
        );
        return;
      }

      router.replace("/sign-in");
      router.refresh();
    } catch (error: unknown) {
      setSignOutError(
        error instanceof Error
          ? error.message
          : "We couldn't sign you out. Please try again.",
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  const navLinkClassName = (href: string) =>
    `rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
      isActive(href)
        ? "bg-orange-100 text-orange-800"
        : "text-stone-600 hover:bg-orange-50 hover:text-orange-800"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8DED3]/80 bg-[#FFFAF4]/90 shadow-[0_4px_20px_-14px_rgba(47,32,22,0.3)] backdrop-blur-xl">
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
          className="order-3 flex basis-full items-center justify-center gap-1 border-t border-[#E8DED3]/80 pt-2 md:order-0 md:basis-auto md:border-0 md:pt-0"
        >
          {session ? (
            <>
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
              <Link
                href="/dashboard"
                className={navLinkClassName("/dashboard")}
                aria-current={isActive("/dashboard") ? "page" : undefined}
              >
               Dashboard
              </Link>
            </>
          ) : (
            <>
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
            </>
          )}
        </nav>

        {session ? (
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <ThemeToggle />
            <Menu.Root>
              <Menu.Trigger
                aria-label="Open account menu"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-orange-200 bg-white py-1 pl-1 pr-3 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <span
                  aria-hidden="true"
                  className="grid size-8 place-items-center rounded-full bg-orange-100 font-semibold text-orange-800"
                >
                  {session.user.name.trim().charAt(0).toUpperCase() || "U"}
                </span>
                <span className="max-w-28 truncate">{session.user.name}</span>
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 text-stone-500"
                />
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner sideOffset={8} align="end" className="z-50">
                  <Menu.Popup className="min-w-52 rounded-xl border border-stone-200 bg-white p-1.5 text-stone-800 shadow-lg shadow-stone-900/10 outline-none">
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-semibold">
                        {session.user.name}
                      </p>
                      <p className="truncate text-xs text-stone-500">
                        {session.user.email}
                      </p>
                    </div>
                    <Menu.Separator className="my-1 h-px bg-stone-100" />
                    <Menu.LinkItem
                      href="/dashboard"
                      closeOnClick
                      className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm outline-none hover:bg-orange-50 focus:bg-orange-50 data-[highlighted]:bg-orange-50"
                    >
                      <LayoutDashboard aria-hidden="true" className="size-4" />
                      Dashboard
                    </Menu.LinkItem>
                    <Menu.LinkItem
                      href="/profile/settings"
                      closeOnClick
                      className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm outline-none hover:bg-orange-50 focus:bg-orange-50 data-[highlighted]:bg-orange-50"
                    >
                      <Settings aria-hidden="true" className="size-4" />
                      Profile Settings
                    </Menu.LinkItem>
                    <Menu.Separator className="my-1 h-px bg-stone-100" />
                    {signOutError && (
                      <p role="alert" className="px-3 py-2 text-xs text-red-600">
                        {signOutError}
                      </p>
                    )}
                    <Menu.Item
                      disabled={isSigningOut}
                      onClick={handleSignOut}
                      className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-sm text-red-700 outline-none hover:bg-red-50 focus:bg-red-50 data-[highlighted]:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <LogOut aria-hidden="true" className="size-4" />
                      {isSigningOut ? "Signing out..." : "Sign out"}
                    </Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          </div>
        ) : (
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <ThemeToggle />
            <Link
              href="/sign-in"
              className="rounded-xl px-3.5 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-orange-50 hover:text-orange-800"
              aria-current={isActive("/sign-in") ? "page" : undefined}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${
                isActive("/sign-up")
                  ? "bg-orange-700"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
              aria-current={isActive("/sign-up") ? "page" : undefined}
            >
              Get started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

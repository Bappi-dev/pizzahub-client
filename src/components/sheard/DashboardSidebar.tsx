"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";

const navigationItems = [
  {
    href: "/dashboard",
    label: "Overview",
    Icon: LayoutDashboard,
  },
  {
    href: "/dashboard/orders",
    label: "My orders",
    Icon: ClipboardList,
  },
  {
    href: "/profile/settings",
    label: "Profile settings",
    Icon: Settings,
  },
];

const DashboardSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const displayName = session?.user.name?.trim() || "User";
  const displayEmail = session?.user.email?.trim() || "";

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(`${href}/`));

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

  return (
    <aside className="w-full shrink-0 border-b bg-sidebar container mx-auto text-sidebar-foreground lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-5 p-3 sm:p-4">
        <nav aria-label="Dashboard navigation">
          <p className="mb-2 hidden px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:block">
            Workspace
          </p>
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {navigationItems.map(({ href, label, Icon }) => {
              const active = isActive(href);

              return (
                <li key={href} className="shrink-0 lg:w-full">
                  <Button
                    variant="ghost"
                    className={`h-10 w-full justify-start gap-3 px-3 ${
                      active
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-current={active ? "page" : undefined}
                    render={<Link href={href} />}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                    {label}
                  </Button>
                </li>
              );
            })}
            {session && (
              <li className="shrink-0 lg:w-full">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSigningOut}
                  onClick={handleSignOut}
                  className="h-10 w-full justify-start gap-3 px-3 text-red-700 hover:bg-red-50 hover:text-red-800"
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </Button>
              </li>
            )}
          </ul>
        </nav>

        {signOutError && (
          <p role="alert" className="px-3 text-sm text-red-700">
            {signOutError}
          </p>
        )}

        {session && (
          <div className="mt-auto hidden items-center gap-3 border-t px-3 pt-4 lg:flex">
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-orange-100 text-sm font-semibold text-orange-800"
            >
              {displayName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {displayEmail}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default DashboardSidebar;

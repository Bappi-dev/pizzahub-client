"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  Crown,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  PlusCircle,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import {
  isDashboardRole,
  type DashboardRole,
} from "@/lib/dashboard-roles";

type NavItem = {
  id: string;
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
};

const roleBasedSidebarItem: Record<DashboardRole, NavItem[]> = {
  customer: [
    {
      id: "customer-overview",
      title: "Overview",
      href: "/dashboard/customer",
      icon: LayoutDashboard,
    },
    {
      id: "customer-orders",
      title: "My Orders",
      href: "/dashboard/customer/orders",
      icon: ListOrdered,
    },
  ],
  vendor: [
    {
      id: "vendor-overview",
      title: "Overview",
      href: "/dashboard/vendor",
      icon: LayoutDashboard,
    },
    {
      id: "vendor-add-item",
      title: "Add Menu Item",
      href: "/dashboard/vendor/add-menu", 
      icon: PlusCircle,
    },
    {
      id: "vendor-menu-items",
      title: "My Menu Items",
      href: "/dashboard/vendor/my-menu", 
      icon: ClipboardList,
    },
     {
      id: "vendor-customer-orders",
      title: "Customer Orders",
      href: "/dashboard/vendor/customer", 
      icon: ListOrdered,
    },
    {
      id: "vendor-subscription",
      title: "Subscription",
      href: "/dashboard/vendor/subscription",
      icon: Crown,
    },
    {
      id: "vendor-profile",
      title: "My profile",
      href: "/profile/settings",
      icon: UserRound,
    },
  ],
  admin: [
    {
      id: "admin-overview",
      title: "Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      id: "admin-orders",
      title: "My Orders",
      href: "/dashboard/orders",
      icon: ListOrdered,
    },
    {
      id: "admin-profile",
      title: "My profile",
      href: "/profile/settings",
      icon: UserRound,
    },
  ],
};

const DashboardSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const displayName = session?.user.name?.trim() || "User";
  const displayEmail = session?.user.email?.trim() || "";

  const role: DashboardRole = isDashboardRole(session?.user.role)
    ? session.user.role
    : "customer";
  const navigationItems = roleBasedSidebarItem[role];

  const isActive = (href: string) => {
    const cleanHref = href === "/" ? "/" : href.replace(/\/+$/, "");
    if (cleanHref === "/") return pathname === "/";
    return (
      pathname === cleanHref ||
      (cleanHref !== `/dashboard/${role}` &&
        pathname.startsWith(`${cleanHref}/`))
    );
  };

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
    <aside className="container mx-auto w-full shrink-0 border-b bg-sidebar text-sidebar-foreground lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-5 p-3 sm:p-4">
        <nav aria-label="Dashboard navigation">
          <p className="mb-2 hidden px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:block">
            Workspace
          </p>

          {isPending ? (
            <div className="space-y-2 px-2">
              <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ) : (
            <ul className="flex gap-1 overflow-x-auto lg:flex-col">
              {navigationItems.map(({ id, href, title, icon: Icon }) => {
                const active = isActive(href);

                return (
                  <li key={id} className="shrink-0 lg:w-full">
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
                      {title}
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
          )}
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
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Pizza,
  Settings,
} from "lucide-react";
import { Menu } from "@base-ui/react/menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NavbarUser = {
  name: string;
  image?: string | null;
  role?: string;
};

type NavbarProps =
  | { user?: null; onLogout?: never }
  | { user: NavbarUser; onLogout: () => void };

const navLinkClassName = cn(
  buttonVariants({ variant: "ghost" }),
  "h-10 text-muted-foreground hover:text-foreground",
);

function ProfileMenu({
  user,
  onLogout,
}: {
  user: NavbarUser;
  onLogout: () => void;
}) {
  const initials =
    user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <Menu.Root>
      <Menu.Trigger
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 gap-2 rounded-full px-2",
        )}
        aria-label={`Open ${user.name}'s profile menu`}
      >
        <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-xs font-semibold text-orange-800">
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              fill
              unoptimized
              sizes="32px"
              className="object-cover"
            />
          ) : (
            initials
          )}
        </span>
        <span className="hidden max-w-32 truncate sm:inline">{user.name}</span>
        <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8}>
          <Menu.Popup className="z-50 min-w-56 rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-lg outline-none">
            <div className="px-2.5 py-2">
              <p className="truncate text-sm font-medium">{user.name}</p>
              {user.role && (
                <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                  {user.role}
                </p>
              )}
            </div>
            <div className="my-1 h-px bg-border" />
            <Menu.Item
              render={<Link href="/dashboard" />}
              className="flex h-9 cursor-default items-center gap-2 rounded-md px-2.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
            >
              <LayoutDashboard aria-hidden="true" className="size-4" />
              Dashboard
            </Menu.Item>
            <Menu.Item
              render={<Link href="/profile" />}
              className="flex h-9 cursor-default items-center gap-2 rounded-md px-2.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
            >
              <Settings aria-hidden="true" className="size-4" />
              Profile Settings
            </Menu.Item>
            <div className="my-1 h-px bg-border" />
            <Menu.Item
              onClick={onLogout}
              className="flex h-9 cursor-default items-center gap-2 rounded-md px-2.5 text-sm text-destructive outline-none data-[highlighted]:bg-destructive/10"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Logout
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export default function Navbar(props: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
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
          <Link href="/" className={navLinkClassName}>
            Home
          </Link>
          <Link href="/menu" className={navLinkClassName}>
            Browse Menu
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {props.user ? (
            <ProfileMenu user={props.user} onLogout={props.onLogout} />
          ) : (
            <>
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-10 px-3",
                )}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants(),
                  "h-10 bg-orange-600 px-4 text-white hover:bg-orange-700",
                )}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

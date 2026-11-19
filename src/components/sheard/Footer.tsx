import Link from "next/link";
import { Pizza } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Browse menu" },
  { href: "/sign-in", label: "Sign in" },
  { href: "/sign-up", label: "Create an account" },
];

const socialLinks = [
  {
    href: "https://www.instagram.com/",
    label: "Instagram",
    Icon: FaInstagram,
  },
  {
    href: "https://www.facebook.com/",
    label: "Facebook",
    Icon: FaFacebookF,
  },
  {
    href: "https://www.tiktok.com/",
    label: "TikTok",
    Icon: FaTiktok,
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-stone-950 text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_0.8fr] lg:px-8 lg:py-14">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-white"
            aria-label="PizzaHub home"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-orange-600 text-white">
              <Pizza aria-hidden="true" className="size-5" />
            </span>
            <span>
              Pizza<span className="text-orange-400">Hub</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-stone-400">
            Freshly baked favorites, made with care and delivered straight to
            your door. Make every pizza night a little easier.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="text-sm font-semibold text-white">Quick links</h2>
          <ul className="mt-4 space-y-3">
            {navigationLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-stone-400 transition-colors hover:text-orange-300"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold text-white">Get in touch</h2>
          <p className="mt-4 text-sm leading-6 text-stone-400">
            Questions about an order? We&apos;re happy to help.
          </p>
          <a
            href="mailto:hello@pizzahub.com"
            className="mt-3 inline-block text-sm font-medium text-orange-300 transition-colors hover:text-orange-200"
          >
            hello@pizzahub.com
          </a>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">Follow us</h2>
          <ul className="mt-4 flex gap-3">
            {socialLinks.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full border border-stone-700 text-stone-300 transition-colors hover:border-orange-500 hover:bg-orange-600 hover:text-white"
                >
                  <Icon aria-hidden="true" className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-800">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-stone-500 sm:px-6 md:text-left lg:px-8">
          &copy; PizzaHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

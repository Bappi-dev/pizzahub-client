"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  LockKeyhole,
  Mail,
  Pizza,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";

const benefits = [
  "Order your favorites in a few taps",
  "Keep track of every delivery",
  "Save your go-to pizzas for next time",
];

export default function SignInPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setIsSubmitting(true);

    try {
      const { error } = await signIn.email({
        email,
        password,
        callbackURL: "/",
      });
      if (error) {
        setErrorMessage(error.message ?? "We couldn't sign you in. Check your email and password.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't sign you in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

   const handleGoogleSignUp = async () => {
      await signIn.social({
        provider: "google",
      });
    };

  return (
    <main className="flex flex-1 items-center justify-center bg-[#fff9f2] px-4 py-10 sm:px-6 lg:py-16">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-xl shadow-orange-950/5 md:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-[#c93e1a] p-10 text-white md:flex lg:p-12">
          <div
            aria-hidden="true"
            className="absolute -bottom-28 -right-24 text-white/[0.08]"
          >
            <Pizza className="size-[26rem]" strokeWidth={1} />
          </div>
          <div className="relative">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-lg font-bold"
              aria-label="PizzaHub home"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-white/15">
                <Pizza aria-hidden="true" className="size-6" />
              </span>
              <span>
                Pizza<span className="text-orange-200">Hub</span>
              </span>
            </Link>
            <p className="mt-16 text-sm font-bold tracking-[0.18em] text-orange-100">
              GOOD PIZZA. GOOD TIMES.
            </p>
            <h1 className="mt-4 max-w-sm text-4xl font-extrabold leading-tight tracking-tight lg:text-5xl">
              Your next favorite slice starts here.
            </h1>
            <p className="mt-5 max-w-sm leading-7 text-orange-50/90">
              Create an account and make every pizza night a little easier.
            </p>
          </div>

          <ul className="relative space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/15">
                  <Check aria-hidden="true" className="size-4" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </aside>

        <section
          aria-labelledby="signup-heading"
          className="px-6 py-9 sm:px-10 sm:py-12 lg:px-14"
        >
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <span className="grid size-10 place-items-center rounded-xl bg-orange-100 text-orange-700">
              <Pizza aria-hidden="true" className="size-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-stone-900">
              Pizza<span className="text-orange-600">Hub</span>
            </span>
          </div>

          <p className="text-sm font-semibold text-orange-700">WELCOME BACK</p>
          <h2
            id="signup-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-stone-950"
          >
             Sign In 
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Sign in to manage your orders and find your next favorite.
          </p>

          {errorMessage && (
            <p
              id="signup-error"
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {errorMessage}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleGoogleSignUp}
            disabled={isSubmitting}
            className="mt-7 h-12 w-full rounded-xl border-stone-200 bg-white text-stone-800 hover:bg-stone-50"
          >
            <span
              aria-hidden="true"
              className="font-bold text-base text-[#4285F4]"
            >
             <FcGoogle />
            </span>
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-stone-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-stone-400">
              or sign in with email
            </span>
            <span className="h-px flex-1 bg-stone-200" />
          </div>

          <form
            className="mt-8 space-y-5"
            onSubmit={handleSubmit}
            aria-busy={isSubmitting}
          >
           

            <div className="space-y-2">
              <label
                htmlFor="signup-email"
                className="text-sm font-medium text-stone-800"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-stone-400"
                />
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="signup-password"
                className="text-sm font-medium text-stone-800"
              >
                Password
              </label>
              <div className="relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-stone-400"
                />
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  minLength={8}
                  maxLength={128}
                  className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl bg-orange-600 text-base text-white hover:bg-orange-700"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
              {!isSubmitting && (
                <ArrowRight
                  aria-hidden="true"
                  data-icon="inline-end"
                  className="size-4"
                />
              )}
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-stone-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-orange-700 underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

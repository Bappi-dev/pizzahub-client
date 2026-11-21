"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle, Settings } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function ProfileSettings() {
  const { data: session, isPending } = useSession();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      queueMicrotask(() => {
        setName(session.user.name ?? "");
        setImage(session.user.image ?? "");
      });
    }
  }, [session]);

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
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSaving(true);
          try {
            const response = await fetch("/api/profile", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, image }),
            });
            const value: unknown = await response.json();
            if (!response.ok) {
              throw new Error(
                typeof value === "object" &&
                  value !== null &&
                  "error" in value &&
                  typeof value.error === "string"
                  ? value.error
                  : "Could not update profile.",
              );
            }
            toast.success("Profile updated.");
          } catch (error: unknown) {
            toast.error(
              error instanceof Error ? error.message : "Could not update profile.",
            );
          } finally {
            setIsSaving(false);
          }
        }}
        className="mt-6 rounded-2xl border border-stone-200 bg-white p-6"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-700">
          <Settings aria-hidden="true" className="size-5" />
        </span>
        <h2 className="mt-4 font-semibold text-stone-900">Account details</h2>
        {isPending ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-stone-600">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Loading profile...
          </p>
        ) : (
          <div className="mt-5 max-w-xl space-y-4">
            <label className="block text-sm font-medium text-stone-800">
              Full name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
                className="mt-2 h-11 w-full rounded-xl border border-stone-200 px-3 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-stone-800">
              Profile image URL
              <input
                type="url"
                value={image}
                onChange={(event) => setImage(event.target.value)}
                placeholder="https://example.com/profile.jpg"
                className="mt-2 h-11 w-full rounded-xl border border-stone-200 px-3 text-sm"
              />
            </label>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-11 rounded-xl bg-[#B34B31] px-5 text-sm font-bold text-white"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        )}
      </form>
    </section>
  );
}

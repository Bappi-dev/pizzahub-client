"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Tostify() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="tostify-heading"
      className="bg-[#AD3F2D] px-4 py-12 text-[#FFF7EC] sm:px-6 sm:py-14 lg:px-8"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{
          duration: reduceMotion ? 0 : 0.45,
          ease: "easeOut" as const,
        }}
        className="mx-auto flex max-w-6xl flex-col gap-7 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#FFE0C2]">
            GOOD PIZZA IS BETTER TOGETHER
          </p>
          <h2
            id="tostify-heading"
            className="mt-3 max-w-xl font-serif text-3xl leading-tight tracking-tight sm:text-4xl"
          >
            Bring your neighborhood
            <br className="hidden sm:block" /> to the table.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#FBE7D9]">
            Find a local favorite or share what you make with the block.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/menu"
            className="group inline-flex h-11 items-center gap-3 rounded-xl bg-[#FFF2DF] px-5 text-sm font-bold text-[#30231B] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#AD3F2D]"
          >
            I&apos;m hungry
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-1"
            />
          </Link>
          <a
            href="mailto:hello@pizzahub.com?subject=Pizzeria%20partnership"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/40 px-5 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#AD3F2D]"
          >
            I&apos;m a pizzeria
          </a>
        </div>
      </motion.div>
    </section>
  );
}

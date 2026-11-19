"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MapPin, ShieldCheck, Star } from "lucide-react";

const pizzaImage =
  "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=1400&q=85";

const trustPoints = [
  {
    icon: MapPin,
    title: "Discover your local legends",
    description: "Independent pizzerias, all in one delicious place.",
  },
  {
    icon: ShieldCheck,
    title: "Order with confidence",
    description: "Clear details and a simple way to find your next favorite.",
  },
];

export default function HowPizzaHubWorks() {
  const reduceMotion = useReducedMotion();
  const entrance = (direction: "left" | "right") => ({
    initial: reduceMotion
      ? false
      : { opacity: 0, x: direction === "left" ? -18 : 18 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: {
      duration: reduceMotion ? 0 : 0.55,
      ease: "easeOut" as const,
    },
  });

  return (
    <section
      aria-labelledby="how-pizzahub-works-heading"
      className="overflow-hidden bg-[#FFFAF4] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.08fr_0.92fr] md:gap-16">
        <motion.div
          {...entrance("left")}
          className="relative"
        >
          <div className="relative aspect-[1.3] overflow-hidden rounded-2xl bg-[#E8D8C8] shadow-[0_24px_60px_-34px_rgba(54,34,23,0.5)]">
            <Image
              src={pizzaImage}
              alt="Freshly baked pizza coming out of a wood-fired oven"
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover"
            />
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              duration: reduceMotion ? 0 : 0.4,
              delay: reduceMotion ? 0 : 0.2,
              ease: "easeOut",
            }}
            className="absolute -bottom-4 right-3 flex items-center gap-3 rounded-xl border border-[#F0E5DB] bg-white px-4 py-3 shadow-[0_16px_40px_-20px_rgba(54,34,23,0.4)] sm:-right-4 sm:px-5"
          >
            <span className="grid size-9 place-items-center rounded-full bg-[#FFF2E5] text-[#B34B31]">
              <Star aria-hidden="true" className="size-4 fill-current" />
            </span>
            <div>
              <p className="flex items-center gap-2 font-serif text-2xl font-bold leading-none text-[#261C16]">
                4.9
              </p>
              <p className="mt-1 text-[10px] text-[#766A60]">
                average neighborhood rating
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          {...entrance("right")}
          className="pt-2 md:pt-0"
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#B34B31]">
            MORE THAN A PIZZA RUN
          </p>
          <h2
            id="how-pizzahub-works-heading"
            className="mt-4 font-serif text-5xl leading-[0.98] tracking-tight text-[#241B16] sm:text-6xl"
          >
            Local pies.
            <span className="block italic text-[#B34B31]">Full hearts.</span>
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#665B52] sm:text-[15px]">
            We bring the neighborhood&apos;s best ovens a little closer to your
            couch. Every order supports a real local shop and the people who
            make it special.
          </p>

          <div className="mt-6 space-y-4">
            {trustPoints.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F6E8DA] text-[#B34B31]">
                  <Icon aria-hidden="true" className="size-[18px]" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#2D241E]">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#766A60]">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/menu"
            className="group mt-7 inline-flex h-11 items-center gap-3 rounded-xl bg-[#2D211B] px-5 text-sm font-bold text-white transition-colors hover:bg-[#B34B31] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B34B31] focus-visible:ring-offset-2"
          >
            Find your new favorite
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Flame, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const PIZZA_IMAGE =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000";

export default function DarkPizzaPromoBanner() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12">
      <div className="relative overflow-hidden rounded-3xl border border-[#2C2C2C] bg-[#1B1C1E] text-white shadow-2xl">
        
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(249,115,22,0.16),transparent_55%)]"
        />

        
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -left-24 hidden h-[440px] w-[540px] rounded-tr-[260px] bg-gradient-to-tr from-[#EA580C] via-[#F97316] to-[#FBBF24] lg:block"
        />

        <div className="relative z-10 grid grid-cols-1 items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:p-12">
     
          <div className="relative flex flex-col items-center justify-center sm:flex-row lg:justify-start">
            <div className="relative size-60 shrink-0 overflow-hidden rounded-full border-4 border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.65)] sm:size-72 lg:size-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PIZZA_IMAGE}
                alt="Hot and fresh loaded pizza"
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>

            
            <div className="mt-4 flex size-28 shrink-0 flex-col items-center justify-center rounded-full border-2 border-dashed border-[#F97316] bg-[#1B1C1E]/95 p-2 text-center shadow-lg sm:-ml-6 sm:mt-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FBBF24]">
                Up To
              </span>
              <span className="text-2xl font-black leading-none text-white">
                50%
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#F97316]">
                OFF
              </span>
            </div>

            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm lg:absolute lg:bottom-0 lg:left-4 lg:mt-0 lg:bg-transparent lg:text-[#1B1C1E]">
              <Truck className="size-4" />
              Free Home Delivery
            </div>
          </div>

          {/* ডান পাশ: আকর্ষণীয় হেডলাইন, সংক্ষিপ্ত বিবরণ ও Explore Pizza Menu CTA */}
          <div className="space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#F97316]/30 bg-[#F97316]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#FBBF24]">
              <Flame className="size-3.5 text-[#F97316]" />
              Today&apos;s Best Deal
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl lg:text-6xl">
                <span className="block text-xl font-extrabold tracking-[0.2em] text-white sm:text-2xl">
                  Delicious
                </span>
                <span className="mt-1 block bg-gradient-to-r from-[#F97316] to-[#FBBF24] bg-clip-text text-transparent">
                  Pizza
                </span>
              </h1>

              <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-300 sm:text-base lg:mx-0">
                Loaded with melted mozzarella, farm-fresh veggies, spicy
                toppings, and a crisp wood-fired crust delivered piping hot to
                your door.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 lg:justify-start">
              <Button
                size="lg"
                className="h-12 rounded-full bg-gradient-to-r from-[#F97316] to-[#EA580C] px-7 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-[#F97316]/25 transition hover:from-[#EA580C] hover:to-[#C2410C]"
                render={<Link href="/menu?category=pizza" />}
              >
                Explore Pizza Menu
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
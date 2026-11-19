"use client";

import { ArrowRight, Bike, Search, ShoppingBag } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const steps = [
  {
    icon: Search,
    title: "Browse the menu",
    description: "Explore neighborhood pizzerias and find your kind of pie.",
  },
  {
    icon: ShoppingBag,
    title: "Pick your favorites",
    description: "Choose what you are craving and place your order with ease.",
  },
  {
    icon: Bike,
    title: "Enjoy the good stuff",
    description: "Your local pizzeria gets cooking and brings it to your door.",
  },
];

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function HowPizzaHubWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="bg-[#F4ECE3] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={itemVariants}
            transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
          >
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#B34B31]">
              THREE SIMPLE STEPS
            </p>
            <h2
              id="how-it-works-heading"
              className="mt-3 font-serif text-4xl leading-tight tracking-tight text-[#201A17] sm:text-5xl"
            >
              How PizzaHub <span className="italic text-[#B34B31]">works.</span>
            </h2>
          </motion.div>
          <p className="max-w-sm text-sm leading-6 text-[#665B52]">
            From first browse to that first bite, getting a great local pizza is
            easy.
          </p>
        </div>

        <motion.ol
          className="mt-9 grid gap-4 md:grid-cols-3"
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={listVariants}
        >
          {steps.map(({ icon: Icon, title, description }, index) => (
            <motion.li
              key={title}
              variants={itemVariants}
              transition={{
                duration: reduceMotion ? 0 : 0.45,
                ease: "easeOut",
              }}
              className="relative flex min-h-52 flex-col rounded-2xl border border-[#E6D8CA] bg-[#FFFAF5] p-5 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#B34B31] text-white shadow-[0_8px_20px_-12px_rgba(179,75,49,0.9)]">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="font-serif text-3xl font-bold text-[#E8D9CC]">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-6 font-serif text-xl font-bold text-[#30251F]">
                {title}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#74685F]">
                {description}
              </p>
              {index < steps.length - 1 && (
                <ArrowRight
                  aria-hidden="true"
                  className="absolute -right-3 top-1/2 z-10 hidden size-6 -translate-y-1/2 rounded-full bg-[#B34B31] p-1 text-white md:block"
                />
              )}
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}

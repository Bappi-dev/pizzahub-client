"use client";

import {
  Bike,
  Flame,
  Heart,
  MapPin,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const reasons = [
  {
    icon: MapPin,
    title: "Love your local",
    description:
      "Find independent pizzerias nearby and discover the people behind every pie.",
  },
  {
    icon: Flame,
    title: "Fresh from the oven",
    description:
      "Your favorites are made fresh by the local kitchens that know them best.",
  },
  {
    icon: Heart,
    title: "Made for your cravings",
    description:
      "From classic comfort to something new, there is a slice for every mood.",
  },
  {
    icon: Bike,
    title: "Good food, on its way",
    description:
      "Choose your meal and have it delivered straight from the neighborhood.",
  },
];

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function WhyChoose() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="why-choose-heading"
      className="overflow-hidden bg-[#FFFAF4] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={itemVariants}
          transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#B34B31]">
            GOOD FOOD, GOOD NEIGHBORS
          </p>
          <h2
            id="why-choose-heading"
            className="mt-3 font-serif text-4xl leading-tight tracking-tight text-[#201A17] sm:text-5xl"
          >
            Why choose <span className="italic text-[#B34B31]">PizzaHub?</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#665B52] sm:text-base">
            Great pizza is about more than a good slice. It is local flavor,
            made fresh, and shared with a little love.
          </p>
        </motion.div>

        <motion.div
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={listVariants}
        >
          {reasons.map(({ icon: Icon, title, description }, index) => (
            <motion.article
              key={title}
              variants={itemVariants}
              transition={{
                duration: reduceMotion ? 0 : 0.45,
                ease: "easeOut",
              }}
              className="rounded-2xl border border-[#E8DED3] hover:border-violet-400 bg-white p-5 shadow-[0_12px_30px_-24px_rgba(67,43,28,0.38)] transition-colors hover:border-[#D8C2AF] sm:p-6"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-[#F8ECE2] text-[#B34B31]">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="text-xs font-extrabold tracking-[0.12em] text-[#B34B31]/70">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-5 font-serif text-xl font-bold text-[#30251F]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#74685F]">
                {description}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

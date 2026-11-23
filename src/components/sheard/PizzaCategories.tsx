import Link from "next/link";
import {
  ArrowUpRight,
  Coffee,
  Leaf,
  Pizza,
  Sparkles,
  UtensilsCrossed,
  Wheat,
} from "lucide-react";

const PizzaCategories = () => {
  const categories = [
    {
      name: "Classic Pizzas",
      description: "Timeless pies, baked just right.",
      icon: Pizza,
      accent: "bg-[#FCE9E3] text-[#A4442F]",
    },
    {
      name: "Vegetarian Pizzas",
      description: "Fresh vegetables and bold flavor.",
      icon: Leaf,
      accent: "bg-[#EAF4EA] text-[#3F7A49]",
    },
    {
      name: "Meat Lovers",
      description: "Generous toppings for a hearty bite.",
      icon: UtensilsCrossed,
      accent: "bg-[#F1E7DE] text-[#81271B]",
    },
    {
      name: "Specialty & Gourmet Pizzas",
      description: "Distinctive flavors worth discovering.",
      icon: Sparkles,
      accent: "bg-[#FFF1D8] text-[#A96821]",
    },
    {
      name: "Sides & Appetizers",
      description: "Perfect extras for every pizza night.",
      icon: Wheat,
      accent: "bg-[#F6E8DA] text-[#963D29]",
    },
    {
      name: "Beverages & Desserts",
      description: "A sweet or refreshing finish.",
      icon: Coffee,
      accent: "bg-[#F8ECE2] text-[#A4442F]",
    },
  ];

  return (
    <section
      aria-labelledby="pizza-categories-heading"
      className="w-full bg-[#F4ECE3]  px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-18"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 max-w-md">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#B34B31]">
            A LITTLE SOMETHING FOR EVERYONE
          </p>
          <h2
            id="pizza-categories-heading"
            className="mt-3 font-serif text-4xl leading-tight tracking-tight text-[#201A17] sm:text-5xl"
          >
            What sounds <span className="italic text-[#B34B31]">good?</span>
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#665B52]">
            From the classics to “one more slice,” find your kind of delicious.
          </p>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ name, description, icon: Icon, accent }, index) => (
            <li key={name}>
              <Link
                href={`/menu?category=${encodeURIComponent(name)}`}
                className="group relative flex min-h-44 overflow-hidden rounded-2xl border border-[#E6D8CA] bg-[#FFFAF5] p-5 shadow-[0_12px_32px_-28px_rgba(67,43,28,0.55)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-300 hover:shadow-[0_18px_38px_-20px_rgba(8,145,178,0.28)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)] dark:hover:border-cyan-200 dark:hover:bg-white/[0.09] dark:hover:shadow-[0_18px_38px_-18px_rgba(34,211,238,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4ECE3] dark:focus-visible:ring-offset-[#1B1C1E]"
              >
                <span
                  aria-hidden="true"
                  className="absolute -right-10 -top-12 size-36 rounded-full bg-[#F4E5D6]/70 transition-all duration-500 group-hover:scale-125 "
                />
                <div className="relative z-10 flex w-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`grid size-12 place-items-center rounded-2xl ${accent} ring-1 ring-black/[0.03] transition-all duration-300 group-hover:-rotate-3 group-hover:scale-110 group-hover:shadow-lg dark:ring-white/10`}
                    >
                      <Icon aria-hidden="true" className="size-5" strokeWidth={2} />
                    </span>
                    <span className="grid size-9 place-items-center rounded-full border border-[#E6D8CA] bg-white/80 text-[#4A3B31] transition-all duration-300 group-hover:border-cyan-400 group-hover:bg-cyan-400 group-hover:text-cyan-950 dark:border-white/10 dark:bg-white/[0.08] dark:text-zinc-200 dark:group-hover:border-cyan-200 dark:group-hover:bg-cyan-200">
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </div>
                  <div className="mt-auto pt-6">
                    <p className="text-[10px] font-extrabold tracking-[0.14em] text-[#B34B31]/75">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 max-w-[90%] font-serif text-xl font-bold leading-snug text-[#342820]">
                      {name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-5 text-[#74685F]">
                      {description}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default PizzaCategories;
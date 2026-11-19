import Link from "next/link";
import { ArrowRight } from "lucide-react";

const PizzaCategories = () => {
  const categories = [
    "Classic Pizzas",
    "Vegetarian Pizzas",
    "Meat Lovers",
    "Specialty & Gourmet Pizzas",
    "Sides & Appetizers",
    "Beverages & Desserts",
  ];

  return (
    <section
      aria-labelledby="pizza-categories-heading"
      className="w-full bg-[#F4ECE3] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-18"
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

        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <li key={category}>
              <Link
                href="/menu"
                className="group relative flex min-h-32 items-end justify-between overflow-hidden rounded-xl border border-[#E6D8CA] bg-[#FFFAF5] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#D4BBA8] hover:shadow-[0_12px_28px_-20px_rgba(67,43,28,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B34B31] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4ECE3]"
              >
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -top-12 size-28 rounded-full bg-[#F4E5D6] transition-transform duration-300 group-hover:scale-110"
                />
                <span className="absolute left-5 top-4 text-[10px] font-extrabold tracking-[0.14em] text-[#B34B31]/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="relative z-10 max-w-[85%] font-serif text-lg font-bold leading-snug text-[#342820] sm:text-xl">
                  {category}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="relative z-10 mb-0.5 size-4 shrink-0 text-[#4A3B31] transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default PizzaCategories;
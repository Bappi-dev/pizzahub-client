"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, MapPin, Search } from "lucide-react";

import MenuCard from "@/components/sheard/MenuCard";

type MenuItem = {
  _id: string;
  name: string;
  itemImage: string;
  location?: string;
  category?: string;
  price: number | string;
};

const categories = [
  "All",
  "Classic Pizzas",
  "Vegetarian Pizzas",
  "Meat Lovers",
  "Specialty / Gourmet Pizzas",
  "Sides & Appetizers",
  "Beverages & Desserts",
];

const sortOptions = [
  "Featured",
  "Price: Low to High",
  "Price: High to Low",
  "Name: A to Z",
];

const BrowesMenu = () => {
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All locations");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Featured");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const res = await fetch("http://localhost:5000/pizza");
        if (!res.ok) throw new Error("Failed to load menu");
        setMenuData((await res.json()) as MenuItem[]);
      } catch {
        setMenuData([]);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  const locations = useMemo(
    () =>
      Array.from(
        new Set(
          menuData
            .map((item) => item.location)
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    [menuData],
  );

  const visibleMenu = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = menuData.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query);
      const matchesLocation =
        location === "All locations" || item.location === location;
      const matchesCategory =
        category === "All" ||
        item.category?.toLowerCase() === category.toLowerCase();

      return matchesSearch && matchesLocation && matchesCategory;
    });

    if (sort === "Price: Low to High") {
      return [...filtered].sort(
        (a, b) => Number(a.price) - Number(b.price),
      );
    }
    if (sort === "Price: High to Low") {
      return [...filtered].sort(
        (a, b) => Number(b.price) - Number(a.price),
      );
    }
    if (sort === "Name: A to Z") {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }
    return filtered;
  }, [category, location, menuData, search, sort]);

  return (
    <section className="w-full py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="w-full rounded-xl bg-[#F5EFEA] px-8 py-12 sm:px-14 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-8">
        {/* Left Text Content */}
        <div className="space-y-3 text-center sm:text-left">
          <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.2em] text-[#B34B31]">
            MADE AROUND THE CORNER
          </p>

          <h2 className="font-serif text-4xl sm:text-5xl text-[#141414] tracking-tight leading-tight">
            Find your{" "}
            <span className="italic font-normal text-[#B34B31]">
              perfect pie.
            </span>
          </h2>

          <p className="text-sm sm:text-[15px] text-[#5C5855] font-normal pt-1">
            Good things are baking at an independent pizzeria near you.
          </p>
        </div>

        {/* Right Circular Pizza Icon Badge */}
        <div className="shrink-0">
          <div className="h-32 w-32 sm:h-36 sm:w-36 rounded-full bg-[#EAD9CC] flex items-center justify-center transition-transform duration-300 hover:scale-105">
            {/* Custom Pizza Slice SVG matching the exact line style */}
            <svg
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-14 w-14 sm:h-16 sm:w-16 text-[#B34B31]"
            >
              {/* Outer Crust */}
              <path
                d="M14 40C15.5 26.5 25.5 16.5 39 15"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Inner Crust Line */}
              <path
                d="M19.5 41.5C21 30.5 29.5 22 40.5 20.5"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Slice Triangle Sides */}
              <path
                d="M14 40L48 50L39 15"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Pepperoni Toppings */}
              <circle cx="31" cy="33" r="2.2" fill="currentColor" />
              <circle cx="26" cy="40" r="1.8" fill="currentColor" />
              <path
                d="M42.5 33.5C39.8 33.5 37.8 35.6 37.8 38.2C37.8 40.8 39.8 42.8 42.5 42.8"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_160px]">
        <label className="relative flex h-12 items-center">
          <Search
            className="pointer-events-none absolute left-4 size-4 text-[#B34B31]"
            strokeWidth={2}
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search pizzas, sides, dessert..."
            className="h-full w-full rounded-xl border border-[#DDD0C2] bg-white pl-11 pr-4 text-sm text-[#332923] outline-none transition placeholder:text-[#A59B91] focus:border-[#B34B31] focus:ring-3 focus:ring-[#B34B31]/10"
          />
        </label>

        <label className="relative h-12">
          <MapPin
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#B34B31]"
            strokeWidth={2}
          />
          <select
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="h-full w-full appearance-none rounded-xl border border-[#DDD0C2] bg-white pl-10 pr-9 text-sm font-medium text-[#332923] outline-none transition focus:border-[#B34B31] focus:ring-3 focus:ring-[#B34B31]/10"
          >
            <option>All locations</option>
            {locations.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#777068]" />
        </label>

        <label className="relative h-12">
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-full w-full appearance-none rounded-xl border border-[#DDD0C2] bg-white px-4 pr-9 text-sm font-medium text-[#332923] outline-none transition focus:border-[#B34B31] focus:ring-3 focus:ring-[#B34B31]/10"
          >
            {sortOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#777068]" />
        </label>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {categories.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategory(value)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${
              category === value
                ? "border-[#332923] bg-[#332923] text-white"
                : "border-[#E1D4C7] bg-white text-[#4D4540] hover:border-[#B34B31] hover:text-[#B34B31]"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-10 text-center text-sm text-[#777068]">
          Loading menu...
        </p>
      ) : visibleMenu.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleMenu.map((data) => (
            <MenuCard key={data._id} menu={data} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-[#D8C8BA] bg-[#FBF7F2] px-6 py-14 text-center">
          <p className="font-serif text-xl text-[#332923]">No menu items found</p>
          <p className="mt-1 text-sm text-[#777068]">
            Try changing your search or filters.
          </p>
        </div>
      )}
    </section>
  );
};

export default BrowesMenu;

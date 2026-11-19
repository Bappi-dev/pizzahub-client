
import Image from "next/image";
import { MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";

type MenuItem = {
  _id: string;
  name: string;
  itemImage: string;
  location?: string;
  category?: string;
  price: number | string;
};

type MenuCardProps = {
  menu: MenuItem;
};

const MenuCard = ({ menu }: MenuCardProps) => {
  const { itemImage, location, category, price, name } = menu;
  const formattedPrice =
    typeof price === "number" ? `$${price.toFixed(2)}` : price;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[#E8DED3] bg-white shadow-[0_10px_30px_-18px_rgba(67,43,28,0.35)] transition duration-300 hover:-translate-y-1 hover:border-[#D8C7B6] hover:shadow-[0_18px_40px_-18px_rgba(67,43,28,0.38)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F5EFEA]">
        {itemImage ? (
          <Image
            src={itemImage}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-sm text-[#8B8177]">
            Image unavailable
          </div>
        )}

        {category && (
          <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#B34B31] shadow-sm backdrop-blur">
            {category}
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-xl leading-tight text-[#201A17]">
            {name}
          </h3>
          <p className="shrink-0 text-lg font-extrabold text-[#B34B31]">
            {formattedPrice}
          </p>
        </div>

        {location && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-[#777068]">
            <MapPin className="size-4 text-[#B34B31]" strokeWidth={2} />
            {location}
          </p>
        )}

       <Link href={'/'}>
        <Button
          type="button"
          size="lg"
          className="mt-5 cursor-pointer h-11 w-full rounded-xl bg-[#B34B31] text-sm font-bold text-white shadow-[0_8px_20px_-10px_rgba(179,75,49,0.8)] hover:bg-[#963D29]"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          View detalis
        </Button>
       </Link>
      </div>
    </article>
  );
};

export default MenuCard;
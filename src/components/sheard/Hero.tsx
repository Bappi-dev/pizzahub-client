// app/page.tsx  — everything in one file (Next.js App Router + shadcn/ui + Tailwind v4)
// Needs: npx shadcn@latest add button badge   |   npm i lucide-react
import { ArrowRight, Heart, Star } from "lucide-react";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "800"], variable: "--font-bricolage" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

const css = `
.pizza-hero{
  --background:#fff7ee; --foreground:#1d1410; --card:#ffffff;
  --primary:#f0450c; --primary-foreground:#ffffff;
  --muted-foreground:#6b5a50; --border:rgb(29 20 16 / .1); --glow:#ffd9b0;
  font-family:var(--font-dm-sans),system-ui,sans-serif;
}
.dark .pizza-hero{
  --background:#17100c; --foreground:#fff3e8; --card:#2a1d16;
  --primary:#ff6a2b; --primary-foreground:#1d1410;
  --muted-foreground:#bfa998; --border:rgb(255 243 232 / .14); --glow:#5a2a10;
}
@keyframes pizza-in{from{transform:rotate(-160deg) scale(.7);opacity:0}to{transform:none;opacity:1}}
`;

const display = "font-[family-name:var(--font-bricolage)]";
const stats = [
  { value: "25 min", label: "average delivery" },
  { value: "4.9", label: "from 12k reviews" },
  { value: "Free", label: "delivery over $20" },
];

export default function Hero() {
  return (
    <section
      className={`pizza-hero ${bricolage.variable} ${dmSans.variable} relative flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground bg-[radial-gradient(60%_60%_at_80%_50%,var(--glow),transparent_70%)]`}
    >
      <style>{css}</style>
      <ToppingPattern />

      {/* Content */}
      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 pb-16 pt-2 md:grid-cols-[1.05fr_1fr] md:gap-12 md:px-12">
        <div>
          <p  className="gap-2 rounded-full bg-card/70 px-3.5 py-1.5 text-sm font-medium backdrop-blur">
            <span className="size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            Ovens are hot, now delivering
          </p>

          <h1 className={`${display} mb-5 mt-5 text-[clamp(2.6rem,6.2vw,5rem)] font-extrabold leading-[0.98] tracking-[-0.035em]`}>
            Hot &amp; fresh pizza
            <span className="block text-primary">delivered to your door.</span>
          </h1>

          <p className="max-w-[30em] text-lg leading-relaxed text-muted-foreground">
            Hand-stretched dough, rich toppings, and gooey cheese, baked fresh and delivered straight to you.
          </p>

          <div className="mt-8">
            <Button
        
              size="lg"
              className="group h-14 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-[0_12px_28px_-10px] shadow-primary transition hover:-translate-y-0.5 hover:bg-primary"
            >
              <Link className="flex items-center" href="/">
                Explore pizza menu
                <ArrowRight className="size-[18px] transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <dl className="mt-11 flex max-w-[30em] gap-7 border-t border-border pt-6">
            {stats.map((s) => (
              <div key={s.label} className="text-sm leading-snug text-muted-foreground">
                <dd className={`${display} text-2xl font-extrabold tracking-tight text-foreground`}>{s.value}</dd>
                <dt>{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Pizza stage */}
        <div className="relative mx-auto aspect-square w-full max-w-[420px] md:max-w-[560px]">
          <div className="absolute inset-0 rounded-full border border-dashed border-border" />
          <div className="absolute inset-[7%] rounded-full bg-card shadow-[0_40px_70px_-30px_rgb(120_40_0/0.45)]" />
          <Pizza className="absolute inset-[11%] size-[78%] motion-safe:animate-[pizza-in_1.6s_cubic-bezier(.16,.8,.2,1)_both]" />

          <Chip className="left-0 top-[10%] md:-left-[4%]" icon={<Star className="size-4 fill-current" />} title="Freshly baked" sub="out of the oven" />
          <Chip className="bottom-[8%] right-0 md:-right-[2%]" icon={<Heart className="size-4 fill-current" />} title="Made with love" sub="every single order" />
        </div>
      </div>
    </section>
  );
}

/* ---------- small components ---------- */

function Chip({ className, icon, title, sub }: { className?: string; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div
      className={`absolute flex items-center gap-2.5 rounded-full border border-border bg-card/70 py-2.5 pl-2.5 pr-4 text-[0.92rem] font-semibold shadow-[0_14px_30px_-14px_rgb(0_0_0/0.35)] backdrop-blur-md ${className}`}
    >
      <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">{icon}</span>
      <div className="leading-tight">
        {title}
        <small className="block text-xs font-normal text-muted-foreground">{sub}</small>
      </div>
    </div>
  );
}

function Pizza({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" role="img" aria-label="Pepperoni pizza with basil">
      <defs>
        <radialGradient id="cheese" cx="50%" cy="45%" r="60%">
          <stop offset="0" stopColor="#ffd86e" />
          <stop offset="1" stopColor="#f3b73c" />
        </radialGradient>
        <radialGradient id="pepperoni" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#d9412b" />
          <stop offset="1" stopColor="#a82616" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="196" fill="#d98a3f" />
      <circle cx="200" cy="200" r="178" fill="#c0392b" />
      <circle cx="200" cy="200" r="166" fill="url(#cheese)" />
      <g stroke="#c0392b" strokeWidth="2" opacity=".35">
        <path d="M200 34v332M34 200h332M83 83l234 234M317 83L83 317" />
      </g>
      <g fill="url(#pepperoni)" stroke="#ee7a5f" strokeWidth="4">
        {[[200, 200], [200, 105], [200, 300], [108, 150], [292, 150], [108, 250], [292, 250]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="27" />
        ))}
      </g>
      <g fill="#4f8a3f">
        <path d="M150 112c18-4 32 4 36 14-18 4-32-4-36-14z" />
        <path d="M250 112c-18-4-32 4-36 14 18 4 32-4 36-14z" />
        <path d="M140 200c14-12 30-12 40-4-12 14-30 14-40 4z" />
        <path d="M260 200c-14-12-30-12-40-4 12 14 30 14 40 4z" />
        <path d="M160 296c4-16 18-26 30-24-2 16-16 28-30 24z" />
        <path d="M240 296c-4-16-18-26-30-24 2 16 16 28 30 24z" />
      </g>
      <g fill="#fff3c4" opacity=".9">
        {[[160, 165, 4], [245, 165, 4], [152, 232, 4], [250, 238, 4], [200, 150, 3], [200, 255, 3]].map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
        ))}
      </g>
    </svg>
  );
}

function ToppingPattern() {
  const leaf = "M0 0c12-10 26-8 32 2-12 10-26 8-32-2z";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="block h-full w-full opacity-[0.22] dark:opacity-[0.14]" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="toppings" width="280" height="280" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
            {[[50, 50], [210, 170]].map(([x, y]) => (
              <g key={`p${x}`}>
                <circle cx={x} cy={y} r="15" fill="#c0392b" />
                <circle cx={x} cy={y} r="10" fill="#d9412b" />
              </g>
            ))}
            {[[130, 130], [250, 40], [30, 230]].map(([x, y]) => (
              <g key={`t${x}`}>
                <circle cx={x} cy={y} r="13" fill="#f0450c" />
                <circle cx={x} cy={y} r="8" fill="#ff8a4d" />
              </g>
            ))}
            <g fill="none" stroke="#3a3a2a" strokeWidth="4">
              <circle cx="150" cy="215" r="8" />
              <circle cx="215" cy="75" r="8" />
              <circle cx="20" cy="135" r="8" />
            </g>
            <g fill="#4f8a3f">
              <path transform="translate(140 40) rotate(30)" d={leaf} />
              <path transform="translate(70 190) rotate(-40)" d={leaf} />
              <path transform="translate(235 235) rotate(100)" d={leaf} />
              <path transform="translate(90 105) rotate(160)" d={leaf} />
            </g>
            <g fill="#f3b73c">
              {[[100, 20], [180, 110], [260, 120], [110, 260], [10, 60], [190, 250]].map(([x, y]) => (
                <circle key={`d${x}${y}`} cx={x} cy={y} r="4" />
              ))}
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#toppings)" />
      </svg>
      {/* fade so the text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background/85 md:bg-gradient-to-r md:from-background/90 md:via-background/40 md:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent to-25%" />
    </div>
  );
}
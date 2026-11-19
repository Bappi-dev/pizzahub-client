"use client";

import React from "react";
import { Clock, MapPin, Bike, Heart } from "lucide-react";

const features = [
  {
    icon: Clock,
    text: "Made fresh, always",
  },
  {
    icon: MapPin,
    text: "Local shops, real flavor",
  },
  {
    icon: Bike,
    text: "At your door, fast",
  },
  {
    icon: Heart,
    text: "Good food does good",
  },
];

export default function FeatureStrip() {
  return (
    <section className="w-full bg-[#FBF7F2] py-8 px-4">
      <div className="max-w-6xl mx-auto border-b border-[#E5DDD3] pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-[#DFD5CA]">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-center gap-3 py-4 lg:py-1 px-4"
              >
                <Icon
                  className="w-5 h-5 text-[#B4533C] shrink-0"
                  strokeWidth={2}
                />
                <span className="text-[15px] font-semibold text-[#2E2A27] tracking-tight">
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
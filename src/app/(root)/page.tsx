import FeatureStrip from "@/components/sheard/FeatureStrip";
import Hero from "@/components/sheard/Hero";
import HowPizzaHubWorks from "@/components/sheard/HowPizzaHubWorks";
import PizzaCategories from "@/components/sheard/PizzaCategories";
import Tostify from "@/components/sheard/Tostify";
import WhyChoose from "@/components/sheard/WhyChoose";
import React from "react";

const Home = () => {
  return (
    <div>
      <Hero />
      <FeatureStrip />
      <PizzaCategories />
      <HowPizzaHubWorks />
      <WhyChoose />
      <Tostify />
    </div>
  );
};

export default Home;

import FeatureStrip from "@/components/sheard/FeatureStrip";
import FeaturedMenu from "@/components/sheard/FeaturedMenu";
import Hero from "@/components/sheard/Hero";
import HowPizzaHubWorks from "@/components/sheard/HowPizzaHubWorks";
import PizzaCategories from "@/components/sheard/PizzaCategories";
import Tostify from "@/components/sheard/Tostify";
import WhyChoose from "@/components/sheard/WhyChoose";


const Home = () => {
  return (
    <div>
      <Hero />
      <FeatureStrip />
      <FeaturedMenu />
      <PizzaCategories />
      <HowPizzaHubWorks />
      <WhyChoose />
      <Tostify />
    </div>
  );
};

export default Home;

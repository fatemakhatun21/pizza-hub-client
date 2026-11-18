import Hero from "@/components/home/Hero";
import FeaturedMenu from "@/components/home/FeaturedMenu";
import PizzaCategories from "@/components/home/PizzaCategories";
import WhyChooseUs from "@/components/home/WhyChooseUs";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <FeaturedMenu />
      <PizzaCategories />
      <WhyChooseUs />
    </main>
  );
}

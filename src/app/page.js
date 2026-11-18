import Hero from "@/components/home/Hero";
import FeaturedMenu from "@/components/home/FeaturedMenu";
import PizzaCategories from "@/components/home/PizzaCategories";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <FeaturedMenu />
      <PizzaCategories />
    </main>
  );
}

import Hero from "@/components/home/Hero";
import FeaturedMenu from "@/components/home/FeaturedMenu";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <FeaturedMenu />
    </main>
  );
}

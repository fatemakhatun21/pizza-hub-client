import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const categories = [
  {
    name: "Classic Pizzas",
    description: "Timeless cheesy favorites",
    image: "/pizzas/margherita.png",
    slug: "Classic Pizzas",
  },
  {
    name: "Vegetarian Pizzas",
    description: "Fresh, colorful & delicious",
    image: "/pizzas/veggie-supreme.png",
    slug: "Vegetarian Pizzas",
  },
  {
    name: "Meat Lovers",
    description: "Loaded with savory goodness",
    image: "/pizzas/meat-lovers.png",
    slug: "Meat Lovers",
  },
  {
    name: "Specialty / Gourmet",
    description: "Extraordinary pizza creations",
    image: "/pizzas/hawaiian.png",
    slug: "Specialty / Gourmet Pizzas",
  },
  {
    name: "Sides & Appetizers",
    description: "Perfect additions to your meal",
    image: "/categories/sides-appetizers.png",
    slug: "Sides & Appetizers",
  },
  {
    name: "Beverages & Desserts",
    description: "Sip, savor & satisfy",
    image: "/categories/beverages-desserts.png",
    slug: "Beverages & Desserts",
  },
];

export default function PizzaCategories() {
  return (
    <section className="bg-[#FFF8ED] py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        <div className="mb-12 text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#C93425]">
            Find Your Favorite
          </span>

          <h2 className="mt-3 text-4xl font-black tracking-tight text-[#25201D] md:text-5xl">
            Explore Our Categories
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-[#6B625C]">
            From timeless classics to gourmet creations,
            explore flavors made for every craving.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/menu?category=${encodeURIComponent(category.slug)}`}
              className="group relative overflow-hidden rounded-[24px] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#C93425] transition-all group-hover:bg-[#C93425] group-hover:text-white">
                  <ArrowUpRight size={21} />
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6">
                  <h3 className="text-2xl font-bold text-white">
                    {category.name}
                  </h3>

                  <p className="mt-1 text-sm text-white/80">
                    {category.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

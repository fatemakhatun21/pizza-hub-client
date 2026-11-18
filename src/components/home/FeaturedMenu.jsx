
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Store } from "lucide-react";

const featuredPizzas = [
  {
    id: 1,
    name: "Classic Pepperoni",
    category: "Classic Pizzas",
    price: 14.99,
    location: "Dhanmondi, Dhaka",
    vendor: "Pizza Corner",
    image: "/pizzas/classic-pepperoni.png",
  },
  {
    id: 2,
    name: "Margherita Pizza",
    category: "Classic Pizzas",
    price: 12.99,
    location: "Gulshan, Dhaka",
    vendor: "Italian Oven",
    image: "/pizzas/margherita.png",
  },
  {
    id: 3,
    name: "Meat Lovers",
    category: "Meat Lovers",
    price: 18.99,
    location: "Banani, Dhaka",
    vendor: "Firestone Pizza",
    image: "/pizzas/meat-lovers.png",
  },
  {
    id: 4,
    name: "Veggie Supreme",
    category: "Vegetarian Pizzas",
    price: 13.99,
    location: "Uttara, Dhaka",
    vendor: "Green Slice",
    image: "/pizzas/veggie-supreme.png",
  },
  {
    id: 5,
    name: "Hawaiian Pizza",
    category: "Specialty Pizzas",
    price: 16.99,
    location: "Mirpur, Dhaka",
    vendor: "Slice House",
    image: "/pizzas/hawaiian.png",
  },
  {
    id: 6,
    name: "Pepperoni Feast",
    category: "Classic Pizzas",
    price: 15.99,
    location: "Mohammadpur, Dhaka",
    vendor: "Urban Pizza",
    image: "/pizzas/pepperoni.png",
  },
];

export default function FeaturedMenu() {
  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-[#C93425]">
            Fresh From The Oven
          </span>

          <h2 className="mt-3 text-4xl font-black tracking-tight text-[#25201D] md:text-5xl">
            Our Most Loved Pizzas
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-[#6B625C]">
            Discover mouthwatering pizzas crafted with love
            by your favorite local restaurants.
          </p>
        </div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPizzas.map((pizza) => (
            <div
              key={pizza.id}
              className="group overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-60 overflow-hidden bg-[#FFF8ED]">
                <Image
                  src={pizza.image}
                  alt={pizza.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#C93425] shadow-sm">
                  {pizza.category}
                </span>
              </div>

              <div className="flex h-[250px] flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-bold text-[#25201D]">
                    {pizza.name}
                  </h3>

                  <span className="whitespace-nowrap text-xl font-black text-[#C93425]">
                    ${pizza.price.toFixed(2)}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-[#6B625C]">
                  <p className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#C93425]" />
                    {pizza.location}
                  </p>

                  <p className="flex items-center gap-2">
                    <Store size={16} className="text-[#C93425]" />
                    {pizza.vendor}
                  </p>
                </div>

                <Link
                  href={`/menu/${pizza.id}`}
                  className="mt-auto flex items-center justify-center gap-2 rounded-full border border-[#C93425] py-3 font-semibold text-[#C93425] transition-colors hover:bg-[#C93425] hover:text-white"
                >
                  View Details
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-3 rounded-full bg-[#C93425] px-8 py-4 font-semibold text-white transition-colors hover:bg-[#A7281D]"
          >
            Explore Full Menu
            <ArrowRight size={19} />
          </Link>
        </div>
      </div>
    </section>
  );
}

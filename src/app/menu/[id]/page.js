import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Store,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";

const menuItems = [
  {
    id: "1",
    name: "Classic Pepperoni",
    category: "Classic Pizzas",
    price: 14.99,
    location: "Dhanmondi, Dhaka",
    vendor: "Pizza Corner",
    description:
      "A delicious classic pizza loaded with savory pepperoni, melted mozzarella cheese, and rich tomato sauce on a perfectly baked crust.",
    images: ["/pizzas/classic-pepperoni.png"],
  },
  {
    id: "2",
    name: "Margherita Pizza",
    category: "Classic Pizzas",
    price: 12.99,
    location: "Gulshan, Dhaka",
    vendor: "Italian Oven",
    description:
      "Traditional Italian pizza topped with creamy mozzarella, fresh basil, and flavorful tomato sauce.",
    images: ["/pizzas/margherita.png"],
  },
  {
    id: "3",
    name: "Meat Lovers",
    category: "Meat Lovers",
    price: 18.99,
    location: "Banani, Dhaka",
    vendor: "Firestone Pizza",
    description:
      "A hearty pizza packed with delicious meats, savory seasoning, and plenty of melted cheese.",
    images: ["/pizzas/meat-lovers.png"],
  },
  {
    id: "4",
    name: "Veggie Supreme",
    category: "Vegetarian Pizzas",
    price: 13.99,
    location: "Uttara, Dhaka",
    vendor: "Green Slice",
    description:
      "Fresh vegetables, colorful bell peppers, mushrooms, olives, and melted mozzarella on a delicious crust.",
    images: ["/pizzas/veggie-supreme.png"],
  },
  {
    id: "5",
    name: "Hawaiian Pizza",
    category: "Specialty / Gourmet Pizzas",
    price: 16.99,
    location: "Mirpur, Dhaka",
    vendor: "Slice House",
    description:
      "A tasty combination of juicy pineapple, savory toppings, rich tomato sauce, and mozzarella cheese.",
    images: ["/pizzas/hawaiian.png"],
  },
  {
    id: "6",
    name: "Pepperoni Feast",
    category: "Classic Pizzas",
    price: 15.99,
    location: "Mohammadpur, Dhaka",
    vendor: "Urban Pizza",
    description:
      "A pepperoni lover's favorite with generous toppings, mozzarella cheese, and delicious tomato sauce.",
    images: ["/pizzas/pepperoni.png"],
  },
  {
    id: "7",
    name: "Crispy Sides Platter",
    category: "Sides & Appetizers",
    price: 8.99,
    location: "Gulshan, Dhaka",
    vendor: "Italian Oven",
    description:
      "A tempting selection of crispy, golden appetizers, perfect for enjoying alongside your pizza.",
    images: ["/categories/sides-appetizers.png"],
  },
  {
    id: "8",
    name: "Refreshing Drinks & Desserts",
    category: "Beverages & Desserts",
    price: 6.99,
    location: "Dhanmondi, Dhaka",
    vendor: "Pizza Corner",
    description:
      "Refresh yourself with delicious beverages and sweet treats that perfectly complement your meal.",
    images: ["/categories/beverages-desserts.png"],
  },
];

export default async function MenuItemDetailsPage({ params }) {
  const { id } = await params;

  const item = menuItems.find((pizza) => pizza.id === id);

  if (!item) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#FFF8ED]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <Link
          href="/menu"
          className="mb-10 inline-flex items-center gap-2 font-semibold text-[#C93425] transition-colors hover:text-[#A7281D]"
        >
          <ArrowLeft size={19} />
          Back to Menu
        </Link>

        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">

          <div className="overflow-hidden rounded-[32px] border border-orange-100 bg-white p-3 shadow-lg shadow-orange-950/5">
            <div className="relative aspect-square overflow-hidden rounded-[24px]">
              <Image
                src={item.images[0]}
                alt={item.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="py-3">
            <span className="inline-flex rounded-full bg-[#FCE8DD] px-4 py-2 text-sm font-semibold text-[#C93425]">
              {item.category}
            </span>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-[#25201D] md:text-5xl">
              {item.name}
            </h1>

            <p className="mt-6 text-4xl font-black text-[#C93425]">
              ${item.price.toFixed(2)}
            </p>

            <p className="mt-7 text-lg leading-8 text-[#6B625C]">
              {item.description}
            </p>

            <div className="my-9 h-px bg-[#EBDCCB]" />

            <div className="rounded-2xl border border-orange-100 bg-white p-6">
              <h2 className="mb-5 text-xl font-bold text-[#25201D]">
                Restaurant Information
              </h2>

              <div className="space-y-4 text-[#6B625C]">
                <div className="flex items-center gap-3">
                  <Store size={21} className="text-[#C93425]" />
                  <span>{item.vendor}</span>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin size={21} className="text-[#C93425]" />
                  <span>{item.location}</span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={21}
                    className="text-green-600"
                  />
                  <span>Available to Order</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="mt-8 flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-full bg-[#C93425] px-7 py-4 text-lg font-semibold text-white opacity-65"
            >
              <ShoppingBag size={21} />
              Order Now — Coming Soon
            </button>

            <p className="mt-4 text-center text-sm text-[#6B625C]">
              Online ordering will be available after authentication and order setup.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

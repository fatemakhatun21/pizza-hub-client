"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, ShoppingCart, Loader2 } from "lucide-react";

export default function PizzaDetailsPage({ params }) {
  const { id } = use(params);

  const [pizza, setPizza] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPizza = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/menu/${id}`
        );

        if (!response.ok) {
          throw new Error("Pizza not found");
        }

        const data = await response.json();
        setPizza(data.pizza || data.item || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPizza();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#C93425]" size={35} />
      </div>
    );
  }

  if (error || !pizza) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold">Pizza Not Found</h1>
        <p className="mt-3 text-gray-500">
          This pizza is unavailable or has not been approved.
        </p>
        <Link href="/menu" className="mt-6 inline-block text-[#C93425]">
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:py-20">
      <Link
        href="/menu"
        className="mb-8 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#C93425]"
      >
        <ArrowLeft size={18} /> Back to Menu
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl bg-gray-100">
          <img
            src={pizza.image}
            alt={pizza.name}
            className="h-[350px] w-full object-cover md:h-[480px]"
          />
        </div>

        <div className="flex flex-col justify-center">
          <span className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#C93425]">
            {pizza.category}
          </span>

          <h1 className="text-4xl font-bold md:text-5xl">
            {pizza.name}
          </h1>

          <p className="mt-5 leading-7 text-gray-600">
            {pizza.description}
          </p>

          <div className="mt-6 flex items-center gap-2 text-gray-500">
            <MapPin size={18} />
            {pizza.location}
          </div>

          <p className="mt-8 text-3xl font-bold text-[#C93425]">
            ${Number(pizza.price).toFixed(2)}
          </p>

          <Link
            href={`/order/${pizza._id}`}
            className="mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-[#C93425] px-8 py-4 font-semibold text-white transition hover:bg-[#A7281D]"
          >
            <ShoppingCart size={19} />
            Order This Pizza
          </Link>
        </div>
      </div>
    </main>
  );
}

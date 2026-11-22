"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Crown, MapPin, Store } from "lucide-react";
import { apiFetch, readApiError } from "@/lib/api";

const FALLBACK_IMAGE = "/pizzas/classic-pepperoni.png";

function FeaturedSkeleton() {
    return (
        <div role="status">
            <span className="sr-only">Loading featured pizzas...</span>

            <div
                aria-hidden="true"
                className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3"
            >
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm"
                    >
                        <div className="h-60 animate-pulse bg-[#FFF8ED]" />

                        <div className="flex h-[250px] flex-col gap-4 p-6">
                            <div className="h-6 w-3/4 animate-pulse rounded bg-orange-50" />

                            <div className="space-y-3">
                                <div className="h-4 w-1/2 animate-pulse rounded bg-orange-50" />
                                <div className="h-4 w-2/5 animate-pulse rounded bg-orange-50" />
                            </div>

                            <div className="mt-auto h-12 animate-pulse rounded-full bg-orange-50" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function FeaturedMenu() {
    const reduceMotion = useReducedMotion();

    const [pizzas, setPizzas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function loadFeatured() {
            try {
                setLoading(true);
                setError("");

                const response = await apiFetch(
                    "/api/menu/featured?limit=6",
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error(
                        await readApiError(
                            response,
                            "Featured pizzas are unavailable right now."
                        )
                    );
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error("Invalid featured menu response.");
                }

                setPizzas(data);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message || "Could not load featured pizzas.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadFeatured();

        return () => controller.abort();
    }, [reloadKey]);

    return (
        <section className="bg-white py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
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

                {loading ? (
                    <FeaturedSkeleton />
                ) : error ? (
                    <div
                        role="alert"
                        className="rounded-3xl bg-white px-6 py-16 text-center"
                    >
                        <p className="text-[#6B625C]">{error}</p>

                        <button
                            type="button"
                            onClick={() => setReloadKey((key) => key + 1)}
                            className="mt-5 rounded-full bg-[#C93425] px-6 py-3 font-semibold text-white transition hover:bg-[#A7281D]"
                        >
                            Try Again
                        </button>
                    </div>
                ) : pizzas.length === 0 ? (
                    <div className="rounded-3xl px-6 py-16 text-center">
                        <p className="text-[#6B625C]">
                            No featured pizzas have been selected yet.
                        </p>

                        <Link
                            href="/menu"
                            className="mt-5 inline-block font-semibold text-[#C93425]"
                        >
                            Browse the full menu
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                        {pizzas.map((pizza, index) => (
                            <motion.div
                                key={pizza._id}
                                initial={
                                    reduceMotion
                                        ? false
                                        : { opacity: 0, y: 35 }
                                }
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.15 }}
                                transition={{
                                    duration: 0.5,
                                    delay: reduceMotion ? 0 : (index % 3) * 0.1,
                                    ease: "easeOut",
                                }}
                                className="group overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl"
                            >
                                <div className="relative h-60 overflow-hidden bg-[#FFF8ED]">
                                    <img
                                        src={pizza.image || FALLBACK_IMAGE}
                                        alt={pizza.name || "Pizza"}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />

                                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#C93425] shadow-sm">
                                        {pizza.category}
                                    </span>

                                    {pizza.isFeatured && (
                                        <span
                                            aria-label="Featured pizza"
                                            className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-[#C93425] px-3 py-1 text-xs font-semibold text-white shadow-sm"
                                        >
                                            <Crown size={13} />
                                            Featured
                                        </span>
                                    )}
                                </div>

                                <div className="flex h-[250px] flex-col p-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-xl font-bold text-[#25201D]">
                                            {pizza.name}
                                        </h3>

                                        <span className="whitespace-nowrap text-xl font-black text-[#C93425]">
                                            ${Number(pizza.price).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-2 text-sm text-[#6B625C]">
                                        <p className="flex items-center gap-2">
                                            <MapPin
                                                size={16}
                                                className="shrink-0 text-[#C93425]"
                                            />
                                            {pizza.location || "Location unavailable"}
                                        </p>

                                        <p className="flex items-center gap-2">
                                            <Store
                                                size={16}
                                                className="shrink-0 text-[#C93425]"
                                            />
                                            {pizza.vendor || "PizzaHub Vendor"}
                                        </p>
                                    </div>

                                    <Link
                                        href={`/menu/${pizza._id}`}
                                        className="mt-auto flex items-center justify-center gap-2 rounded-full border border-[#C93425] py-3 font-semibold text-[#C93425] transition-colors hover:bg-[#C93425] hover:text-white"
                                    >
                                        View Details
                                        <ArrowRight size={17} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

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

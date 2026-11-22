"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    Search,
    SlidersHorizontal,
    MapPin,
    Store,
    ArrowUpRight,
    Pizza,
    X,
    Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const API_URL = "http://localhost:5000";

const categories = [
    "All Categories",
    "Classic Pizzas",
    "Vegetarian Pizzas",
    "Meat Lovers",
    "Specialty / Gourmet Pizzas",
    "Specialty Pizzas",
    "Sides & Appetizers",
    "Beverages & Desserts",
];

export default function BrowseMenuPage() {
    const searchParams = useSearchParams();
    const urlCategory = searchParams.get("category");

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState(
        categories.includes(urlCategory)
            ? urlCategory
            : "All Categories"
    );
    const [location, setLocation] = useState("All Locations");
    const [sort, setSort] = useState("default");

    useEffect(() => {
        const controller = new AbortController();

        const fetchMenu = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/api/menu`,
                    {
                        signal: controller.signal,
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to load menu items.");
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error("Invalid menu response.");
                }

                setMenuItems(data);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message || "Something went wrong.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchMenu();

        return () => controller.abort();
    }, []);

    useEffect(() => {
        setCategory(
            categories.includes(urlCategory)
                ? urlCategory
                : "All Categories"
        );
    }, [urlCategory]);

    const locations = useMemo(() => {
        const uniqueLocations = [
            ...new Set(
                menuItems
                    .map((item) => item.location)
                    .filter(Boolean)
            ),
        ];

        return ["All Locations", ...uniqueLocations.sort()];
    }, [menuItems]);

    const filteredItems = useMemo(() => {
        const results = menuItems.filter((item) => {
            const matchesSearch = (item.name || "")
                .toLowerCase()
                .includes(search.trim().toLowerCase());

            const matchesCategory =
                category === "All Categories" ||
                item.category === category;

            const matchesLocation =
                location === "All Locations" ||
                item.location === location;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesLocation
            );
        });

        if (sort === "low") {
            results.sort((a, b) => a.price - b.price);
        }

        if (sort === "high") {
            results.sort((a, b) => b.price - a.price);
        }

        return results;
    }, [menuItems, search, category, location, sort]);

    const resetFilters = () => {
        setSearch("");
        setCategory("All Categories");
        setLocation("All Locations");
        setSort("default");
    };

    return (
        <main className="min-h-screen bg-[#FFF8ED]">

            <section className="border-b border-orange-100 bg-white py-16 text-center">
                <div className="mx-auto max-w-7xl px-6">
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#C93425]">
                        Fresh Flavors Await
                    </span>

                    <h1 className="mt-4 text-4xl font-black tracking-tight text-[#25201D] md:text-6xl">
                        Explore Our{" "}
                        <span className="text-[#C93425]">
                            Menu
                        </span>
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-[#6B625C]">
                        Discover mouthwatering pizzas, delicious sides,
                        and refreshing drinks from your favorite local
                        restaurants.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

                <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm md:p-7">
                    <div className="mb-5 flex items-center gap-2">
                        <SlidersHorizontal
                            size={20}
                            className="text-[#C93425]"
                        />

                        <h2 className="text-lg font-bold text-[#25201D]">
                            Find Your Favorite
                        </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                        <div className="relative">
                            <Search
                                size={19}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B817B]"
                            />

                            <Input
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search pizzas..."
                                aria-label="Search menu items"
                                className="h-12 rounded-xl border-[#EBDCCB] pl-11"
                            />
                        </div>

                        <select
                            value={category}
                            onChange={(e) =>
                                setCategory(e.target.value)
                            }
                            aria-label="Filter by category"
                            className="h-12 w-full rounded-xl border border-[#EBDCCB] bg-white px-4 text-sm text-[#25201D]"
                        >
                            {categories.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>

                        <select
                            value={location}
                            onChange={(e) =>
                                setLocation(e.target.value)
                            }
                            aria-label="Filter by location"
                            className="h-12 w-full rounded-xl border border-[#EBDCCB] bg-white px-4 text-sm text-[#25201D]"
                        >
                            {locations.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sort}
                            onChange={(e) =>
                                setSort(e.target.value)
                            }
                            aria-label="Sort menu items"
                            className="h-12 w-full rounded-xl border border-[#EBDCCB] bg-white px-4 text-sm text-[#25201D]"
                        >
                            <option value="default">
                                Default Sorting
                            </option>

                            <option value="low">
                                Price: Low to High
                            </option>

                            <option value="high">
                                Price: High to Low
                            </option>
                        </select>
                    </div>
                </div>

                <div className="mb-7 mt-10 flex flex-wrap items-center justify-between gap-4">
                    <p className="font-medium text-[#6B625C]">
                        Showing{" "}
                        <span className="font-bold text-[#C93425]">
                            {loading ? "..." : filteredItems.length}
                        </span>{" "}
                        delicious items
                    </p>

                    <button
                        type="button"
                        onClick={resetFilters}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#C93425] hover:underline"
                    >
                        <X size={17} />
                        Reset Filters
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2
                            size={36}
                            className="animate-spin text-[#C93425]"
                        />
                    </div>
                ) : error ? (
                    <div
                        role="alert"
                        className="rounded-3xl border border-red-100 bg-white px-6 py-16 text-center"
                    >
                        <p className="font-semibold text-red-600">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-5 rounded-full bg-[#C93425] px-6 py-3 font-semibold text-white"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredItems.length > 0 ? (

                    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredItems.map((item) => (
                            <article
                                key={item._id}
                                className="group overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="relative h-60 overflow-hidden">
                                    <Image
                                        src={item.image || "/pizzas/classic-pepperoni.png"}
                                        alt={item.name}
                                        fill
                                        unoptimized
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />

                                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#C93425] shadow-sm">
                                        {item.category}
                                    </span>
                                </div>

                                <div className="flex min-h-[245px] flex-col p-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-xl font-bold text-[#25201D]">
                                            {item.name}
                                        </h3>

                                        <span className="whitespace-nowrap text-xl font-black text-[#C93425]">
                                            ${Number(item.price).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-2 text-sm text-[#6B625C]">
                                        <p className="flex items-center gap-2">
                                            <MapPin
                                                size={16}
                                                className="shrink-0 text-[#C93425]"
                                            />
                                            {item.location}
                                        </p>

                                        <p className="flex items-center gap-2">
                                            <Store
                                                size={16}
                                                className="shrink-0 text-[#C93425]"
                                            />
                                            {item.vendor || "PizzaHub Vendor"}
                                        </p>
                                    </div>

                                    <Link
                                        href={`/order/${item._id}`}
                                        className="mt-auto flex items-center justify-center gap-2 rounded-full border border-[#C93425] py-3 font-semibold text-[#C93425] transition-colors hover:bg-[#C93425] hover:text-white"
                                    >
                                        Order Now
                                        <ArrowUpRight size={18} />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-3xl border border-orange-100 bg-white px-6 py-20 text-center">
                        <Pizza
                            size={54}
                            className="mx-auto text-[#C93425]"
                            strokeWidth={1.4}
                        />

                        <h2 className="mt-5 text-2xl font-bold text-[#25201D]">
                            No menu items found
                        </h2>

                        <p className="mt-3 text-[#6B625C]">
                            No approved pizzas match your filters yet.
                        </p>

                        <button
                            type="button"
                            onClick={resetFilters}
                            className="mt-6 rounded-full bg-[#C93425] px-7 py-3 font-semibold text-white hover:bg-[#A7281D]"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}

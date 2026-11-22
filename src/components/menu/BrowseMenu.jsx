"use client";

import { useEffect, useMemo, useState } from "react";
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
    Crown,
    Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { apiFetch, readApiError } from "@/lib/api";
import WishlistButton from "@/components/menu/WishlistButton";

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

export default function BrowseMenu() {
    const searchParams = useSearchParams();
    const urlCategory = searchParams.get("category");

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [categoryOverride, setCategoryOverride] = useState({
        source: null,
        value: "All Categories",
    });
    const [location, setLocation] = useState("All Locations");
    const [sort, setSort] = useState("default");

    const urlCategoryValue = categories.includes(urlCategory)
        ? urlCategory
        : "All Categories";

    const category =
        categoryOverride.source === urlCategory
            ? categoryOverride.value
            : urlCategoryValue;

    const setCategory = (value) =>
        setCategoryOverride({ source: urlCategory, value });

    useEffect(() => {
        const controller = new AbortController();

        async function fetchMenu() {
            try {
                setLoading(true);
                setError("");

                const response = await apiFetch("/api/menu", {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(
                        await readApiError(
                            response,
                            "Failed to load menu items."
                        )
                    );
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error("Invalid menu response.");
                }

                setMenuItems(data);
            } catch (err) {
                if (err.name !== "AbortError") {
                    const message = err.message || "Something went wrong.";
                    setError(message);
                    toast.error(message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        fetchMenu();

        return () => controller.abort();
    }, []);

    const locations = useMemo(() => {
        const unique = [
            ...new Set(
                menuItems.map((item) => item.location).filter(Boolean)
            ),
        ];

        return ["All Locations", ...unique.sort()];
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
            results.sort(
                (a, b) => Number(a.price) - Number(b.price)
            );
        }

        if (sort === "high") {
            results.sort(
                (a, b) => Number(b.price) - Number(a.price)
            );
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

                    <h1 className="mt-4 text-4xl font-black text-[#25201D] md:text-6xl">
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
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search pizzas..."
                                aria-label="Search menu items"
                                className="h-12 rounded-xl border-[#EBDCCB] pl-11"
                            />
                        </div>

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            aria-label="Filter by category"
                            className="h-12 rounded-xl border border-[#EBDCCB] bg-white px-4 text-sm"
                        >
                            {categories.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>

                        <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            aria-label="Filter by location"
                            className="h-12 rounded-xl border border-[#EBDCCB] bg-white px-4 text-sm"
                        >
                            {locations.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            aria-label="Sort menu items"
                            className="h-12 rounded-xl border border-[#EBDCCB] bg-white px-4 text-sm"
                        >
                            <option value="default">Default Sorting</option>
                            <option value="low">Price: Low to High</option>
                            <option value="high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                <div className="mb-7 mt-10 flex items-center justify-between gap-4">
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
                        className="flex items-center gap-2 text-sm font-semibold text-[#C93425]"
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
                        className="rounded-3xl bg-white px-6 py-16 text-center"
                    >
                        <p className="text-red-600">{error}</p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-5 rounded-full bg-[#C93425] px-6 py-3 text-white"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredItems.length > 0 ? (
                    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredItems.map((item) => (
                            <article
                                key={item._id}
                                className="group overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="relative h-60 overflow-hidden">
                                    <img
                                        src={
                                            item.image ||
                                            "/pizzas/classic-pepperoni.png"
                                        }
                                        alt={item.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />

                                    <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#C93425]">
                                            {item.category}
                                        </span>

                                        {(item.vendorPlan === "premium" ||
                                            item.isFeatured) && (
                                            <div className="flex flex-wrap gap-2">
                                                {item.vendorPlan ===
                                                    "premium" && (
                                                    <span
                                                        aria-label="Premium vendor"
                                                        className="inline-flex items-center gap-1 rounded-full bg-[#25201D] px-3 py-1 text-xs font-semibold text-[#FFD27A]"
                                                    >
                                                        <Crown size={13} />
                                                        Premium
                                                    </span>
                                                )}

                                                {item.isFeatured && (
                                                    <span
                                                        aria-label="Featured pizza"
                                                        className="inline-flex items-center gap-1 rounded-full bg-[#C93425] px-3 py-1 text-xs font-semibold text-white"
                                                    >
                                                        <Sparkles size={13} />
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <WishlistButton
                                        pizzaId={item._id}
                                        className="absolute right-4 top-4 z-10"
                                    />
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
                                        href={`/menu/${item._id}`}
                                        className="mt-auto flex items-center justify-center gap-2 rounded-full border border-[#C93425] py-3 font-semibold text-[#C93425] transition-colors hover:bg-[#C93425] hover:text-white"
                                    >
                                        View Details
                                        <ArrowUpRight size={18} />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-3xl bg-white px-6 py-20 text-center">
                        <Pizza
                            size={54}
                            className="mx-auto text-[#C93425]"
                        />

                        <h2 className="mt-5 text-2xl font-bold">
                            No menu items found
                        </h2>

                        <p className="mt-3 text-[#6B625C]">
                            No approved pizzas match your filters.
                        </p>

                        <button
                            type="button"
                            onClick={resetFilters}
                            className="mt-6 rounded-full bg-[#C93425] px-7 py-3 font-semibold text-white"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}

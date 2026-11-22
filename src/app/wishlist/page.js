"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { apiFetch, readApiError } from "@/lib/api";
import { toast } from "sonner";
import {
    ArrowRight,
    Heart,
    Loader2,
    MapPin,
    Pizza,
    Trash2,
} from "lucide-react";

const FALLBACK_IMAGE = "/pizzas/classic-pepperoni.png";

function getPizzaId(item) {
    return item?._id || item?.pizzaId || item?.pizza?._id || "";
}

export default function WishlistPage() {
    const { data: session, isPending } = authClient.useSession();
    const userId = session?.user?.id;

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (isPending) return;

        if (!userId) return;

        const controller = new AbortController();

        async function loadWishlist() {
            try {
                setLoading(true);
                setError("");

                const response = await apiFetch("/api/wishlist", {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(
                        await readApiError(
                            response,
                            "Failed to load your wishlist."
                        )
                    );
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error("Invalid wishlist response.");
                }

                setItems(data);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message || "Failed to load your wishlist.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadWishlist();

        return () => controller.abort();
    }, [isPending, userId, reloadKey]);

    const removeItem = async (item) => {
        const id = getPizzaId(item);

        if (!id || removingId) return;

        const previousItems = items;

        setRemovingId(id);
        setItems((current) =>
            current.filter((entry) => getPizzaId(entry) !== id)
        );

        try {
            const response = await apiFetch(
                `/api/wishlist/${encodeURIComponent(id)}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                throw new Error(
                    await readApiError(
                        response,
                        "Failed to remove this pizza from your wishlist."
                    )
                );
            }

            toast.success("Removed from your wishlist");
        } catch (err) {
            setItems(previousItems);
            toast.error(
                err.message || "Failed to remove this pizza from your wishlist."
            );
        } finally {
            setRemovingId("");
        }
    };

    const showLoading = Boolean(userId) && loading;

    if (isPending || showLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2
                    size={34}
                    className="animate-spin text-[#C93425]"
                    aria-label="Loading wishlist"
                />
            </div>
        );
    }

    if (!session?.user) {
        return (
            <main className="mx-auto max-w-xl px-5 py-24 text-center">
                <Heart
                    size={52}
                    className="mx-auto text-[#C93425]"
                    aria-hidden="true"
                />

                <h1 className="mt-6 text-3xl font-black text-[#25201D]">
                    Sign in to see your wishlist
                </h1>

                <p className="mt-3 text-[#6B625C]">
                    Save the pizzas you love and find them all here.
                </p>

                <Link
                    href="/login"
                    className="mt-7 inline-block rounded-full bg-[#C93425] px-8 py-4 font-semibold text-white transition hover:bg-[#A7281D]"
                >
                    Sign In
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#FFF8ED] px-5 py-12">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-wrap items-center justify-between gap-5">
                    <div>
                        <h1 className="text-3xl font-black text-[#25201D] md:text-4xl">
                            My Wishlist
                        </h1>

                        <p className="mt-2 text-[#6B625C]">
                            Your favorite pizzas, all in one place.
                        </p>
                    </div>

                    <Link
                        href="/menu"
                        className="inline-flex items-center gap-2 rounded-full bg-[#C93425] px-6 py-3 font-semibold text-white transition hover:bg-[#A7281D]"
                    >
                        Browse Menu
                        <ArrowRight size={18} />
                    </Link>
                </div>

                {error ? (
                    <div
                        role="alert"
                        className="rounded-3xl bg-white px-6 py-16 text-center"
                    >
                        <p className="text-red-600">{error}</p>

                        <button
                            type="button"
                            onClick={() => setReloadKey((key) => key + 1)}
                            className="mt-5 rounded-full bg-[#C93425] px-6 py-3 font-semibold text-white"
                        >
                            Try Again
                        </button>
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-3xl bg-white px-6 py-20 text-center">
                        <Heart
                            size={54}
                            className="mx-auto text-[#C93425]"
                        />

                        <h2 className="mt-5 text-2xl font-bold text-[#25201D]">
                            No saved pizzas yet
                        </h2>

                        <p className="mt-3 text-[#6B625C]">
                            Tap the heart on any pizza to save it here.
                        </p>

                        <Link
                            href="/menu"
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#C93425] px-7 py-3 font-semibold text-white"
                        >
                            Explore Menu
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => {
                            const id = getPizzaId(item);

                            return (
                                <article
                                    key={id || item.name}
                                    className="group overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <div className="relative h-56 overflow-hidden bg-[#FFF8ED]">
                                        <img
                                            src={item.image || FALLBACK_IMAGE}
                                            alt={item.name || "Pizza"}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />

                                        {item.category && (
                                            <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#C93425] shadow-sm">
                                                {item.category}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex min-h-[220px] flex-col p-6">
                                        <div className="flex items-start justify-between gap-3">
                                            <h2 className="text-xl font-bold text-[#25201D]">
                                                {item.name}
                                            </h2>

                                            <span className="whitespace-nowrap text-xl font-black text-[#C93425]">
                                                ${Number(item.price).toFixed(2)}
                                            </span>
                                        </div>

                                        {item.location && (
                                            <p className="mt-4 flex items-center gap-2 text-sm text-[#6B625C]">
                                                <MapPin
                                                    size={16}
                                                    className="shrink-0 text-[#C93425]"
                                                />
                                                {item.location}
                                            </p>
                                        )}

                                        <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                                            <Link
                                                href={`/menu/${id}`}
                                                className="inline-flex items-center gap-2 rounded-full border border-[#C93425] px-5 py-3 font-semibold text-[#C93425] transition-colors hover:bg-[#C93425] hover:text-white"
                                            >
                                                View Details
                                                <ArrowRight size={17} />
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() => removeItem(item)}
                                                disabled={removingId === id}
                                                aria-label={`Remove ${item.name || "pizza"} from wishlist`}
                                                className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-[#6B625C] transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                                            >
                                                <Trash2 size={16} />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

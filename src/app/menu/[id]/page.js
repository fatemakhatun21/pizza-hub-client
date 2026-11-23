"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Crown,
    MapPin,
    ShoppingCart,
    Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { isPremiumAccount } from "@/lib/premium";
import { normalizeCategoryName } from "@/lib/menuCategories";
import WishlistInitialState from "@/components/menu/WishlistInitialState";
import PizzaReviews from "@/components/reviews/PizzaReviews";

function StatusMessage({ title, message }) {
    return (
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="mt-3 text-gray-500">{message}</p>
            <Link href="/menu" className="mt-6 inline-block text-[#C93425]">
                Back to Menu
            </Link>
        </div>
    );
}

export default function PizzaDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const detailsPath = id ? `/menu/${id}` : "/menu";

    const [state, setState] = useState(() => ({
        loading: Boolean(id),
        profile: null,
        pizza: null,
        error: id ? null : "notFound",
    }));

    useEffect(() => {
        if (!id) return;

        const controller = new AbortController();

        async function loadDetails() {
            try {
                const [authResponse, response] = await Promise.all([
                    apiFetch("/api/me", { signal: controller.signal }),
                    apiFetch(`/api/menu/${encodeURIComponent(id)}`, {
                        signal: controller.signal,
                    }),
                ]);

                if (controller.signal.aborted) return;

                if (authResponse.status === 401 || response.status === 401) {
                    router.replace(
                        `/login?callbackUrl=${encodeURIComponent(detailsPath)}`
                    );
                    return;
                }

                if (authResponse.status === 403 || response.status === 403) {
                    setState({ loading: false, profile: null, pizza: null, error: "forbidden" });
                    return;
                }

                if (response.status === 404) {
                    setState({ loading: false, profile: null, pizza: null, error: "notFound" });
                    return;
                }

                if (!authResponse.ok || !response.ok) {
                    setState({ loading: false, profile: null, pizza: null, error: "unavailable" });
                    return;
                }

                const [authData, pizzaData] = await Promise.all([
                    authResponse.json(),
                    response.json(),
                ]);

                if (controller.signal.aborted) return;

                setState({
                    loading: false,
                    profile: authData.user,
                    pizza: pizzaData,
                    error: null,
                });
            } catch {
                if (!controller.signal.aborted) {
                    setState({ loading: false, profile: null, pizza: null, error: "network" });
                }
            }
        }

        loadDetails();

        return () => controller.abort();
    }, [id, detailsPath, router]);

    if (state.loading) {
        return (
            <div className="mx-auto max-w-5xl px-6 py-24 text-center text-gray-500">
                Loading pizza details...
            </div>
        );
    }

    if (state.error === "notFound") {
        return (
            <StatusMessage
                title="Pizza not found"
                message="This pizza does not exist or has not been approved."
            />
        );
    }

    if (state.error === "forbidden") {
        return (
            <StatusMessage
                title="Account unavailable"
                message="Your account cannot access pizza details right now."
            />
        );
    }

    if (state.error) {
        return (
            <StatusMessage
                title="Unable to load pizza"
                message="The menu service is unavailable. Please try again."
            />
        );
    }

    const { profile, pizza } = state;
    const canOrder = profile?.role === "customer";
    const pizzaImages =
        Array.isArray(pizza.images) && pizza.images.length
            ? pizza.images
            : pizza.image
              ? [pizza.image]
              : ["/pizzas/classic-pepperoni.png"];

    return (
        <main className="mx-auto max-w-6xl px-4 py-12 md:py-20">
            <Link
                href="/menu"
                className="mb-8 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#C93425]"
            >
                <ArrowLeft size={18} /> Back to Menu
            </Link>

            <div className="grid gap-10 md:grid-cols-2">
                <div>
                    <div className="overflow-hidden rounded-3xl bg-gray-100">
                        <Image
                            src={pizzaImages[0]}
                            alt={pizza.name || "Pizza"}
                            width={1200}
                            height={900}
                            unoptimized
                            className="h-[350px] w-full object-cover md:h-[480px]"
                        />
                    </div>

                    {pizzaImages.length > 1 && (
                        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
                            {pizzaImages.slice(1).map((src, index) => (
                                <div
                                    key={`${src}-${index}`}
                                    className="overflow-hidden rounded-xl bg-gray-100"
                                >
                                    <Image
                                        src={src}
                                        alt={`Pizza image ${index + 2}`}
                                        width={240}
                                        height={180}
                                        unoptimized
                                        className="h-20 w-full object-cover sm:h-24"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col justify-center">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                        <span className="text-sm font-semibold uppercase tracking-widest text-[#C93425]">
                            {normalizeCategoryName(pizza.category)}
                        </span>

                        {isPremiumAccount(pizza) && (
                            <span
                                aria-label="Premium vendor"
                                className="inline-flex items-center gap-1 rounded-full bg-[#25201D] px-3 py-1 text-xs font-semibold text-[#FFD27A]"
                            >
                                <Crown size={14} />
                                Premium
                            </span>
                        )}

                        {pizza.isFeatured && (
                            <span
                                aria-label="Featured pizza"
                                className="inline-flex items-center gap-1 rounded-full bg-[#C93425] px-3 py-1 text-xs font-semibold text-white"
                            >
                                <Sparkles size={14} />
                                Featured
                            </span>
                        )}
                    </div>

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

                    <div className="mt-8 flex items-center gap-4">
                        <p className="text-3xl font-bold text-[#C93425]">
                            ${Number(pizza.price).toFixed(2)}
                        </p>

                        <WishlistInitialState pizzaId={pizza._id} />
                    </div>

                    {canOrder ? (
                        <Link
                            href={`/order/${pizza._id}`}
                            className="mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-[#C93425] px-8 py-4 font-semibold text-white transition hover:bg-[#A7281D]"
                        >
                            <ShoppingCart size={19} />
                            Order This Pizza
                        </Link>
                    ) : (
                        <p className="mt-8 rounded-xl border border-orange-100 bg-[#FFF8ED] px-5 py-4 text-sm text-[#6B625C]">
                            Only customer accounts can place orders.
                        </p>
                    )}
                </div>
            </div>

            <PizzaReviews pizzaId={pizza._id} />
        </main>
    );
}

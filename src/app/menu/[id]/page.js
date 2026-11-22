import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    Crown,
    MapPin,
    ShoppingCart,
    Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import WishlistInitialState from "@/components/menu/WishlistInitialState";
import PizzaReviews from "@/components/reviews/PizzaReviews";

export default async function PizzaDetailsPage({ params }) {
    const { id } = await params;

    let response;

    try {
        response = await apiFetch(`/api/menu/${encodeURIComponent(id)}`);
    } catch {
        return (
            <div className="mx-auto max-w-5xl px-6 py-24 text-center">
                <h1 className="text-3xl font-bold">Unable to load pizza</h1>
                <p className="mt-3 text-gray-500">
                    The menu service is unavailable. Please try again.
                </p>
                <Link href="/menu" className="mt-6 inline-block text-[#C93425]">
                    Back to Menu
                </Link>
            </div>
        );
    }

    if (response.status === 404) {
        notFound();
    }

    if (!response.ok) {
        return (
            <div className="mx-auto max-w-5xl px-6 py-24 text-center">
                <h1 className="text-3xl font-bold">Unable to load pizza</h1>
                <p className="mt-3 text-gray-500">
                    This pizza is unavailable or has not been approved.
                </p>
                <Link href="/menu" className="mt-6 inline-block text-[#C93425]">
                    Back to Menu
                </Link>
            </div>
        );
    }

    const pizza = await response.json();

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
                        src={pizza.image || "/pizzas/classic-pepperoni.png"}
                        alt={pizza.name || "Pizza"}
                        className="h-[350px] w-full object-cover md:h-[480px]"
                    />
                </div>

                <div className="flex flex-col justify-center">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                        <span className="text-sm font-semibold uppercase tracking-widest text-[#C93425]">
                            {pizza.category}
                        </span>

                        {pizza.vendorPlan === "premium" && (
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

                    <Link
                        href={`/order/${pizza._id}`}
                        className="mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-[#C93425] px-8 py-4 font-semibold text-white transition hover:bg-[#A7281D]"
                    >
                        <ShoppingCart size={19} />
                        Order This Pizza
                    </Link>
                </div>
            </div>

            <PizzaReviews pizzaId={pizza._id} />
        </main>
    );
}

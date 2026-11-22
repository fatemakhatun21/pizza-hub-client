"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { apiFetch, readApiError } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";

export default function OrderPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const [form, setForm] = useState({
        quantity: 1,
        deliveryAddress: "",
        deliveryDate: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await apiFetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pizzaId: id,
                    quantity: Number(form.quantity),
                    deliveryAddress: form.deliveryAddress.trim(),
                    deliveryDate: new Date(
                        `${form.deliveryDate}T12:00:00`
                    ).toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error(await readApiError(response, "Order failed"));
            }

            toast.success("Order placed successfully!");
            router.push("/customer/dashboard");
            router.refresh();
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (isPending) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-[#C93425]" />
            </div>
        );
    }

    if (!session?.user) {
        return (
            <main className="px-5 py-20 text-center">
                <h1 className="text-2xl font-bold">
                    Please sign in to order
                </h1>
                <Link href="/login" className="mt-4 inline-block text-[#C93425]">
                    Sign In
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#FFF8ED] px-5 py-12">
            <div className="mx-auto max-w-xl">
                <Link
                    href="/menu"
                    className="mb-6 inline-flex items-center gap-2 text-[#C93425]"
                >
                    <ArrowLeft size={18} />
                    Back to Menu
                </Link>

                <div className="rounded-2xl bg-white p-7 shadow-sm sm:p-9">
                    <ShoppingBag
                        size={32}
                        className="mb-4 text-[#C93425]"
                    />

                    <h1 className="text-3xl font-black">
                        Place Your Order
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Fill in your delivery information.
                    </p>

                    {error && (
                        <p
                            role="alert"
                            className="mt-5 rounded-xl bg-red-50 p-4 text-red-600"
                        >
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                        <div>
                            <label htmlFor="quantity" className="mb-2 block font-semibold">
                                Quantity
                            </label>
                            <input
                                id="quantity"
                                type="number"
                                min="1"
                                max="20"
                                required
                                value={form.quantity}
                                onChange={(e) =>
                                    setForm({ ...form, quantity: e.target.value })
                                }
                                className="w-full rounded-xl border p-3"
                            />
                        </div>

                        <div>
                            <label htmlFor="address" className="mb-2 block font-semibold">
                                Delivery Address
                            </label>
                            <textarea
                                id="address"
                                rows={3}
                                required
                                placeholder="House, Road, Area, City"
                                value={form.deliveryAddress}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        deliveryAddress: e.target.value,
                                    })
                                }
                                className="w-full rounded-xl border p-3"
                            />
                        </div>

                        <div>
                            <label htmlFor="date" className="mb-2 block font-semibold">
                                Delivery Date
                            </label>
                            <input
                                id="date"
                                type="date"
                                required
                                value={form.deliveryDate}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        deliveryDate: e.target.value,
                                    })
                                }
                                className="w-full rounded-xl border p-3"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C93425] p-3 font-semibold text-white disabled:opacity-60"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <ShoppingBag size={18} />
                            )}

                            {loading ? "Placing Order..." : "Place Order"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}

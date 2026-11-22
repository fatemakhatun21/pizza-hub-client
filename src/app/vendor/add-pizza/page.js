"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import ImageUpload from "@/components/vendor/ImageUpload";
import { ArrowLeft, Loader2, Pizza } from "lucide-react";

const initialForm = {
    name: "",
    description: "",
    category: "Classic Pizzas",
    price: "",
    location: "",
    image: "",
};

export default function AddPizzaPage() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const price = Number(form.price);

        if (!Number.isFinite(price) || price <= 0) {
            setError("Please enter a valid price.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/menu",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: form.name.trim(),
                        description: form.description.trim(),
                        category: form.category,
                        price,
                        location: form.location.trim(),
                        image: form.image.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to add pizza."
                );
            }

            router.push("/vendor/dashboard");
            router.refresh();
        } catch (err) {
            setError(err.message);
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
                    Please sign in first
                </h1>
                <Link href="/login" className="mt-4 inline-block text-[#C93425]">
                    Sign In
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#FFF8ED] px-5 py-12">
            <div className="mx-auto max-w-2xl">
                <Link
                    href="/vendor/dashboard"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#C93425]"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>

                <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-9">
                    <div className="mb-7">
                        <div className="mb-3 inline-flex rounded-xl bg-red-50 p-3 text-[#C93425]">
                            <Pizza size={26} />
                        </div>

                        <h1 className="text-3xl font-black text-[#25201D]">
                            Add New Pizza
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Your pizza will be submitted for admin approval.
                        </p>
                    </div>

                    {error && (
                        <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="mb-2 block font-semibold">
                                Pizza Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Classic Pepperoni"
                                required
                                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#C93425]"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="mb-2 block font-semibold">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe your pizza"
                                required
                                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#C93425]"
                            />
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="category" className="mb-2 block font-semibold">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 p-3"
                                >
                                    <option>Classic Pizzas</option>
                                    <option>Vegetarian Pizzas</option>
                                    <option>Meat Lovers</option>
                                    <option>Specialty Pizzas</option>
                                    <option>Sides & Appetizers</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="price" className="mb-2 block font-semibold">
                                    Price ($)
                                </label>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={form.price}
                                    onChange={handleChange}
                                    placeholder="14.99"
                                    required
                                    className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#C93425]"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="location" className="mb-2 block font-semibold">
                                Location
                            </label>
                            <input
                                id="location"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="Dhanmondi, Dhaka"
                                required
                                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#C93425]"
                            />
                        </div>

                        <ImageUpload
                            value={form.image}
                            onChange={(url) =>
                                setForm((prev) => ({ ...prev, image: url }))
                            }
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C93425] px-6 py-3 font-semibold text-white hover:bg-[#A7281D] disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Pizza for Approval"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}

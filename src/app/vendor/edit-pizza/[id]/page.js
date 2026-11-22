"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import ImageUpload from "@/components/vendor/ImageUpload";
import { ArrowLeft, Loader2, Save } from "lucide-react";

const API_URL = "http://localhost:5000";

export default function EditPizzaPage() {
    const router = useRouter();
    const { id } = useParams();
    const { data: session, isPending } = authClient.useSession();

    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "Classic Pizzas",
        price: "",
        location: "",
        image: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isPending) return;

        if (!session?.user) {
            setLoading(false);
            return;
        }

        const loadPizza = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/menu/vendor/mine`,
                    { credentials: "include" }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load pizza.");
                }

                const pizza = data.find((item) => item._id === id);

                if (!pizza) {
                    throw new Error("Pizza not found in your menu.");
                }

                setForm({
                    name: pizza.name || "",
                    description: pizza.description || "",
                    category: pizza.category || "Classic Pizzas",
                    price: String(pizza.price ?? ""),
                    location: pizza.location || "",
                    image: pizza.image || "",
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadPizza();
    }, [id, session?.user?.id, isPending]);

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

        setSaving(true);

        try {
            const response = await fetch(
                `${API_URL}/api/menu/${id}`,
                {
                    method: "PATCH",
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
                throw new Error(data.message || "Failed to update pizza.");
            }

            router.push("/vendor/dashboard");
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (isPending || loading) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center">
                <Loader2 size={32} className="animate-spin text-[#C93425]" />
            </main>
        );
    }

    if (!session?.user) {
        return (
            <main className="px-5 py-20 text-center">
                <h1 className="text-2xl font-bold">Please sign in first</h1>
                <Link href="/login" className="mt-4 inline-block text-[#C93425]">
                    Sign In
                </Link>
            </main>
        );
    }

    if (error && !form.name) {
        return (
            <main className="px-5 py-20 text-center">
                <p role="alert" className="text-red-600">{error}</p>
                <Link
                    href="/vendor/dashboard"
                    className="mt-4 inline-block text-[#C93425]"
                >
                    Back to Dashboard
                </Link>
            </main>
        );
    }

    const fields = [
        { name: "name", label: "Pizza Name", type: "text" },
        { name: "price", label: "Price ($)", type: "number" },
        { name: "location", label: "Location", type: "text" },
    ];

    return (
        <main className="min-h-screen bg-[#FFF8ED] px-5 py-12">
            <div className="mx-auto max-w-2xl">
                <Link
                    href="/vendor/dashboard"
                    className="mb-6 inline-flex items-center gap-2 font-semibold text-[#C93425]"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>

                <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-9">
                    <h1 className="text-3xl font-black text-[#25201D]">
                        Edit Pizza
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Your pizza will require admin approval after editing.
                    </p>

                    {error && (
                        <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-600">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                        {fields.map((field) => (
                            <div key={field.name}>
                                <label
                                    htmlFor={field.name}
                                    className="mb-2 block font-semibold"
                                >
                                    {field.label}
                                </label>

                                <input
                                    id={field.name}
                                    name={field.name}
                                    type={field.type}
                                    value={form[field.name]}
                                    onChange={handleChange}
                                    required
                                    min={field.type === "number" ? "0.01" : undefined}
                                    step={field.type === "number" ? "0.01" : undefined}
                                    className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#C93425]"
                                />
                            </div>
                        ))}

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
                            <label htmlFor="description" className="mb-2 block font-semibold">
                                Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={4}
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
                            disabled={saving}
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C93425] px-6 py-3 font-semibold text-white hover:bg-[#A7281D] disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}


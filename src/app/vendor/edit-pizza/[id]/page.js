"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, readApiError } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { toast } from "sonner";
import ImageUpload from "@/components/vendor/ImageUpload";
import {
    VENDOR_CATEGORIES,
    normalizeCategoryName,
} from "@/lib/menuCategories";
import { ArrowLeft, Loader2, Save } from "lucide-react";

export default function EditPizzaPage() {
    const router = useRouter();
    const { id } = useParams();
    const { ready, allowed, message, session, isPending } =
        useAuthGuard("vendor");
    const userId = session?.user?.id;

    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "Classic Pizzas",
        price: "",
        location: "",
        image: "",
        images: [],
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isPending || !ready || !allowed || !userId) return;

        const loadPizza = async () => {
            try {
                const response = await apiFetch("/api/menu/vendor/mine");

                if (!response.ok) {
                    throw new Error(
                        await readApiError(response, "Failed to load pizza.")
                    );
                }

                const data = await response.json();

                const pizza = data.find((item) => item._id === id);

                if (!pizza) {
                    throw new Error("Pizza not found in your menu.");
                }

                setForm({
                    name: pizza.name || "",
                    description: pizza.description || "",
                    category: normalizeCategoryName(pizza.category) || "Classic Pizzas",
                    price: String(pizza.price ?? ""),
                    location: pizza.location || "",
                    image: pizza.image || "",
                    images:
                        Array.isArray(pizza.images) && pizza.images.length
                            ? pizza.images
                            : pizza.image
                              ? [pizza.image]
                              : [],
                });
            } catch (err) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadPizza();
    }, [id, userId, isPending, ready, allowed]);

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
            toast.error("Please enter a valid price.");
            return;
        }

        if (!form.images.length) {
            const message = "Please upload at least one pizza image.";
            setError(message);
            toast.error(message);
            return;
        }

        setSaving(true);

        try {
            const response = await apiFetch(`/api/menu/${id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    name: form.name.trim(),
                    description: form.description.trim(),
                    category: form.category,
                    price,
                    location: form.location.trim(),
                    image: form.images[0],
                    images: form.images,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    await readApiError(response, "Failed to update pizza.")
                );
            }

            toast.success("Pizza updated and submitted for approval.");
            router.push("/vendor/dashboard");
            router.refresh();
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const showLoading = isPending || !ready || (Boolean(userId) && loading);

    if (showLoading) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center">
                <Loader2 size={32} className="animate-spin text-[#C93425]" />
            </main>
        );
    }

    if (!allowed) {
        return (
            <main className="px-5 py-20 text-center">
                <h1 className="text-2xl font-bold">Access unavailable</h1>
                <p className="mt-3 text-gray-500">
                    {message || "Only vendor accounts can edit pizzas."}
                </p>
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
                                {VENDOR_CATEGORIES.map((category) => (
                                    <option key={category}>{category}</option>
                                ))}
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
                            multiple
                            value={form.images}
                            onChange={(images) =>
                                setForm((prev) => ({
                                    ...prev,
                                    images,
                                    image: images[0] || "",
                                }))
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


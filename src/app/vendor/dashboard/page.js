"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Star, StarOff } from "lucide-react";
import PremiumUpgrade from "@/components/vendor/PremiumUpgrade";
import Link from "next/link";
import { toast } from "sonner";
import DashboardShell from "@/components/layout/DashboardShell";
import { DonutChart } from "@/components/dashboard/Charts";
import { authClient } from "@/lib/auth-client";
import { apiFetch, readApiError } from "@/lib/api";
import {
    Pizza,
    Plus,
    Clock3,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowRight,
    ShoppingBag,
} from "lucide-react";

export default function VendorDashboard() {
    const { data: session, isPending } = authClient.useSession();
    const userId = session?.user?.id;

    const [pizzas, setPizzas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isPremium, setIsPremium] = useState(false);
    const [featuringId, setFeaturingId] = useState(null);
    const [updatingAvailabilityId, setUpdatingAvailabilityId] = useState(null);

    useEffect(() => {
        if (isPending) return;

        if (!userId) return;

        const loadProfile = async () => {
            try {
                const response = await apiFetch("/api/me");

                if (!response.ok) return;

                const data = await response.json();
                const profile = data.user ?? data;

                setIsPremium(
                    Boolean(
                        profile?.isPremium === true ||
                        profile?.plan === "premium"
                    )
                );
            } catch {
                // Premium status is optional; feature controls stay disabled.
            }
        };

        const fetchPizzas = async () => {
            try {
                const response = await apiFetch("/api/menu/vendor/mine");

                if (!response.ok) {
                    throw new Error(
                        response.status === 403
                            ? "Only vendors can access this dashboard."
                            : "Failed to load pizzas."
                    );
                }

                setPizzas(await response.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
        fetchPizzas();
    }, [userId, isPending]);

    const showLoading = Boolean(userId) && loading;

    if (isPending || showLoading) {
        return (
            <DashboardShell role="vendor">
                <div className="flex min-h-[70vh] items-center justify-center">
                    <Loader2 className="animate-spin text-[#C93425]" size={35} />
                </div>
            </DashboardShell>
        );
    }

    if (!session?.user) {
        return (
            <DashboardShell role="vendor">
                <div className="mx-auto max-w-xl px-5 py-24 text-center">
                    <h1 className="text-2xl font-bold">Please sign in first</h1>
                    <Link
                        href="/login"
                        className="mt-5 inline-block rounded-full bg-[#C93425] px-6 py-3 text-white"
                    >
                        Sign In
                    </Link>
                </div>
            </DashboardShell>
        );
    }

    const approved = pizzas.filter(
        (pizza) => pizza.status === "approved"
    ).length;

    const pending = pizzas.filter(
        (pizza) => pizza.status === "pending"
    ).length;

    const rejected = pizzas.filter(
        (pizza) => pizza.status === "rejected"
    ).length;

    const stats = [
        {
            title: "Total Pizzas",
            value: pizzas.length,
            icon: Pizza,
            color: "text-[#C93425]",
            bg: "bg-red-50",
        },
        {
            title: "Approved",
            value: approved,
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            title: "Pending",
            value: pending,
            icon: Clock3,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            title: "Rejected",
            value: rejected,
            icon: XCircle,
            color: "text-red-600",
            bg: "bg-red-50",
        },
    ];

    const pizzaStatusData = [
        { label: "Pending", value: pending },
        { label: "Approved", value: approved },
        { label: "Rejected", value: rejected },
    ];

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this pizza?")) {
            return;
        }

        try {
            const response = await apiFetch(`/api/menu/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(
                    await readApiError(response, "Failed to delete pizza")
                );
            }

            setPizzas((prev) => prev.filter((pizza) => pizza._id !== id));
            toast.success("Pizza deleted.");
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        }
    };

    const handleAvailability = async (pizza) => {
        if (pizza.status !== "approved" || updatingAvailabilityId) return;

        const nextAvailability = !pizza.isActive;
        setUpdatingAvailabilityId(pizza._id);

        try {
            const response = await apiFetch(
                `/api/menu/${pizza._id}/availability`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        isActive: nextAvailability,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    await readApiError(
                        response,
                        "Failed to update pizza availability"
                    )
                );
            }

            const data = await response.json();

            setPizzas((prev) =>
                prev.map((item) =>
                    item._id === pizza._id
                        ? { ...item, isActive: data.isActive }
                        : item
                )
            );

            toast.success(data.message);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUpdatingAvailabilityId(null);
        }
    };

    const handleFeature = async (pizza) => {
        if (!isPremium) return;

        setFeaturingId(pizza._id);

        try {
            const response = await apiFetch(`/api/menu/${pizza._id}`, {
                method: "PATCH",
                body: JSON.stringify({ isFeatured: !pizza.isFeatured }),
            });

            if (!response.ok) {
                throw new Error(
                    await readApiError(response, "Failed to update featured status.")
                );
            }

            const data = await response.json().catch(() => ({}));
            const nextFeatured =
                typeof data.isFeatured === "boolean"
                    ? data.isFeatured
                    : !pizza.isFeatured;

            setPizzas((prev) =>
                prev.map((item) =>
                    item._id === pizza._id
                        ? { ...item, isFeatured: nextFeatured }
                        : item
                )
            );

            toast.success(
                nextFeatured ? "Pizza featured." : "Pizza unfeatured."
            );
        } catch (err) {
            toast.error(err.message);
        } finally {
            setFeaturingId(null);
        }
    };

    return (
        <DashboardShell role="vendor">
            <div className="min-h-screen bg-[#FFF8ED] px-5 py-12">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 flex flex-wrap items-center justify-between gap-5">
                        <div>
                            <p className="mb-2 font-semibold text-[#C93425]">
                                Vendor Dashboard
                            </p>

                            <h1 className="text-3xl font-black text-[#25201D]">
                                Welcome, {session.user.name}!
                            </h1>

                            <p className="mt-2 text-[#6B625C]">
                                Manage your pizzas and track their approval status.
                            </p>
                        </div>

                        <Link
                            href="/vendor/add-pizza"
                            className="inline-flex items-center gap-2 rounded-full bg-[#C93425] px-6 py-3 font-semibold text-white hover:bg-[#A7281D]"
                        >
                            <Plus size={20} />
                            Add New Pizza
                        </Link>
                        <Link
                            href="/vendor/orders"
                            className="inline-flex items-center gap-2 rounded-full border border-[#C93425] px-6 py-3 font-semibold text-[#C93425]"
                        >
                            <ShoppingBag size={19} />
                            Manage Orders
                        </Link>
                    </div>

                    {error && (
                        <div role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">
                            {error}
                        </div>
                    )}

                    {!error && (
                        <>
                            <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                {stats.map((stat) => {
                                    const Icon = stat.icon;

                                    return (
                                        <div
                                            key={stat.title}
                                            className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"
                                        >
                                            <div className={`mb-4 inline-flex rounded-xl p-3 ${stat.bg}`}>
                                                <Icon size={24} className={stat.color} />
                                            </div>

                                            <p className="text-sm text-[#6B625C]">
                                                {stat.title}
                                            </p>

                                            <h2 className="mt-1 text-3xl font-bold text-[#25201D]">
                                                {stat.value}
                                            </h2>
                                        </div>
                                    );
                                })}

                            </div>
                            <div className="mb-8 max-w-2xl">
                                <DonutChart
                                    data={pizzaStatusData}
                                    title="Pizzas by status"
                                />
                            </div>
                            <div className="mb-8">
                                <PremiumUpgrade
                                    {...(isPremium ? { isPremium: true } : {})}
                                />
                            </div>

                            <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center justify-between gap-3">
                                    <h2 className="text-xl font-bold text-[#25201D]">
                                        My Pizzas
                                    </h2>

                                    <span className="text-sm text-[#6B625C]">
                                        {pizzas.length} items
                                    </span>
                                </div>

                                {pizzas.length === 0 ? (
                                    <div className="py-14 text-center">
                                        <Pizza
                                            size={46}
                                            className="mx-auto mb-4 text-[#C93425]"
                                        />

                                        <h3 className="text-lg font-bold">
                                            No pizzas added yet
                                        </h3>

                                        <p className="mt-2 text-sm text-gray-500">
                                            Add your first pizza to get started.
                                        </p>

                                        <Link
                                            href="/vendor/add-pizza"
                                            className="mt-5 inline-flex items-center gap-2 font-semibold text-[#C93425]"
                                        >
                                            Add Pizza
                                            <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[600px] text-left">
                                            <thead className="border-b bg-[#FFF8ED] text-sm text-[#6B625C]">
                                                <tr>
                                                    <th className="p-4">Pizza</th>
                                                    <th className="p-4">Price</th>
                                                    <th className="p-4">Status</th>
                                                    <th className="p-4">Visibility</th>
                                                    <th className="p-4">Actions</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {pizzas.map((pizza) => (
                                                    <tr
                                                        key={pizza._id}
                                                        className="border-b border-gray-100 last:border-0"
                                                    >
                                                        <td className="p-4 font-semibold">
                                                            {pizza.name}
                                                        </td>

                                                        <td className="p-4">
                                                            ${pizza.price}
                                                        </td>

                                                        <td className="p-4">
                                                            <span className="capitalize">
                                                                {pizza.status}
                                                            </span>
                                                        </td>


                                                        <td className="p-4">
                                                            <div className="flex flex-col items-start gap-2">
                                                                <button
                                                                    type="button"
                                                                    role="switch"
                                                                    aria-label={`Availability for ${pizza.name}`}
                                                                    aria-checked={Boolean(pizza.isActive)}
                                                                    disabled={
                                                                        pizza.status !== "approved" ||
                                                                        updatingAvailabilityId !== null
                                                                    }
                                                                    onClick={() => handleAvailability(pizza)}
                                                                    className="flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    <span
                                                                        className={`relative h-6 w-11 rounded-full transition-colors ${pizza.isActive
                                                                            ? "bg-green-600"
                                                                            : "bg-gray-300"
                                                                            }`}
                                                                    >
                                                                        <span
                                                                            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${pizza.isActive
                                                                                ? "left-1 translate-x-5"
                                                                                : "left-1"
                                                                                }`}
                                                                        />
                                                                    </span>

                                                                    <span className="text-sm font-semibold">
                                                                        {updatingAvailabilityId === pizza._id
                                                                            ? "Updating..."
                                                                            : pizza.isActive
                                                                                ? "Active"
                                                                                : "Inactive"}
                                                                    </span>
                                                                </button>

                                                                {pizza.status !== "approved" && (
                                                                    <span className="text-xs text-gray-500">
                                                                        Requires admin approval
                                                                    </span>
                                                                )}

                                                                {pizza.isFeatured && (
                                                                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                                                        Featured
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="p-4">
                                                            <div className="flex flex-wrap gap-3">
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        !isPremium ||
                                                                        featuringId !== null
                                                                    }
                                                                    title={
                                                                        !isPremium
                                                                            ? "Upgrade to Premium to feature pizzas."
                                                                            : undefined
                                                                    }
                                                                    onClick={() =>
                                                                        handleFeature(pizza)
                                                                    }
                                                                    className="inline-flex items-center gap-1 text-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    {pizza.isFeatured ? (
                                                                        <StarOff size={16} />
                                                                    ) : (
                                                                        <Star size={16} />
                                                                    )}
                                                                    {pizza.isFeatured
                                                                        ? "Unfeature"
                                                                        : "Feature"}
                                                                </button>

                                                                <Link
                                                                    href={`/vendor/edit-pizza/${pizza._id}`}
                                                                    className="inline-flex items-center gap-1 text-blue-600"
                                                                >
                                                                    <Pencil size={16} />
                                                                    Edit
                                                                </Link>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDelete(pizza._id)}
                                                                    className="inline-flex items-center gap-1 text-red-600"
                                                                >
                                                                    <Trash2 size={16} />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </DashboardShell>
    );
}

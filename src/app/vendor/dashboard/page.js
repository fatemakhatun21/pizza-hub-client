"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
    Pizza,
    Plus,
    Clock3,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowRight,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function VendorDashboard() {
    const { data: session, isPending } = authClient.useSession();

    const [pizzas, setPizzas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isPending) return;

        if (!session?.user) {
            setLoading(false);
            return;
        }

        const fetchPizzas = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/menu/vendor/mine`,
                    { credentials: "include" }
                );

                if (!response.ok) {
                    throw new Error(
                        response.status === 403
                            ? "Only vendors can access this dashboard."
                            : "Failed to load pizzas."
                    );
                }

                const data = await response.json();
                setPizzas(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPizzas();
    }, [session?.user?.id, isPending]);

    if (isPending || loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2 className="animate-spin text-[#C93425]" size={35} />
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="mx-auto max-w-xl px-5 py-24 text-center">
                <h1 className="text-2xl font-bold">Please sign in first</h1>
                <Link
                    href="/login"
                    className="mt-5 inline-block rounded-full bg-[#C93425] px-6 py-3 text-white"
                >
                    Sign In
                </Link>
            </div>
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

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this pizza?")) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/menu/${id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete pizza");
            }

            setPizzas((prev) => prev.filter((pizza) => pizza._id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <main className="min-h-screen bg-[#FFF8ED] px-5 py-12">
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
                                                        {pizza.isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </td>

                                                    <td className="p-4">
                                                        <div className="flex gap-3">
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
        </main>
    );
}

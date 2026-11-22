"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
    CheckCircle2,
    XCircle,
    Clock3,
    Pizza,
    Loader2,
    RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function AdminDashboard() {
    const { data: session, isPending } = authClient.useSession();

    const [pizzas, setPizzas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchPizzas = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/admin/menu`, {
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load pizzas."
                );
            }

            setPizzas(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isPending) return;

        if (!session?.user) {
            setLoading(false);
            return;
        }

        fetchPizzas();
    }, [session?.user?.id, isPending, fetchPizzas]);

    const handleReview = async (id, status) => {
        setProcessingId(id);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${API_URL}/api/admin/menu/${id}/status`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to review pizza."
                );
            }

            setSuccess(`Pizza ${status} successfully.`);
            await fetchPizzas();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (isPending) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2
                    size={32}
                    className="animate-spin text-[#C93425]"
                />
            </div>
        );
    }

    if (!session?.user) {
        return (
            <main className="px-5 py-20 text-center">
                <h1 className="text-2xl font-bold">Please sign in first</h1>
                <Link
                    href="/login"
                    className="mt-5 inline-block text-[#C93425]"
                >
                    Sign In
                </Link>
            </main>
        );
    }

    const pending = pizzas.filter((item) => item.status === "pending").length;
    const approved = pizzas.filter((item) => item.status === "approved").length;
    const rejected = pizzas.filter((item) => item.status === "rejected").length;

    const stats = [
        { title: "Total Pizzas", value: pizzas.length, icon: Pizza },
        { title: "Pending", value: pending, icon: Clock3 },
        { title: "Approved", value: approved, icon: CheckCircle2 },
        { title: "Rejected", value: rejected, icon: XCircle },
    ];

    return (
        <main className="min-h-screen bg-[#FFF8ED] px-5 py-12">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="font-semibold text-[#C93425]">
                            Admin Control Panel
                        </p>

                        <h1 className="mt-2 text-3xl font-black text-[#25201D]">
                            Pizza Management
                        </h1>

                        <p className="mt-2 text-[#6B625C]">
                            Review and manage vendor pizza submissions.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchPizzas}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-full border border-[#C93425] px-5 py-2 font-semibold text-[#C93425] disabled:opacity-50"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-600">
                        {error}
                    </p>
                )}

                {success && (
                    <p role="status" className="mb-5 rounded-xl bg-green-50 p-4 text-green-700">
                        {success}
                    </p>
                )}

                <div className="mb-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <div
                                key={stat.title}
                                className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"
                            >
                                <Icon size={26} className="mb-4 text-[#C93425]" />

                                <p className="text-sm text-gray-500">
                                    {stat.title}
                                </p>

                                <h2 className="mt-2 text-3xl font-bold">
                                    {stat.value}
                                </h2>
                            </div>
                        );
                    })}
                </div>

                <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-xl font-bold">
                        All Pizza Submissions
                    </h2>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2
                                className="animate-spin text-[#C93425]"
                                size={30}
                            />
                        </div>
                    ) : pizzas.length === 0 ? (
                        <p className="py-12 text-center text-gray-500">
                            No pizzas found.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[750px] text-left">
                                <thead className="bg-[#FFF8ED] text-sm">
                                    <tr>
                                        <th className="p-4">Pizza</th>
                                        <th className="p-4">Vendor</th>
                                        <th className="p-4">Price</th>
                                        <th className="p-4">Status</th>
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
                                                {pizza.vendor || "Unknown"}
                                            </td>

                                            <td className="p-4">
                                                ${pizza.price}
                                            </td>

                                            <td className="p-4 capitalize">
                                                {pizza.status}
                                            </td>

                                            <td className="p-4">
                                                {pizza.status === "pending" ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={processingId !== null}
                                                            onClick={() =>
                                                                handleReview(
                                                                    pizza._id,
                                                                    "approved"
                                                                )
                                                            }
                                                            className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={processingId !== null}
                                                            onClick={() =>
                                                                handleReview(
                                                                    pizza._id,
                                                                    "rejected"
                                                                )
                                                            }
                                                            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        Reviewed
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import DashboardShell from "@/components/layout/DashboardShell";
import { BarChart, DonutChart, LineChart } from "@/components/dashboard/Charts";
import { authClient } from "@/lib/auth-client";
import { apiFetch, readApiError } from "@/lib/api";
import {
    Users,
    ShoppingBag,
    Wallet,
    CheckCircle2,
    XCircle,
    Clock3,
    Pizza,
    Loader2,
    RefreshCw,
} from "lucide-react";

export default function AdminDashboard() {
    const { data: session, isPending } = authClient.useSession();
    const userId = session?.user?.id;

    const [pizzas, setPizzas] = useState([]);
    const [adminStats, setAdminStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState("");

    const fetchPizzas = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await apiFetch("/api/admin/menu");

            if (!response.ok) {
                throw new Error(
                    await readApiError(response, "Failed to load pizzas.")
                );
            }

            setPizzas(await response.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAdminStats = useCallback(async () => {
        try {
            const response = await apiFetch("/api/admin/stats");

            if (!response.ok) return;

            setAdminStats(await response.json());
        } catch {
            // The overview endpoint is optional; local counts are used instead.
        }
    }, []);

    useEffect(() => {
        if (isPending || !userId) return;

        async function loadDashboard() {
            await Promise.resolve();
            await Promise.all([fetchPizzas(), fetchAdminStats()]);
        }

        loadDashboard();
    }, [userId, isPending, fetchPizzas, fetchAdminStats]);

    const handleReview = async (id, status) => {
        setProcessingId(id);

        try {
            const response = await apiFetch(`/api/admin/menu/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error(
                    await readApiError(response, "Failed to review pizza.")
                );
            }

            toast.success(`Pizza ${status} successfully.`);
            await Promise.all([fetchPizzas(), fetchAdminStats()]);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (isPending) {
        return (
            <DashboardShell role="admin">
                <div className="flex min-h-[70vh] items-center justify-center">
                    <Loader2
                        size={32}
                        className="animate-spin text-[#C93425]"
                    />
                </div>
            </DashboardShell>
        );
    }

    if (!session?.user) {
        return (
            <DashboardShell role="admin">
                <div className="px-5 py-20 text-center">
                    <h1 className="text-2xl font-bold">Please sign in first</h1>
                    <Link
                        href="/login"
                        className="mt-5 inline-block text-[#C93425]"
                    >
                        Sign In
                    </Link>
                </div>
            </DashboardShell>
        );
    }

    const pending = pizzas.filter((item) => item.status === "pending").length;
    const approved = pizzas.filter((item) => item.status === "approved").length;
    const rejected = pizzas.filter((item) => item.status === "rejected").length;

    const pizzaTotals = adminStats?.pizzas ?? {};
    const orderTotals = adminStats?.orders ?? {};

    const summaryCards = [
        {
            title: "Total Pizzas",
            value: adminStats
                ? Number(pizzaTotals.total ?? 0)
                : pizzas.length,
            icon: Pizza,
        },
        {
            title: "Pending",
            value: adminStats ? Number(pizzaTotals.pending ?? 0) : pending,
            icon: Clock3,
        },
        {
            title: "Approved",
            value: adminStats ? Number(pizzaTotals.approved ?? 0) : approved,
            icon: CheckCircle2,
        },
        {
            title: "Rejected",
            value: adminStats ? Number(pizzaTotals.rejected ?? 0) : rejected,
            icon: XCircle,
        },
    ];

    const platformCards = [
        {
            title: "Total Users",
            value: Number(adminStats?.users?.total ?? 0),
            icon: Users,
        },
        {
            title: "Total Orders",
            value: Number(orderTotals.total ?? 0),
            icon: ShoppingBag,
        },
        {
            title: "Revenue",
            value: `$${Number(orderTotals.revenue ?? 0).toFixed(2)}`,
            icon: Wallet,
        },
    ];

    const pizzaStatusData = [
        { label: "Pending", value: summaryCards[1].value },
        { label: "Approved", value: summaryCards[2].value },
        { label: "Rejected", value: summaryCards[3].value },
    ];

    const orderStatusData = [
        { label: "Pending", value: Number(orderTotals.pending ?? 0) },
        { label: "Accepted", value: Number(orderTotals.accepted ?? 0) },
        { label: "Preparing", value: Number(orderTotals.preparing ?? 0) },
        {
            label: "Out for delivery",
            value: Number(orderTotals.out_for_delivery ?? 0),
        },
        { label: "Delivered", value: Number(orderTotals.delivered ?? 0) },
        { label: "Rejected", value: Number(orderTotals.rejected ?? 0) },
        { label: "Cancelled", value: Number(orderTotals.cancelled ?? 0) },
    ];

    const monthlyOrders = Array.isArray(adminStats?.monthlyOrders)
        ? adminStats.monthlyOrders
        : [];

    return (
        <DashboardShell role="admin">
            <div className="min-h-screen bg-[#FFF8ED] px-5 py-12">
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
                            onClick={() => {
                                fetchPizzas();
                                fetchAdminStats();
                            }}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-full border border-[#C93425] px-5 py-2 font-semibold text-[#C93425] disabled:opacity-50"
                        >
                            <RefreshCw size={17} />
                            Refresh
                        </button>
                        <Link
                            href="/admin/users"
                            className="inline-flex items-center gap-2 rounded-full bg-[#C93425] px-5 py-2 font-semibold text-white"
                        >
                            <Users size={18} />
                            Manage Users
                        </Link>
                    </div>

                    {error && (
                        <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="mb-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {summaryCards.map((stat) => {
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

                    {adminStats && (
                        <div className="mb-9 grid gap-5 sm:grid-cols-3">
                            {platformCards.map((stat) => {
                                const Icon = stat.icon;

                                return (
                                    <div
                                        key={stat.title}
                                        className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"
                                    >
                                        <Icon
                                            size={26}
                                            className="mb-4 text-[#C93425]"
                                        />

                                        <p className="text-sm text-gray-500">
                                            {stat.title}
                                        </p>

                                        <h2 className="mt-2 text-2xl font-bold">
                                            {stat.value}
                                        </h2>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mb-9 grid gap-5 lg:grid-cols-2">
                        <BarChart
                            data={pizzaStatusData}
                            title="Pizzas by status"
                        />
                        <DonutChart
                            data={orderStatusData}
                            title="Orders by status"
                        />
                    </div>

                    <div className="mb-9">
                        <LineChart
                            data={monthlyOrders}
                            title="Monthly orders"
                        />
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
            </div>
        </DashboardShell>
    );
}

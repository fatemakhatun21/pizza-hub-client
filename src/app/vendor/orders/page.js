"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
    ShoppingBag,
    CheckCircle2,
    XCircle,
    Clock3,
    Loader2,
    RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function VendorOrdersPage() {
    const { data: session, isPending } = authClient.useSession();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/orders/vendor`, {
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load orders.");
            }

            setOrders(data);
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

        fetchOrders();
    }, [session?.user?.id, isPending, fetchOrders]);

    const handleStatus = async (id, status) => {
        setProcessingId(id);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${API_URL}/api/orders/${id}/status`,
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
                throw new Error(data.message || "Failed to update order.");
            }

            setOrders((prev) =>
                prev.map((order) =>
                    order._id === id
                        ? { ...order, status }
                        : order
                )
            );

            setSuccess(`Order ${status} successfully.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (isPending) {
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

    const pending = orders.filter((o) => o.status === "pending").length;
    const accepted = orders.filter((o) => o.status === "accepted").length;
    const rejected = orders.filter((o) => o.status === "rejected").length;

    const stats = [
        { title: "Total Orders", value: orders.length, icon: ShoppingBag },
        { title: "Pending", value: pending, icon: Clock3 },
        { title: "Accepted", value: accepted, icon: CheckCircle2 },
        { title: "Rejected", value: rejected, icon: XCircle },
    ];

    return (
        <main className="min-h-screen bg-[#FFF8ED] px-5 py-12">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="font-semibold text-[#C93425]">
                            Vendor Dashboard
                        </p>

                        <h1 className="mt-2 text-3xl font-black text-[#25201D]">
                            Manage Orders
                        </h1>

                        <p className="mt-2 text-[#6B625C]">
                            View orders for your pizzas and manage their status.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchOrders}
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
                                <p className="text-sm text-gray-500">{stat.title}</p>
                                <h2 className="mt-2 text-3xl font-bold">{stat.value}</h2>
                            </div>
                        );
                    })}
                </div>

                <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-xl font-bold">Customer Orders</h2>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 size={30} className="animate-spin text-[#C93425]" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="py-14 text-center">
                            <ShoppingBag
                                size={46}
                                className="mx-auto mb-4 text-[#C93425]"
                            />
                            <h3 className="text-lg font-bold">No orders yet</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Orders for your pizzas will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left">
                                <thead className="bg-[#FFF8ED] text-sm">
                                    <tr>
                                        <th className="p-4">Pizza</th>
                                        <th className="p-4">Customer</th>
                                        <th className="p-4">Quantity</th>
                                        <th className="p-4">Total</th>
                                        <th className="p-4">Delivery</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {orders.map((order) => (
                                        <tr
                                            key={order._id}
                                            className="border-b border-gray-100 last:border-0"
                                        >
                                            <td className="p-4 font-semibold">
                                                {order.pizzaName}
                                            </td>

                                            <td className="p-4">
                                                <p>{order.customerName}</p>
                                                <p className="text-xs text-gray-500">
                                                    {order.customerEmail}
                                                </p>
                                            </td>

                                            <td className="p-4">{order.quantity}</td>

                                            <td className="p-4">
                                                ${Number(order.totalPrice).toFixed(2)}
                                            </td>

                                            <td className="p-4">
                                                <p className="text-sm">
                                                    {order.deliveryAddress}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {new Date(order.deliveryDate).toLocaleDateString()}
                                                </p>
                                            </td>

                                            <td className="p-4 capitalize">
                                                {order.status}
                                            </td>

                                            <td className="p-4">
                                                {order.status === "pending" ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={processingId !== null}
                                                            onClick={() =>
                                                                handleStatus(order._id, "accepted")
                                                            }
                                                            className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                                        >
                                                            Accept
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={processingId !== null}
                                                            onClick={() =>
                                                                handleStatus(order._id, "rejected")
                                                            }
                                                            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        —
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

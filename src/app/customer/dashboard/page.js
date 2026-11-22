
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Loader2, ShoppingBag, XCircle } from "lucide-react";

export default function CustomerDashboard() {
    const { data: session, isPending } = authClient.useSession();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isPending) return;

        if (!session?.user) {
            setLoading(false);
            return;
        }

        const loadOrders = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/orders/mine",
                    { credentials: "include" }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load orders");
                }

                setOrders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [session?.user?.id, isPending]);

    const cancelOrder = async (id) => {
        setProcessingId(id);
        setError("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/orders/${id}/cancel`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Cancellation failed");
            }

            setOrders((prev) =>
                prev.map((order) =>
                    order._id === id
                        ? { ...order, status: "cancelled" }
                        : order
                )
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (isPending || loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-[#C93425]" />
            </div>
        );
    }

    if (!session?.user) {
        return (
            <main className="px-5 py-20 text-center">
                <p>Please sign in first.</p>
                <Link href="/login" className="text-[#C93425]">
                    Sign In
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#FFF8ED] px-5 py-12">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black">
                            My Orders
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Track your pizza orders.
                        </p>
                    </div>

                    <Link
                        href="/menu"
                        className="rounded-full bg-[#C93425] px-6 py-3 font-semibold text-white"
                    >
                        Browse Pizzas
                    </Link>
                </div>

                {error && (
                    <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-600">
                        {error}
                    </p>
                )}

                {orders.length === 0 ? (
                    <div className="rounded-2xl bg-white px-6 py-16 text-center">
                        <ShoppingBag size={46} className="mx-auto text-[#C93425]" />
                        <h2 className="mt-4 text-xl font-bold">
                            No orders yet
                        </h2>
                        <p className="mt-2 text-gray-500">
                            Your pizza orders will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl bg-white p-5 shadow-sm">
                        <table className="w-full min-w-[700px] text-left">
                            <thead className="border-b bg-[#FFF8ED]">
                                <tr>
                                    <th className="p-4">Pizza</th>
                                    <th className="p-4">Quantity</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id} className="border-b last:border-0">
                                        <td className="p-4 font-semibold">
                                            {order.pizzaName}
                                        </td>

                                        <td className="p-4">
                                            {order.quantity}
                                        </td>

                                        <td className="p-4">
                                            ${order.totalPrice.toFixed(2)}
                                        </td>

                                        <td className="p-4 capitalize">
                                            {order.status}
                                        </td>

                                        <td className="p-4">
                                            {order.status === "pending" ? (
                                                <button
                                                    type="button"
                                                    disabled={processingId !== null}
                                                    onClick={() => cancelOrder(order._id)}
                                                    className="inline-flex items-center gap-2 text-red-600 disabled:opacity-50"
                                                >
                                                    <XCircle size={17} />
                                                    Cancel
                                                </button>
                                            ) : (
                                                <span className="text-gray-400">
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
            </div>
        </main>
    );
}


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import DashboardShell from "@/components/layout/DashboardShell";
import { DonutChart } from "@/components/dashboard/Charts";
import { authClient } from "@/lib/auth-client";
import { apiFetch, readApiError } from "@/lib/api";
import { Loader2, ShoppingBag, XCircle } from "lucide-react";

const ORDER_STATUSES = [
    "pending",
    "accepted",
    "preparing",
    "out_for_delivery",
    "delivered",
    "rejected",
    "cancelled",
];

function statusLabel(status) {
    return String(status || "update")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatTimelineDate(value) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

function OrderTimeline({ timeline }) {
    if (!Array.isArray(timeline) || timeline.length === 0) return null;

    const entries = [...timeline].sort(
        (a, b) => new Date(a.at || 0).getTime() - new Date(b.at || 0).getTime()
    );

    return (
        <ol className="mt-2 space-y-1 border-l border-orange-100 pl-3 text-xs">
            {entries.map((entry, index) => (
                <li
                    key={`${entry.status || "update"}-${entry.at || index}`}
                    className={
                        index === entries.length - 1
                            ? "font-semibold text-[#C93425]"
                            : "text-[#6B625C]"
                    }
                >
                    <span>{statusLabel(entry.status)}</span>
                    {entry.at && (
                        <span className="text-gray-400">
                            {" · "}
                            {formatTimelineDate(entry.at)}
                        </span>
                    )}
                    {entry.note && (
                        <span className="block text-gray-500">{entry.note}</span>
                    )}
                </li>
            ))}
        </ol>
    );
}

export default function CustomerDashboard() {
    const { data: session, isPending } = authClient.useSession();
    const userId = session?.user?.id;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isPending) return;

        if (!userId) return;

        const loadOrders = async () => {
            try {
                const response = await apiFetch("/api/orders/mine");

                if (!response.ok) {
                    throw new Error(
                        await readApiError(response, "Failed to load orders")
                    );
                }

                setOrders(await response.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [userId, isPending]);

    const cancelOrder = async (id) => {
        setProcessingId(id);

        try {
            const response = await apiFetch(`/api/orders/${id}/cancel`, {
                method: "PATCH",
            });

            if (!response.ok) {
                throw new Error(
                    await readApiError(response, "Cancellation failed")
                );
            }

            setOrders((prev) =>
                prev.map((order) =>
                    order._id === id
                        ? {
                              ...order,
                              status: "cancelled",
                              timeline: [
                                  ...(Array.isArray(order.timeline)
                                      ? order.timeline
                                      : []),
                                  {
                                      status: "cancelled",
                                      at: new Date().toISOString(),
                                  },
                              ],
                          }
                        : order
                )
            );

            toast.success("Order cancelled.");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const showLoading = Boolean(userId) && loading;

    if (isPending || showLoading) {
        return (
            <DashboardShell role="customer">
                <div className="flex min-h-[60vh] items-center justify-center">
                    <Loader2 className="animate-spin text-[#C93425]" />
                </div>
            </DashboardShell>
        );
    }

    if (!session?.user) {
        return (
            <DashboardShell role="customer">
                <div className="px-5 py-20 text-center">
                    <p>Please sign in first.</p>
                    <Link href="/login" className="text-[#C93425]">
                        Sign In
                    </Link>
                </div>
            </DashboardShell>
        );
    }

    const orderStatusData = ORDER_STATUSES.map((status) => ({
        label: statusLabel(status),
        value: orders.filter((order) => order.status === status).length,
    }));

    return (
        <DashboardShell role="customer">
            <div className="min-h-screen bg-[#FFF8ED] px-5 py-12">
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

                    <div className="mb-6 max-w-2xl">
                        <DonutChart
                            data={orderStatusData}
                            title="Orders by status"
                        />
                    </div>

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
                                                ${Number(order.totalPrice).toFixed(2)}
                                            </td>

                                            <td className="p-4">
                                                <span className="capitalize">
                                                    {statusLabel(order.status)}
                                                </span>
                                                <OrderTimeline
                                                    timeline={order.timeline}
                                                />
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
            </div>
        </DashboardShell>
    );
}

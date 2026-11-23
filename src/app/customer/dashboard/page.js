
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import DashboardShell from "@/components/layout/DashboardShell";
import { DonutChart } from "@/components/dashboard/Charts";
import { authClient } from "@/lib/auth-client";
import { apiFetch, readApiError } from "@/lib/api";
import {
    Ban,
    CheckCircle2,
    Clock3,
    Loader2,
    ShoppingBag,
    XCircle,
} from "lucide-react";

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

function CustomerDashboardContent() {
    const { data: session, isPending } = authClient.useSession();
    const searchParams = useSearchParams();
    const userId = session?.user?.id;
    // Order-status emails deep-link here with ?orderId=<id>. This is the
    // existing authenticated order view, not the pizza creation route.
    const focusedOrderId = searchParams.get("orderId") ?? "";

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

    const countByStatus = (status) =>
        orders.filter((order) => order.status === status).length;

    const stats = [
        {
            title: "Total Orders",
            value: orders.length,
            icon: ShoppingBag,
            color: "text-[#C93425]",
            bg: "bg-[#FDE9E5]",
        },
        {
            title: "Pending",
            value: countByStatus("pending"),
            icon: Clock3,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            title: "Accepted",
            value: countByStatus("accepted"),
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            title: "Rejected",
            value: countByStatus("rejected"),
            icon: XCircle,
            color: "text-red-600",
            bg: "bg-red-50",
        },
        {
            title: "Cancelled",
            value: countByStatus("cancelled"),
            icon: Ban,
            color: "text-gray-600",
            bg: "bg-gray-100",
        },
    ];

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

                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {stats.map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <div
                                    key={stat.title}
                                    className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
                                >
                                    <div
                                        className={`mb-3 inline-flex rounded-xl p-3 ${stat.bg}`}
                                    >
                                        <Icon
                                            size={22}
                                            className={stat.color}
                                        />
                                    </div>

                                    <p className="text-sm text-[#6B625C]">
                                        {stat.title}
                                    </p>

                                    <h2 className="mt-1 text-2xl font-bold text-[#25201D]">
                                        {stat.value}
                                    </h2>
                                </div>
                            );
                        })}
                    </div>

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
                            <table className="w-full min-w-[1100px] text-left">
                                <thead className="border-b bg-[#FFF8ED]">
                                    <tr>
                                        <th className="p-4">Pizza</th>
                                        <th className="p-4">Restaurant</th>
                                        <th className="p-4">Delivery</th>
                                        <th className="p-4">Ordered</th>
                                        <th className="p-4">Quantity</th>
                                        <th className="p-4">Total</th>
                                        <th className="p-4">Special Instructions</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {orders.map((order) => (
                                        <tr
                                            key={order._id}
                                            id={`order-${order._id}`}
                                            className={
                                                order._id === focusedOrderId
                                                    ? "border-b bg-amber-50 last:border-0"
                                                    : "border-b last:border-0"
                                            }
                                        >
                                            <td className="p-4 font-semibold">
                                                <div className="flex items-center gap-3">
                                                    {order.pizzaImage && (
                                                        <img
                                                            src={order.pizzaImage}
                                                            alt={order.pizzaName || "Pizza"}
                                                            width={48}
                                                            height={48}
                                                            className="h-12 w-12 shrink-0 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <span>{order.pizzaName}</span>
                                                </div>
                                                {order._id === focusedOrderId && (
                                                    <span className="ml-2 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-800">
                                                        Order update
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4 text-sm">
                                                {order.vendorName || order.vendorId || "—"}
                                            </td>
                                            <td className="p-4 text-sm">
                                                <div>{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "—"}</div>
                                                <div className="max-w-[230px] text-gray-500">{order.deliveryAddress || "—"}</div>
                                            </td>
                                            <td className="p-4 text-sm">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                                            </td>
                                            <td className="p-4">
                                                {order.quantity}
                                            </td>

                                            <td className="p-4">
                                                ${Number(order.totalPrice).toFixed(2)}
                                            </td>

                                            <td className="max-w-[220px] p-4 text-sm text-gray-600">
                                                {order.message || "—"}
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

export default function CustomerDashboard() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[70vh] items-center justify-center">
                    <Loader2 className="animate-spin text-[#C93425]" size={34} />
                </div>
            }
        >
            <CustomerDashboardContent />
        </Suspense>
    );
}

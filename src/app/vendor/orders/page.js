"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import DashboardShell from "@/components/layout/DashboardShell";
import { DonutChart } from "@/components/dashboard/Charts";
import { authClient } from "@/lib/auth-client";
import { apiFetch, readApiError } from "@/lib/api";
import {
    ShoppingBag,
    CheckCircle2,
    XCircle,
    Clock3,
    Loader2,
    RefreshCw,
} from "lucide-react";

const STATUS_FLOW = [
    "pending",
    "accepted",
    "preparing",
    "out_for_delivery",
    "delivered",
];
const MANAGEABLE_STATUSES = [
    "accepted",
    "preparing",
    "out_for_delivery",
    "delivered",
];
const CHART_STATUSES = [
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

export default function VendorOrdersPage() {
    const { data: session, isPending } = authClient.useSession();
    const userId = session?.user?.id;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState("");

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await apiFetch("/api/orders/vendor");

            if (!response.ok) {
                throw new Error(
                    await readApiError(response, "Failed to load orders.")
                );
            }

            setOrders(await response.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isPending || !userId) return;

        async function loadOrders() {
            await Promise.resolve();
            await fetchOrders();
        }

        loadOrders();
    }, [userId, isPending, fetchOrders]);

    const handleStatus = async (id, status) => {
        setProcessingId(id);

        try {
            const response = await apiFetch(`/api/orders/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error(
                    await readApiError(response, "Failed to update order.")
                );
            }

            const data = await response.json().catch(() => ({}));
            const updatedOrder = data.order || null;

            setOrders((prev) =>
                prev.map((order) =>
                    order._id === id
                        ? updatedOrder
                            ? { ...order, ...updatedOrder }
                            : {
                                  ...order,
                                  status,
                                  timeline: [
                                      ...(Array.isArray(order.timeline)
                                          ? order.timeline
                                          : []),
                                      { status, at: new Date().toISOString() },
                                  ],
                              }
                        : order
                )
            );

            toast.success(`Order ${statusLabel(status)} successfully.`);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (isPending) {
        return (
            <DashboardShell role="vendor">
                <div className="flex min-h-[60vh] items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-[#C93425]" />
                </div>
            </DashboardShell>
        );
    }

    if (!session?.user) {
        return (
            <DashboardShell role="vendor">
                <div className="px-5 py-20 text-center">
                    <h1 className="text-2xl font-bold">Please sign in first</h1>
                    <Link href="/login" className="mt-4 inline-block text-[#C93425]">
                        Sign In
                    </Link>
                </div>
            </DashboardShell>
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

    const orderStatusData = CHART_STATUSES.map((status) => ({
        label: statusLabel(status),
        value: orders.filter((order) => order.status === status).length,
    }));

    return (
        <DashboardShell role="vendor">
            <div className="min-h-screen bg-[#FFF8ED] px-5 py-12">
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

                    <div className="mb-9 max-w-2xl">
                        <DonutChart
                            data={orderStatusData}
                            title="Orders by status"
                        />
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
                                        {orders.map((order) => {
                                            const flowIndex = STATUS_FLOW.indexOf(
                                                order.status
                                            );
                                            const nextStatus =
                                                flowIndex >= 0
                                                    ? STATUS_FLOW[flowIndex + 1] || null
                                                    : null;

                                            return (
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

                                                    <td className="p-4">
                                                        <label
                                                            htmlFor={`order-status-${order._id}`}
                                                            className="sr-only"
                                                        >
                                                            Update status for {order.pizzaName}
                                                        </label>
                                                        <select
                                                            id={`order-status-${order._id}`}
                                                            value={order.status}
                                                            disabled={
                                                                processingId === order._id ||
                                                                !nextStatus
                                                            }
                                                            onChange={(event) => {
                                                                if (
                                                                    event.target.value !==
                                                                    order.status
                                                                ) {
                                                                    handleStatus(
                                                                        order._id,
                                                                        event.target.value
                                                                    );
                                                                }
                                                            }}
                                                            className="rounded-lg border border-orange-200 bg-white px-2 py-1 text-sm font-semibold text-[#25201D] disabled:opacity-50"
                                                        >
                                                            <option value={order.status}>
                                                                {statusLabel(order.status)}
                                                            </option>
                                                            {MANAGEABLE_STATUSES.filter(
                                                                (status) =>
                                                                    status !== order.status
                                                            ).map((status) => (
                                                                <option
                                                                    key={status}
                                                                    value={status}
                                                                    disabled={
                                                                        status !== nextStatus
                                                                    }
                                                                >
                                                                    {statusLabel(status)}
                                                                </option>
                                                            ))}
                                                            {order.status === "pending" && (
                                                                <option value="rejected">
                                                                    {statusLabel("rejected")}
                                                                </option>
                                                            )}
                                                        </select>
                                                        {nextStatus && (
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                Next: {statusLabel(nextStatus)}
                                                            </p>
                                                        )}
                                                        <OrderTimeline
                                                            timeline={order.timeline}
                                                        />
                                                    </td>

                                                    <td className="p-4">
                                                        <span className="text-sm text-gray-400">
                                                            {nextStatus
                                                                ? "Use the status control"
                                                                : "—"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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

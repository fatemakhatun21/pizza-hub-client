"use client";

import { useEffect, useMemo, useState } from "react";
import {
    BadgeCheck,
    CreditCard,
    Loader2,
    ReceiptText,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import DashboardShell from "@/components/layout/DashboardShell";
import { apiFetch, readApiError } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";

const PAGE_SIZE = 10;
const SUCCESS_STATUSES = new Set([
    "paid",
    "succeeded",
    "success",
    "complete",
    "completed",
]);

function isSuccessful(status) {
    return SUCCESS_STATUSES.has(String(status || "").toLowerCase());
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString();
}

function formatAmount(value, currency) {
    const amount = Number(value) || 0;
    const code = (currency || "USD").toUpperCase();

    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: code,
        }).format(amount);
    } catch {
        return `${code} ${amount.toFixed(2)}`;
    }
}

function truncateSession(id) {
    if (!id) return "—";

    const value = String(id);

    return value.length <= 18
        ? value
        : `${value.slice(0, 8)}…${value.slice(-6)}`;
}

function statusClasses(status) {
    if (isSuccessful(status)) {
        return "bg-green-50 text-green-700";
    }

    const value = String(status || "").toLowerCase();

    if (["pending", "open", "processing"].includes(value)) {
        return "bg-amber-50 text-amber-700";
    }

    return "bg-red-50 text-red-600";
}

async function fetchTransactionsPage(skip) {
    const response = await apiFetch(
        `/api/admin/transactions?limit=${PAGE_SIZE}&skip=${skip}`
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(response, "Failed to load transactions.")
        );
    }

    const data = await response.json();

    return Array.isArray(data) ? data : [];
}

export default function AdminTransactionsPage() {
    const { ready, allowed } = useAuthGuard("admin");

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        if (!ready || !allowed) return;

        let active = true;

        fetchTransactionsPage(0)
            .then((page) => {
                if (!active) return;

                setTransactions(page);
                setHasMore(page.length === PAGE_SIZE);
                setError("");
            })
            .catch((err) => {
                if (!active) return;

                const message =
                    err.message || "Failed to load transactions.";
                setError(message);
                toast.error(message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [ready, allowed]);

    const runRequest = async (skip, append) => {
        if (loading) return;

        setLoading(true);
        setError("");

        try {
            const page = await fetchTransactionsPage(skip);

            setTransactions((prev) => (append ? [...prev, ...page] : page));
            setHasMore(page.length === PAGE_SIZE);
        } catch (err) {
            const message = err.message || "Failed to load transactions.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => runRequest(0, false);
    const handleLoadMore = () => runRequest(transactions.length, true);

    const successful = useMemo(
        () => transactions.filter((item) => isSuccessful(item.status)),
        [transactions]
    );

    const successfulAmount = useMemo(
        () =>
            successful.reduce(
                (total, item) => total + (Number(item.amountTotal) || 0),
                0
            ),
        [successful]
    );

    const currency = successful.find((item) => item.currency)?.currency || "USD";

    const stats = [
        {
            title: "Total Transactions",
            value: transactions.length,
            icon: ReceiptText,
        },
        {
            title: "Successful Payments",
            value: successful.length,
            icon: BadgeCheck,
        },
        {
            title: "Successful Amount",
            value: formatAmount(successfulAmount, currency),
            icon: CreditCard,
        },
    ];

    return (
        <DashboardShell role="admin">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="font-semibold text-[#C93425]">
                        Admin Control Panel
                    </p>

                    <h1 className="mt-2 text-3xl font-black text-[#25201D]">
                        Transactions
                    </h1>

                    <p className="mt-2 text-[#6B625C]">
                        Review Stripe checkout sessions and premium purchases.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading || !allowed}
                    className="inline-flex items-center gap-2 rounded-full border border-[#C93425] px-5 py-2 font-semibold text-[#C93425] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {error && transactions.length > 0 && (
                <p
                    role="alert"
                    className="mb-5 rounded-xl bg-red-50 p-4 text-red-600"
                >
                    {error}
                </p>
            )}

            <div className="mb-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                <h2 className="mb-6 text-xl font-bold">All Transactions</h2>

                {loading && transactions.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <Loader2
                            className="animate-spin text-[#C93425]"
                            size={30}
                        />
                    </div>
                ) : error && transactions.length === 0 ? (
                    <div className="py-12 text-center">
                        <p role="alert" className="text-red-600">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            className="mt-5 rounded-full bg-[#C93425] px-6 py-2 font-semibold text-white"
                        >
                            Try Again
                        </button>
                    </div>
                ) : transactions.length === 0 ? (
                    <p className="py-12 text-center text-gray-500">
                        No transactions found.
                    </p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-left">
                                <thead className="bg-[#FFF8ED] text-sm">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">User</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Stripe Session</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {transactions.map((transaction, index) => (
                                        <tr
                                            key={
                                                transaction._id ||
                                                transaction.stripeSessionId ||
                                                index
                                            }
                                            className="border-b border-gray-100 last:border-0"
                                        >
                                            <td className="p-4 text-sm text-gray-600">
                                                {formatDate(transaction.createdAt)}
                                            </td>

                                            <td className="p-4">
                                                <p className="font-semibold text-[#25201D]">
                                                    {transaction.email ||
                                                        "Unknown user"}
                                                </p>

                                                <p
                                                    className="mt-1 max-w-[210px] truncate text-xs text-gray-500"
                                                    title={transaction.userId}
                                                >
                                                    {transaction.userId || "—"}
                                                </p>
                                            </td>

                                            <td className="p-4 capitalize">
                                                {transaction.type || "—"}
                                            </td>

                                            <td className="p-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(
                                                        transaction.status
                                                    )}`}
                                                >
                                                    {transaction.status ||
                                                        "unknown"}
                                                </span>
                                            </td>

                                            <td className="p-4 font-semibold">
                                                {formatAmount(
                                                    transaction.amountTotal,
                                                    transaction.currency
                                                )}
                                            </td>

                                            <td className="p-4">
                                                <span
                                                    className="font-mono text-xs text-gray-600"
                                                    title={
                                                        transaction.stripeSessionId ||
                                                        ""
                                                    }
                                                >
                                                    {truncateSession(
                                                        transaction.stripeSessionId
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 pt-5">
                            <p className="text-sm text-gray-500">
                                Showing {transactions.length} transaction(s)
                            </p>

                            {hasMore && (
                                <button
                                    type="button"
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#C93425] px-5 py-2 font-semibold text-[#C93425] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                    ) : null}
                                    {loading ? "Loading..." : "Load More"}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </section>
        </DashboardShell>
    );
}

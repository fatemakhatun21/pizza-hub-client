"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
    ArrowLeft,
    Users,
    ShieldCheck,
    Ban,
    CheckCircle2,
    Loader2,
    RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function AdminUsersPage() {
    const { data: session, isPending } = authClient.useSession();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/admin/users`, {
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load users.");
            }

            setUsers(data);
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

        fetchUsers();
    }, [isPending, session?.user?.id, fetchUsers]);

    const handleBlock = async (id, blocked) => {
        setProcessingId(id);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${API_URL}/api/admin/users/${id}/block`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ blocked }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update user.");
            }

            setUsers((prev) =>
                prev.map((user) =>
                    user._id === id ? { ...user, blocked } : user
                )
            );

            setSuccess(data.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (isPending) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center">
                <Loader2
                    size={32}
                    className="animate-spin text-[#C93425]"
                />
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

    const blockedCount = users.filter((user) => user.blocked).length;
    const vendorsCount = users.filter((user) => user.role === "vendor").length;

    return (
        <main className="min-h-screen bg-[#FFF8ED] px-5 py-12">
            <div className="mx-auto max-w-7xl">

                <Link
                    href="/admin/dashboard"
                    className="mb-6 inline-flex items-center gap-2 font-semibold text-[#C93425]"
                >
                    <ArrowLeft size={18} />
                    Back to Admin Dashboard
                </Link>

                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="font-semibold text-[#C93425]">
                            Admin Control Panel
                        </p>

                        <h1 className="mt-2 text-3xl font-black text-[#25201D]">
                            User Management
                        </h1>

                        <p className="mt-2 text-[#6B625C]">
                            Manage customers, vendors and account access.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchUsers}
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

                <div className="mb-9 grid gap-5 sm:grid-cols-3">
                    {[
                        {
                            title: "Total Users",
                            value: users.length,
                            icon: Users,
                        },
                        {
                            title: "Vendors",
                            value: vendorsCount,
                            icon: ShieldCheck,
                        },
                        {
                            title: "Blocked Users",
                            value: blockedCount,
                            icon: Ban,
                        },
                    ].map((stat) => {
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

                                <h2 className="mt-2 text-3xl font-bold">
                                    {stat.value}
                                </h2>
                            </div>
                        );
                    })}
                </div>

                <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-xl font-bold">
                        All Users
                    </h2>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2
                                size={30}
                                className="animate-spin text-[#C93425]"
                            />
                        </div>
                    ) : users.length === 0 ? (
                        <p className="py-12 text-center text-gray-500">
                            No users found.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[750px] text-left">
                                <thead className="bg-[#FFF8ED] text-sm">
                                    <tr>
                                        <th className="p-4">User</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.map((user) => (
                                        <tr
                                            key={user._id}
                                            className="border-b border-gray-100 last:border-0"
                                        >
                                            <td className="p-4">
                                                <p className="font-semibold text-[#25201D]">
                                                    {user.name || "Unknown"}
                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    {user.email}
                                                </p>
                                            </td>

                                            <td className="p-4 capitalize">
                                                {user.role || "customer"}
                                            </td>

                                            <td className="p-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${user.blocked
                                                            ? "bg-red-50 text-red-600"
                                                            : "bg-green-50 text-green-700"
                                                        }`}
                                                >
                                                    {user.blocked ? "Blocked" : "Active"}
                                                </span>
                                            </td>

                                            <td className="p-4">
                                                {user.role === "admin" ? (
                                                    <span className="text-sm text-gray-400">
                                                        Protected
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled={processingId !== null}
                                                        onClick={() =>
                                                            handleBlock(
                                                                user._id,
                                                                !user.blocked
                                                            )
                                                        }
                                                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${user.blocked
                                                                ? "bg-green-600"
                                                                : "bg-red-600"
                                                            }`}
                                                    >
                                                        {processingId === user._id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : user.blocked ? (
                                                            <CheckCircle2 size={16} />
                                                        ) : (
                                                            <Ban size={16} />
                                                        )}

                                                        {user.blocked
                                                            ? "Unblock"
                                                            : "Block"}
                                                    </button>
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

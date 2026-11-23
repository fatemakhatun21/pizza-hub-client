"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import DashboardShell from "@/components/layout/DashboardShell";
import { BarChart } from "@/components/dashboard/Charts";
import { authClient } from "@/lib/auth-client";
import { apiFetch, readApiError } from "@/lib/api";
import {
    ArrowLeft,
    Users,
    ShieldCheck,
    Ban,
    CheckCircle2,
    Loader2,
    RefreshCw,
    Search,
} from "lucide-react";

export default function AdminUsersPage() {
    const { data: session, isPending } = authClient.useSession();
    const userId = session?.user?.id;

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const filteredUsers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return users.filter((user) => {
            const role = user.role || "customer";
            const matchesRole = roleFilter === "all" || role === roleFilter;
            const searchable = `${user.name || ""} ${user.email || ""}`.toLowerCase();

            return matchesRole && (!query || searchable.includes(query));
        });
    }, [users, searchTerm, roleFilter]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await apiFetch("/api/admin/users");

            if (!response.ok) {
                throw new Error(
                    await readApiError(response, "Failed to load users.")
                );
            }

            setUsers(await response.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isPending || !userId) return;

        async function loadUsers() {
            await Promise.resolve();
            await fetchUsers();
        }

        loadUsers();
    }, [isPending, userId, fetchUsers]);

    const handleBlock = async (id, blocked) => {
        setProcessingId(id);

        try {
            const response = await apiFetch(`/api/admin/users/${id}/block`, {
                method: "PATCH",
                body: JSON.stringify({ blocked }),
            });

            if (!response.ok) {
                throw new Error(
                    await readApiError(response, "Failed to update user.")
                );
            }

            const data = await response.json().catch(() => ({}));

            setUsers((prev) =>
                prev.map((user) =>
                    user._id === id ? { ...user, blocked } : user
                )
            );

            toast.success(
                data.message ||
                    `User ${blocked ? "blocked" : "unblocked"} successfully.`
            );
        } catch (err) {
            toast.error(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (isPending) {
        return (
            <DashboardShell role="admin">
                <div className="flex min-h-[60vh] items-center justify-center">
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
                    <Link href="/login" className="mt-4 inline-block text-[#C93425]">
                        Sign In
                    </Link>
                </div>
            </DashboardShell>
        );
    }

    const blockedCount = users.filter((user) => user.blocked).length;
    const vendorsCount = users.filter((user) => user.role === "vendor").length;
    const customersCount = users.filter(
        (user) => (user.role || "customer") === "customer"
    ).length;
    const adminsCount = users.filter((user) => user.role === "admin").length;

    const roleData = [
        { label: "Customers", value: customersCount },
        { label: "Vendors", value: vendorsCount },
        { label: "Admins", value: adminsCount },
    ];

    return (
        <DashboardShell role="admin">
            <div className="min-h-screen bg-[#FFF8ED] px-5 py-12">
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

                    <div className="mb-9 max-w-2xl">
                        <BarChart data={roleData} title="Users by role" />
                    </div>

                    <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                            <h2 className="text-xl font-bold">
                                All Users
                            </h2>

                            <div className="flex flex-wrap items-center gap-3">
                                <label className="relative block">
                                    <span className="sr-only">
                                        Search users by name or email
                                    </span>
                                    <Search
                                        size={16}
                                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B817B]"
                                    />
                                    <input
                                        type="search"
                                        value={searchTerm}
                                        onChange={(event) =>
                                            setSearchTerm(event.target.value)
                                        }
                                        placeholder="Search name or email"
                                        className="w-full rounded-full border border-orange-200 bg-white py-2 pl-9 pr-4 text-sm text-[#25201D] outline-none focus:border-[#C93425] sm:w-64"
                                    />
                                </label>

                                <label className="flex items-center gap-2 text-sm text-[#6B625C]">
                                    <span className="sr-only">
                                        Filter users by role
                                    </span>
                                    <select
                                        value={roleFilter}
                                        onChange={(event) =>
                                            setRoleFilter(event.target.value)
                                        }
                                        className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-[#25201D] outline-none focus:border-[#C93425]"
                                    >
                                        <option value="all">All roles</option>
                                        <option value="customer">
                                            Customers
                                        </option>
                                        <option value="vendor">Vendors</option>
                                        <option value="admin">Admins</option>
                                    </select>
                                </label>
                            </div>
                        </div>

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
                        ) : filteredUsers.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-gray-500">
                                    No users match your search or role filter.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setRoleFilter("all");
                                    }}
                                    className="mt-4 rounded-full border border-[#C93425] px-5 py-2 font-semibold text-[#C93425]"
                                >
                                    Clear filters
                                </button>
                            </div>
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
                                        {filteredUsers.map((user) => (
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
            </div>
        </DashboardShell>
    );
}

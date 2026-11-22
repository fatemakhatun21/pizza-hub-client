"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRound, Mail, ShieldCheck, Loader2 } from "lucide-react";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/me", {
                    credentials: "include",
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error("Please sign in to view your profile.");
                }

                const data = await response.json();
                setUser(data.user);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2
                    className="animate-spin text-[#C93425]"
                    size={32}
                />
            </div>
        );
    }

    if (error || !user) {
        return (
            <main className="mx-auto max-w-xl px-4 py-24 text-center">
                <h1 className="text-2xl font-bold">Profile Unavailable</h1>
                <p className="mt-3 text-gray-500">{error}</p>
                <Link
                    href="/login"
                    className="mt-6 inline-block rounded-full bg-[#C93425] px-6 py-3 font-semibold text-white"
                >
                    Sign In
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-[75vh] bg-[#FFF9F5] px-4 py-16">
            <div className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
                <div className="h-28 bg-[#C93425]" />

                <div className="px-7 pb-10">
                    <div className="-mt-12 mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-orange-100">
                        {user.image ? (
                            <img
                                src={user.image}
                                alt={user.name || "Profile"}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <UserRound size={42} className="text-[#C93425]" />
                        )}
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900">
                        {user.name || "PizzaHub User"}
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Your PizzaHub Account
                    </p>

                    <div className="mt-8 space-y-5">
                        <div className="flex items-center gap-4 border-b pb-4">
                            <Mail className="text-[#C93425]" size={21} />
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="break-all font-medium">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 border-b pb-4">
                            <ShieldCheck className="text-[#C93425]" size={21} />
                            <div>
                                <p className="text-xs text-gray-500">Account Role</p>
                                <p className="font-semibold capitalize">
                                    {user.role || "customer"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/"
                        className="mt-8 inline-block rounded-full border border-[#C93425] px-6 py-3 font-semibold text-[#C93425] hover:bg-orange-50"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}

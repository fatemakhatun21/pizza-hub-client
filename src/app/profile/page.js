"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Crown,
    Mail,
    Pencil,
    ShieldCheck,
    UserRound,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch, readApiError } from "@/lib/api";

function isValidImageUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({ name: "", image: "" });
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await apiFetch("/api/me");

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

    const startEditing = () => {
        setForm({
            name: user?.name || "",
            image: user?.image || "",
        });
        setFormError("");
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setForm({
            name: user?.name || "",
            image: user?.image || "",
        });
        setFormError("");
        setIsEditing(false);
    };

    const handleChange = (event) => {
        setForm((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }));
        setFormError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");

        const name = form.name.trim();
        const image = form.image.trim();

        if (!name) {
            const message = "Name is required.";
            setFormError(message);
            toast.error(message);
            return;
        }

        if (image && !isValidImageUrl(image)) {
            const message = "Please enter a valid http(s) image URL.";
            setFormError(message);
            toast.error(message);
            return;
        }

        setSaving(true);

        try {
            const response = await apiFetch("/api/me", {
                method: "PATCH",
                body: JSON.stringify({ name, image }),
            });

            if (!response.ok) {
                throw new Error(
                    await readApiError(response, "Failed to update profile.")
                );
            }

            const data = await response.json();

            setUser((prev) => ({
                ...prev,
                ...data.user,
                role: data.user?.role || prev?.role,
                plan: data.user?.plan ?? prev?.plan,
                isPremium: data.user?.isPremium ?? prev?.isPremium,
            }));

            toast.success(data.message || "Profile updated successfully.");
            setIsEditing(false);
        } catch (err) {
            const message = err.message || "Failed to update profile.";
            setFormError(message);
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

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

                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {user.name || "PizzaHub User"}
                        </h1>

                        {user.isPremium && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                                <Crown size={14} /> Premium
                            </span>
                        )}
                    </div>

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

                    {!isEditing ? (
                        <button
                            type="button"
                            onClick={startEditing}
                            className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#C93425] px-6 py-3 font-semibold text-[#C93425] hover:bg-orange-50"
                        >
                            <Pencil size={17} />
                            Edit Profile
                        </button>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 border-t border-orange-100 pt-8"
                        >
                            <h2 className="mb-5 text-xl font-bold text-[#25201D]">
                                Edit Profile
                            </h2>

                            {formError && (
                                <p
                                    role="alert"
                                    className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-600"
                                >
                                    {formError}
                                </p>
                            )}

                            <div className="space-y-5">
                                <div>
                                    <label
                                        htmlFor="edit-name"
                                        className="mb-2 block text-sm font-semibold text-[#25201D]"
                                    >
                                        Name
                                    </label>

                                    <input
                                        id="edit-name"
                                        name="name"
                                        type="text"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Your name"
                                        autoComplete="name"
                                        className="h-12 w-full rounded-xl border border-[#EBDCCB] px-4 text-[#25201D] outline-none transition-colors focus:border-[#C93425]"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="edit-image"
                                        className="mb-2 block text-sm font-semibold text-[#25201D]"
                                    >
                                        Image URL
                                    </label>

                                    <input
                                        id="edit-image"
                                        name="image"
                                        type="url"
                                        value={form.image}
                                        onChange={handleChange}
                                        placeholder="https://example.com/avatar.jpg"
                                        className="h-12 w-full rounded-xl border border-[#EBDCCB] px-4 text-[#25201D] outline-none transition-colors focus:border-[#C93425]"
                                    />

                                    <p className="mt-2 text-xs text-gray-500">
                                        Leave empty to use the default avatar.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-7 flex flex-wrap items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#C93425] px-6 font-semibold text-white transition-colors hover:bg-[#A7281D] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? (
                                        <Loader2 size={17} className="animate-spin" />
                                    ) : null}
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>

                                <button
                                    type="button"
                                    onClick={cancelEditing}
                                    disabled={saving}
                                    className="inline-flex h-12 items-center justify-center rounded-full border border-[#EBDCCB] px-6 font-semibold text-[#6B625C] transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

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

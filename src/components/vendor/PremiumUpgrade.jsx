"use client";

import { useState } from "react";
import { Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, readApiError } from "@/lib/api";

export default function PremiumUpgrade({ isPremium = false }) {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        if (loading) return;

        setLoading(true);

        try {
            const response = await apiFetch("/api/billing/checkout", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error(
                    await readApiError(response, "Failed to start checkout")
                );
            }

            const data = await response.json();

            if (!data.url) {
                throw new Error("Checkout URL missing");
            }

            toast.success("Redirecting to checkout...");
            window.location.assign(data.url);
        } catch (err) {
            toast.error(err.message || "Failed to start checkout");
            setLoading(false);
        }
    };

    if (isPremium) {
        return (
            <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                    <Crown size={28} className="text-amber-500" />

                    <div>
                        <h2 className="text-xl font-bold text-[#25201D]">
                            Premium Active
                        </h2>
                        <p className="text-sm text-gray-500">
                            Unlimited active pizzas unlocked.
                        </p>
                    </div>
                </div>

                <span
                    aria-label="Active Premium"
                    className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-5 py-3 font-semibold text-amber-700"
                >
                    <Crown size={18} />
                    Active Premium
                </span>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
                <Crown size={28} className="text-amber-500" />

                <div>
                    <h2 className="text-xl font-bold text-[#25201D]">
                        Upgrade to Premium
                    </h2>
                    <p className="text-sm text-gray-500">
                        Unlock unlimited active pizzas.
                    </p>
                </div>
            </div>

            <p className="mb-5 text-2xl font-black text-[#C93425]">
                $10/month
            </p>

            <button
                type="button"
                onClick={handleUpgrade}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-full bg-[#C93425] px-6 py-3 font-semibold text-white hover:bg-[#A7281D] disabled:opacity-60"
            >
                {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <Crown size={18} />
                )}

                {loading ? "Redirecting..." : "Upgrade Now"}
            </button>
        </div>
    );
}

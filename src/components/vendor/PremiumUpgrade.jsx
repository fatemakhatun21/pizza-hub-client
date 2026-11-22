"use client";

import { useState } from "react";
import { Crown, Loader2 } from "lucide-react";

export default function PremiumUpgrade() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleUpgrade = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/billing/checkout",
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to start checkout"
                );
            }

            if (!data.url) {
                throw new Error("Checkout URL missing");
            }

            window.location.assign(data.url);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

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

            {error && (
                <p role="alert" className="mb-4 text-sm text-red-600">
                    {error}
                </p>
            )}

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

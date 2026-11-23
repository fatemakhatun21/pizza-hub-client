"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, readApiError } from "@/lib/api";

export default function WishlistButton({
    pizzaId,
    initialSaved = false,
    onChange,
    className = "",
}) {
    const [savedOverride, setSavedOverride] = useState(null);
    const [busy, setBusy] = useState(false);
    const saved = savedOverride ?? Boolean(initialSaved);

    const handleClick = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!pizzaId || busy) return;

        const nextSaved = !saved;
        setSavedOverride(nextSaved);
        setBusy(true);

        try {
            const response = await apiFetch(
                nextSaved
                    ? "/api/wishlist"
                    : `/api/wishlist/${encodeURIComponent(pizzaId)}`,
                {
                    method: nextSaved ? "POST" : "DELETE",
                    ...(nextSaved
                        ? { body: JSON.stringify({ pizzaId }) }
                        : {}),
                }
            );

            if (response.status === 401) {
                setSavedOverride(!nextSaved);
                toast.error("Please sign in to save pizzas");
                return;
            }

            if (response.status === 403) {
                // Wishlist is customer-only. The control should already be hidden
                // for other roles, so a stale view is just a silent no-op.
                setSavedOverride(!nextSaved);
                return;
            }

            if (!response.ok) {
                throw new Error(
                    await readApiError(
                        response,
                        nextSaved
                            ? "Failed to save this pizza."
                            : "Failed to remove this pizza from your wishlist."
                    )
                );
            }

            toast.success(
                nextSaved
                    ? "Saved to your wishlist"
                    : "Removed from your wishlist"
            );

            if (typeof onChange === "function") {
                onChange(nextSaved);
            }
        } catch (err) {
            setSavedOverride(!nextSaved);
            toast.error(err.message || "Failed to update your wishlist.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={busy}
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={saved}
            title={saved ? "Remove from wishlist" : "Save to wishlist"}
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-orange-100 bg-white text-[#C93425] shadow-sm transition hover:bg-[#FFF8ED] disabled:opacity-60 ${className}`}
        >
            <Heart
                size={19}
                fill={saved ? "currentColor" : "none"}
                aria-hidden="true"
            />
        </button>
    );
}

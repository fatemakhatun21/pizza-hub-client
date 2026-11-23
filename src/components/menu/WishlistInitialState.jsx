"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import WishlistButton from "@/components/menu/WishlistButton";

export default function WishlistInitialState({
    pizzaId,
    className = "",
    role: roleProp,
}) {
    const { data: session, isPending } = authClient.useSession();
    const userId = session?.user?.id;
    const sessionRole = session?.user?.role ?? null;

    const [profile, setProfile] = useState({ userId: null, role: null });
    const [state, setState] = useState({ checkedId: null, saved: false });

    useEffect(() => {
        if (roleProp !== undefined || isPending || !userId) return;

        const controller = new AbortController();

        async function loadRole() {
            try {
                const response = await apiFetch("/api/me", {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    if (!controller.signal.aborted) {
                        setProfile({ userId, role: null });
                    }
                    return;
                }

                const data = await response.json();

                if (!controller.signal.aborted) {
                    setProfile({
                        userId,
                        role: data?.user?.role ?? data?.role ?? null,
                    });
                }
            } catch {
                if (!controller.signal.aborted) {
                    // Fall back to the session role only after the check runs.
                    setProfile({ userId, role: sessionRole });
                }
            }
        }

        loadRole();

        return () => controller.abort();
    }, [isPending, userId, roleProp, sessionRole]);

    const resolvedRole =
        roleProp !== undefined
            ? roleProp
            : profile.userId === userId
                ? profile.role
                : null;

    const canUseWishlist =
        !isPending && Boolean(userId) && resolvedRole === "customer";

    useEffect(() => {
        if (!canUseWishlist || !pizzaId) return;

        const controller = new AbortController();

        async function loadSavedState() {
            let saved = false;

            try {
                const response = await apiFetch("/api/wishlist", {
                    signal: controller.signal,
                });

                if (response.ok) {
                    const data = await response.json();

                    if (Array.isArray(data)) {
                        saved = data.some((entry) => {
                            const id =
                                entry?._id ||
                                entry?.pizzaId ||
                                entry?.pizza?._id;

                            return id != null && String(id) === String(pizzaId);
                        });
                    }
                }
            } catch {
                // Keep the default unsaved state; the button still works on click.
            }

            if (!controller.signal.aborted) {
                setState({ checkedId: userId, saved });
            }
        }

        loadSavedState();

        return () => controller.abort();
    }, [canUseWishlist, userId, pizzaId]);

    if (!canUseWishlist || !pizzaId || state.checkedId !== userId) return null;

    return (
        <WishlistButton
            pizzaId={pizzaId}
            initialSaved={state.saved}
            className={className}
        />
    );
}

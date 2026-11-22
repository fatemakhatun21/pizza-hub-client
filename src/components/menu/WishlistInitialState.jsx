"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import WishlistButton from "@/components/menu/WishlistButton";

export default function WishlistInitialState({ pizzaId }) {
    const { data: session, isPending } = authClient.useSession();
    const userId = session?.user?.id;

    const [state, setState] = useState({ checkedId: null, saved: false });

    useEffect(() => {
        if (isPending || !userId || !pizzaId) return;

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
    }, [isPending, userId, pizzaId]);

    if (!pizzaId || state.checkedId !== userId) return null;

    return <WishlistButton pizzaId={pizzaId} initialSaved={state.saved} />;
}

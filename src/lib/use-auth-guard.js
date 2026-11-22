"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";

export function useAuthGuard(requiredRole = null) {
    const { data: session, isPending } = authClient.useSession();
    const userId = session?.user?.id;

    const [state, setState] = useState({
        checkedUserId: null,
        profile: null,
        error: "",
    });

    useEffect(() => {
        if (isPending || !userId) return;

        const controller = new AbortController();

        async function checkAccess() {
            try {
                const response = await apiFetch("/api/me", {
                    signal: controller.signal,
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Account unavailable");
                }

                const profile = data.user;

                if (requiredRole && profile?.role !== requiredRole) {
                    throw new Error(
                        `This area is only available to ${requiredRole} accounts.`
                    );
                }

                if (!controller.signal.aborted) {
                    setState({ checkedUserId: userId, profile, error: "" });
                }
            } catch (error) {
                if (controller.signal.aborted) return;
                setState({
                    checkedUserId: userId,
                    profile: null,
                    error: error.message || "Access denied",
                });
            }
        }

        checkAccess();
        return () => controller.abort();
    }, [isPending, userId, requiredRole]);

    const hasSession = Boolean(userId);
    const checked = state.checkedUserId === userId;
    const ready = !isPending && (!hasSession || checked);
    const profile = checked ? state.profile : null;
    const error = checked ? state.error : "";

    return {
        ready,
        allowed:
            hasSession &&
            checked &&
            !error &&
            Boolean(profile) &&
            (!requiredRole || profile.role === requiredRole),
        profile,
        message: !hasSession ? "Please sign in to continue." : error,
        session,
        isPending,
    };
}

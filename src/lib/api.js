export const API_BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

export function apiUrl(path = "/") {
    const suffix = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${suffix}`;
}

export async function apiFetch(path, options = {}) {
    const { headers, body, ...rest } = options;
    const isFormData =
        typeof FormData !== "undefined" && body instanceof FormData;

    return fetch(apiUrl(path), {
        credentials: "include",
        cache: "no-store",
        ...rest,
        body,
        headers: {
            ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
            ...headers,
        },
    });
}

export async function readApiError(response, fallback = "Something went wrong") {
    try {
        const data = await response.json();
        return data.message || fallback;
    } catch {
        return fallback;
    }
}

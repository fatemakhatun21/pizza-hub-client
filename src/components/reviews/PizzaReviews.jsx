"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, MessageCircle, Star } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiFetch, readApiError } from "@/lib/api";

const MAX_COMMENT_LENGTH = 1000;
const RATING_VALUES = [1, 2, 3, 4, 5];

function normalizeDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function normalizeReview(item, index) {
    if (!item || typeof item !== "object") return null;

    const user =
        item.user && typeof item.user === "object"
            ? item.user
            : item.customer && typeof item.customer === "object"
              ? item.customer
              : {};

    const name =
        item.customerName ||
        item.userName ||
        item.name ||
        user.name ||
        (typeof item.author === "string"
            ? item.author
            : item.author?.name) ||
        "Pizza lover";

    const userId =
        item.userId ||
        item.customerId ||
        item.authorId ||
        user._id ||
        user.id;

    const rating = Number(item.rating ?? item.stars ?? 0);
    const dateValue = item.createdAt || item.date || item.updatedAt;

    return {
        id: String(item._id || item.id || `review-${index}`),
        name: String(name),
        userId: userId == null ? "" : String(userId),
        rating: Number.isFinite(rating)
            ? Math.min(5, Math.max(0, rating))
            : 0,
        dateLabel: normalizeDate(dateValue),
        comment: String(
            item.comment || item.text || item.review || ""
        ).trim(),
    };
}

function normalizeReviewsPayload(payload) {
    const root = payload && typeof payload === "object" ? payload : {};
    const container =
        root.data && typeof root.data === "object" ? root.data : root;

    const rawReviews = Array.isArray(container)
        ? container
        : Array.isArray(container.reviews)
          ? container.reviews
          : Array.isArray(container.data)
            ? container.data
            : [];

    const reviews = rawReviews.map(normalizeReview).filter(Boolean);

    const averageRaw =
        container.averageRating ??
        container.average ??
        container.avgRating ??
        root.averageRating ??
        root.average;
    const countRaw =
        container.reviewCount ??
        container.count ??
        container.total ??
        root.reviewCount ??
        root.count;

    const fallbackAverage = reviews.length
        ? reviews.reduce((total, review) => total + review.rating, 0) /
          reviews.length
        : 0;
    const parsedAverage = Number(averageRaw);
    const parsedCount = Number(countRaw);

    return {
        reviews,
        averageRating: Number.isFinite(parsedAverage)
            ? parsedAverage
            : fallbackAverage,
        reviewCount: Number.isFinite(parsedCount)
            ? parsedCount
            : reviews.length,
        hasReviewed: Boolean(container.hasReviewed ?? root.hasReviewed),
    };
}

function StarRow({ rating, label, size = 16, className = "" }) {
    return (
        <span
            role="img"
            aria-label={label}
            className={`inline-flex items-center gap-0.5 ${className}`}
        >
            {RATING_VALUES.map((value) => (
                <Star
                    key={value}
                    size={size}
                    aria-hidden="true"
                    className={
                        value <= Math.round(rating)
                            ? "fill-[#F5A623] text-[#F5A623]"
                            : "fill-none text-orange-200"
                    }
                />
            ))}
        </span>
    );
}

export default function PizzaReviews({ pizzaId }) {
    const headingId = useId();
    const formErrorId = useId();
    const commentFieldId = useId();
    const commentCountId = useId();

    const { data: session, isPending: sessionPending } =
        authClient.useSession();
    const sessionUserId = session?.user?.id;

    const [requestVersion, setRequestVersion] = useState(0);
    const [loadedRequest, setLoadedRequest] = useState("");
    const [reviewData, setReviewData] = useState({
        reviews: [],
        averageRating: 0,
        reviewCount: 0,
        hasReviewed: false,
    });
    const [loadError, setLoadError] = useState("");

    const [roleState, setRoleState] = useState({
        userId: "",
        role: null,
        profileId: "",
    });

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const requestId = `${pizzaId ?? ""}:${requestVersion}`;
    const loading = loadedRequest !== requestId;

    useEffect(() => {
        if (!pizzaId) return;

        const controller = new AbortController();

        async function loadReviews() {
            try {
                const response = await apiFetch(
                    `/api/reviews/${encodeURIComponent(pizzaId)}`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error(
                        await readApiError(
                            response,
                            "Reviews are unavailable right now."
                        )
                    );
                }

                const payload = await response.json();

                if (controller.signal.aborted) return;

                setReviewData(normalizeReviewsPayload(payload));
                setLoadError("");
                setLoadedRequest(requestId);
            } catch (err) {
                if (controller.signal.aborted || err?.name === "AbortError") {
                    return;
                }

                setLoadError(err?.message || "Could not load reviews.");
                setLoadedRequest(requestId);
            }
        }

        loadReviews();

        return () => controller.abort();
    }, [pizzaId, requestId]);

    useEffect(() => {
        if (sessionPending || !sessionUserId) return;

        const controller = new AbortController();

        async function loadRole() {
            try {
                const response = await apiFetch("/api/me", {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(
                        await readApiError(
                            response,
                            "Could not verify your account."
                        )
                    );
                }

                const data = await response.json();
                const profileId = data?.user?.id ?? data?.id ?? "";

                if (controller.signal.aborted) return;

                setRoleState({
                    userId: sessionUserId,
                    role: data?.user?.role ?? data?.role ?? null,
                    profileId: profileId ? String(profileId) : "",
                });
            } catch {
                if (controller.signal.aborted) return;

                // Fall back to a neutral state: no review form is shown.
                setRoleState({ userId: sessionUserId, role: null, profileId: "" });
            }
        }

        loadRole();

        return () => controller.abort();
    }, [sessionPending, sessionUserId]);

    const roleReady =
        !sessionPending && (!sessionUserId || roleState.userId === sessionUserId);
    const isCustomer =
        Boolean(sessionUserId) && roleReady && roleState.role === "customer";

    const userIds = [sessionUserId, roleState.profileId]
        .filter(Boolean)
        .map(String);
    const alreadyReviewed =
        submitted ||
        reviewData.hasReviewed ||
        reviewData.reviews.some(
            (review) => review.userId && userIds.includes(review.userId)
        );

    async function handleSubmit(event) {
        event.preventDefault();

        if (submitting) return;

        const trimmedComment = comment.trim();

        if (!RATING_VALUES.includes(rating)) {
            const message = "Please choose a star rating.";
            setFormError(message);
            toast.error(message);
            return;
        }

        if (!trimmedComment) {
            const message = "Please write a short comment about this pizza.";
            setFormError(message);
            toast.error(message);
            return;
        }

        setFormError("");
        setSubmitting(true);

        try {
            const response = await apiFetch("/api/reviews", {
                method: "POST",
                body: JSON.stringify({
                    pizzaId,
                    rating,
                    comment: trimmedComment,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    await readApiError(response, "Could not post your review.")
                );
            }

            let payload = null;

            try {
                payload = await response.json();
            } catch {
                // An empty success body is still a success.
            }

            toast.success(payload?.message || "Thanks for sharing your review!");
            setRating(0);
            setComment("");
            setSubmitted(true);
            setRequestVersion((version) => version + 1);
        } catch (err) {
            const message = err?.message || "Could not post your review.";
            setFormError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    if (!pizzaId) return null;

    return (
        <section
            aria-labelledby={headingId}
            className="mt-16 rounded-3xl border border-orange-100 bg-[#FFF8ED] p-6 md:p-10"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="text-sm font-bold uppercase tracking-widest text-[#C93425]">
                        Customer Stories
                    </span>
                    <h2
                        id={headingId}
                        className="mt-2 text-3xl font-black tracking-tight text-[#25201D]"
                    >
                        Reviews &amp; Ratings
                    </h2>
                </div>

                {!loading && !loadError && (
                    <div className="flex w-fit items-center gap-4 rounded-2xl bg-white px-5 py-3 shadow-sm">
                        <span
                            aria-hidden="true"
                            className="text-3xl font-black text-[#C93425]"
                        >
                            {reviewData.averageRating.toFixed(1)}
                        </span>
                        <div>
                            <StarRow
                                rating={reviewData.averageRating}
                                label={`Average rating ${reviewData.averageRating.toFixed(1)} out of 5`}
                            />
                            <p className="mt-1 text-xs text-[#6B625C]">
                                {reviewData.reviewCount}{" "}
                                {reviewData.reviewCount === 1
                                    ? "review"
                                    : "reviews"}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                    <h3 className="text-lg font-bold text-[#25201D]">
                        What people are saying
                    </h3>

                    {loading ? (
                        <div
                            role="status"
                            className="mt-5 rounded-2xl bg-white p-8 text-center"
                        >
                            <span className="sr-only">Loading reviews...</span>
                            <div
                                aria-hidden="true"
                                className="mx-auto h-4 w-40 animate-pulse rounded bg-orange-100"
                            />
                            <div
                                aria-hidden="true"
                                className="mx-auto mt-3 h-3 w-64 animate-pulse rounded bg-orange-50"
                            />
                            <p className="mt-5 text-sm text-[#6B625C]">
                                Loading reviews...
                            </p>
                        </div>
                    ) : loadError ? (
                        <div
                            role="alert"
                            className="mt-5 rounded-2xl bg-white p-8 text-center"
                        >
                            <AlertCircle
                                size={28}
                                aria-hidden="true"
                                className="mx-auto text-[#C93425]"
                            />
                            <p className="mt-3 text-sm text-[#6B625C]">
                                {loadError}
                            </p>
                            <button
                                type="button"
                                onClick={() =>
                                    setRequestVersion((version) => version + 1)
                                }
                                className="mt-5 rounded-full bg-[#C93425] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#A7281D]"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : reviewData.reviews.length === 0 ? (
                        <div className="mt-5 rounded-2xl bg-white p-8 text-center">
                            <MessageCircle
                                size={28}
                                aria-hidden="true"
                                className="mx-auto text-[#C93425]"
                            />
                            <p className="mt-3 font-semibold text-[#25201D]">
                                No reviews yet
                            </p>
                            <p className="mt-1 text-sm text-[#6B625C]">
                                Be the first to share your experience with this
                                pizza.
                            </p>
                        </div>
                    ) : (
                        <ul className="mt-5 space-y-4">
                            {reviewData.reviews.map((review) => (
                                <li
                                    key={review.id}
                                    className="rounded-2xl bg-white p-5 shadow-sm"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-[#25201D]">
                                                {review.name}
                                            </p>
                                            <StarRow
                                                rating={review.rating}
                                                label={`${review.rating} out of 5 stars`}
                                                size={14}
                                                className="mt-1"
                                            />
                                        </div>

                                        {review.dateLabel && (
                                            <time className="text-xs text-[#6B625C]">
                                                {review.dateLabel}
                                            </time>
                                        )}
                                    </div>

                                    {review.comment && (
                                        <p className="mt-4 text-sm leading-6 text-[#6B625C]">
                                            {review.comment}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[#25201D]">
                        Share your experience
                    </h3>

                    {!sessionUserId ? (
                        <p className="mt-3 text-sm leading-6 text-[#6B625C]">
                            <Link
                                href="/login"
                                className="font-semibold text-[#C93425] hover:underline"
                            >
                                Sign in
                            </Link>{" "}
                            to leave a review and help other pizza lovers
                            choose.
                        </p>
                    ) : !roleReady ? (
                        <p className="mt-3 text-sm text-[#6B625C]">
                            Checking your account...
                        </p>
                    ) : !isCustomer ? (
                        <div className="mt-3 rounded-xl bg-[#FFF8ED] p-4 text-sm leading-6 text-[#6B625C]">
                            Reviews can be left by customer accounts. Thanks for
                            being part of PizzaHub!
                        </div>
                    ) : loading ? (
                        <p className="mt-3 text-sm text-[#6B625C]">
                            Checking your review status...
                        </p>
                    ) : alreadyReviewed ? (
                        <div
                            role="status"
                            className="mt-3 rounded-xl bg-[#FFF8ED] p-5"
                        >
                            <CheckCircle2
                                size={24}
                                aria-hidden="true"
                                className="text-[#C93425]"
                            />
                            <p className="mt-2 font-semibold text-[#25201D]">
                                You&apos;ve reviewed this pizza
                            </p>
                            <p className="mt-1 text-sm text-[#6B625C]">
                                Thanks for helping other pizza lovers choose.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate>
                            <fieldset
                                className="mt-5"
                                aria-describedby={
                                    formError ? formErrorId : undefined
                                }
                            >
                                <legend className="text-sm font-semibold text-[#25201D]">
                                    Your rating
                                </legend>
                                <div className="mt-2 flex items-center gap-1">
                                    {RATING_VALUES.map((value) => (
                                        <label
                                            key={value}
                                            className="cursor-pointer p-1"
                                            title={`${value} star${value > 1 ? "s" : ""}`}
                                        >
                                            <input
                                                type="radio"
                                                name="pizza-review-rating"
                                                value={value}
                                                checked={rating === value}
                                                onChange={() => {
                                                    setRating(value);
                                                    setFormError("");
                                                }}
                                                aria-label={`${value} star${value > 1 ? "s" : ""}`}
                                                className="peer sr-only"
                                            />
                                            <Star
                                                size={30}
                                                aria-hidden="true"
                                                className={`transition ${
                                                    value <= rating
                                                        ? "fill-[#F5A623] text-[#F5A623]"
                                                        : "fill-none text-orange-200"
                                                } peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#C93425]`}
                                            />
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            <div className="mt-5">
                                <label
                                    htmlFor={commentFieldId}
                                    className="text-sm font-semibold text-[#25201D]"
                                >
                                    Your comment
                                </label>
                                <textarea
                                    id={commentFieldId}
                                    value={comment}
                                    onChange={(event) =>
                                        setComment(
                                            event.target.value.slice(
                                                0,
                                                MAX_COMMENT_LENGTH
                                            )
                                        )
                                    }
                                    maxLength={MAX_COMMENT_LENGTH}
                                    rows={4}
                                    placeholder="What did you love about this pizza?"
                                    aria-invalid={Boolean(formError)}
                                    aria-describedby={`${commentCountId}${formError ? ` ${formErrorId}` : ""}`}
                                    className="mt-2 w-full resize-none rounded-xl border border-orange-100 bg-[#FFFCF6] px-4 py-3 text-sm text-[#25201D] outline-none transition placeholder:text-[#9C8F87] focus:border-[#C93425]"
                                />
                                <p
                                    id={commentCountId}
                                    className="mt-1 text-right text-xs text-[#6B625C]"
                                >
                                    {comment.length}/{MAX_COMMENT_LENGTH}
                                </p>
                            </div>

                            {formError && (
                                <p
                                    id={formErrorId}
                                    role="alert"
                                    className="mt-2 text-sm text-[#C93425]"
                                >
                                    {formError}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                aria-label={
                                    submitting
                                        ? "Posting your review"
                                        : "Post review"
                                }
                                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#C93425] px-6 py-3 font-semibold text-white transition hover:bg-[#A7281D] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? "Posting..." : "Post Review"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}

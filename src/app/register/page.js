"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { apiFetch, readApiError } from "@/lib/api";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import {
    Eye,
    EyeOff,
    User,
    Mail,
    LockKeyhole,
    ArrowRight,
    Loader2,
} from "lucide-react";

function validatePassword(password) {
    if (
        password.length < 6 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password)
    ) {
        return "Password must be at least 6 characters and include one uppercase and one lowercase letter.";
    }

    return "";
}

export default function RegisterPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "customer",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (form.password !== form.confirmPassword) {
            const message = "Passwords do not match.";
            setError(message);
            toast.error(message);
            return;
        }

        const passwordError = validatePassword(form.password);

        if (passwordError) {
            setError(passwordError);
            toast.error(passwordError);
            return;
        }

        setLoading(true);

        try {
            const { error: authError } = await authClient.signUp.email({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
            });

            if (authError) {
                const message = authError.message || "Registration failed.";
                setError(message);
                toast.error(message);
                return;
            }


            if (form.role === "vendor") {
                const response = await apiFetch("/api/vendor/register", {
                    method: "POST",
                });

                if (!response.ok) {
                    const message = await readApiError(
                        response,
                        "Account created, but vendor activation failed."
                    );
                    setError(message);
                    toast.error(message);
                    return;
                }
            }

            const message = "Account created successfully!";
            setSuccess(message);
            toast.success(message);

            router.push(
                form.role === "vendor"
                    ? "/vendor/dashboard"
                    : "/"
            );
            router.refresh();

        } catch {
            const message = "Something went wrong. Please try again.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);

        try {
            const { error: authError } = await authClient.signIn.social({
                provider: "google",
                callbackURL:
                    process.env.NEXT_PUBLIC_CLIENT_URL || window.location.origin,
            });

            if (authError) {
                const message = authError.message || "Google sign up failed.";
                setError(message);
                toast.error(message);
            }
        } catch {
            const message = "Unable to connect with Google.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#FFF8ED] px-4 py-14">
            <div className="w-full max-w-[480px] rounded-[28px] border border-orange-100 bg-white p-7 shadow-xl shadow-orange-950/5 sm:p-10">

                <div className="mb-7 flex justify-center">
                    <Image
                        src="/logo/PizzaHub.png"
                        alt="PizzaHub Logo"
                        width={80}
                        height={80}
                        className="rounded-full object-contain"
                    />
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-[#25201D]">
                        Join <span className="text-[#C93425]">PizzaHub</span>
                    </h1>

                    <p className="mt-3 text-sm text-[#6B625C]">
                        Create your account and start your pizza journey.
                    </p>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-600"
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        role="status"
                        className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-700"
                    >
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-semibold text-[#25201D]"
                        >
                            Full Name
                        </label>

                        <div className="relative">
                            <User
                                size={19}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8C82]"
                            />

                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                autoComplete="name"
                                required
                                className="h-12 w-full rounded-xl border border-[#EBDCCB] bg-white pl-12 pr-4 outline-none focus:border-[#C93425]"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-semibold text-[#25201D]"
                        >
                            Email Address
                        </label>

                        <div className="relative">
                            <Mail
                                size={19}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8C82]"
                            />

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                autoComplete="email"
                                required
                                className="h-12 w-full rounded-xl border border-[#EBDCCB] bg-white pl-12 pr-4 outline-none focus:border-[#C93425]"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-semibold text-[#25201D]"
                        >
                            Password
                        </label>

                        <div className="relative">
                            <LockKeyhole
                                size={19}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8C82]"
                            />

                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Minimum 6 characters"
                                autoComplete="new-password"
                                minLength={6}
                                required
                                className="h-12 w-full rounded-xl border border-[#EBDCCB] bg-white pl-12 pr-12 outline-none focus:border-[#C93425]"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={
                                    showPassword ? "Hide password" : "Show password"
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A8C82]"
                            >
                                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="mb-2 block text-sm font-semibold text-[#25201D]"
                        >
                            Confirm Password
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            autoComplete="new-password"
                            required
                            className="h-12 w-full rounded-xl border border-[#EBDCCB] bg-white px-4 outline-none focus:border-[#C93425]"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="role"
                            className="mb-2 block text-sm font-semibold text-[#25201D]"
                        >
                            Join As
                        </label>

                        <select
                            id="role"
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="h-12 w-full rounded-xl border border-[#EBDCCB] bg-white px-4 outline-none focus:border-[#C93425]"
                        >
                            <option value="customer">Customer</option>
                            <option value="vendor">Vendor</option>
                        </select>

                        <p className="mt-2 text-xs text-[#8B817B]">
                            Vendor account activation will be available after
                            role verification is implemented.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#C93425] font-semibold text-white transition-colors hover:bg-[#A7281D] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={19} className="animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            <>
                                Create Account
                                <ArrowRight size={19} />
                            </>
                        )}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-sm text-gray-500">
                        or continue with
                    </span>
                    <div className="h-px flex-1 bg-gray-200" />
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#EBDCCB] bg-white font-semibold text-[#25201D] transition-colors hover:bg-[#FFF8ED] disabled:opacity-60"
                >
                    <FcGoogle size={22} />
                    Continue with Google
                </button>
                <p className="mt-8 text-center text-sm text-[#6B625C]">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-bold text-[#C93425] hover:underline"
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </main>
    );
}

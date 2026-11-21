"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";
import {
    Eye,
    EyeOff,
    Mail,
    LockKeyhole,
    ArrowRight,
    Loader2,
} from "lucide-react";

export default function LoginPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.email.trim() || !form.password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);

        try {
            const { error: authError } = await authClient.signIn.email({
                email: form.email.trim(),
                password: form.password,
            });

            if (authError) {
                setError(authError.message || "Invalid email or password.");
                return;
            }

            router.push("/");
            router.refresh();
        } catch {
            setError("Unable to sign in. Please try again.");
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
                callbackURL: "http://localhost:3000/",
            });

            if (authError) {
                setError(authError.message || "Google login failed.");
            }
        } catch {
            setError("Unable to connect with Google.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#FFF8ED] px-4 py-16">
            <div className="w-full max-w-[460px] rounded-[28px] border border-orange-100 bg-white p-7 shadow-xl shadow-orange-950/5 sm:p-10">

                <div className="mb-7 flex justify-center">
                    <Link href="/">
                        <Image
                            src="/logo/PizzaHub.png"
                            alt="PizzaHub Logo"
                            width={80}
                            height={80}
                            className="rounded-full object-contain"
                        />
                    </Link>
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-[#25201D]">
                        Welcome{" "}
                        <span className="text-[#C93425]">
                            Back!
                        </span>
                    </h1>

                    <p className="mt-3 text-sm text-[#6B625C]">
                        Sign in to your PizzaHub account
                        and continue your delicious journey.
                    </p>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600"
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

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
                                className="h-12 w-full rounded-xl border border-[#EBDCCB] bg-white pl-12 pr-4 text-[#25201D] outline-none transition-colors focus:border-[#C93425]"
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
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                                className="h-12 w-full rounded-xl border border-[#EBDCCB] bg-white pl-12 pr-12 text-[#25201D] outline-none transition-colors focus:border-[#C93425]"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A8C82] transition-colors hover:text-[#C93425]"
                            >
                                {showPassword ? (
                                    <EyeOff size={19} />
                                ) : (
                                    <Eye size={19} />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[#C93425] font-semibold text-white transition-colors hover:bg-[#A7281D] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={19} className="animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            <>
                                Sign In
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
                    className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#EBDCCB] bg-white font-semibold text-[#25201D] transition-colors hover:bg-[#FFF8ED] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <FcGoogle size={22} />

                    Continue with Google
                </button>

                <p className="mt-8 text-center text-sm text-[#6B625C]">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        className="font-bold text-[#C93425] hover:underline"
                    >
                        Create Account
                    </Link>
                </p>
            </div>
        </main>
    );
}

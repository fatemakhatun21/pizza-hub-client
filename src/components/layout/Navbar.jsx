"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, UserRound, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const navLinks = [
    { label: "Home", href: "/" },
    { label: "Browse Menu", href: "/menu" },
];
export default function Navbar() {
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    const { data: session, isPending } = authClient.useSession();

    const user = session?.user;

    const closeMenu = () => setIsOpen(false);

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        setLogoutError("");

        try {
            const { error } = await authClient.signOut();

            if (error) {
                setLogoutError(error.message || "Logout failed.");
                return;
            }

            closeMenu();
            router.push("/");
            router.refresh();
        } catch {
            setLogoutError("Something went wrong. Please try again.");
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
            <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
                <Link
                    href="/"
                    onClick={closeMenu}
                    className="flex items-center gap-3"
                >
                    <Image
                        src="/logo/Pizzahub.png"
                        alt="PizzaHub"
                        width={58}
                        height={58}
                        className="rounded-full object-contain"
                    />

                    <span className="text-2xl font-black tracking-tight text-[#25201D]">
                        Pizza<span className="text-[#C93425]">Hub</span>
                    </span>
                </Link>

                <div className="hidden items-center gap-8 md:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="font-medium text-[#25201D] transition-colors hover:text-[#C93425]"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="hidden items-center gap-3 md:flex">
                    {isPending ? (
                        <Loader2
                            size={22}
                            className="animate-spin text-[#C93425]"
                            aria-label="Checking session"
                        />
                    ) : user ? (
                        <>
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 rounded-full bg-[#FFF8ED] px-4 py-2 text-sm font-semibold text-[#25201D] transition-colors hover:bg-orange-100 hover:text-[#C93425]"
                            >
                                <UserRound size={18} className="text-[#C93425]" />
                                <span className="max-w-36 truncate">
                                    {user.name || "My Account"}
                                </span>
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#C93425] px-5 font-medium text-white transition-colors hover:bg-[#A7281D] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isLoggingOut ? (
                                    <Loader2 size={17} className="animate-spin" />
                                ) : (
                                    <LogOut size={17} />
                                )}
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="inline-flex h-10 items-center justify-center rounded-full px-5 font-medium text-[#25201D] transition-colors hover:bg-orange-100"
                            >
                                Sign In
                            </Link>

                            <Link
                                href="/register"
                                className="inline-flex h-10 items-center justify-center rounded-full bg-[#C93425] px-6 font-medium text-white transition-colors hover:bg-[#A7281D]"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isOpen}
                    aria-controls="mobile-navigation"
                    className="rounded-md p-2 text-[#25201D] hover:bg-orange-100 md:hidden"
                >
                    {isOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </nav>

            {logoutError && (
                <div role="alert" className="bg-red-50 px-5 py-2 text-center text-sm text-red-600">
                    {logoutError}
                </div>
            )}

            {isOpen && (
                <div
                    id="mobile-navigation"
                    className="border-t border-orange-100 bg-[#FFF8ED] px-5 py-5 md:hidden"
                >
                    <div className="flex flex-col gap-5">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={closeMenu}
                                className="font-medium text-[#25201D] transition-colors hover:text-[#C93425]"
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="border-t border-orange-100 pt-4">
                            {isPending ? (
                                <div className="flex justify-center">
                                    <Loader2
                                        size={22}
                                        className="animate-spin text-[#C93425]"
                                        aria-label="Checking session"
                                    />
                                </div>
                            ) : user ? (
                                <div className="flex flex-col gap-4">
                                    <Link
                                        href="/profile"
                                        onClick={closeMenu}
                                        className="flex items-center gap-3 font-semibold text-[#25201D] hover:text-[#C93425]"
                                    >
                                        <UserRound size={20} className="text-[#C93425]" />
                                        <span>{user.name || "My Account"}</span>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#C93425] font-medium text-white transition-colors hover:bg-[#A7281D] disabled:opacity-60"
                                    >
                                        {isLoggingOut ? (
                                            <Loader2 size={17} className="animate-spin" />
                                        ) : (
                                            <LogOut size={17} />
                                        )}
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <Link
                                        href="/login"
                                        onClick={closeMenu}
                                        className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-[#C93425] font-medium text-[#C93425] transition-colors hover:bg-orange-50"
                                    >
                                        Sign In
                                    </Link>

                                    <Link
                                        href="/register"
                                        onClick={closeMenu}
                                        className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-[#C93425] font-medium text-white transition-colors hover:bg-[#A7281D]"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

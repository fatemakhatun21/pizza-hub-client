"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    Crown,
    Menu,
    X,
    LogOut,
    UserRound,
    Loader2,
    ChevronDown,
    LayoutDashboard,
    Settings,
    Heart,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { isPremiumAccount } from "@/lib/premium";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [account, setAccount] = useState(null);

    const dropdownRef = useRef(null);

    const { data: session, isPending } = authClient.useSession();
    const user = session?.user;

    useEffect(() => {
        if (!user?.id) return;

        const controller = new AbortController();

        apiFetch("/api/me", {
            signal: controller.signal,
            cache: "no-store",
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load account");
                }

                return response.json();
            })
            .then((data) => {
                if (!controller.signal.aborted) {
                    setAccount({
                        ...data.user,
                        userId: user.id,
                    });
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setAccount(null);
                }
            });

        return () => controller.abort();
    }, [user?.id, pathname]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setProfileOpen(false);
                setMobileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const role =
        user && account?.userId === user.id
            ? account.role
            : null;

    const isPremium =
        role === "vendor" && isPremiumAccount(account);

    const dashboardHref =
        role === "admin"
            ? "/admin/dashboard"
            : role === "vendor"
                ? "/vendor/dashboard"
                : role === "customer"
                    ? "/customer/dashboard"
                    : null;

    const links = [
        { label: "Home", href: "/" },
        { label: "Browse Menu", href: "/menu" },
        ...(dashboardHref
            ? [{ label: "Dashboard", href: dashboardHref }]
            : []),
        ...(role === "customer"
            ? [{ label: "Wishlist", href: "/wishlist" }]
            : []),
    ];

    const isActive = (href) => {
        if (href === "/") {
            return pathname === "/";
        }

        if (href === "/menu") {
            return (
                pathname === "/menu" ||
                pathname.startsWith("/menu/")
            );
        }

        if (href.includes("/dashboard")) {
            const prefix = href.split("/dashboard")[0];
            return pathname.startsWith(prefix + "/");
        }

        return (
            pathname === href ||
            pathname.startsWith(href + "/")
        );
    };

    const linkClass = (href, mobile = false) => {
        const base = mobile
            ? "block rounded-xl px-4 py-3 text-base font-semibold transition-colors"
            : "shrink-0 whitespace-nowrap rounded-full px-3 py-2.5 text-base font-semibold transition-colors";

        return isActive(href)
            ? `${base} bg-[#FDE9E5] text-[#C93425]`
            : `${base} text-[#352C27] hover:bg-[#FFF3EB] hover:text-[#C93425]`;
    };

    const closeMenus = () => {
        setMobileOpen(false);
        setProfileOpen(false);
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);

        try {
            const { error } = await authClient.signOut();

            if (error) {
                toast.error(error.message || "Logout failed");
                return;
            }

            setAccount(null);
            closeMenus();
            toast.success("Logged out successfully");

            router.push("/");
            router.refresh();
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoggingOut(false);
        }
    };

    const avatar = user?.image ? (
        <img
            src={user.image}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover"
        />
    ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#C93425]">
            <UserRound size={18} />
        </span>
    );

    return (
        <header className="sticky top-0 z-50 border-b border-[#F1E5D9] bg-white/95 backdrop-blur-xl">
            <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-3 px-4 min-[500px]:gap-5 min-[960px]:px-5 xl:px-8">

                {/* Logo */}
                <Link
                    href="/"
                    onClick={closeMenus}
                    className="flex shrink-0 items-center gap-2"
                >
                    <Image
                        src="/logo/PizzaHub.png"
                        alt="PizzaHub"
                        width={48}
                        height={48}
                        className="h-12 w-12 shrink-0 object-contain"
                        priority
                    />

                    <span className="whitespace-nowrap text-2xl font-black tracking-tight text-[#25201D]">
                        Pizza
                        <span className="text-[#C93425]">
                            Hub
                        </span>
                    </span>
                </Link>

                <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex xl:gap-2">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeMenus}
                            aria-current={
                                isActive(link.href) ? "page" : undefined
                            }
                            className={linkClass(link.href)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="hidden shrink-0 items-center gap-3 lg:flex">

                    <ThemeToggle />

                    {isPending ? (
                        <Loader2
                            size={22}
                            className="animate-spin text-[#C93425]"
                        />
                    ) : user ? (
                        <div
                            ref={dropdownRef}
                            className="relative"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setProfileOpen((prev) => !prev)
                                }
                                aria-expanded={profileOpen}
                                aria-haspopup="menu"
                                className="flex h-11 items-center gap-2 rounded-full border border-[#EEDFD2] bg-[#FFF8ED] px-3 transition-colors hover:border-[#C93425]"
                            >
                                {avatar}

                                <span className="max-w-24 truncate whitespace-nowrap text-sm font-semibold text-[#25201D] xl:max-w-32">
                                    {user.name || "My Account"}
                                </span>

                                {isPremium && (
                                    <Crown
                                        size={16}
                                        className="shrink-0 text-amber-500"
                                    />
                                )}

                                <ChevronDown
                                    size={16}
                                    className={`shrink-0 text-[#6B625C] transition-transform ${profileOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {profileOpen && (
                                <div
                                    role="menu"
                                    className="absolute right-0 top-[calc(100%+12px)] z-50 w-64 rounded-2xl border border-[#F1E5D9] bg-white p-2 shadow-xl"
                                >
                                    <div className="border-b border-orange-100 px-3 py-3">
                                        <p className="truncate font-bold text-[#25201D]">
                                            {user.name || "My Account"}
                                        </p>

                                        <p className="truncate text-xs text-gray-500">
                                            {user.email}
                                        </p>

                                        {isPremium && (
                                            <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-amber-700">
                                                <Crown size={13} />
                                                Premium Vendor
                                            </p>
                                        )}
                                    </div>

                                    {dashboardHref && (
                                        <Link
                                            role="menuitem"
                                            href={dashboardHref}
                                            onClick={closeMenus}
                                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#25201D] hover:bg-[#FFF8ED]"
                                        >
                                            <LayoutDashboard size={18} />
                                            Dashboard
                                        </Link>
                                    )}

                                    <Link
                                        role="menuitem"
                                        href="/profile"
                                        onClick={closeMenus}
                                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#25201D] hover:bg-[#FFF8ED]"
                                    >
                                        <Settings size={18} />
                                        Profile Settings
                                    </Link>

                                    {role === "customer" && (
                                        <Link
                                            role="menuitem"
                                            href="/wishlist"
                                            onClick={closeMenus}
                                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#25201D] hover:bg-[#FFF8ED]"
                                        >
                                            <Heart size={18} />
                                            My Wishlist
                                        </Link>
                                    )}

                                    <div className="my-1 border-t border-orange-100" />

                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#C93425] hover:bg-red-50 disabled:opacity-50"
                                    >
                                        {isLoggingOut ? (
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <LogOut size={18} />
                                        )}
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-[#25201D] hover:bg-[#FFF8ED]"
                            >
                                Sign In
                            </Link>

                            <Link
                                href="/register"
                                className="whitespace-nowrap rounded-full bg-[#C93425] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#A7281D]"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Right Side */}
                <div className="flex shrink-0 items-center gap-2 lg:hidden">

                    <ThemeToggle />

                    {!isPending && user && (
                        <Link
                            href="/profile"
                            onClick={closeMenus}
                            aria-label="My Profile"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF8ED]"
                        >
                            {avatar}
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={() =>
                            setMobileOpen((prev) => !prev)
                        }
                        aria-label={
                            mobileOpen ? "Close menu" : "Open menu"
                        }
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-navigation"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF8ED] text-[#25201D]"
                    >
                        {mobileOpen ? (
                            <X size={23} />
                        ) : (
                            <Menu size={23} />
                        )}
                    </button>
                </div>
            </nav>

            {mobileOpen && (
                <div
                    id="mobile-navigation"
                    className="border-t border-[#F1E5D9] bg-white px-4 py-4 shadow-lg lg:hidden"
                >
                    <div className="mx-auto flex max-w-7xl flex-col gap-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={
                                    isActive(link.href) ? "page" : undefined
                                }
                                onClick={closeMenus}
                                className={linkClass(link.href, true)}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="mt-3 border-t border-orange-100 pt-3">
                            {isPending ? (
                                <Loader2
                                    size={22}
                                    className="mx-auto animate-spin text-[#C93425]"
                                />
                            ) : user ? (
                                <div className="space-y-2">
                                    <div className="px-4 py-2">
                                        <p className="font-bold text-[#25201D]">
                                            {user.name || "My Account"}
                                        </p>

                                        <p className="truncate text-xs text-gray-500">
                                            {user.email}
                                        </p>

                                        {isPremium && (
                                            <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-amber-700">
                                                <Crown size={14} />
                                                Premium Vendor
                                            </p>
                                        )}
                                    </div>

                                    <Link
                                        href="/profile"
                                        onClick={closeMenus}
                                        className={linkClass("/profile", true)}
                                    >
                                        Profile Settings
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#C93425] px-5 py-3 font-semibold text-white disabled:opacity-50"
                                    >
                                        {isLoggingOut ? (
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <LogOut size={18} />
                                        )}
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <Link
                                        href="/login"
                                        onClick={closeMenus}
                                        className="flex-1 rounded-full border border-[#C93425] py-3 text-center font-semibold text-[#C93425]"
                                    >
                                        Sign In
                                    </Link>

                                    <Link
                                        href="/register"
                                        onClick={closeMenus}
                                        className="flex-1 rounded-full bg-[#C93425] py-3 text-center font-semibold text-white"
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

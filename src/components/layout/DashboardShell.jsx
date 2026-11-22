"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, Loader2, ShieldAlert } from "lucide-react";
import { useAuthGuard } from "@/lib/use-auth-guard";

const NAVIGATION = {
    admin: [
        { href: "/admin/dashboard", label: "Overview" },
        { href: "/admin/users", label: "Users" },
        { href: "/admin/transactions", label: "Transactions" },
        { href: "/menu", label: "Browse Menu" },
    ],
    vendor: [
        { href: "/vendor/dashboard", label: "Overview" },
        { href: "/vendor/orders", label: "Orders" },
        { href: "/vendor/add-pizza", label: "Add Pizza" },
        { href: "/menu", label: "Browse Menu" },
    ],
    customer: [
        { href: "/customer/dashboard", label: "Overview" },
        { href: "/wishlist", label: "Wishlist" },
        { href: "/menu", label: "Browse Menu" },
        { href: "/profile", label: "Profile" },
    ],
};

const TITLES = {
    admin: "Admin Workspace",
    vendor: "Vendor Workspace",
    customer: "Customer Workspace",
};

export default function DashboardShell({ role, children }) {
    const pathname = usePathname();
    const { ready, allowed, profile, message } = useAuthGuard(role);
    const links = NAVIGATION[role] || [];

    if (!ready) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2 className="animate-spin text-[#C93425]" size={34} />
            </div>
        );
    }

    if (!allowed) {
        return (
            <main className="mx-auto max-w-xl px-5 py-24 text-center">
                <ShieldAlert
                    size={44}
                    className="mx-auto mb-5 text-[#C93425]"
                />
                <h1 className="text-2xl font-bold text-[#25201D]">
                    Access unavailable
                </h1>
                <p className="mt-3 text-[#6B625C]">{message}</p>
                <Link
                    href="/login"
                    className="mt-7 inline-block rounded-full bg-[#C93425] px-7 py-3 font-semibold text-white"
                >
                    Sign In
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#FFF8ED]">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 lg:flex-row lg:gap-8 lg:px-8">
                <aside className="lg:w-64 lg:shrink-0">
                    <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm lg:sticky lg:top-28">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#C93425]">
                            {TITLES[role]}
                        </p>

                        <nav className="mt-5 flex flex-wrap gap-2 lg:flex-col">
                            {links.map((link) => {
                                const active = pathname === link.href;

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                                            active
                                                ? "bg-[#C93425] text-white"
                                                : "text-[#6B625C] hover:bg-orange-50 hover:text-[#C93425]"
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-6 border-t border-orange-100 pt-5">
                            <p className="text-sm font-semibold text-[#25201D]">
                                {profile?.name || "Account"}
                            </p>
                            <p className="mt-1 text-xs capitalize text-[#6B625C]">
                                {profile?.role || role}
                            </p>

                            {profile?.plan === "premium" && (
                                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                                    <Crown size={14} /> Premium
                                </span>
                            )}
                        </div>
                    </div>
                </aside>

                <div className="min-w-0 flex-1">{children}</div>
            </div>
        </main>
    );
}

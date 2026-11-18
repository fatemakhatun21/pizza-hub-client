"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
    { label: "Home", href: "/" },
    { label: "Browse Menu", href: "/menu" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const closeMenu = () => setIsOpen(false);

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

                        <div className="flex gap-3 border-t border-orange-100 pt-4">
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
                    </div>
                </div>
            )}
        </header>
    );
}

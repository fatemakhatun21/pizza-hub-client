import Image from "next/image";
import Link from "next/link";
import {
    MapPin,
    Mail,
    Phone,
    ArrowUpRight,
    Pizza,
} from "lucide-react";

import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Browse Menu", href: "/menu" },
    { label: "Sign In", href: "/login" },
    { label: "Sign Up", href: "/register" },
];

const socialLinks = [
    {
        name: "Facebook",
        href: "https://facebook.com",
        icon: FaFacebookF,
    },
    {
        name: "Instagram",
        href: "https://instagram.com",
        icon: FaInstagram,
    },
    {
        name: "X",
        href: "https://x.com",
        icon: FaXTwitter,
    },
];

export default function Footer() {
    return (
        <footer className="bg-[#25201D] text-white">
            <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 lg:px-8 lg:pt-20">

                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1.2fr] lg:gap-10">

                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3"
                        >
                            <Image
                                src="/logo/PizzaHub.png"
                                alt="PizzaHub Logo"
                                width={60}
                                height={60}
                                className="rounded-full object-contain"
                            />

                            <span className="text-3xl font-black tracking-tight">
                                Pizza
                                <span className="text-[#F06445]">
                                    Hub
                                </span>
                            </span>
                        </Link>

                        <p className="mt-5 max-w-sm text-sm leading-7 text-[#C9BDB5]">
                            Discover delicious pizzas from local restaurants,
                            explore mouthwatering flavors, and enjoy a simple
                            ordering experience with PizzaHub.
                        </p>

                        <div className="mt-7 flex items-center gap-3">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;

                                return (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.name}
                                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-all duration-300 hover:-translate-y-1 hover:border-[#C93425] hover:bg-[#C93425]"
                                    >
                                        <Icon size={19} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold">
                            Quick Links
                        </h3>

                        <ul className="mt-6 space-y-4">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="inline-flex items-center gap-2 text-sm text-[#C9BDB5] transition-colors hover:text-[#F06445]"
                                    >
                                        <ArrowUpRight size={15} />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold">
                            Get in Touch
                        </h3>

                        <div className="mt-6 space-y-5 text-sm text-[#C9BDB5]">

                            <div className="flex items-start gap-3">
                                <MapPin
                                    size={19}
                                    className="shrink-0 text-[#F06445]"
                                />
                                <span>Dhaka, Bangladesh</span>
                            </div>

                            <a
                                href="mailto:hello@pizzahub.example"
                                className="flex items-center gap-3 transition-colors hover:text-white"
                            >
                                <Mail
                                    size={19}
                                    className="shrink-0 text-[#F06445]"
                                />
                                <span className="break-all">
                                    hello@pizzahub.example
                                </span>
                            </a>

                            <div className="flex items-center gap-3">
                                <Phone
                                    size={19}
                                    className="shrink-0 text-[#F06445]"
                                />
                                <span>Contact details coming soon</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-center sm:flex-row">

                    <p className="text-sm text-[#C9BDB5]">
                        © {new Date().getFullYear()} PizzaHub.
                        All rights reserved.
                    </p>

                    <div className="flex items-center gap-4">
                        <p className="flex items-center gap-2 text-sm text-[#C9BDB5]">
                            Made with
                            <Pizza
                                size={17}
                                className="text-[#F06445]"
                            />
                            for pizza lovers
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

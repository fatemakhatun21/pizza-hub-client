"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        let active = true;

        // Read the class the inline head script already applied. Deferring the
        // setState keeps the initial markup stable through hydration.
        Promise.resolve().then(() => {
            if (!active) return;

            setIsDark(
                document.documentElement.classList.contains("dark")
            );
        });

        return () => {
            active = false;
        };
    }, []);

    const toggleTheme = () => {
        const nextIsDark = !isDark;
        const root = document.documentElement;

        if (nextIsDark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        localStorage.setItem(
            "pizzahub-theme",
            nextIsDark ? "dark" : "light"
        );
        setIsDark(nextIsDark);
    };

    const label = isDark
        ? "Switch to light mode"
        : "Switch to dark mode";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={label}
            aria-pressed={isDark}
            title={label}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[#F06445] transition-colors hover:border-[#F06445] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F06445]"
        >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
    );
}

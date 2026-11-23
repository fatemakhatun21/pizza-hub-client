import Link from "next/link";
import { ArrowRight, Pizza } from "lucide-react";

export const metadata = {
    title: "Page Not Found",
};

export default function NotFound() {
    return (
        <main className="flex min-h-[70vh] items-center justify-center bg-[#FFF8ED] px-5 py-20">
            <div className="w-full max-w-xl rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-sm sm:p-12">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FDE9E5]">
                    <Pizza size={32} className="text-[#C93425]" />
                </div>

                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#C93425]">
                    404
                </p>

                <h1 className="mt-3 text-3xl font-black text-[#25201D] sm:text-4xl">
                    This page went missing
                </h1>

                <p className="mt-4 text-[#6B625C]">
                    The page you are looking for may have moved, or it never
                    existed. Let&apos;s get you back to the good stuff.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-full bg-[#C93425] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#A7281D]"
                    >
                        Back Home
                    </Link>

                    <Link
                        href="/menu"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#C93425] px-6 py-3 font-semibold text-[#C93425] transition-colors hover:bg-[#FDE9E5]"
                    >
                        Browse Menu
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </main>
    );
}

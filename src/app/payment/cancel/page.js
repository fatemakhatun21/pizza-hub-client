import Link from "next/link";
import { ArrowRight, Crown, XCircle } from "lucide-react";

export const metadata = {
    title: "Payment Cancelled",
};

export default function PaymentCancelPage() {
    return (
        <main className="min-h-[70vh] bg-[#FFF8ED] px-5 py-20">
            <div className="mx-auto max-w-2xl rounded-3xl border border-orange-100 bg-white p-8 shadow-sm sm:p-12">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                    <XCircle size={34} className="text-red-600" />
                </div>

                <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-red-600">
                    Payment cancelled
                </p>

                <h1 className="mt-3 text-center text-3xl font-black text-[#25201D] sm:text-4xl">
                    No charge was made
                </h1>

                <p className="mt-4 text-center text-[#6B625C]">
                    You left the Stripe checkout before completing payment.
                    Your account is unchanged and no Premium benefits have been
                    added.
                </p>

                <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-start gap-3">
                        <Crown
                            size={22}
                            className="mt-0.5 shrink-0 text-amber-600"
                        />

                        <div>
                            <h2 className="font-bold text-[#25201D]">
                                Want to try again?
                            </h2>

                            <p className="mt-2 text-sm text-[#6B625C]">
                                You can start a new checkout from the vendor
                                dashboard at any time. Premium is activated
                                only when a verified Stripe webhook confirms a
                                completed subscription.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                        href="/vendor/dashboard"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C93425] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#A7281D]"
                    >
                        Back to Vendor Dashboard
                        <ArrowRight size={18} />
                    </Link>

                    <Link
                        href="/menu"
                        className="inline-flex items-center justify-center rounded-full border border-[#C93425] px-6 py-3 font-semibold text-[#C93425] transition-colors hover:bg-[#FDE9E5]"
                    >
                        Browse Menu
                    </Link>
                </div>
            </div>
        </main>
    );
}

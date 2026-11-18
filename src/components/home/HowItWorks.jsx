import Image from "next/image";
import Link from "next/link";
import { Search, ClipboardList, Pizza, ArrowRight } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: Search,
        title: "Explore the Menu",
        description:
            "Discover delicious pizzas, sides, and drinks from local restaurants. Find exactly what you're craving.",
    },
    {
        number: "02",
        icon: ClipboardList,
        title: "Place Your Order",
        description:
            "Choose your favorite item, select a delivery date, and provide your delivery address.",
    },
    {
        number: "03",
        icon: Pizza,
        title: "Enjoy Your Pizza",
        description:
            "Track your order status and get ready to enjoy a delicious meal from your chosen restaurant.",
    },
];

export default function HowItWorks() {
    return (
        <section className="overflow-hidden bg-[#FFF8ED] py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex flex-col-reverse gap-12 lg:gap-16">

                    <div className="relative">
                        <div className="absolute -inset-4 rounded-[40px] bg-[#F6D9C7]/60 blur-2xl" />

                        <div className="relative overflow-hidden rounded-[32px] shadow-xl shadow-orange-950/10">
                            <Image
                                src="/delivery/pizza-delivery.png"
                                alt="PizzaHub delivery partner carrying pizzas"
                                width={900}
                                height={750}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="aspect-[5/4] w-full object-cover"
                            />
                        </div>

                        <div className="absolute -bottom-5 right-4 rounded-2xl border border-orange-100 bg-white px-5 py-4 shadow-xl sm:right-8">
                            <p className="text-sm font-bold text-[#25201D]">
                                🍕 Your Pizza, Your Way
                            </p>
                            <p className="mt-1 text-xs text-[#6B625C]">
                                Simple ordering experience
                            </p>
                        </div>
                    </div>

                    <div>
                        <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#C93425]">
                            Simple & Convenient
                        </span>

                        <h2 className="mt-4 text-4xl font-black tracking-tight text-[#25201D] md:text-5xl">
                            How <span className="text-[#C93425]">PizzaHub</span> Works
                        </h2>

                        <p className="mt-5 max-w-lg text-lg leading-relaxed text-[#6B625C]">
                            Your favorite pizza is just a few simple steps away.
                            Discover, order, and enjoy with PizzaHub.
                        </p>

                        <div className="mt-10 space-y-8">
                            {steps.map((step) => {
                                const Icon = step.icon;

                                return (
                                    <div key={step.number} className="flex gap-5">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#C93425] shadow-sm">
                                            <Icon size={26} strokeWidth={1.8} />
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-[#C93425]">
                                                    STEP {step.number}
                                                </span>
                                            </div>

                                            <h3 className="mt-1 text-xl font-bold text-[#25201D]">
                                                {step.title}
                                            </h3>

                                            <p className="mt-2 max-w-md text-sm leading-7 text-[#6B625C]">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Link
                            href="/menu"
                            className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#C93425] px-7 py-4 font-semibold text-white transition-colors hover:bg-[#A7281D]"
                        >
                            Explore Pizza Menu
                            <ArrowRight size={19} />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

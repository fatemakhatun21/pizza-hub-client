import {
    Pizza,
    Store,
    MousePointerClick,
    ShieldCheck,
    ArrowUpRight,
} from "lucide-react";

const features = [
    {
        id: 1,
        icon: Pizza,
        title: "Fresh & Delicious",
        description:
            "Discover mouthwatering pizzas freshly prepared with quality ingredients by local restaurants.",
        number: "01",
    },
    {
        id: 2,
        icon: Store,
        title: "Local Restaurants",
        description:
            "Explore unique flavors from local pizza shops and find your next favorite restaurant.",
        number: "02",
    },
    {
        id: 3,
        icon: MousePointerClick,
        title: "Easy Ordering",
        description:
            "Browse menus, choose your favorite pizza, and place your order in just a few simple steps.",
        number: "03",
    },
    {
        id: 4,
        icon: ShieldCheck,
        title: "Trusted Quality",
        description:
            "Explore menu items reviewed by our platform, with clear restaurant and ordering information.",
        number: "04",
    },
];

export default function WhyChooseUs() {
    return (
        <section className="relative overflow-hidden bg-white py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">

                <div className="mb-12 max-w-2xl">
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#C93425]">
                        The PizzaHub Experience
                    </span>

                    <h2 className="mt-4 text-4xl font-black tracking-tight text-[#25201D] md:text-5xl">
                        Why Choose{" "}
                        <span className="text-[#C93425]">PizzaHub?</span>
                    </h2>

                    <p className="mt-5 text-lg leading-relaxed text-[#6B625C]">
                        We make discovering and ordering your favorite pizza
                        simple, convenient, and enjoyable.
                    </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={feature.id}
                                className="group relative flex min-h-[310px] flex-col overflow-hidden rounded-[28px] border border-[#F1E8DE] bg-[#FFF8ED] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#F3C5B6] hover:bg-white hover:shadow-xl hover:shadow-orange-950/5"
                            >

                                <div className="flex items-start justify-between">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C93425]/10 text-[#C93425] transition-colors duration-300 group-hover:bg-[#C93425] group-hover:text-white">
                                        <Icon size={30} strokeWidth={1.8} />
                                    </div>

                                    <span className="text-sm font-semibold text-[#C9B7AA]">
                                        {feature.number}
                                    </span>
                                </div>

                                <div className="mt-auto pt-10">
                                    <h3 className="text-xl font-bold text-[#25201D]">
                                        {feature.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-7 text-[#6B625C]">
                                        {feature.description}
                                    </p>

                                    <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#C93425]">
                                        Made for pizza lovers
                                        <ArrowUpRight size={16} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

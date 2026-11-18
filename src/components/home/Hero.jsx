"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Clock3, Truck } from "lucide-react";

export default function Hero() {
    return (
        <section className="overflow-hidden bg-[#FFF8ED]">
            <div className="mx-auto grid min-h-[600px] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="space-y-7"
                >
                    <span className="inline-flex items-center rounded-full bg-[#FCE8DD] px-4 py-2 text-sm font-semibold text-[#C93425]">
                        🍕 Freshly Baked, Made with Love
                    </span>

                    <h1 className="text-5xl leading-[1.12] font-black tracking-tight text-[#25201D] sm:text-6xl lg:text-[68px]">
                        Happiness Is
                        <br />
                        Just a{" "}
                        <span className="text-[#C93425]">
                            Pizza
                        </span>
                        <br />
                        Away!
                    </h1>

                    <p className="max-w-lg text-lg leading-relaxed text-[#6B625C]">
                        Discover delicious, freshly baked pizzas from
                        your favorite local restaurants. Made with
                        passion, delivered to your doorstep.
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href="/menu"
                            className="inline-flex items-center gap-3 rounded-full bg-[#C93425] px-7 py-4 font-semibold text-white transition-all hover:-translate-y-1 hover:bg-[#A7281D]"
                        >
                            Explore Pizza Menu
                            <ArrowRight size={19} />
                        </Link>

                        <span className="text-sm font-medium text-[#6B625C]">
                            Fresh • Delicious • Reliable
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-8 border-t border-[#EBDCCB] pt-7">
                        <div className="flex items-center gap-3">
                            <Truck className="text-[#C93425]" size={25} />
                            <div>
                                <p className="font-bold text-[#25201D]">
                                    Easy Ordering
                                </p>
                                <p className="text-sm text-[#6B625C]">
                                    Simple & convenient
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock3 className="text-[#C93425]" size={25} />
                            <div>
                                <p className="font-bold text-[#25201D]">
                                    Freshly Prepared
                                </p>
                                <p className="text-sm text-[#6B625C]">
                                    Made just for you
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative"
                >
                    <div className="absolute -inset-5 rounded-[3rem] bg-[#F8D9BF]/50 blur-3xl" />

                    <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-orange-950/15">
                        <Image
                            src="/banners/bannar.png"
                            alt="Delicious freshly baked pizza"
                            width={900}
                            height={700}
                            priority
                            className="aspect-[5/4] w-full object-cover"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

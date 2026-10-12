"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { testimonial } from "@/lib/testimonial";
import Image from "next/image";
import TextAnimation from "../components/TextAnimation";

export default function Testimonial3DCarousel() {
    const shouldReduceMotion = useReducedMotion();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const totalCards = testimonial.length;

    // Detect screen width for responsive rendering
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const nextCard = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % totalCards);
    }, [totalCards]);

    const prevCard = useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
    }, [totalCards]);

    // Autoplay timer with pause on hover
    useEffect(() => {
        if (isHovered) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        timerRef.current = setInterval(() => {
            nextCard();
        }, 5000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isHovered, nextCard]);

    // Circular relative position calculation (-2 to +2)
    const getRelativePosition = (index: number) => {
        let diff = index - activeIndex;
        if (diff > totalCards / 2) diff -= totalCards;
        if (diff < -totalCards / 2) diff += totalCards;
        return diff;
    };

    return (
        <section className="text-white relative overflow-hidden select-none bg-black bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(45,45,50,0.5)_0%,rgba(20,20,24,0.2)_50%,transparent_80%)]" id="testimonials">
            <div className="px-6 py-20 md:px-12 md:py-28 mx-auto">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                        duration: shouldReduceMotion ? 0.25 : 0.8,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    className="mb-12 md:mb-16"
                >
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 sm:text-xs">
                        05 / Testimonials
                    </p>

                    <h2 className="mt-5 max-w-4xl text-[10vw] font-bold uppercase leading-[0.85] tracking-[-0.04em] text-white sm:text-[8vw] md:text-[5.5vw] xl:text-[4.5vw]">
                        Trusted by <TextAnimation>Humans</TextAnimation>.
                    </h2>
                </motion.div>

                {/* 3D Carousel Stage */}
                <motion.div
                    initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.94 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                        duration: shouldReduceMotion ? 0.25 : 0.85,
                        delay: shouldReduceMotion ? 0 : 0.15,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    className="relative w-full h-[460px] sm:h-[480px] flex items-center justify-center [perspective:1200px]"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Background Glow */}
                    <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-white/[0.03] blur-[120px] pointer-events-none" />

                    <div className="relative w-full max-w-[320px] sm:max-w-[420px] h-full flex items-center justify-center">
                        {testimonial.map((item, index) => {
                            const offset = getRelativePosition(index);
                            const isCenter = offset === 0;

                            // Limit DOM load to visible scope
                            if (Math.abs(offset) > 2) return null;
                            // On mobile, discard non-center cards entirely from view
                            if (isMobile && !isCenter) return null;

                            const xTranslate = isMobile ? 0 : offset * 250;
                            const rotateY = isMobile ? 0 : offset * -28;
                            const zTranslate = isMobile ? 0 : -Math.abs(offset) * 120;
                            const scale = isMobile ? 1 : 1 - Math.abs(offset) * 0.1;
                            const opacity = isMobile
                                ? (isCenter ? 1 : 0)
                                : Math.abs(offset) === 2
                                    ? 0.35
                                    : Math.abs(offset) === 1
                                        ? 0.7
                                        : 1;
                            const zIndex = 30 - Math.abs(offset) * 10;

                            return (
                                <motion.div
                                    key={item.name + index}
                                    onClick={() => !isCenter && setActiveIndex(index)}
                                    initial={false}
                                    animate={{
                                        x: xTranslate,
                                        y: 0,
                                        z: zTranslate,
                                        rotateY: rotateY,
                                        scale: scale,
                                        opacity: opacity,
                                        zIndex: zIndex,
                                    }}
                                    whileHover={
                                        isCenter
                                            ? {
                                                y: -4,
                                                transition: { duration: 0.2, ease: "easeOut" },
                                            }
                                            : {
                                                opacity: 0.9,
                                                transition: { duration: 0.2, ease: "easeOut" },
                                            }
                                    }
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                        mass: 0.7,
                                    }}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.12}
                                    onDragEnd={(_, info) => {
                                        if (info.offset.x < -60) nextCard();
                                        else if (info.offset.x > 60) prevCard();
                                    }}
                                    style={{
                                        transformStyle: "preserve-3d",
                                    }}
                                    className={`group absolute inset-0 rounded-3xl border bg-neutral-950 p-7 sm:p-10 shadow-2xl flex flex-col justify-between transform-gpu will-change-transform transition-[border-color,box-shadow] duration-300 ${isCenter
                                        ? "border-neutral-700 cursor-grab active:cursor-grabbing hover:border-neutral-400 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)]"
                                        : "border-neutral-900 cursor-pointer hover:border-neutral-700"
                                        }`}
                                >
                                    {/* Subtle Inset Highlight on Hover */}
                                    <div className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-white/[0.04] to-transparent" />

                                    {/* Quote Text */}
                                    <p className="text-base sm:text-lg md:text-xl font-medium leading-relaxed text-neutral-200 pointer-events-none">
                                        <span className="text-3xl sm:text-4xl text-neutral-500 font-serif mr-2">
                                            &ldquo;
                                        </span>
                                        {item.speech}
                                    </p>

                                    {/* Author Profile */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-neutral-900 pointer-events-none">
                                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-neutral-700 group-hover:border-neutral-500 transition-colors duration-300 bg-neutral-900">
                                            <Image
                                                src={item.image || "/images/sadab.png"}
                                                alt={item.name}
                                                fill
                                                className="object-cover object-center"
                                                sizes="48px"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm sm:text-base text-white uppercase tracking-wider transition-colors">
                                                {item.name}
                                            </h3>
                                            <p className="font-mono text-[11px] text-neutral-400 uppercase tracking-widest mt-0.5">
                                                {item.role}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Navigation Controls */}
                <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                        duration: shouldReduceMotion ? 0.25 : 0.65,
                        delay: shouldReduceMotion ? 0 : 0.25,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    className="mt-10 flex justify-center items-center gap-5"
                >
                    <button
                        onClick={prevCard}
                        aria-label="Previous slide"
                        className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-500 hover:bg-neutral-900 transition-all duration-200 active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-2">
                        {testimonial.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                aria-label={`Go to slide ${i + 1}`}
                                className={`h-1.5 transition-all duration-300 rounded-full ${activeIndex === i
                                    ? "w-8 bg-white"
                                    : "w-2 bg-neutral-800 hover:bg-neutral-600"
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextCard}
                        aria-label="Next slide"
                        className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-500 hover:bg-neutral-900 transition-all duration-200 active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

// Same link style as the homepage: hover bullet + sliding underline
const linkClass =
    "group relative inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white transition-colors duration-300 hover:text-white md:text-[11px]";
const bulletClass =
    "h-1.5 w-1.5 shrink-0 scale-0 rounded-full bg-white opacity-0 transition-all duration-200 ease-out group-hover:scale-100 group-hover:opacity-100";
const underlineClass =
    "absolute -bottom-0.5 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100";

export default function AboutMe() {
    const shouldReduceMotion = useReducedMotion();

    const socials = [
        { name: "Github", href: "https://github.com/Sadab-Kibria" },
        { name: "X / Twitter", href: "https://x.com/Sadab_Kibria" },
        { name: "Instagram", href: "https://www.instagram.com/sadab_kibria" },
    ];

    return (
        <main className="text-white min-h-screen bg-black" id="about-me">
            <div className="mx-6 my-20 md:mx-12 md:my-28">
                {/* Section Indicator */}
                <motion.p
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: shouldReduceMotion ? 0.25 : 0.6,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 sm:text-xs mb-10"
                >
                    01 / About Me
                </motion.p>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: shouldReduceMotion ? 0.25 : 0.8,
                        delay: shouldReduceMotion ? 0 : 0.1,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    className="mb-20 text-[10vw] font-bold uppercase leading-[0.85] tracking-[-0.04em] text-white sm:text-[8vw] md:text-[5.5vw] xl:text-[4.5vw]"
                >
                    About Me.
                </motion.h1>

                {/* Full-width image, natural aspect ratio, no cropping */}
                <motion.div
                    initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: shouldReduceMotion ? 0.25 : 0.85,
                        delay: shouldReduceMotion ? 0 : 0.2,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    className="w-full overflow-hidden border border-white/10 bg-neutral-900"
                >
                    <Image
                        src="/images/sadabkibria2.avif"
                        alt="Visual showcase"
                        width={1920}
                        height={1080}
                        priority
                        className="h-auto w-full"
                        sizes="100vw"
                    />
                </motion.div>

                {/* Content & Social Sections with Left-Aligned Titles */}
                <div className="mt-10 md:mt-14 flex flex-col gap-16 md:gap-24">
                    {/* Socials Section */}
                    <motion.div
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                            duration: shouldReduceMotion ? 0.25 : 0.7,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 border-t border-white/10 pt-10"
                    >
                        <div className="md:col-span-4">
                            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-400">
                                Connect / Socials
                            </h2>
                        </div>
                        <div className="md:col-span-8 flex flex-wrap items-center justify-start gap-x-6 gap-y-3">
                            {socials.map((social, index) => (
                                <motion.div
                                    key={social.name}
                                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: shouldReduceMotion ? 0.2 : 0.45,
                                        delay: shouldReduceMotion ? 0 : 0.15 + index * 0.06,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                >
                                    <Link
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={linkClass}
                                    >
                                        <span className={bulletClass} />
                                        <span className="relative">
                                            {social.name}
                                            <span className={underlineClass} />
                                        </span>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Web Development Section */}
                    <motion.div
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                            duration: shouldReduceMotion ? 0.25 : 0.7,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 border-t border-white/10 pt-10"
                    >
                        <div className="md:col-span-4">
                            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-400">
                                Engineering & Craft
                            </h2>
                        </div>
                        <div className="md:col-span-8">
                            <p className="text-xl sm:text-2xl md:text-3xl font-medium leading-relaxed text-neutral-200">
                                I design and engineer fast, resilient web applications at the intersection of minimalist aesthetics and solid architecture. With a focus on full-stack development, modern interfaces, and scalable backend systems, I build digital experiences where clean code meets deliberate visual restraint.
                            </p>
                        </div>
                    </motion.div>

                    {/* Backstory Section */}
                    <motion.div
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                            duration: shouldReduceMotion ? 0.25 : 0.7,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 border-t border-white/10 pt-10"
                    >
                        <div className="md:col-span-4">
                            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-400">
                                Backstory
                            </h2>
                        </div>
                        <div className="md:col-span-8">
                            <p className="text-xl sm:text-2xl md:text-3xl font-medium leading-relaxed text-neutral-200">
                                I started coding in 2022, building my foundation in programming fundamentals before exploring the world of web development. As I grew more comfortable with <span className="text-[#F7DF1E]">JavaScript</span>, I moved on to <span className="text-[#61DBFB]">React</span>, learning to build interactive user interfaces, and eventually became comfortable with <span className="text-black [-webkit-text-stroke:0.7px_white]">Next.js</span>. Along the way, I explored different tools, technologies, and frameworks, turning what I learned into practical projects and real-world applications. My journey continues through experimentation, problem-solving, and a constant drive to build clean, functional, and thoughtfully crafted digital experiences.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Centered Quote Section */}
                <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                        duration: shouldReduceMotion ? 0.25 : 0.8,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    className="mt-24 md:mt-36 border-t border-white/10 pt-16 flex flex-col items-center text-center max-w-4xl mx-auto"
                >
                    <blockquote className="text-2xl sm:text-3xl md:text-4xl font-medium leading-relaxed text-neutral-100">
                        <span className="text-5xl sm:text-6xl text-neutral-500 font-serif mr-2 leading-none align-middle">
                            &ldquo;
                        </span>
                        Software is at its best when complexity dissolves into intuitive simplicity.
                    </blockquote>
                    <cite className="not-italic mt-6 flex items-center justify-center gap-3">
                        <span className="h-px w-8 bg-neutral-600 inline-block" />
                        <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-neutral-300">
                            Sadab Kibria
                        </span>
                    </cite>
                </motion.div>
            </div>
        </main>
    );
}
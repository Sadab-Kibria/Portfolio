"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { projects, Project } from "@/lib/projects";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function ProjectsPage() {
    const shouldReduceMotion = useReducedMotion();
    const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

    // Modal State for Image Slider
    const [activeModalImages, setActiveModalImages] = useState<string[]>([]);
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const toggleProject = (slug: string) => {
        setExpandedSlug((prev) => (prev === slug ? null : slug));
    };

    // Open Image Lightbox
    const openImageModal = (
        e: React.MouseEvent,
        imageSet: string[],
        index: number
    ) => {
        e.stopPropagation(); // Prevents triggering accordion toggle when clicking preview image
        setActiveModalImages(imageSet);
        setActiveImageIndex(index);
        setIsModalOpen(true);
    };

    // Slider Navigation Logic
    const handlePrevImage = useCallback(() => {
        setActiveImageIndex((prev) =>
            prev === 0 ? activeModalImages.length - 1 : prev - 1
        );
    }, [activeModalImages.length]);

    const handleNextImage = useCallback(() => {
        setActiveImageIndex((prev) =>
            prev === activeModalImages.length - 1 ? 0 : prev + 1
        );
    }, [activeModalImages.length]);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    // Keyboard Navigation (ESC to close, Left/Right arrows to slide)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isModalOpen) return;
            if (e.key === "Escape") closeModal();
            if (e.key === "ArrowLeft") handlePrevImage();
            if (e.key === "ArrowRight") handleNextImage();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isModalOpen, handlePrevImage, handleNextImage, closeModal]);

    return (
        <main className="min-h-screen text-white" id="works">
            <section className="px-6 py-20 md:px-12 md:py-28">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: shouldReduceMotion ? 0.25 : 0.8,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    className="mb-16 flex flex-col gap-8 md:mb-24 md:flex-row md:items-start md:justify-between"
                >
                    <div className="flex-1">
                        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 sm:text-xs">
                            Selected Work
                        </p>

                        <h1 className="mt-5 max-w-3xl text-[10vw] font-bold uppercase leading-[0.85] tracking-[-0.04em] text-white sm:text-[8vw] md:text-[5.5vw] xl:text-[4.5vw]">
                            Built with Code, Made to Perform
                        </h1>
                    </div>

                    <div className="flex-1 text-[3.5vw] font-semibold leading-[1.1] text-neutral-300 md:mt-16 md:text-[2.2vw] xl:text-[2vw]">
                        Here are some selected projects that showcase my passion for
                        creating memorable web experiences, products and brands to life
                    </div>
                </motion.div>

                {/* Projects Interactive List */}
                <div className="border-t border-white/20">
                    {projects.map((project: Project, index: number) => {
                        const isExpanded = expandedSlug === project.slug;
                        // Full set of images for this project (Main cover + gallery)
                        const allProjectImages = [
                            project.image,
                            ...(project.gallery || []),
                        ].filter(Boolean);

                        return (
                            <motion.div
                                key={project.slug}
                                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{
                                    duration: shouldReduceMotion ? 0.25 : 0.6,
                                    delay: shouldReduceMotion ? 0 : Math.min(index * 0.08, 0.4),
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                                className="border-b border-white/20 transition-colors duration-300"
                            >
                                {/* Row Header Button */}
                                <button
                                    onClick={() => toggleProject(project.slug)}
                                    className={`group flex w-full items-center justify-between gap-4 px-4 py-6 text-left transition-all duration-300 hover:bg-neutral-900/60 md:px-6 md:py-8 ${isExpanded ? "bg-neutral-900/80 text-white" : "text-white"
                                        }`}
                                    aria-expanded={isExpanded}
                                >
                                    {/* 1. Name */}
                                    <div className="w-1/3 pr-2 sm:pr-4">
                                        <span
                                            className={`block font-mono text-xs uppercase tracking-widest transition-colors duration-300 ${isExpanded
                                                ? "text-neutral-400"
                                                : "text-neutral-500 group-hover:text-neutral-300"
                                                }`}
                                        >
                                            {project.category}
                                        </span>
                                        <h2
                                            className={`text-lg font-bold uppercase tracking-tight transition-colors duration-300 sm:text-2xl md:text-3xl ${isExpanded
                                                ? "text-white"
                                                : "text-neutral-100 group-hover:text-white"
                                                }`}
                                        >
                                            {project.title}
                                        </h2>
                                    </div>

                                    {/* 2. Centered Image Thumbnail (Clickable for Modal Preview) */}
                                    <div className="flex flex-1 items-center justify-center">
                                        <motion.div
                                            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.92 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                duration: shouldReduceMotion ? 0.25 : 0.5,
                                                delay: shouldReduceMotion ? 0 : Math.min(index * 0.08, 0.4) + 0.1,
                                                ease: [0.16, 1, 0.3, 1],
                                            }}
                                            onClick={(e) => openImageModal(e, allProjectImages, 0)}
                                            className="relative h-16 w-24 flex-shrink-0 cursor-zoom-in overflow-hidden border border-white/10 bg-neutral-900 sm:h-20 sm:w-32 md:h-24 md:w-40"
                                            title="Click to view full screen"
                                        >
                                            <Image
                                                src={project.image}
                                                alt={project.title}
                                                fill
                                                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                                sizes="(max-width: 768px) 128px, 160px"
                                            />
                                        </motion.div>
                                    </div>

                                    {/* 3. Year & Expand Toggle Indicator */}
                                    <div className="flex w-1/3 items-center justify-end gap-3 pl-2 sm:gap-8">
                                        <span
                                            className={`font-mono text-sm transition-colors duration-300 sm:text-base ${isExpanded
                                                ? "text-neutral-300"
                                                : "text-neutral-500 group-hover:text-neutral-300"
                                                }`}
                                        >
                                            {project.year}
                                        </span>
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm transition-all duration-300 ${isExpanded
                                                ? "border border-white bg-white text-black"
                                                : "border border-white/30 text-white group-hover:border-white group-hover:bg-white group-hover:text-black"
                                                }`}
                                        >
                                            {isExpanded ? "−" : "+"}
                                        </div>
                                    </div>
                                </button>

                                {/* Smooth Expansion Panel using Grid Rows */}
                                <div
                                    className={`grid transition-all duration-500 ease-in-out ${isExpanded
                                        ? "grid-rows-[1fr] opacity-100 pb-12 pt-6"
                                        : "grid-rows-[0fr] opacity-0 pb-0 pt-0"
                                        }`}
                                >
                                    <div className="overflow-hidden px-4 md:px-6">
                                        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                                            {/* Left Sidebar: Meta & Action Buttons */}
                                            <div className="space-y-6 lg:col-span-4">
                                                {/* Meta Tags */}
                                                <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-6 font-mono text-xs uppercase">
                                                    <div>
                                                        <span className="block text-neutral-500">Role</span>
                                                        <span className="mt-1 block font-medium text-neutral-200">
                                                            {project.role || "Developer"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-neutral-500">Status</span>
                                                        <span className="mt-1 block font-medium text-neutral-200">
                                                            {project.status || "Completed"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Tech Stack */}
                                                <div>
                                                    <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-neutral-400">
                                                        Technologies
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {project.tech.map((tech) => (
                                                            <span
                                                                key={tech}
                                                                className=" border border-white/20 bg-neutral-900/60 px-3 py-1 font-mono text-xs text-neutral-300"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* 2 Action Buttons: Source Code & View Live */}
                                                <div className="flex flex-wrap gap-3 pt-4">
                                                    {project.source && (
                                                        <a
                                                            href={project.source}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-1  font-bold border border-white/30 bg-transparent py-3 text-center font-mono text-xs uppercase tracking-wider text-white transition-all hover:bg-white hover:text-black"
                                                        >
                                                            Source Code
                                                        </a>
                                                    )}
                                                    {project.live && (
                                                        <a
                                                            href={project.live}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-1 font-bold  border border-gray-900 bg-white py-3 text-center font-mono text-xs uppercase tracking-wider text-gray-900 transition-all hover:bg-neutral-200"
                                                        >
                                                            View Live
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right Main Content */}
                                            <div className="space-y-10 lg:col-span-8">
                                                {/* Overview */}
                                                <div>
                                                    <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-neutral-400">
                                                        Overview
                                                    </h3>
                                                    <p className="text-base leading-relaxed text-neutral-300 md:text-lg">
                                                        {project.overview || project.description}
                                                    </p>
                                                </div>

                                                {/* Features */}
                                                {project.features && project.features.length > 0 && (
                                                    <div>
                                                        <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-neutral-400">
                                                            Key Features
                                                        </h3>
                                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                            {project.features.map((feature, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className=" border border-white/10 bg-neutral-900/50 p-5"
                                                                >
                                                                    <h4 className="mb-1 font-semibold text-white">
                                                                        {feature.title}
                                                                    </h4>
                                                                    <p className="text-sm leading-normal text-neutral-400">
                                                                        {feature.description}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Highlights & Challenges */}
                                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                                    {project.technicalHighlights && (
                                                        <div>
                                                            <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-neutral-400">
                                                                Highlights
                                                            </h3>
                                                            <ul className="space-y-3 text-sm text-neutral-300">
                                                                {project.technicalHighlights.map((item, idx) => (
                                                                    <li
                                                                        key={idx}
                                                                        className="border-l-2 border-white pl-3"
                                                                    >
                                                                        <strong className="block text-white">
                                                                            {item.title}
                                                                        </strong>
                                                                        <span className="text-neutral-400">
                                                                            {item.description}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {project.challenges && (
                                                        <div>
                                                            <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-neutral-400">
                                                                Challenges Solved
                                                            </h3>
                                                            <ul className="space-y-3 text-sm text-neutral-300">
                                                                {project.challenges.map((item, idx) => (
                                                                    <li
                                                                        key={idx}
                                                                        className="border-l-2 border-neutral-700 pl-3"
                                                                    >
                                                                        <strong className="block text-white">
                                                                            {item.title}
                                                                        </strong>
                                                                        <span className="text-neutral-400">
                                                                            {item.description}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Interactive Gallery */}
                                                {project.gallery && project.gallery.length > 0 && (
                                                    <div>
                                                        <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-neutral-400">
                                                            Gallery (Click to Expand)
                                                        </h3>
                                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                                            {project.gallery.map((imgSrc, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    onClick={(e) =>
                                                                        openImageModal(
                                                                            e,
                                                                            allProjectImages,
                                                                            idx + 1 // Offset by 1 since main cover image is at index 0
                                                                        )
                                                                    }
                                                                    className="relative aspect-video cursor-zoom-in overflow-hidden border border-white/10 bg-neutral-900 transition-opacity hover:opacity-80"
                                                                >
                                                                    <Image
                                                                        src={imgSrc}
                                                                        alt={`${project.title} view ${idx + 1}`}
                                                                        fill
                                                                        className="object-cover object-center"
                                                                        sizes="(max-width: 640px) 50vw, 25vw"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Full-Screen Image Lightbox Modal */}
            <AnimatePresence>
                {isModalOpen && activeModalImages.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: shouldReduceMotion ? 0.2 : 0.3 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
                        onClick={closeModal}
                    >
                    {/* Close Button */}
                    <button
                        onClick={closeModal}
                        className="absolute right-6 top-6 z-50 font-mono text-sm uppercase tracking-widest text-white/70 hover:text-white"
                        aria-label="Close full screen image view"
                    >
                        ✕ Close [ESC]
                    </button>

                    {/* Slide Count Indicator */}
                    <div className="absolute left-6 top-6 font-mono text-xs tracking-widest text-white/50">
                        {activeImageIndex + 1} / {activeModalImages.length}
                    </div>

                    {/* Prev Button */}
                    {activeModalImages.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePrevImage();
                            }}
                            className="absolute left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 font-mono text-xl text-white transition hover:bg-white/20 sm:left-8"
                            aria-label="Previous Image"
                        >
                            ←
                        </button>
                    )}

                    {/* Active Full-Screen Image Container */}
                    <motion.div
                        initial={{ scale: shouldReduceMotion ? 1 : 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: shouldReduceMotion ? 1 : 0.95, opacity: 0 }}
                        transition={{ duration: shouldReduceMotion ? 0.2 : 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="relative h-[85vh] w-[90vw] max-w-6xl"
                        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking the image frame
                    >
                        <Image
                            src={activeModalImages[activeImageIndex]}
                            alt={`Full view ${activeImageIndex + 1}`}
                            fill
                            className="object-contain object-center"
                            priority
                            sizes="100vw"
                        />
                    </motion.div>

                    {/* Next Button */}
                    {activeModalImages.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNextImage();
                            }}
                            className="absolute right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 font-mono text-xl text-white transition hover:bg-white/20 sm:right-8"
                            aria-label="Next Image"
                        >
                            →
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
        </main>
    );
}
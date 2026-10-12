"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { projects, Project } from "@/lib/projects";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import TextAnimation from "../components/TextAnimation";
import { useAssetLoader } from "../components/AssetLoadingProvider";

function ProjectThumbnailImage({
  src,
  alt,
  slug,
  reportLoaded,
  reportError,
}: {
  src: string;
  alt: string;
  slug: string;
  reportLoaded: (id: string) => void;
  reportError: (id: string, err?: unknown) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth !== 0) {
      reportLoaded(`project-img-${slug}`);
    }
  }, [slug, reportLoaded]);

  return (
    <Image
      ref={imgRef}
      src={src}
      alt={alt}
      fill
      priority
      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
      sizes="(max-width: 768px) 128px, 160px"
      onLoad={() => reportLoaded(`project-img-${slug}`)}
      onError={(err) => reportError(`project-img-${slug}`, err)}
    />
  );
}

export default function ProjectsScrollReveal() {
  const shouldReduceMotion = useReducedMotion();
  const { reportAssetLoaded, reportAssetError } = useAssetLoader();
  const featuredProjects = projects.slice(0, 3);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  // Modal State for Image Slider Lightbox
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
    e.stopPropagation(); // Prevents accordion toggle when clicking image
    setActiveModalImages(imageSet);
    setActiveImageIndex(index);
    setIsModalOpen(true);
  };

  // Slider Navigation
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

  // Keyboard navigation for image lightbox
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
    <main className="text-white" id="works">
      <section className="px-6 py-20 md:px-12 md:py-28">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: shouldReduceMotion ? 0.25 : 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mb-12 flex flex-col gap-8 md:mb-16 md:flex-row md:items-start md:justify-between"
        >
          <div className="flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 sm:text-xs">
              03 / Selected Work
            </p>

            <h1 className="mt-5 max-w-3xl text-[10vw] font-bold uppercase leading-[0.85] tracking-[-0.04em] text-white sm:text-[8vw] md:text-[5.5vw] xl:text-[4.5vw]">
              Simple Code, Better <TextAnimation>Experience</TextAnimation>
            </h1>

            {/* Circular Fill Hover Button */}
            <motion.div
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.88 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: shouldReduceMotion ? 0.25 : 0.6,
                delay: shouldReduceMotion ? 0 : 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-8 inline-block"
            >
              <Link
                href="/projectShowcase"
                className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/30 text-center font-mono text-[10px] uppercase leading-tight tracking-wide text-white transition-colors duration-500 hover:text-black md:h-28 md:w-28 before:absolute before:inset-0 before:z-0 before:m-auto before:h-full before:w-full before:rounded-full before:bg-white before:scale-0 before:transition-transform before:duration-500 before:ease-out hover:before:scale-100"
              >
                <span className="relative z-10 font-bold">
                  View All
                  <br />
                  Projects
                </span>
              </Link>
            </motion.div>
          </div>

          <div className="flex-1 text-[3.5vw] font-semibold leading-[1.1] text-neutral-300 md:mt-16 md:text-[2.2vw] xl:text-[2vw] uppercase">
            Here are some selected projects that showcase my work in creating clean, useful, and engaging digital experiences.
          </div>
        </motion.div>

        {/* 3-Item Expandable Row Listing */}
        <div className="border-t border-white/20">
          {featuredProjects.map((project: Project, idx: number) => {
            const isExpanded = expandedSlug === project.slug;
            const allProjectImages = [
              project.image,
              ...(project.gallery || []),
            ].filter(Boolean);

            return (
              <motion.div
                key={project.slug}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: shouldReduceMotion ? 0.25 : 0.65,
                  delay: shouldReduceMotion ? 0 : idx * 0.1,
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
                  {/* 1. Name & Category */}
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

                  {/* 2. Image (Centered & Clickable for full-screen view) */}
                  <div className="flex flex-1 items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.92 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: shouldReduceMotion ? 0.25 : 0.5,
                        delay: shouldReduceMotion ? 0 : idx * 0.1 + 0.1,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      onClick={(e) => openImageModal(e, allProjectImages, 0)}
                      className="relative h-16 w-24 flex-shrink-0 cursor-zoom-in overflow-hidden border border-white/10 bg-neutral-900 sm:h-20 sm:w-32 md:h-24 md:w-40"
                      title="Click to view full screen"
                    >
                      <ProjectThumbnailImage
                        src={project.image}
                        alt={project.title}
                        slug={project.slug}
                        reportLoaded={reportAssetLoaded}
                        reportError={reportAssetError}
                      />
                    </motion.div>
                  </div>

                  {/* 3. Year & Expand Indicator */}
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

                {/* Smooth Expanding Panel */}
                <div
                  className={`grid transition-all duration-500 ease-in-out ${isExpanded
                      ? "grid-rows-[1fr] opacity-100 pb-12 pt-6"
                      : "grid-rows-[0fr] opacity-0 pb-0 pt-0"
                    }`}
                >
                  <div className="overflow-hidden px-4 md:px-6">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                      {/* Left Sidebar: Metadata & Action Links */}
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
                                className="border border-white/20 bg-neutral-900/60 px-3 py-1 font-mono text-xs text-neutral-300"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons: Source Code & View Live */}
                        <div className="flex flex-wrap gap-3 pt-4">
                          {project.source && (
                            <a
                              href={project.source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 font-bold border border-white/30 bg-transparent py-3 text-center font-mono text-xs uppercase tracking-wider text-white transition-all hover:bg-white hover:text-black"
                            >
                              Source Code
                            </a>
                          )}
                          {project.live && (
                            <a
                              href={project.live}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 border font-extrabold border-gray-900 bg-white py-3 text-center font-mono text-xs uppercase tracking-wider text-gray-900 transition-all hover:bg-neutral-200"
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

                        {/* Key Features */}
                        {project.features && project.features.length > 0 && (
                          <div>
                            <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-neutral-400">
                              Key Features
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {project.features.map((feature, idx) => (
                                <div
                                  key={idx}
                                  className="border border-white/10 bg-neutral-900/50 p-5"
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

                        {/* Technical Highlights & Challenges */}
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
                                      idx + 1
                                    )
                                  }
                                  className="relative aspect-video cursor-zoom-in overflow-hidden border border-white/10 bg-neutral-900 transition-opacity hover:opacity-80"
                                >
                                  <Image
                                    src={imgSrc}
                                    alt={`${project.title} gallery preview ${idx + 1}`}
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

            {/* Slide Index Indicator */}
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

            {/* Active Image */}
            <motion.div
              initial={{ scale: shouldReduceMotion ? 1 : 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: shouldReduceMotion ? 1 : 0.95, opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-[85vh] w-[90vw] max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={activeModalImages[activeImageIndex]}
                alt={`Full screen view ${activeImageIndex + 1}`}
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
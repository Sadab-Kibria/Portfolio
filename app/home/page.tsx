"use client";

import { useRef } from "react";
import FluidCanvas from "../components/FluidCanvas";
import Link from "next/link";
import HeroBackground from "../components/HeroBackground";
import { motion, useReducedMotion } from "framer-motion";

const CV_FILE_ID = "1hQFVP8_6C83yqM1CFK3SoTAzSt4Auixy";
const CV_PREVIEW_URL = `https://drive.google.com/file/d/${CV_FILE_ID}/view`;
const CV_DOWNLOAD_URL = `https://drive.google.com/uc?export=download&id=${CV_FILE_ID}`;

// Shared link style: hover bullet + sliding underline (same as the footer links)
const linkClass =
  "group relative inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white transition-colors duration-300 hover:text-white md:text-[11px]";
const bulletClass =
  "h-1.5 w-1.5 shrink-0 scale-0 rounded-full bg-white opacity-0 transition-all duration-200 ease-out group-hover:scale-100 group-hover:opacity-100";
const underlineClass =
  "absolute -bottom-0.5 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100";

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const socialLinks = [
    { label: "Github", link: "https://github.com/Sadab-Kibria" },
    { label: "X / Twitter", link: "https://x.com/Sadab_Kibria" },
    { label: "Instagram", link: "https://www.instagram.com/sadab_kibria" },
  ];

  return (
    <>
      <FluidCanvas heroRef={heroRef} />
      <HeroBackground />

      <section
        ref={heroRef}
        className="relative w-full min-h-svh py-8 md:py-10 flex flex-col overflow-hidden text-white select-none"
        id="home"
      >
        {/* Right Indicator */}
        <motion.div
          initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.25 : 0.8,
            delay: shouldReduceMotion ? 0 : 0.35,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute right-6 md:right-14 top-1/3 z-10 hidden sm:block"
        >
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/60">
            01 / HOME
          </span>
        </motion.div>

        {/* Center Main Content
            In normal flow (flex-1) so the section grows to fit the title
            plus the bottom bar instead of letting them overlap. */}
        <div className="relative flex flex-1 items-center py-6 pointer-events-none">
          <div className="w-full">
            <motion.h1
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0.25 : 0.9,
                delay: shouldReduceMotion ? 0 : 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-black uppercase leading-[0.76]"
              style={{
                fontSize: "clamp(3.5rem, 21.5vw, 20rem)",
                letterSpacing: "clamp(-0.08em, -0.06em, -0.04em)",
              }}
            >
              SADAB
            </motion.h1>

            <motion.h1
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0.25 : 0.9,
                delay: shouldReduceMotion ? 0 : 0.28,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-black uppercase leading-[0.76] text-right"
              style={{
                fontSize: "clamp(3.5rem, 21.5vw, 20rem)",
                letterSpacing: "clamp(-0.08em, -0.06em, -0.04em)",
                marginRight: "clamp(1rem, 3.5vw, 4.5rem)",
              }}
            >
              KIBRIA
            </motion.h1>
          </div>
        </div>

        {/* Bottom bar
            Mobile: resume links -> Let's Talk -> socials (stacked, centered)
            md+: resume links + socials in the left column, Let's Talk in the center
            Now in normal flow (not absolute), so it can never sit behind the title. */}
        <div className="relative z-10 mx-5 mb-6 md:mx-14 md:mb-10 grid grid-cols-1 justify-items-center gap-5 md:grid-cols-[1fr_auto_1fr] md:grid-rows-[auto_auto] md:items-end md:justify-items-start md:gap-x-6 md:gap-y-2">
          {/* Resume links: above Let's Talk on mobile, left column (top) on md+ */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0.25 : 0.75,
              delay: shouldReduceMotion ? 0 : 0.42,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:col-start-1 md:row-start-1 md:justify-start md:gap-x-6"
          >
            {/* Preview Resume (opens the Drive viewer in a new tab) */}
            <a
              href={CV_PREVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              <span className={bulletClass} />
              <span className="relative">
                Preview Resume
                <span className={underlineClass} />
              </span>
            </a>

            {/* Download Resume (direct download from Drive) */}
            <a href={CV_DOWNLOAD_URL} className={linkClass}>
              <span className={bulletClass} />
              <span className="relative">
                Download Resume
                <span className={underlineClass} />
              </span>
            </a>
          </motion.div>

          {/* Let's Talk: center column, spans both rows on md+ */}
          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: shouldReduceMotion ? 0.25 : 0.75,
              delay: shouldReduceMotion ? 0 : 0.38,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex justify-center md:col-start-2 md:row-span-2 md:row-start-1 md:self-end"
          >
            <Link
              href="/#contact"
              className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/30 text-center font-mono text-[10px] uppercase leading-tight tracking-wide text-white transition-colors duration-500 hover:text-black md:h-28 md:w-28 before:absolute before:inset-0 before:rounded-full before:bg-white before:scale-0 before:transition-transform before:duration-500 before:ease-out hover:before:scale-100"
            >
              <span className="relative z-10 font-bold">LET&apos;S TALK</span>
            </Link>
          </motion.div>

          {/* Social links: below on mobile, left column (bottom) on md+ */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0.25 : 0.75,
              delay: shouldReduceMotion ? 0 : 0.52,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:col-start-1 md:row-start-2 md:justify-start md:gap-x-6"
          >
            {socialLinks.map((item, index) => (
              <motion.a
                key={item.label}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0.25 : 0.5,
                  delay: shouldReduceMotion ? 0 : 0.55 + index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                <span className={bulletClass} />
                <span className="relative">
                  {item.label}
                  <span className={underlineClass} />
                </span>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
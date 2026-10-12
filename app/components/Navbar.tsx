"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  easeInOut,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  Variants,
} from "framer-motion";
import { Link } from "next-view-transitions";

interface NavItem {
  title: string;
  link: string;
}

const navItems: NavItem[] = [
  { title: "Home", link: "/#home" },
  { title: "TechStack", link: "/#techstack" },
  { title: "Works", link: "/#works" },
  { title: "About", link: "/#about" },
  /* { title: "Testimonials", link: "/#testimonials" }, */
  { title: "Contact", link: "/#contact" },
];

const socialLinks = [
  { label: "Github", link: "https://github.com/Sadab-Kibria" },
  { label: "X / Twitter", link: "https://x.com/Sadab_Kibria" },
  { label: "Instagram", link: "https://www.instagram.com/sadab_kibria" },
];

// Shared hover effect: bullet + sliding underline (same as the footer links)
const bulletClass =
  "h-1.5 w-1.5 shrink-0 scale-0 rounded-full bg-white opacity-0 transition-all duration-200 ease-out group-hover:scale-100 group-hover:opacity-100";
const underlineClass =
  "absolute -bottom-0.5 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 850);
  });

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const panelVariants: Variants = {
    initial: {
      x: "100%",
      skewX: 12,
      opacity: 0,
    },
    animate: {
      x: 0,
      skewX: 0,
      opacity: 1,
      transition: {
        duration: 0.75,
        ease: [0.76, 0, 0.24, 1],
      },
    },
    exit: {
      x: "100%",
      skewX: -12,
      opacity: 0,
      transition: {
        duration: 0.55,
        ease: [0.76, 0, 0.24, 1],
      },
    },
  };

  return (
    <>
      {/* ── Static top navbar ── */}
      <motion.nav
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0.25 : 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 left-0 w-full px-4 py-4 min-[1000px]:px-8 min-[1000px]:py-8 flex justify-between items-start z-40"
      >
        <motion.div
          initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.25 : 0.65, delay: shouldReduceMotion ? 0 : 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/#home" className="inline-flex items-center">
            <Image
              src="/images/logo.png"
              alt="Sadab Logo"
              width={240}
              height={80}
              priority
              className="w-auto h-16 object-contain"
            />
          </Link>
        </motion.div>
        <div className="flex gap-16 max-[1000px]:flex-col max-[1000px]:items-end max-[1000px]:gap-1">
          {navItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0.25 : 0.5,
                delay: shouldReduceMotion ? 0 : 0.15 + index * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link
                href={item.link}
                className="group relative inline-flex items-center gap-2 uppercase font-semibold text-[0.85rem] text-white no-underline"
              >
                {/* Hover bullet */}
                <span className={bulletClass} />

                {/* Label + underline */}
                <span className="relative">
                  {item.title}
                  <span className={underlineClass} />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.nav>

      {/* ── Floating circle button (z-[60] keeps it in front of the slide panel) ── */}
      <AnimatePresence>
        {(isScrolled || isOpen) && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: easeInOut }}
            onClick={() => setIsOpen(!isOpen)}
            className="group fixed top-5 right-5 md:top-8 md:right-8 z-[60] flex h-12 w-12 md:h-16 md:w-16 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-black/60 backdrop-blur-md cursor-pointer transition-colors duration-500 hover:border-white
              before:absolute before:inset-0 before:z-0 before:rounded-full before:bg-white before:scale-0 before:transition-transform before:duration-500 before:ease-out hover:before:scale-100"
            aria-label="Toggle menu"
          >
            <motion.div
              animate={isOpen ? "open" : "closed"}
              className="relative z-10 flex flex-col justify-center items-center gap-1.5 w-5 md:w-6 pointer-events-none"
            >
              <motion.span
                variants={{
                  closed: { rotate: 0, y: 0 },
                  open: { rotate: 45, y: 7.5 },
                }}
                transition={{ duration: 0.3 }}
                className="block h-[1.5px] w-full bg-white transition-colors duration-500 group-hover:bg-black origin-center"
              />
              <motion.span
                variants={{
                  closed: { opacity: 1, scaleX: 1 },
                  open: { opacity: 0, scaleX: 0 },
                }}
                transition={{ duration: 0.2 }}
                className="block h-[1.5px] w-full bg-white transition-colors duration-500 group-hover:bg-black origin-center"
              />
              <motion.span
                variants={{
                  closed: { rotate: 0, y: 0 },
                  open: { rotate: -45, y: -7.5 },
                }}
                transition={{ duration: 0.3 }}
                className="block h-[1.5px] w-full bg-white transition-colors duration-500 group-hover:bg-black origin-center"
              />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Slide-in panel ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ transformOrigin: "right center" }}
              className="
                fixed top-0 right-0 z-50 h-full
                w-full md:w-2/3 lg:w-1/2
                bg-[#0a0a0a]
                flex flex-col justify-between
                px-10 md:px-16 py-14
                overflow-hidden
              "
            >
              {/* Top row */}
              <div className="flex justify-between items-center">
                <Link
                  href="/#home"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center"
                >
                  <Image
                    src="/images/logo.png"
                    alt="Sadab Logo"
                    width={100}
                    height={32}
                    className="w-auto h-16 object-contain"
                  />
                </Link>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 48, skewY: 4 }}
                    animate={{ opacity: 1, y: 0, skewY: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{
                      delay: 0.45 + i * 0.08,
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="border-b border-white/8"
                  >
                    <Link
                      href={item.link}
                      onClick={() => setIsOpen(false)}
                      onMouseEnter={() => setHoveredItem(item.title)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="
                        group relative
                        flex items-center gap-4
                        py-6
                        text-[2.4rem] md:text-[3.2rem] font-black uppercase tracking-tight leading-none
                        text-white/70 hover:text-white
                        transition-colors duration-300
                        no-underline select-none
                      "
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {/* Bullet */}
                      <motion.span
                        animate={{
                          scale: hoveredItem === item.title ? 1 : 0,
                          opacity: hoveredItem === item.title ? 1 : 0,
                        }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="inline-block w-2 h-2 rounded-full bg-white shrink-0"
                        style={{ transformOrigin: "center" }}
                      />

                      {/* Label + underline */}
                      <span className="relative">
                        {item.title}
                        <motion.span
                          animate={{
                            scaleX: hoveredItem === item.title ? 1 : 0,
                          }}
                          transition={{
                            duration: 0.35,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="absolute left-0 -bottom-1 w-full h-[1.5px] bg-white origin-left block"
                        />
                      </span>

                      {/* Arrow */}
                      <motion.span
                        animate={{
                          x: hoveredItem === item.title ? 0 : -6,
                          opacity: hoveredItem === item.title ? 0.6 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                        className="ml-auto text-xl leading-none"
                      >
                        ↗
                      </motion.span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Bottom row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="flex justify-between items-end"
              >
                <span className="text-[0.7rem] tracking-[0.2em] opacity-20 text-white uppercase">
                  © 2026
                </span>
                <div className="flex gap-6">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex items-center gap-2 text-xs tracking-widest opacity-40 hover:opacity-100 text-white uppercase transition-opacity duration-300"
                    >
                      {/* Hover bullet */}
                      <span className={bulletClass} />

                      {/* Label + underline */}
                      <span className="relative">
                        {social.label}
                        <span className={underlineClass} />
                      </span>
                    </a>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
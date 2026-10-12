"use client";

import Image from "next/image";
import { Link } from "next-view-transitions";
import { motion, useReducedMotion } from "framer-motion";

const CV_FILE_ID = "1hQFVP8_6C83yqM1CFK3SoTAzSt4Auixy";
const CV_PREVIEW_URL = `https://drive.google.com/file/d/${CV_FILE_ID}/view`;
const CV_DOWNLOAD_URL = `https://drive.google.com/uc?export=download&id=${CV_FILE_ID}`;

const sitemapLinks = [
  { label: "Home", href: "/#home" },
  { label: "TechStack", href: "/#techstack" },
  { label: "Works", href: "/#works" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

const socialLinks = [
  { label: "Github", link: "https://github.com/Sadab-Kibria" },
  { label: "X / Twitter", link: "https://x.com/Sadab_Kibria" },
  { label: "Instagram", link: "https://www.instagram.com/sadab_kibria" },
];

const linkClass =
  "group relative inline-flex items-center gap-2 text-sm transition-colors duration-200";

const bulletClass =
  "w-1.5 h-1.5 rounded-full bg-white scale-0 opacity-0 transition-all duration-200 ease-out group-hover:scale-100 group-hover:opacity-100 shrink-0";

const underlineClass =
  "absolute left-0 -bottom-0.5 w-full h-[1.5px] bg-white origin-left scale-x-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100";

export default function Footer() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: shouldReduceMotion ? 0.25 : 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative w-full bg-black text-white px-6 sm:px-10 md:px-16 pt-10 sm:pt-16 md:pt-20 pb-8 sm:pb-10 flex flex-col justify-between selection:bg-white selection:text-black border-t border-white/10"
    >
      <div className="flex flex-col-reverse lg:flex-row justify-between items-stretch gap-8 sm:gap-12 lg:gap-16 pb-8 sm:pb-12">
        {/* Logo & Name Section */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: shouldReduceMotion ? 0.25 : 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="flex flex-col justify-between items-center lg:items-start flex-1 min-h-0 lg:min-h-[460px] pt-4 lg:pt-0"
        >
          <div className="group flex flex-col justify-between items-center lg:items-start h-full w-full select-none text-center lg:text-left gap-4 lg:gap-0">
            <div className="relative w-full max-w-[240px] sm:max-w-[340px] md:max-w-[420px] lg:max-w-[460px] h-36 sm:h-52 md:h-64 lg:h-80 mx-auto lg:mx-0">
              <Link href="/">
                <Image
                  src="/images/logo.png"
                  alt="Sadab Kibria Logo"
                  fill
                  priority
                  className="object-contain object-center lg:object-left"
                />
              </Link>
            </div>

            <span className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white leading-none">
              Sadab Kibria
            </span>
          </div>
        </motion.div>

        {/* Links & CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: shouldReduceMotion ? 0.25 : 0.8,
            delay: shouldReduceMotion ? 0 : 0.15,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="flex flex-col justify-between gap-8 lg:gap-12 lg:w-auto shrink-0"
        >
          {/* Top CTA + CV Links */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-6 sm:gap-x-8 gap-y-3 uppercase">
            <Link href="/#contact" className={linkClass}>
              <span className={bulletClass} />
              <span className="relative">
                Let&apos;s work together
                <span className={underlineClass} />
              </span>
            </Link>

            {/* Preview CV in Google Drive */}
            <a
              href={CV_PREVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              <span className={bulletClass} />
              <span className="relative">
                Preview CV
                <span className={underlineClass} />
              </span>
            </a>

            {/* Download CV directly from Google Drive */}
            <a
              href={CV_DOWNLOAD_URL}
              className={linkClass}
            >
              <span className={bulletClass} />
              <span className="relative">
                Download CV
                <span className={underlineClass} />
              </span>
            </a>
          </div>

          {/* Sitemap & Socials */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-12 lg:gap-16 text-left uppercase">
            {/* Sitemap */}
            <div className="flex flex-col items-start gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase">
                <span>Sitemap</span>
              </div>

              <ul className="flex flex-col items-start gap-1.5 sm:gap-2 mt-1">
                {sitemapLinks.map((item, index) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: shouldReduceMotion ? 0.2 : 0.45,
                      delay: shouldReduceMotion ? 0 : 0.2 + index * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="flex justify-start"
                  >
                    <Link href={item.href} className={linkClass}>
                      <span className={bulletClass} />
                      <span className="relative">
                        {item.label}
                        <span className={underlineClass} />
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Socials */}
            <div className="flex flex-col items-start gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase">
                <span>Socials</span>
              </div>

              <ul className="flex flex-col items-start gap-1.5 sm:gap-2 mt-1">
                {socialLinks.map((item, index) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: shouldReduceMotion ? 0.2 : 0.45,
                      delay: shouldReduceMotion ? 0 : 0.25 + index * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="flex justify-start"
                  >
                    <a
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
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Metadata Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: shouldReduceMotion ? 0.25 : 0.6,
          delay: shouldReduceMotion ? 0 : 0.25,
        }}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center text-[10px] md:text-xs font-mono uppercase tracking-wider text-neutral-500 pt-5 sm:pt-6 border-t border-neutral-900 text-center sm:text-left"
      >
        <span>© 2026 Sadab Kibria. All rights reserved.</span>
      </motion.div>
    </motion.footer>
  );
}
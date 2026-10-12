"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import TextAnimation from "../components/TextAnimation";
import sadab from "@/public/images/sadabkibria.avif";
import { useAssetLoader } from "../components/AssetLoadingProvider";
import { motion, useReducedMotion } from "framer-motion";

export default function About() {
  const { reportAssetLoaded, reportAssetError } = useAssetLoader();
  const imgRef = useRef<HTMLImageElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth !== 0) {
      reportAssetLoaded("image-sadabkibria");
    }
  }, [reportAssetLoaded]);

  return (
    <div id="about">
      <section className="flex flex-col lg:flex-row min-h-screen">
        {/* Text */}
        <div className="flex-3 text-white flex items-center">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: shouldReduceMotion ? 0.25 : 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="px-8 py-16 lg:px-16"
          >
            <motion.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0.25 : 0.5, delay: shouldReduceMotion ? 0 : 0.1 }}
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 sm:text-xs mb-10"
            >
              04 / About
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0.25 : 0.7, delay: shouldReduceMotion ? 0 : 0.15 }}
              className="text-[10vw] font-bold uppercase leading-[0.85] tracking-[-0.04em] text-white sm:text-[8vw] md:text-[5.5vw] xl:text-[4.5vw]"
            >
              Hey, I&apos;m <TextAnimation>Sadab Kibria</TextAnimation>.
            </motion.p>
            <br />
            <motion.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0.25 : 0.7, delay: shouldReduceMotion ? 0 : 0.22 }}
              className="text-[3.5vw] font-semibold leading-[1.1] text-neutral-300 md:text-[2.2vw] xl:text-[2vw] uppercase"
            >
              I&apos;m a product-focused developer with 3 years of experience turning pixels into real, usable products. My focus: clean design, buttery-smooth performance, and building experiences people actually enjoy — not endure.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.88 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0.25 : 0.6, delay: shouldReduceMotion ? 0 : 0.3 }}
              className="mt-8 inline-block"
            >
              <Link
                href="/aboutMe"
                className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/30 text-center font-mono text-[10px] uppercase leading-tight tracking-wide text-white transition-colors duration-500 hover:text-black md:h-28 md:w-28
                before:absolute before:inset-0 before:z-0 before:m-auto before:h-full before:w-full before:rounded-full before:bg-white before:scale-0 before:transition-transform before:duration-500 before:ease-out hover:before:scale-100"
              >
                <span className="relative z-10 font-bold">About Me</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Image: keeps its own aspect ratio on every screen */}
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.94, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: shouldReduceMotion ? 0.25 : 0.85,
            delay: shouldReduceMotion ? 0 : 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="flex-2 m-10 lg:self-center"
        >
          <Image
            ref={imgRef}
            src={sadab}
            alt="Sadab"
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="h-auto w-full"
            onLoad={() => reportAssetLoaded("image-sadabkibria")}
            onError={(err) => reportAssetError("image-sadabkibria", err)}
          />
        </motion.div>
      </section>
    </div>
  );
}

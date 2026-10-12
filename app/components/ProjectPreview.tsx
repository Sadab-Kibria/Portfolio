"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Project } from "@/lib/projects";
import Image from "next/image";
import Link from "next/link";

export default function ProjectPreview({
  project,
}: {
  project: Project;
}) {
  return (
    <div className="hidden lg:block">
      <div className="sticky top-20">

        <AnimatePresence mode="wait">

          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: .4 }}
          >

            <Image
              src={project.image}
              width={900}
              height={700}
              alt={project.title}
              className="rounded-xl"
            />

            <div className="mt-8 space-y-4">

              <p className="text-lg">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="border px-3 py-1 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <Link
                href={project.live || project.source || "#"}
                className="inline-block mt-6 text-lg underline"
              >
                View Project →
              </Link>

            </div>

          </motion.div>

        </AnimatePresence>

      </div>
    </div>
  );
}
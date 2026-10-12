"use client";
import dynamic from "next/dynamic";

const SkillsCube = dynamic(() => import('@/app/components/skills-cube'), { ssr: false });

export default function SkillsCubeLoader() {
  return (
    <div className="w-full h-full" id="techstack">
      <SkillsCube />
    </div>
  );
}
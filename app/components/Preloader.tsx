"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useAssetLoader } from "./AssetLoadingProvider";

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => { };
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export default function Preloader() {
  const {
    displayProgress,
    isReady,
    isExited,
    onExitComplete,
  } = useAssetLoader();

  const [phase, setPhase] = useState<"loading" | "curtain" | "done">(
    () => (isExited ? "done" : "loading")
  );

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while preloader is active, unlock when curtain opens or unmounts
  useEffect(() => {
    if (phase === "done" || isExited) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [phase, isExited]);

  // Transition sequence:
  // 1. Counter reaches 100% and isReady (LOADING is completely filled white)
  // 2. Intentional hold (350ms, or 100ms with reduced motion) so the completed state is visible
  // 3. Trigger curtain exit animation (slides up or fades out)
  // 4. Animation ends -> phase: "done", call onExitComplete
  useEffect(() => {
    if (phase !== "loading") return;

    if (isReady && displayProgress >= 100) {
      const holdDuration = prefersReducedMotion ? 100 : 350;
      const holdTimer = setTimeout(() => {
        // Unlock scroll right as curtain begins moving
        document.body.style.overflow = "";
        setPhase("curtain");
      }, holdDuration);

      return () => clearTimeout(holdTimer);
    }
  }, [isReady, displayProgress, phase, prefersReducedMotion]);

  // Handle exit completion via transitionend
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    // Only respond to the overlay container's transform/opacity transition
    if (e.target !== overlayRef.current) return;
    if (phase === "curtain") {
      setPhase("done");
      onExitComplete();
    }
  };

  // Failsafe timer: ensure preloader unmounts even if transitionend misses
  useEffect(() => {
    if (phase === "curtain") {
      const exitTimer = setTimeout(
        () => {
          setPhase("done");
          onExitComplete();
        },
        prefersReducedMotion ? 350 : 1200
      );

      return () => clearTimeout(exitTimer);
    }
  }, [phase, onExitComplete, prefersReducedMotion]);

  if (isExited || phase === "done") {
    return null;
  }

  // Format percentage with leading zero (00% .. 100%)
  const formattedPercent = `${String(displayProgress).padStart(2, "0")}%`;
  const isCurtainOpen = phase === "curtain";

  // Responsive stroke width for the text outline
  const strokeStyle = "clamp(1.2px, 0.16vw, 2.5px) #ffffff";

  return (
    <div
      ref={overlayRef}
      onTransitionEnd={handleTransitionEnd}
      aria-hidden={isCurtainOpen}
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[99999] flex h-screen h-[100dvh] w-screen items-center justify-center overflow-hidden overscroll-none bg-black p-4 text-white select-none transition-all ${prefersReducedMotion
          ? `duration-300 ease-out ${isCurtainOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`
          : `duration-[950ms] [transition-timing-function:cubic-bezier(0.77,0,0.175,1)] ${isCurtainOpen
            ? "-translate-y-full pointer-events-none"
            : "translate-y-0"
          }`
        }`}
    >
      {/* Screen-reader accessible live text */}
      <span className="sr-only">Loading {displayProgress}%</span>

      {/* Centered Editorial Line: LOADING {x}% */}
      <div
        className={`inline-flex items-baseline justify-center gap-[0.3em] text-[clamp(2.1rem,7.5vw,7.5rem)] font-semibold uppercase tracking-[-0.03em] leading-none transition-all duration-500 ${isCurtainOpen ? "opacity-0 -translate-y-6" : "opacity-100 translate-y-0"
          }`}
        aria-hidden="true"
      >
        {/* Word: LOADING with progressive horizontal white fill */}
        <div className="relative inline-block select-none">
          {/* Base Layer: Outlined typography on pure black background */}
          <span
            className="block text-transparent"
            style={{
              WebkitTextStroke: strokeStyle,
            }}
          >
            LOADING
          </span>

          {/* Fill Layer: Solid white revealed progressively from left to right */}
          <span
            className="absolute inset-0 block text-white pointer-events-none"
            style={{
              WebkitTextStroke: strokeStyle,
              clipPath: `inset(0 calc(100% - ${displayProgress}%) 0 0)`,
              WebkitClipPath: `inset(0 calc(100% - ${displayProgress}%) 0 0)`,
            }}
          >
            LOADING
          </span>
        </div>

        {/* Percentage: Plain white with fixed width to prevent layout shifts */}
        <span
          className="inline-block text-white tabular-nums w-[3.8ch] min-w-[3.8ch] text-left shrink-0"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formattedPercent}
        </span>
      </div>
    </div>
  );
}

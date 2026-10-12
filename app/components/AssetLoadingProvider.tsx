"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cubeFaces } from "@/lib/cube-icons";

// In-memory module flag to ensure the preloader runs once per full page load,
// and does NOT replay during internal client-side route transitions.
let hasCompletedInitialLoad = false;

// Weights for all required essential initial assets:
// 1. Globe texture (earth3.png): 15%
// 2. Globe scene frame rendered: 10%
// 3. SkillsCube 54 icon textures: 40% (~0.74% each)
// 4. SkillsCube scene frame rendered: 10%
// 5. About portrait AVIF image (sadabkibria.avif): 15%
// 6. Featured project AVIF images (3 items): 10% (~3.33% each)
// Total = 100%
const ASSET_WEIGHTS: Record<string, number> = {
  "globe-texture": 15,
  "globe-scene": 10,
  "cube-scene": 10,
  "image-sadabkibria": 15,
  "project-img-noir-media-studio": 3.33,
  "project-img-shopverse": 3.33,
  "project-img-imagekit": 3.34,
};

// Compute total cube icon count (54 items across 6 faces)
const TOTAL_CUBE_ICONS = Object.values(cubeFaces).reduce(
  (acc, face) => acc + face.length,
  0
);
const CUBE_ICONS_TOTAL_WEIGHT = 40;
const SINGLE_ICON_WEIGHT = CUBE_ICONS_TOTAL_WEIGHT / (TOTAL_CUBE_ICONS || 54);

interface AssetLoadingContextValue {
  progress: number;
  displayProgress: number;
  isReady: boolean;
  isExited: boolean;
  statusLabel: string;
  reportAssetLoaded: (id: string) => void;
  reportAssetError: (id: string, error?: unknown) => void;
  reportFrameRendered: (sceneId: "globe-scene" | "cube-scene") => void;
  onExitComplete: () => void;
}

const AssetLoadingContext = createContext<AssetLoadingContextValue>({
  progress: 100,
  displayProgress: 100,
  isReady: true,
  isExited: true,
  statusLabel: "EXPERIENCE READY",
  reportAssetLoaded: () => {},
  reportAssetError: () => {},
  reportFrameRendered: () => {},
  onExitComplete: () => {},
});

export function useAssetLoader() {
  return useContext(AssetLoadingContext);
}

export default function AssetLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isExited, setIsExited] = useState(() => hasCompletedInitialLoad);
  const [isReady, setIsReady] = useState(() => hasCompletedInitialLoad);
  const [monotonicProgress, setMonotonicProgress] = useState(() =>
    hasCompletedInitialLoad ? 100 : 0
  );
  const [displayProgress, setDisplayProgress] = useState(() =>
    hasCompletedInitialLoad ? 100 : 0
  );

  const completedAssets = useRef<Set<string>>(new Set());
  const currentWeightRef = useRef(0);
  const displayProgressRef = useRef(hasCompletedInitialLoad ? 100 : 0);
  const isReadyRef = useRef(hasCompletedInitialLoad);

  // Calculate progress from completed weight
  const recalculateProgress = useCallback(() => {
    if (isReadyRef.current) return;

    // Base weights sum is 60 + 40 (cube icons) = 100
    const clampedProgress = Math.min(
      100,
      Math.max(0, Math.round(currentWeightRef.current))
    );

    setMonotonicProgress((prev) => {
      const next = Math.max(prev, clampedProgress);
      if (next >= 100 && !isReadyRef.current) {
        isReadyRef.current = true;
        setIsReady(true);
      }
      return next;
    });
  }, []);

  const reportAssetLoaded = useCallback(
    (id: string) => {
      if (completedAssets.current.has(id)) return;
      completedAssets.current.add(id);

      let weight = 0;
      if (id.startsWith("cube-icon-")) {
        weight = SINGLE_ICON_WEIGHT;
      } else if (ASSET_WEIGHTS[id]) {
        weight = ASSET_WEIGHTS[id];
      } else {
        weight = 0;
      }

      currentWeightRef.current += weight;
      recalculateProgress();
    },
    [recalculateProgress]
  );

  const reportAssetError = useCallback(
    (id: string, error?: unknown) => {
      if (completedAssets.current.has(id)) return;
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[AssetLoader] Warning: Asset "${id}" failed to load:`, error);
      }
      // Failsafe: credit the weight so a missing asset never stalls the counter
      reportAssetLoaded(id);
    },
    [reportAssetLoaded]
  );

  const reportFrameRendered = useCallback(
    (sceneId: "globe-scene" | "cube-scene") => {
      reportAssetLoaded(sceneId);
    },
    [reportAssetLoaded]
  );

  // Safety ceiling: if network hangs or any resource fails to respond within 7.5s,
  // gracefully push the loader to completion so the user is never stuck.
  useEffect(() => {
    if (hasCompletedInitialLoad) return;

    const safetyTimer = setTimeout(() => {
      if (!isReadyRef.current) {
        if (process.env.NODE_ENV !== "production") {
          console.info("[AssetLoader] Safety timeout triggered. Completing loader.");
        }
        isReadyRef.current = true;
        setMonotonicProgress(100);
        setIsReady(true);
      }
    }, 7500);

    return () => clearTimeout(safetyTimer);
  }, []);

  // Screen size check: on mobile devices (<1024px), Globe is hidden (`hidden lg:block`).
  // Ensure the globe scene frame doesn't delay mobile viewports.
  useEffect(() => {
    if (typeof window === "undefined" || hasCompletedInitialLoad) return;

    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      queueMicrotask(() => {
        reportAssetLoaded("globe-scene");
      });
    }
  }, [reportAssetLoaded]);

  // Smooth animation of the displayed counter toward monotonicProgress
  useEffect(() => {
    if (hasCompletedInitialLoad) return;

    let rafId: number;

    const step = () => {
      const target = monotonicProgress;
      const current = displayProgressRef.current;

      if (current < target) {
        // Smooth proportional ease + constant minimum step for crisp progression
        const delta = target - current;
        const stepSize = Math.max(0.4, delta * 0.12);
        const nextVal = Math.min(target, current + stepSize);
        displayProgressRef.current = nextVal;
        setDisplayProgress(nextVal);

        if (nextVal >= 100 && !isReadyRef.current) {
          isReadyRef.current = true;
          setIsReady(true);
        }
      }

      if (displayProgressRef.current < 100 || !isReady) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [monotonicProgress, isReady]);

  const onExitComplete = useCallback(() => {
    hasCompletedInitialLoad = true;
    setIsExited(true);
  }, []);

  const statusLabel = isReady ? "EXPERIENCE READY" : "INITIALIZING EXPERIENCE";

  const contextValue = useMemo<AssetLoadingContextValue>(
    () => ({
      progress: monotonicProgress,
      displayProgress: Math.min(100, Math.floor(displayProgress)),
      isReady,
      isExited: hasCompletedInitialLoad || isExited,
      statusLabel,
      reportAssetLoaded,
      reportAssetError,
      reportFrameRendered,
      onExitComplete,
    }),
    [
      monotonicProgress,
      displayProgress,
      isReady,
      isExited,
      statusLabel,
      reportAssetLoaded,
      reportAssetError,
      reportFrameRendered,
      onExitComplete,
    ]
  );

  return (
    <AssetLoadingContext.Provider value={contextValue}>
      {children}
    </AssetLoadingContext.Provider>
  );
}

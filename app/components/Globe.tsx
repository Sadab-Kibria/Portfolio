"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { useAssetLoader } from "./AssetLoadingProvider";

/* -------------------------------------------------------
   Earth texture
------------------------------------------------------- */

function useGlobeTexture() {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const { reportAssetLoaded, reportAssetError } = useAssetLoader();

  useEffect(() => {
    let cancelled = false;

    async function createTexture() {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise<void>((resolve, reject) => {
          if (img.complete && img.naturalWidth !== 0) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load Earth texture"));
          img.src = "/images/earth3.png";
          if (img.complete && img.naturalWidth !== 0) {
            resolve();
          }
        });

        if (cancelled) return;

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.filter = "brightness(1.35) contrast(1.1)";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.filter = "none";

        const canvasTexture = new THREE.CanvasTexture(canvas);
        canvasTexture.colorSpace = THREE.SRGBColorSpace;
        canvasTexture.needsUpdate = true;

        if (!cancelled) {
          setTexture(canvasTexture);
          reportAssetLoaded("globe-texture");
        }
      } catch (error) {
        console.error("Globe texture error:", error);
        reportAssetError("globe-texture", error);
      }
    }

    createTexture();

    return () => {
      cancelled = true;
    };
  }, [reportAssetLoaded, reportAssetError]);

  return texture;
}

/* -------------------------------------------------------
   Static Light Fixed to the Screen/Camera
------------------------------------------------------- */

function CameraLight() {
  const { camera, scene } = useThree();
  const lightRef = useRef<THREE.DirectionalLight>(null);

  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;

    // Attach light directly to camera so it moves wherever the screen faces
    camera.add(light);
    // Ensure camera is part of the scene graph so its children render
    scene.add(camera);

    return () => {
      camera.remove(light);
    };
  }, [camera, scene]);

  // Positioned slightly forward and offset so the sphere gets 3D definition
  return (
    <directionalLight
      ref={lightRef}
      position={[2, 2, 5]}
      intensity={1.8}
      color="#ffffff"
    />
  );
}

/* -------------------------------------------------------
   Globe
------------------------------------------------------- */

function GlobeMesh({ onFirstFrameRendered }: { onFirstFrameRendered?: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useGlobeTexture();
  const { reportFrameRendered } = useAssetLoader();
  const hasReportedFrame = useRef(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.1;

    if (!hasReportedFrame.current && texture) {
      hasReportedFrame.current = true;
      reportFrameRendered("globe-scene");
      onFirstFrameRendered?.();
    }
  });

  // Local safety fallback: in case useFrame is delayed or throttled
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasReportedFrame.current) {
        hasReportedFrame.current = true;
        reportFrameRendered("globe-scene");
        onFirstFrameRendered?.();
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [reportFrameRendered, onFirstFrameRendered]);

  if (!texture) return null;

  return (
    <group ref={groupRef}>
      {/* Main Earth */}
      <mesh>
        <sphereGeometry args={[2.2, 96, 96]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.65}
          metalness={0.1}
          transparent
          opacity={0.98}
        />
      </mesh>

      {/* Very subtle latitude/longitude grid */}
      <mesh scale={1.004}>
        <sphereGeometry args={[2.2, 48, 48]} />
        <meshBasicMaterial
          color="#ffffff"
          wireframe
          transparent
          opacity={0.025}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------
   Main Globe component
------------------------------------------------------- */

export default function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [hasRenderedFirstFrame, setHasRenderedFirstFrame] = useState(false);

  // Pause continuous rendering when scrolled out of view,
  // but allow the initial frame to render so textures and materials are prepared.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "150px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleFirstFrame = useCallback(() => {
    setHasRenderedFirstFrame(true);
  }, []);

  const shouldRender = inView || !hasRenderedFirstFrame;

  return (
    <div ref={containerRef} className="hidden h-[550px] w-full lg:block">
      <Canvas
        frameloop={shouldRender ? "always" : "never"}
        camera={{
          position: [0, 0, 6],
          fov: 50,
        }}
        dpr={[1, 1.5]}
      >
        {/* Even base visibility across all angles */}
        <ambientLight intensity={1.2} />

        {/* Headlamp light that stays pointed from your screen to the globe */}
        <CameraLight />

        <GlobeMesh onFirstFrameRendered={handleFirstFrame} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          minAzimuthAngle={-Infinity}
          maxAzimuthAngle={Infinity}
          enableDamping={true}
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}
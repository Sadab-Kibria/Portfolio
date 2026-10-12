"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer } from "@react-three/drei";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cubeFaces } from "@/lib/cube-icons";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { useAssetLoader } from "./AssetLoadingProvider";
import { TextAnimation } from "./TextAnimation";
import { motion, useReducedMotion } from "framer-motion";

type StickerItem = { src: string; title: string } | string;
type FaceKey = "front" | "back" | "right" | "left" | "top" | "bottom";
type Vec3 = [number, number, number];

interface FaceMetaData {
  key: FaceKey;
  label: string;
  description: string;
}

const FACE_CONFIG: FaceMetaData[] = [
  { key: "front", label: "FRONTEND", description: "UI FRAMEWORKS AND STYLING" },
  { key: "back", label: "BACKEND", description: "APIS & SERVER RUNTIMES" },
  { key: "right", label: "CLOUD & DEVOPS", description: "DEPLOYMENT AND VERSION CONTROLS" },
  { key: "left", label: "DATABASE", description: "ORMS & DATA STORES" },
  { key: "top", label: "LANGUAGES", description: "CORE PROGRAMMING LANGUAGES" },
  { key: "bottom", label: "TOOLS & SOFTWARE", description: "DESIGN & DEV UTILITIES" },
];

const INITIAL_CAMERA_POS: Vec3 = [6.8, 5.8, 6.8];

const FACE_NORMALS: Record<FaceKey, THREE.Vector3> = {
  front: new THREE.Vector3(0, 0, 1),
  back: new THREE.Vector3(0, 0, -1),
  right: new THREE.Vector3(1, 0, 0),
  left: new THREE.Vector3(-1, 0, 0),
  top: new THREE.Vector3(0, 1, 0),
  bottom: new THREE.Vector3(0, -1, 0),
};

const FACE_KEYS = Object.keys(FACE_NORMALS) as FaceKey[];

function getSkillInfo(item: StickerItem): { src: string; title: string } {
  if (typeof item === "string") {
    const filename = item.split("/").pop()?.replace(/\.[^/.]+$/, "") || "";
    return { src: item, title: filename };
  }
  return item;
}

/* ------------------------------------------------------------------ */
/*  Shared geometry (created once, reused by every piece)              */
/* ------------------------------------------------------------------ */

const TILE_SIZE = 0.74;
const TILE_OFFSET = 0.479; // tile sits just above the cubie body
const LABEL_OFFSET = 0.488; // icon + text sits just above the tile

const TILE_GEO = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
const BODY_GEO = new RoundedBoxGeometry(0.94, 0.94, 0.94, 4, 0.05);

// Dark gray body (a step darker than the tiles so grid lines stay visible)
const BODY_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: "#2a2c33",
  metalness: 0.35,
  roughness: 0.4,
  clearcoat: 0.6,
  clearcoatRoughness: 0.25,
});

/* ------------------------------------------------------------------ */
/*  Procedural surface textures + tile materials (lazy, browser only)  */
/* ------------------------------------------------------------------ */

let speckleTex: THREE.CanvasTexture | null = null;
let meshTex: THREE.CanvasTexture | null = null;
let tileMaterials: THREE.Material[] | null = null;

function getSpeckle() {
  if (speckleTex) return speckleTex;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3500; i++) {
    const v = Math.random() * 255;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
  }
  speckleTex = new THREE.CanvasTexture(c);
  return speckleTex;
}

function getMesh() {
  if (meshTex) return meshTex;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#000000";
  for (let x = 8; x < 256; x += 16) {
    for (let y = 8; y < 256; y += 16) {
      g.beginPath();
      g.arc(x, y, 3.5, 0, Math.PI * 2);
      g.fill();
    }
  }
  meshTex = new THREE.CanvasTexture(c);
  return meshTex;
}

// 0-1 = charcoal tiles, 2-5 = mid-dark gray tiles
function getTileMaterials(): THREE.Material[] {
  if (tileMaterials) return tileMaterials;
  tileMaterials = [
    // 0: charcoal glossy
    new THREE.MeshPhysicalMaterial({
      color: "#34363d",
      metalness: 0.3,
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
    }),
    // 1: charcoal satin
    new THREE.MeshStandardMaterial({
      color: "#30323a",
      metalness: 0.3,
      roughness: 0.5,
    }),
    // 2: mid-dark gray glossy
    new THREE.MeshPhysicalMaterial({
      color: "#3e4048",
      metalness: 0.3,
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
    }),
    // 3: speckled
    new THREE.MeshStandardMaterial({
      color: "#42444c",
      metalness: 0.2,
      roughness: 0.7,
      bumpMap: getSpeckle(),
      bumpScale: 1.5,
    }),
    // 4: satin
    new THREE.MeshStandardMaterial({
      color: "#3a3c44",
      metalness: 0.3,
      roughness: 0.55,
    }),
    // 5: perforated mesh
    new THREE.MeshStandardMaterial({
      color: "#373940",
      metalness: 0.4,
      roughness: 0.5,
      bumpMap: getMesh(),
      bumpScale: 0.8,
    }),
  ];
  return tileMaterials;
}

/* ------------------------------------------------------------------ */
/*  Tile layout (computed once, pure data)                             */
/* ------------------------------------------------------------------ */

interface FaceDef {
  key: FaceKey;
  rot: Vec3;
  test: (x: number, y: number, z: number) => boolean;
  cell: (x: number, y: number, z: number) => number;
}

const FACE_DEFS: FaceDef[] = [
  { key: "front", rot: [0, 0, 0], test: (_x, _y, z) => z === 1, cell: (x, y) => (1 - y) * 3 + (x + 1) },
  { key: "back", rot: [0, Math.PI, 0], test: (_x, _y, z) => z === -1, cell: (x, y) => (1 - y) * 3 + (1 - x) },
  { key: "right", rot: [0, Math.PI / 2, 0], test: (x) => x === 1, cell: (_x, y, z) => (1 - y) * 3 + (1 - z) },
  { key: "left", rot: [0, -Math.PI / 2, 0], test: (x) => x === -1, cell: (_x, y, z) => (1 - y) * 3 + (z + 1) },
  { key: "top", rot: [-Math.PI / 2, 0, 0], test: (_x, y) => y === 1, cell: (x, _y, z) => (z + 1) * 3 + (x + 1) },
  { key: "bottom", rot: [Math.PI / 2, 0, 0], test: (_x, y) => y === -1, cell: (x, _y, z) => (1 - z) * 3 + (x + 1) },
];

const VARIANT_PATTERN = [0, 3, 1, 2, 0, 4, 1, 5, 2];

interface TileDesc {
  variant: number;
  matrix: THREE.Matrix4;
  labelPos: Vec3;
  labelRot: Vec3;
  icon?: StickerItem;
}

function buildTiles(): TileDesc[] {
  const tiles: TileDesc[] = [];
  const d = new THREE.Object3D();
  const faceIcons = cubeFaces as unknown as Record<FaceKey, (StickerItem | undefined)[]>;

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        FACE_DEFS.forEach((f, faceNum) => {
          if (!f.test(x, y, z)) return;
          const cell = f.cell(x, y, z);

          d.position.set(x, y, z);
          d.rotation.set(...f.rot);
          d.translateZ(TILE_OFFSET);
          d.updateMatrix();
          const matrix = d.matrix.clone();

          d.position.set(x, y, z);
          d.rotation.set(...f.rot);
          d.translateZ(LABEL_OFFSET);

          tiles.push({
            variant: VARIANT_PATTERN[(cell + faceNum * 2) % 9],
            matrix,
            labelPos: [d.position.x, d.position.y, d.position.z],
            labelRot: f.rot,
            icon: faceIcons[f.key]?.[cell],
          });
        });
      }
    }
  }
  return tiles;
}

const TILES = buildTiles();

const TILES_BY_VARIANT: TileDesc[][] = Array.from({ length: 6 }, (_, v) =>
  TILES.filter((t) => t.variant === v)
);

const LABELS = TILES.filter((t) => !!t.icon);

// 26 outer cubies (the hidden center one is skipped)
const BODY_POSITIONS: Vec3[] = [];
for (let x = -1; x <= 1; x++)
  for (let y = -1; y <= 1; y++)
    for (let z = -1; z <= 1; z++)
      if (x !== 0 || y !== 0 || z !== 0) BODY_POSITIONS.push([x, y, z]);

/* ------------------------------------------------------------------ */
/*  Labels: icon (forced white) + title baked into ONE canvas texture  */
/* ------------------------------------------------------------------ */

const FONT_FAMILY =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
// 384px provides crisp retina resolution on small Rubik's cube tiles
// while cutting memory footprint and CPU drawing time by ~44% vs 512px
const LABEL_RES = 384;

// Reusable scratch canvas for tinting icons to avoid allocating 54 DOM canvas nodes
let scratchTintCanvas: HTMLCanvasElement | null = null;
let scratchTintCtx: CanvasRenderingContext2D | null = null;

function getSharedTint(w: number, h: number) {
  if (!scratchTintCanvas) {
    scratchTintCanvas = document.createElement("canvas");
    scratchTintCtx = scratchTintCanvas.getContext("2d", { willReadFrequently: false });
  }
  if (scratchTintCanvas.width !== w || scratchTintCanvas.height !== h) {
    scratchTintCanvas.width = w;
    scratchTintCanvas.height = h;
  } else {
    scratchTintCtx?.clearRect(0, 0, w, h);
  }
  return { canvas: scratchTintCanvas, ctx: scratchTintCtx! };
}

function drawLabel(img: HTMLImageElement, title: string) {
  const S = LABEL_RES;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = S;
  const ctx = canvas.getContext("2d")!;

  // subtle tile rim
  ctx.strokeStyle = "#26282e";
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, S - 4, S - 4);

  // icon, tinted pure white (keeps alpha, replaces color)
  const box = Math.round(S * (0.38 / TILE_SIZE));
  const iw = img.naturalWidth || img.width || box;
  const ih = img.naturalHeight || img.height || box;
  const k = Math.min(box / iw, box / ih);
  const w = Math.max(1, Math.round(iw * k));
  const h = Math.max(1, Math.round(ih * k));

  const { canvas: tintCanvas, ctx: t } = getSharedTint(w, h);
  t.drawImage(img, 0, 0, w, h);
  t.globalCompositeOperation = "source-in";
  t.fillStyle = "#ffffff";
  t.fillRect(0, 0, w, h);
  t.globalCompositeOperation = "source-over";

  const iconCy = S * (0.5 - 0.08 / TILE_SIZE);
  ctx.drawImage(tintCanvas, (S - w) / 2, iconCy - h / 2);

  // title, pure white, calculated efficiently without repeated layout loops
  const maxW = S * (0.65 / TILE_SIZE);
  let size = Math.round(S * (0.07 / TILE_SIZE));
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  const spaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string };

  ctx.font = `500 ${size}px ${FONT_FAMILY}`;
  if ("letterSpacing" in spaced) spaced.letterSpacing = `${size * 0.03}px`;
  const measured = ctx.measureText(title).width;

  if (measured > maxW && measured > 0) {
    size = Math.max(16, Math.floor(size * (maxW / measured)));
    ctx.font = `500 ${size}px ${FONT_FAMILY}`;
    if ("letterSpacing" in spaced) spaced.letterSpacing = `${size * 0.03}px`;
  }

  ctx.fillText(title, S / 2, S * (0.5 + 0.22 / TILE_SIZE));

  return canvas;
}

interface LabelEntry {
  status: "pending" | "done";
  promise: Promise<void>;
  material: THREE.MeshBasicMaterial | null;
}

const labelCache = new Map<string, LabelEntry>();

function loadLabel(src: string, title: string): LabelEntry {
  const key = `${src}|${title}`;
  const cached = labelCache.get(key);
  if (cached) return cached;

  const entry: LabelEntry = {
    status: "pending",
    material: null,
    promise: Promise.resolve(),
  };

  entry.promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
    if (img.complete && img.naturalWidth !== 0) {
      resolve(img);
    }
  })
    .then(async (img) => {
      // Yield to the event loop so 54 image canvas draws don't block RAF animation
      await new Promise((res) => setTimeout(res, 0));
      const tex = new THREE.CanvasTexture(drawLabel(img, title));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      entry.material = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      });
    })
    .catch(() => {
      console.warn(`Failed to load cube icon: ${src}`);
    })
    .finally(() => {
      entry.status = "done";
    });

  labelCache.set(key, entry);
  return entry;
}

function Label({ tile }: { tile: TileDesc }) {
  const { src, title } = getSkillInfo(tile.icon!);
  const [material, setMaterial] = useState<THREE.Material | null>(() => {
    const entry = loadLabel(src, title);
    return entry.status === "done" ? entry.material : null;
  });

  useEffect(() => {
    const entry = loadLabel(src, title);
    if (entry.status !== "done") {
      let active = true;
      entry.promise.then(() => {
        if (active) setMaterial(entry.material);
      });
      return () => {
        active = false;
      };
    }
  }, [src, title]);

  if (!material) return null;

  return (
    <mesh
      geometry={TILE_GEO}
      material={material}
      position={tile.labelPos}
      rotation={tile.labelRot}
    />
  );
}

function Labels() {
  const { reportAssetLoaded, reportAssetError } = useAssetLoader();

  // kick off every load up front and report progress as each completes
  useEffect(() => {
    LABELS.forEach((l) => {
      const { src, title } = getSkillInfo(l.icon!);
      const entry = loadLabel(src, title);
      entry.promise
        .then(() => {
          reportAssetLoaded(`cube-icon-${src}`);
        })
        .catch((err) => {
          reportAssetError(`cube-icon-${src}`, err);
        });
    });
  }, [reportAssetLoaded, reportAssetError]);

  return (
    <>
      {LABELS.map((tile, i) => (
        <Label key={i} tile={tile} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Instanced bodies + tiles (a handful of draw calls total)           */
/* ------------------------------------------------------------------ */

function CubeBodies() {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const d = new THREE.Object3D();
    BODY_POSITIONS.forEach((p, i) => {
      d.position.set(...p);
      d.updateMatrix();
      mesh.setMatrixAt(i, d.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh
      ref={ref}
      args={[BODY_GEO, BODY_MATERIAL, BODY_POSITIONS.length]}
      frustumCulled={false}
    />
  );
}

function TileLayer({
  tiles,
  material,
}: {
  tiles: TileDesc[];
  material: THREE.Material;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    tiles.forEach((t, i) => mesh.setMatrixAt(i, t.matrix));
    mesh.instanceMatrix.needsUpdate = true;
  }, [tiles]);

  return (
    <instancedMesh
      ref={ref}
      args={[TILE_GEO, material, tiles.length]}
      frustumCulled={false}
    />
  );
}

function TileLayers() {
  const materials = useMemo(() => getTileMaterials(), []);
  return (
    <>
      {TILES_BY_VARIANT.map((tiles, v) =>
        tiles.length ? <TileLayer key={v} tiles={tiles} material={materials[v]} /> : null
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Cube                                                               */
/* ------------------------------------------------------------------ */

const _camDir = new THREE.Vector3();
const _normal = new THREE.Vector3();

function RubiksCube({
  onActiveFaceChange,
  onFirstFrameRendered,
}: {
  onActiveFaceChange: (face: FaceKey) => void;
  onFirstFrameRendered: () => void;
}) {
  const cubeRef = useRef<THREE.Group>(null);
  const lastFace = useRef<FaceKey | null>(null);
  const { viewport } = useThree();
  const { reportFrameRendered } = useAssetLoader();
  const hasReportedFrame = useRef(false);

  useFrame(({ camera, clock }) => {
    const cube = cubeRef.current;
    if (!cube) return;

    if (!hasReportedFrame.current) {
      hasReportedFrame.current = true;
      reportFrameRendered("cube-scene");
      onFirstFrameRendered();
    }

    cube.position.y = Math.sin(clock.getElapsedTime() * 0.9) * 0.05;

    _camDir.copy(camera.position).sub(cube.position).normalize();

    let maxDot = -Infinity;
    let closest: FaceKey = "front";

    for (const key of FACE_KEYS) {
      _normal.copy(FACE_NORMALS[key]).applyQuaternion(cube.quaternion);
      const dot = _normal.dot(_camDir);
      if (dot > maxDot) {
        maxDot = dot;
        closest = key;
      }
    }

    // only touch React state when the face actually changes
    if (closest !== lastFace.current) {
      lastFace.current = closest;
      onActiveFaceChange(closest);
    }
  });

  // Local safety fallback: in case useFrame is throttled by browser tab visibility
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasReportedFrame.current) {
        hasReportedFrame.current = true;
        reportFrameRendered("cube-scene");
        onFirstFrameRendered();
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [reportFrameRendered, onFirstFrameRendered]);

  const scale = useMemo(() => {
    const minDim = Math.min(viewport.width, viewport.height);
    return Math.min(Math.max(minDim * 0.26, 0.85), 1.72);
  }, [viewport.width, viewport.height]);

  return (
    <group ref={cubeRef} scale={scale}>
      <CubeBodies />
      <TileLayers />
      <Labels />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SkillsPage() {
  const shouldReduceMotion = useReducedMotion();
  const [activeFaceKey, setActiveFaceKey] = useState<FaceKey>("front");
  // the face whose text is actually on screen (lags behind during the swap)
  const [shownFaceKey, setShownFaceKey] = useState<FaceKey>("front");
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [inView, setInView] = useState(false);
  const [hasRenderedFirstFrame, setHasRenderedFirstFrame] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Stop continuous rendering when the cube is scrolled out of view,
  // but ALWAYS allow the initial frame to render so shaders, reflections,
  // and geometries are pre-compiled during preloading.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleFirstFrame = useCallback(() => {
    setHasRenderedFirstFrame(true);
  }, []);

  const shouldRender = inView || !hasRenderedFirstFrame;

  // swap the text: old one exits right, new one enters from the left
  useEffect(() => {
    if (activeFaceKey === shownFaceKey) return;
    const t1 = setTimeout(() => {
      setPhase("out");
    }, 0);
    const t2 = setTimeout(() => {
      setShownFaceKey(activeFaceKey);
      setPhase("in");
    }, 280);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeFaceKey, shownFaceKey]);

  const activeMetaData =
    FACE_CONFIG.find((cfg) => cfg.key === shownFaceKey) || FACE_CONFIG[0];

  return (
    <main className="relative min-h-screen text-white overflow-hidden bg-black bg-[radial-gradient(ellipse_75%_45%_at_55%_58%,rgba(45,45,50,0.45)_0%,rgba(20,20,24,0.2)_45%,transparent_75%),linear-gradient(165deg,transparent_35%,rgba(30,30,35,0.25)_55%,transparent_75%)]">
      <style>{`
        @keyframes faceOut {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(60px); }
        }
        @keyframes faceIn {
          from { opacity: 0; transform: translateX(-60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-face-out { animation: faceOut 280ms cubic-bezier(0.4, 0, 1, 1) forwards; }
        .animate-face-in  { animation: faceIn 420ms cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}</style>

      <section className="min-h-screen px-5 py-10 sm:px-8 sm:py-12 lg:px-12 xl:px-16">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1600px] flex-col lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

          {/* ================= LEFT ================= */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: shouldReduceMotion ? 0.25 : 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative z-10 flex flex-col justify-center lg:pr-8 xl:pr-16"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 sm:text-xs">
              02 / Tech Stack
            </p>

            <h1 className="max-w-4xl text-[10vw] font-bold uppercase leading-[0.85] tracking-[-0.04em] text-white sm:text-[8vw] md:text-[5.5vw] xl:text-[4.5vw]">
              Tech
              <br />
              I use to
              <br />
              <TextAnimation>build.</TextAnimation>
            </h1>

            <p className="mt-8 max-w-md text-sm md:text-base leading-relaxed pointer-events-none select-none uppercase font-base lg:mt-10">
              A collection of technologies I use to design, develop,
              deploy, and maintain modern web experiences.
            </p>

            <div className="mt-12 overflow-hidden border-t border-white/[0.08] pt-5 sm:mt-16">
              {/* stays fixed */}
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-500 sm:text-[10px]">
                Currently viewing
              </span>

              {/* only this part animates */}
              <div
                className={`mt-2 flex items-start justify-between gap-8 ${phase === "out"
                  ? "animate-face-out"
                  : phase === "in"
                    ? "animate-face-in"
                    : ""
                  }`}
              >
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl text-white">
                    {activeMetaData.label}
                  </h2>

                  <p className="mt-1 text-xs text-neutral-400 sm:text-sm">
                    {activeMetaData.description}
                  </p>
                </div>

                <span className="font-mono text-xs uppercase text-neutral-500">
                  [{activeMetaData.key}]
                </span>
              </div>
            </div>
          </motion.div>

          {/* ================= RIGHT / CUBE CONTAINER ================= */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: shouldReduceMotion ? 0.25 : 0.85,
              delay: shouldReduceMotion ? 0 : 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative mt-6 h-[320px] xs:h-[360px] sm:h-[440px] md:h-[520px] w-full lg:mt-0 lg:h-[620px] xl:h-[680px]"
          >
            <Canvas
              frameloop={shouldRender ? "always" : "never"}
              dpr={[1, 2]}
              camera={{ position: INITIAL_CAMERA_POS, fov: 50 }}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.1,
              }}
              className="relative z-10 h-full w-full"
            >
              <ambientLight intensity={0.5} />
              <directionalLight position={[6, 9, 7]} intensity={1.4} color="#ffffff" />

              {/* Dark studio reflections, rendered once (frames={1}) */}
              <Environment resolution={256} frames={1}>
                <color attach="background" args={["#000000"]} />
                <Lightformer form="rect" intensity={4} position={[-5, 3, 4]} scale={[6, 3, 1]} />
                <Lightformer form="rect" intensity={2} color="#94a3b8" position={[5, -2, -4]} scale={[4, 2, 1]} />
                <Lightformer form="rect" intensity={1.5} position={[0, 6, -5]} scale={[8, 1, 1]} />
              </Environment>

              <RubiksCube
                onActiveFaceChange={setActiveFaceKey}
                onFirstFrameRendered={handleFirstFrame}
              />

              <OrbitControls
                ref={controlsRef}
                enableZoom={false}
                enablePan={false}
                autoRotate={inView}
                autoRotateSpeed={0.9}
                enableDamping
                dampingFactor={0.05}
              />
            </Canvas>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0.25 : 0.6, delay: shouldReduceMotion ? 0 : 0.4 }}
              className="pointer-events-none absolute bottom-2 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-500"
            >
              Drag to explore
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
"use client";

import React, { useEffect, useRef } from "react";

export interface OrbitalParticleBackgroundProps {
  /**
   * Additional CSS classes for the container.
   */
  className?: string;
  /**
   * Overall opacity multiplier for the canvas (0 to 1). Default: 1.0.
   */
  opacity?: number;
  /**
   * Global animation speed multiplier. Target full cycle is ~25-35s. Default: 0.6.
   */
  speed?: number;
  /**
   * Density multiplier for the dotted sphere rings. Default: 1.0.
   */
  density?: number;
  /**
   * Custom base sphere radius in pixels. If omitted, scales responsively to viewport.
   */
  sphereRadius?: number;
  /**
   * Whether to enable subtle interactive mouse parallax/tilt. Default: true.
   */
  interactive?: boolean;
  /**
   * Number of horizontal concentric latitudinal rings. Default: 44.
   */
  ringCount?: number;
  /**
   * Number of ambient floating dust particles. Default: 65.
   */
  ambientParticleCount?: number;
  /**
   * Background color of the canvas container. Default: "#000000".
   */
  backgroundColor?: string;
}

// 3D Point Interface
interface Point3D {
  x: number;
  y: number;
  z: number;
}

// Dotted Ring Dot Definition
interface RingDot {
  // Base spherical coordinates
  theta: number; // Angle around Y axis [0, 2PI]
  yRatio: number; // Vertical position [-1 (bottom) to 1 (top)]
  radiusRatio: number; // Radius at this latitude sqrt(1 - yRatio^2)
  size: number; // Dot base size in px (0.8 - 1.8)
  baseAlpha: number; // Base alpha (0.08 - 0.35)
  isAccent: boolean; // Brighter sparkle dot (0.4 - 0.65)
  twinklePhase: number; // Twinkle phase offset
  twinkleSpeed: number; // Twinkle frequency
  layerSpeedOffset: number; // Slight layer differential speed
}

// Ambient Dust Particle Definition
interface AmbientParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  alpha: number;
  pulsePhase: number;
  pulseSpeed: number;
}

// Flowing Luminous Ribbon / Orbital Path Definition
interface OrbitPathConfig {
  id: number;
  // Harmonic frequencies and phases
  freqX: number;
  freqY: number;
  freqZ: number;
  phaseX: number;
  phaseY: number;
  phaseZ: number;
  radScale: number; // Scaling relative to sphere radius (e.g. 0.95 - 1.25)
  yOffset: number; // Vertical offset [-0.4, 0.4]
  tiltX: number; // Specific orbit plane tilt
  tiltZ: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  driftSpeed: number;
  baseAlpha: number;
  lineWidth: number;
  hasGlow: boolean;
  pointCount: number;
}

export default function OrbitalParticleBackground({
  className = "",
  opacity = 1.0,
  speed = 0.6,
  density = 1.0,
  sphereRadius,
  interactive = true,
  ringCount = 44,
  ambientParticleCount = 65,
  backgroundColor = "#000000",
}: OrbitalParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Smooth interactive mouse tilt
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    // Prefers-reduced-motion check
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReducedMotion = mediaQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches;
    };
    mediaQuery.addEventListener?.("change", handleMotionChange);

    // Page Visibility API handler
    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
      if (isVisible) {
        lastTime = performance.now();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Intersection Observer to stop rendering when not in viewport
    let isIntersecting = true;
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersecting = entry.isIntersecting;
          if (isIntersecting) {
            lastTime = performance.now();
          }
        });
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // --- Generate Dotted Sphere Structure ---
    const effectiveRingCount = Math.max(16, Math.floor(ringCount * density));
    const ringDots: RingDot[] = [];

    // Distribution: denser packed at the bottom and lower mid-section to match the reference globe
    for (let r = 0; r < effectiveRingCount; r++) {
      // Non-linear latitude distribution: t goes from -1 (bottom) to +0.92 (top)
      const u = r / (effectiveRingCount - 1);
      // Quadratic/biased distribution giving denser rings towards the south pole
      const yRatio = -1 + Math.pow(u, 0.85) * 1.92;
      const clampedY = Math.max(-0.995, Math.min(0.995, yRatio));
      const radiusRatio = Math.sqrt(Math.max(0.01, 1 - clampedY * clampedY));

      // Dots per ring proportional to perimeter with extra density in lower hemisphere
      const lowerHemisphereMultiplier = clampedY < 0 ? 1.0 + Math.abs(clampedY) * 0.4 : 1.0;
      const dotsInRing = Math.floor(
        (80 + radiusRatio * 160) * density * lowerHemisphereMultiplier
      );

      const ringLayerSpeedOffset = (Math.random() - 0.5) * 0.08;

      for (let i = 0; i < dotsInRing; i++) {
        const theta = (i / dotsInRing) * Math.PI * 2 + (r % 2 === 0 ? 0 : Math.PI / dotsInRing);
        const isAccent = Math.random() < 0.035;

        // Base dot sizes and opacities
        const size = isAccent
          ? 1.4 + Math.random() * 0.7
          : 0.75 + Math.random() * 0.65;

        // Slightly lower base alpha so layering gives depth
        const baseAlpha = isAccent
          ? 0.45 + Math.random() * 0.2
          : 0.08 + Math.random() * 0.16;

        ringDots.push({
          theta,
          yRatio: clampedY,
          radiusRatio,
          size,
          baseAlpha,
          isAccent,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.8 + Math.random() * 1.5,
          layerSpeedOffset: ringLayerSpeedOffset,
        });
      }
    }

    // --- Generate Ambient Floating Particles ---
    const ambientParticles: AmbientParticle[] = [];
    const ambientCount = Math.floor(ambientParticleCount * density);
    for (let i = 0; i < ambientCount; i++) {
      ambientParticles.push({
        x: (Math.random() - 0.5) * 2.8,
        y: (Math.random() - 0.5) * 2.8,
        z: (Math.random() - 0.5) * 2.8,
        vx: (Math.random() - 0.5) * 0.0003,
        vy: (Math.random() - 0.5) * 0.0003,
        vz: (Math.random() - 0.5) * 0.0003,
        size: 0.7 + Math.random() * 1.4,
        alpha: 0.12 + Math.random() * 0.35,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.6 + Math.random() * 1.2,
      });
    }

    // --- Generate Flowing Luminous Ribbons / Orbital Paths ---
    // 6 distinct generative harmonic curves wrapping gracefully around and outside the sphere
    const orbitConfigs: OrbitPathConfig[] = [
      // 1. Top Crown Ribbon: loops across top rim and dips down front-left
      {
        id: 1,
        freqX: 1,
        freqY: 2,
        freqZ: 1,
        phaseX: 0.2,
        phaseY: 1.1,
        phaseZ: 0.8,
        radScale: 1.04,
        yOffset: 0.28,
        tiltX: -0.32,
        tiltZ: 0.25,
        wobbleSpeed: 0.4,
        wobbleAmp: 0.08,
        driftSpeed: 0.7,
        baseAlpha: 0.48,
        lineWidth: 1.35,
        hasGlow: true,
        pointCount: 220,
      },
      // 2. Dynamic Equator S-Vortex: curves through the central sphere with dramatic sweep
      {
        id: 2,
        freqX: 2,
        freqY: 3,
        freqZ: 2,
        phaseX: 1.8,
        phaseY: 0.5,
        phaseZ: 2.2,
        radScale: 0.98,
        yOffset: -0.05,
        tiltX: 0.22,
        tiltZ: -0.35,
        wobbleSpeed: 0.55,
        wobbleAmp: 0.1,
        driftSpeed: 0.85,
        baseAlpha: 0.52,
        lineWidth: 1.45,
        hasGlow: true,
        pointCount: 260,
      },
      // 3. Lower Hemisphere Cradling Arc: wide sweeping loop along the dense bottom rings
      {
        id: 3,
        freqX: 1,
        freqY: 1,
        freqZ: 2,
        phaseX: 3.14,
        phaseY: 2.0,
        phaseZ: 0.4,
        radScale: 1.08,
        yOffset: -0.32,
        tiltX: -0.45,
        tiltZ: 0.15,
        wobbleSpeed: 0.35,
        wobbleAmp: 0.07,
        driftSpeed: 0.6,
        baseAlpha: 0.42,
        lineWidth: 1.25,
        hasGlow: false,
        pointCount: 200,
      },
      // 4. Outer Extended Spiral Loop: loops out to 1.2x radius on the right side
      {
        id: 4,
        freqX: 3,
        freqY: 2,
        freqZ: 3,
        phaseX: 0.7,
        phaseY: 3.8,
        phaseZ: 1.5,
        radScale: 1.18,
        yOffset: 0.1,
        tiltX: 0.4,
        tiltZ: 0.45,
        wobbleSpeed: 0.45,
        wobbleAmp: 0.12,
        driftSpeed: 0.5,
        baseAlpha: 0.38,
        lineWidth: 1.15,
        hasGlow: false,
        pointCount: 240,
      },
      // 5. Vertical Polar Loop: folds from north pole down around back to south pole
      {
        id: 5,
        freqX: 2,
        freqY: 1,
        freqZ: 1,
        phaseX: 2.4,
        phaseY: 1.7,
        phaseZ: 4.1,
        radScale: 1.02,
        yOffset: 0.02,
        tiltX: -0.7,
        tiltZ: -0.2,
        wobbleSpeed: 0.6,
        wobbleAmp: 0.09,
        driftSpeed: 0.75,
        baseAlpha: 0.44,
        lineWidth: 1.2,
        hasGlow: true,
        pointCount: 220,
      },
      // 6. Delicate Swirling Filament: high-frequency subtle organic tracer
      {
        id: 6,
        freqX: 3,
        freqY: 4,
        freqZ: 2,
        phaseX: 4.2,
        phaseY: 2.9,
        phaseZ: 0.9,
        radScale: 0.92,
        yOffset: -0.15,
        tiltX: 0.15,
        tiltZ: 0.6,
        wobbleSpeed: 0.7,
        wobbleAmp: 0.14,
        driftSpeed: 1.0,
        baseAlpha: 0.32,
        lineWidth: 0.95,
        hasGlow: false,
        pointCount: 280,
      },
    ];

    // --- Sizing and DPR Setup ---
    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width, 100);
      height = Math.max(rect.height, 100);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(container);

    // Mouse Move Listener for interactive tilt
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetMouseX = Math.max(-1, Math.min(1, nx));
      targetMouseY = Math.max(-1, Math.min(1, ny));
    };

    const handleMouseLeave = () => {
      targetMouseX = 0;
      targetMouseY = 0;
    };

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      document.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    }

    // --- 3D Rotation and Projection Helpers ---
    // Camera settings
    const CAMERA_DISTANCE = 1000;

    // Rotate point around X, Y, Z axes
    const rotate3D = (
      x: number,
      y: number,
      z: number,
      pitch: number,
      yaw: number,
      roll: number
    ): Point3D => {
      // 1. Yaw around Y axis
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x1 = x * cosY + z * sinY;
      const y1 = y;
      const z1 = -x * sinY + z * cosY;

      // 2. Pitch around X axis
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const x2 = x1;
      const y2 = y1 * cosP - z1 * sinP;
      const z2 = y1 * sinP + z1 * cosP;

      // 3. Roll around Z axis
      const cosR = Math.cos(roll);
      const sinR = Math.sin(roll);
      const x3 = x2 * cosR - y2 * sinR;
      const y3 = x2 * sinR + y2 * cosR;
      const z3 = z2;

      return { x: x3, y: y3, z: z3 };
    };

    // Project 3D coordinate to 2D canvas with depth scale
    const project3D = (
      p: Point3D,
      cx: number,
      cy: number
    ): { x2d: number; y2d: number; scale: number; depthAlpha: number; z: number } => {
      const zOffset = p.z;
      const scale = CAMERA_DISTANCE / (CAMERA_DISTANCE + zOffset);
      const x2d = cx + p.x * scale;
      const y2d = cy + p.y * scale;

      // Depth alpha attenuation: elements in front (z < 0) are brighter, back (z > 0) are dimmer
      const normZ = Math.max(-1, Math.min(1, zOffset / (CAMERA_DISTANCE * 0.5)));
      // normZ < 0: front (up to 1.3x alpha), normZ > 0: back (down to 0.35x alpha)
      const depthAlpha = Math.max(0.2, Math.min(1.3, 1.0 - normZ * 0.65));

      return { x2d, y2d, scale, depthAlpha, z: zOffset };
    };

    // --- Main Animation Loop ---
    let lastTime = performance.now();
    let globalTime = 0;

    const render = (now: number) => {
      if (!isVisible || !isIntersecting) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isReducedMotion) {
        globalTime += dt * speed;
      }

      // Smooth mouse lerp
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      // Base globe radius: scales nicely across desktop & mobile
      const baseRadius =
        sphereRadius ??
        Math.min(width, height) * (width < 768 ? 0.44 : 0.36);

      const cx = width * 0.5;
      const cy = height * 0.5;

      // Clear Canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Global angles
      // The reference image has a noticeable downward tilt (~38 degrees) so we look down into the bowl
      const basePitch = -0.52 + currentMouseY * 0.14;
      const baseYaw = globalTime * 0.18 + currentMouseX * 0.22;
      const baseRoll = Math.sin(globalTime * 0.08) * 0.04;

      // 1. Draw Ambient Particles
      for (let i = 0; i < ambientParticles.length; i++) {
        const p = ambientParticles[i];
        if (!isReducedMotion) {
          p.x += p.vx * speed * 60;
          p.y += p.vy * speed * 60;
          p.z += p.vz * speed * 60;

          // Boundary wrap
          if (p.x > 1.4) p.x = -1.4;
          if (p.x < -1.4) p.x = 1.4;
          if (p.y > 1.4) p.y = -1.4;
          if (p.y < -1.4) p.y = 1.4;
          if (p.z > 1.4) p.z = -1.4;
          if (p.z < -1.4) p.z = 1.4;
        }

        const rot = rotate3D(
          p.x * baseRadius * 1.35,
          p.y * baseRadius * 1.35,
          p.z * baseRadius * 1.35,
          basePitch * 0.6,
          baseYaw * 0.4,
          0
        );

        const proj = project3D(rot, cx, cy);
        const pulse = Math.sin(globalTime * p.pulseSpeed + p.pulsePhase) * 0.25 + 0.75;
        const finalAlpha = p.alpha * proj.depthAlpha * pulse * opacity;

        if (finalAlpha > 0.02) {
          ctx.beginPath();
          ctx.arc(proj.x2d, proj.y2d, Math.max(0.5, p.size * proj.scale), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      // 2. Draw Dotted Sphere Rings
      // We project all dots and batch render for high 60fps performance
      for (let i = 0; i < ringDots.length; i++) {
        const dot = ringDots[i];

        // Slight vortex/spiral dynamic twist in the central latitudes
        const centerProximity = 1 - Math.abs(dot.yRatio);
        const spiralTwist =
          Math.sin(globalTime * 0.25 + dot.yRatio * 2.0) *
          0.12 *
          centerProximity;

        const currentTheta =
          dot.theta +
          baseYaw +
          dot.layerSpeedOffset * globalTime +
          spiralTwist;

        // 3D Sphere coordinates (Y is vertical)
        const radiusAtY = dot.radiusRatio * baseRadius;
        const x0 = radiusAtY * Math.cos(currentTheta);
        const y0 = dot.yRatio * baseRadius;
        const z0 = radiusAtY * Math.sin(currentTheta);

        const rot = rotate3D(x0, y0, z0, basePitch, 0, baseRoll);
        const proj = project3D(rot, cx, cy);

        // Center cutout attenuation: slightly fade dots near direct 2D center so typography stays clean
        const distFromCenter2D = Math.hypot(proj.x2d - cx, proj.y2d - cy);
        const centerCutoutRadius = baseRadius * 0.32;
        const centerFactor =
          distFromCenter2D < centerCutoutRadius
            ? Math.max(0.35, distFromCenter2D / centerCutoutRadius)
            : 1.0;

        // Twinkle effect for sparkle dots
        let twinkle = 1.0;
        if (dot.isAccent) {
          twinkle =
            Math.sin(globalTime * dot.twinkleSpeed * 3 + dot.twinklePhase) * 0.35 + 0.65;
        }

        const calculatedAlpha =
          dot.baseAlpha * proj.depthAlpha * centerFactor * twinkle * opacity;

        if (calculatedAlpha > 0.015) {
          const dotRadius = Math.max(0.4, dot.size * proj.scale);
          ctx.beginPath();
          ctx.arc(proj.x2d, proj.y2d, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${calculatedAlpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      // 3. Draw Flowing Luminous Ribbons / Orbital Paths
      for (let c = 0; c < orbitConfigs.length; c++) {
        const cfg = orbitConfigs[c];
        const drift = globalTime * cfg.driftSpeed * 0.2;
        const wobble = Math.sin(globalTime * cfg.wobbleSpeed) * cfg.wobbleAmp;

        ctx.beginPath();
        let firstPoint = true;
        let avgZ = 0;

        for (let j = 0; j <= cfg.pointCount; j++) {
          const t = (j / cfg.pointCount) * Math.PI * 2;

          // Parametric spherical Lissajous wave formulation
          const angleTheta = t * cfg.freqX + drift + cfg.phaseX;
          const anglePhi =
            Math.sin(t * cfg.freqY + cfg.phaseY + wobble) * 0.85 +
            cfg.yOffset * Math.PI * 0.5;

          // Dynamic radial breath
          const rMod =
            baseRadius *
            cfg.radScale *
            (1 + Math.sin(t * cfg.freqZ + cfg.phaseZ + drift * 0.5) * 0.08 + wobble * 0.5);

          // 3D coordinates
          const x0 = rMod * Math.cos(angleTheta) * Math.cos(anglePhi);
          const y0 = rMod * Math.sin(anglePhi) + cfg.yOffset * baseRadius;
          const z0 = rMod * Math.sin(angleTheta) * Math.cos(anglePhi);

          // Apply path's individual tilt
          const tilted = rotate3D(x0, y0, z0, cfg.tiltX, 0, cfg.tiltZ);

          // Apply global globe rotation
          const rot = rotate3D(
            tilted.x,
            tilted.y,
            tilted.z,
            basePitch,
            baseYaw * 0.6,
            baseRoll
          );

          const proj = project3D(rot, cx, cy);
          avgZ += proj.z;

          if (firstPoint) {
            ctx.moveTo(proj.x2d, proj.y2d);
            firstPoint = false;
          } else {
            ctx.lineTo(proj.x2d, proj.y2d);
          }
        }

        ctx.closePath();

        avgZ /= cfg.pointCount;
        const normZ = Math.max(-1, Math.min(1, avgZ / (CAMERA_DISTANCE * 0.5)));
        const depthFactor = Math.max(0.3, Math.min(1.3, 1.0 - normZ * 0.6));
        const finalStrokeAlpha = Math.min(0.65, cfg.baseAlpha * depthFactor * opacity);

        ctx.save();
        if (cfg.hasGlow) {
          ctx.shadowColor = "rgba(255, 255, 255, 0.45)";
          ctx.shadowBlur = 5 * dpr;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${finalStrokeAlpha.toFixed(3)})`;
        ctx.lineWidth = cfg.lineWidth;
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      mediaQuery.removeEventListener?.("change", handleMotionChange);
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [
    opacity,
    speed,
    density,
    sphereRadius,
    interactive,
    ringCount,
    ambientParticleCount,
    backgroundColor,
  ]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}

"use client";

import React, { useEffect, useRef } from "react";

export interface FluidBackgroundProps {
  /**
   * Additional CSS classes for the container.
   */
  className?: string;
  /**
   * Ambient idle fluid motion speed multiplier. Default: 0.5.
   */
  speed?: number;
  /**
   * Mouse pointer ripple / distortion intensity. Default: 1.0.
   */
  intensity?: number;
  /**
   * Fluid density / smoke texture detail scale. Default: 1.0.
   */
  density?: number;
  /**
   * Cap on the devicePixelRatio for performance. Default: 2.
   */
  dprCap?: number;
  /**
   * Enable or disable cursor ripple interaction. Default: true.
   */
  interactive?: boolean;
}

// Vertex shader: Fullscreen quad
const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Fragment shader: High-performance Domain-Warped Fluid & Liquid Smoke Simulation
const FRAGMENT_SHADER_SOURCE = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_mouse_vel;
uniform float u_intensity;
uniform float u_density;
uniform float u_dpr;

varying vec2 v_uv;

// Fast Simplex-like Hash Noise
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// Multi-Octave Fractional Brownian Motion (fBm)
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p * 2.02 + vec2(0.35);
    a *= 0.5;
  }
  return v;
}

void main() {
  // Normalize aspect ratio coordinates
  vec2 st = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  vec2 mouse = (u_mouse * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  float t = u_time * 0.18;

  // Mouse fluid vortex & impulse field
  vec2 toMouse = st - mouse;
  float distToMouse = length(toMouse);
  float mouseInfluence = exp(-distToMouse * 3.2);

  // Swirl distortion around pointer motion
  vec2 mouseDisplacement = vec2(
    -toMouse.y * u_mouse_vel.x + toMouse.x * u_mouse_vel.y,
     toMouse.x * u_mouse_vel.x + toMouse.y * u_mouse_vel.y
  ) * mouseInfluence * u_intensity * 0.45;

  vec2 p = st * (1.6 * u_density) + mouseDisplacement;

  // Domain Warping (Eulerian fluid smoke aesthetic)
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + vec2(t * 0.4, t * 0.25)),
    fbm(p + vec2(5.2, 1.3) - vec2(t * 0.35, t * 0.3))
  );

  vec2 r = vec2(
    fbm(p + 4.0 * q + vec2(1.7, 9.2) + vec2(t * 0.25, -t * 0.35)),
    fbm(p + 4.0 * q + vec2(8.3, 2.8) - vec2(t * 0.15, t * 0.2))
  );

  float f = fbm(p + 3.8 * r + q * 1.5);

  // Depth and edge sculpting
  float fluidPattern = clamp((f * f * 4.0 + 0.6 * length(q) + 0.5 * length(r)) * 0.5, 0.0, 1.0);

  // Deep Monochromatic Palette
  // Base deep black: #09090b
  vec3 colBase = vec3(0.035, 0.035, 0.042);
  // Mid-tone charcoal slate: #18191e
  vec3 colMid = vec3(0.094, 0.098, 0.118);
  // Soft liquid smoke highlight: #424652
  vec3 colHighlight = vec3(0.258, 0.274, 0.322);
  // Luminous white crest: #7d8494
  vec3 colCrest = vec3(0.490, 0.518, 0.580);

  // Color blending based on fluid density
  vec3 color = mix(colBase, colMid, smoothstep(0.0, 0.5, fluidPattern));
  color = mix(color, colHighlight, smoothstep(0.4, 0.82, fluidPattern));
  color = mix(color, colCrest, pow(fluidPattern, 3.2) * 0.65);

  // Dynamic vignette falloff towards screen corners
  vec2 uvNorm = v_uv * (1.0 - v_uv.yx);
  float vig = uvNorm.x * uvNorm.y * 15.0;
  vig = clamp(pow(vig, 0.22), 0.0, 1.0);
  color *= vig;

  // High-precision dithering to prevent 8-bit banding on dark tones
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * (1.0 / 255.0);
  color += dither;

  gl_FragColor = vec4(color, 1.0);
}
`;

export default function FluidBackground({
  className = "",
  speed = 0.5,
  intensity = 1.0,
  density = 1.0,
  dprCap = 2,
  interactive = true,
}: FluidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Initialize WebGL context
    const gl =
      canvas.getContext("webgl", {
        alpha: false,
        depth: false,
        stencil: false,
        antialias: false,
        powerPreference: "high-performance",
      }) || (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) {
      console.warn("WebGL not supported on this device.");
      return;
    }

    // Helper: Compile Shader
    const compileShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const aPositionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResLoc = gl.getUniformLocation(program, "u_resolution");
    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uMouseLoc = gl.getUniformLocation(program, "u_mouse");
    const uMouseVelLoc = gl.getUniformLocation(program, "u_mouse_vel");
    const uIntensityLoc = gl.getUniformLocation(program, "u_intensity");
    const uDensityLoc = gl.getUniformLocation(program, "u_density");
    const uDprLoc = gl.getUniformLocation(program, "u_dpr");

    let width = 0;
    let height = 0;
    let dpr = 1;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width, 100);
      height = Math.max(rect.height, 100);
      dpr = Math.min(window.devicePixelRatio || 1, dprCap);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(container);

    // Mouse tracking & physics damping
    let targetMouseX = width * 0.5;
    let targetMouseY = height * 0.5;
    let currentMouseX = targetMouseX;
    let currentMouseY = targetMouseY;
    let prevMouseX = currentMouseX;
    let prevMouseY = currentMouseY;
    let velX = 0;
    let velY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      // Invert Y for WebGL coordinates (origin at bottom-left)
      targetMouseY = height - (e.clientY - rect.top);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!interactive || e.touches.length === 0) return;
      const rect = container.getBoundingClientRect();
      targetMouseX = e.touches[0].clientX - rect.left;
      targetMouseY = height - (e.touches[0].clientY - rect.top);
    };

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
    }

    // Tab visibility & intersection observation to save battery
    let isVisible = true;
    let isIntersecting = true;

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
      if (isVisible) lastTime = performance.now();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersecting = entry.isIntersecting;
          if (isIntersecting) lastTime = performance.now();
        });
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // Reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReducedMotion = mediaQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches;
    };
    mediaQuery.addEventListener?.("change", handleMotionChange);

    // Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    let elapsedTime = 0;

    const render = (now: number) => {
      if (!isVisible || !isIntersecting) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isReducedMotion) {
        elapsedTime += dt * speed;
      }

      // Smooth mouse lerp
      currentMouseX += (targetMouseX - currentMouseX) * 0.08;
      currentMouseY += (targetMouseY - currentMouseY) * 0.08;

      // Compute damped mouse velocity impulse
      const rawVelX = (currentMouseX - prevMouseX) / Math.max(width, 1);
      const rawVelY = (currentMouseY - prevMouseY) / Math.max(height, 1);
      velX = velX * 0.88 + rawVelX * 0.12;
      velY = velY * 0.88 + rawVelY * 0.12;

      prevMouseX = currentMouseX;
      prevMouseY = currentMouseY;

      // Pass uniforms
      gl.uniform2f(uResLoc, canvas.width, canvas.height);
      gl.uniform1f(uTimeLoc, elapsedTime);
      gl.uniform2f(uMouseLoc, currentMouseX * dpr, currentMouseY * dpr);
      gl.uniform2f(uMouseVelLoc, velX * 15.0, velY * 15.0);
      gl.uniform1f(uIntensityLoc, intensity);
      gl.uniform1f(uDensityLoc, density);
      gl.uniform1f(uDprLoc, dpr);

      // Render fullscreen quad
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      mediaQuery.removeEventListener?.("change", handleMotionChange);
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("touchmove", handleTouchMove);
      }

      // Clean WebGL resources
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
        gl.deleteBuffer(positionBuffer);
        const loseContext = gl.getExtension("WEBGL_lose_context");
        if (loseContext) loseContext.loseContext();
      }
    };
  }, [speed, intensity, density, dprCap, interactive]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#08080a] ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}

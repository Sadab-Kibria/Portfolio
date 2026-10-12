"use client";

import { useEffect, useRef } from "react";

export default function WireframeRoad() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        let animationFrameId = 0;
        let lastTime = 0;
        let cameraZ = 0;
        let width = 0;
        let height = 0;
        let dpr = 1;
        let isVisible = true;

        // --------------------------------------------------
        // CONFIGURATION
        // --------------------------------------------------
        const CONFIG = {
            speed: 0.6,
            camHeight: 1.45,
            fov: 0.92,
            horizonFrac: 0.46,
            nearZ: 1.8,
            farZ: 68.0,
            rowStep: 1.25,
            roadColumns: 14,
            roadHalfWidth: 3.4,
            mountainColumns: 20,
            mountainWidth: 26.0,
        };

        // --------------------------------------------------
        // STARS SETUP (Deterministic pseudo-randomness)
        // --------------------------------------------------
        const STAR_COUNT = 160;
        const starX = new Float32Array(STAR_COUNT);
        const starY = new Float32Array(STAR_COUNT);
        const starSize = new Float32Array(STAR_COUNT);
        const starBaseAlpha = new Float32Array(STAR_COUNT);
        const starTwinkleSpeed = new Float32Array(STAR_COUNT);
        const starPhase = new Float32Array(STAR_COUNT);

        let seed = 123456789;
        const pseudoRandom = () => {
            seed = (seed * 1664525 + 1013904223) % 4294967296;
            return seed / 4294967296;
        };

        for (let i = 0; i < STAR_COUNT; i++) {
            starX[i] = pseudoRandom();
            starY[i] = pseudoRandom() * 0.44;
            starSize[i] = pseudoRandom() < 0.82 ? 0.75 + pseudoRandom() * 0.6 : 1.4 + pseudoRandom() * 1.1;
            starBaseAlpha[i] = 0.25 + pseudoRandom() * 0.65;
            starTwinkleSpeed[i] = 0.8 + pseudoRandom() * 2.2;
            starPhase[i] = pseudoRandom() * Math.PI * 2;
        }

        // --------------------------------------------------
        // PROCEDURAL MOUNTAIN NOISE
        // --------------------------------------------------
        const hash2D = (x: number, z: number, s: number) => {
            const v = Math.sin(x * 12.9898 + z * 78.233 + s * 37.719) * 43758.5453123;
            return v - Math.floor(v);
        };

        const mountainHeight = (u: number, worldZ: number, side: number): number => {
            const zFreq1 = worldZ * 0.085;
            const zFreq2 = worldZ * 0.19;
            const zFreq3 = worldZ * 0.42;

            const xFreq1 = u * 3.8;
            const xFreq2 = u * 7.5;
            const xFreq3 = u * 14.0;

            const m1 = Math.sin(xFreq1 * 1.4 + zFreq1 + side * 1.8) * 0.85;
            const m2 = Math.cos(xFreq2 * 0.9 - zFreq2 + side * 3.1) * 0.45;

            const ridge1 = (1.0 - Math.abs(Math.sin(xFreq1 * 1.8 + zFreq2 * 1.2 + side * 0.9))) * 1.1;
            const ridge2 = (1.0 - Math.abs(Math.cos(xFreq2 * 1.2 - zFreq3 * 0.9 + side * 2.4))) * 0.55;

            const detail = Math.sin(xFreq3 + zFreq3 * 1.5) * 0.18;

            const cellX = Math.floor(u * 5);
            const cellZ = Math.floor(worldZ * 0.22);
            const peakHash = hash2D(cellX, cellZ, side);
            const peak = peakHash > 0.68 ? (peakHash - 0.68) * 4.6 : 0;

            const h = Math.max(0, m1 + m2 + ridge1 + ridge2 + detail + peak);
            const ramp = Math.pow(Math.min(u, 1), 0.72);
            return h * (ramp * (3.8 + u * 4.2));
        };

        // --------------------------------------------------
        // GEOMETRY & TYPED ARRAY ALLOCATION
        // --------------------------------------------------
        const mCols = CONFIG.mountainColumns;
        const rCols = CONFIG.roadColumns;
        const totalCols = mCols + rCols + mCols;
        const numRows = Math.ceil((CONFIG.farZ - CONFIG.nearZ) / CONFIG.rowStep) + 3;
        const totalVerts = (numRows + 1) * (totalCols + 1);

        const staticColX = new Float32Array(totalCols + 1);
        const colIsRoad = new Uint8Array(totalCols);

        for (let c = 0; c <= totalCols; c++) {
            if (c < mCols) {
                const u = (mCols - c) / mCols;
                staticColX[c] = -CONFIG.roadHalfWidth - Math.pow(u, 1.08) * CONFIG.mountainWidth;
            } else if (c <= mCols + rCols) {
                const roadFrac = (c - mCols) / rCols;
                staticColX[c] = -CONFIG.roadHalfWidth + roadFrac * (CONFIG.roadHalfWidth * 2);
            } else {
                const u = (c - (mCols + rCols)) / mCols;
                staticColX[c] = CONFIG.roadHalfWidth + Math.pow(u, 1.08) * CONFIG.mountainWidth;
            }

            if (c < totalCols) {
                colIsRoad[c] = c >= mCols && c < mCols + rCols ? 1 : 0;
            }
        }

        const projX = new Float32Array(totalVerts);
        const projY = new Float32Array(totalVerts);
        const worldY = new Float32Array(totalVerts);

        // Directional light vector normalized
        const lx = -0.3475;
        const ly = 0.844;
        const lz = -0.3972;

        // --------------------------------------------------
        // RESIZE OBSERVER / HANDLER
        // --------------------------------------------------
        const handleResize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = canvas.parentElement?.clientWidth || window.innerWidth;
            height = canvas.parentElement?.clientHeight || window.innerHeight;

            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        // --------------------------------------------------
        // MAIN RENDER LOOP
        // --------------------------------------------------
        const render = (timestamp: number) => {
            if (!isVisible) {
                lastTime = timestamp;
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            if (!lastTime) lastTime = timestamp;
            const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
            lastTime = timestamp;

            cameraZ += dt * CONFIG.speed;

            // 1. Clear Screen
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);

            const horizonY = height * CONFIG.horizonFrac;
            const fovHeight = height * CONFIG.fov;
            const halfWidth = width * 0.5;

            // 2. Stars
            const timeSec = timestamp * 0.001;
            for (let i = 0; i < STAR_COUNT; i++) {
                const twinkle = Math.sin(timeSec * starTwinkleSpeed[i] + starPhase[i]) * 0.25;
                const alpha = Math.max(0.1, Math.min(1, starBaseAlpha[i] + twinkle));

                ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
                ctx.fillRect(
                    starX[i] * width - starSize[i] * 0.5,
                    starY[i] * height - starSize[i] * 0.5,
                    starSize[i],
                    starSize[i]
                );
            }

            // 3. Project 3D Grid Vertices
            const rowOffset = cameraZ % CONFIG.rowStep;
            const colsStride = totalCols + 1;

            for (let r = 0; r <= numRows; r++) {
                const rowZ = CONFIG.farZ - r * CONFIG.rowStep - rowOffset;
                if (rowZ < 0.2) continue;

                const scale = fovHeight / rowZ;
                const sampleZ = rowZ + cameraZ;
                const baseIdx = r * colsStride;

                for (let c = 0; c <= totalCols; c++) {
                    const idx = baseIdx + c;
                    let wy = 0;

                    if (c < mCols) {
                        const u = (mCols - c) / mCols;
                        wy = mountainHeight(u, sampleZ, -1);
                    } else if (c > mCols + rCols) {
                        const u = (c - (mCols + rCols)) / mCols;
                        wy = mountainHeight(u, sampleZ, 1);
                    }

                    worldY[idx] = wy;
                    projX[idx] = halfWidth + staticColX[c] * scale;
                    projY[idx] = horizonY + (CONFIG.camHeight - wy) * scale;
                }
            }

            // 4. Render Mesh (Back to Front)
            const zSpan = CONFIG.farZ - CONFIG.nearZ;

            for (let r = 0; r < numRows; r++) {
                const rowFarZ = CONFIG.farZ - r * CONFIG.rowStep - rowOffset;
                const rowNearZ = rowFarZ - CONFIG.rowStep;

                if (rowNearZ < CONFIG.nearZ * 0.7) continue;

                const avgZ = (rowFarZ + rowNearZ) * 0.5;
                const closeness = 1.0 - Math.max(0, Math.min(1, (avgZ - CONFIG.nearZ) / zSpan));
                const fogFactor = Math.pow(closeness, 1.35);
                const baseAlpha = 0.08 + fogFactor * 0.65;
                const baseAlphaStr = baseAlpha.toFixed(2);

                const r0 = r * colsStride;
                const r1 = (r + 1) * colsStride;

                ctx.lineWidth = closeness > 0.55 ? 0.75 : 0.5;

                for (let c = 0; c < totalCols; c++) {
                    const i00 = r0 + c;
                    const i10 = r0 + c + 1;
                    const i01 = r1 + c;
                    const i11 = r1 + c + 1;

                    const p00x = projX[i00];
                    const p00y = projY[i00];
                    const p10x = projX[i10];
                    const p10y = projY[i10];
                    const p01x = projX[i01];
                    const p01y = projY[i01];
                    const p11x = projX[i11];
                    const p11y = projY[i11];

                    if (colIsRoad[c]) {
                        ctx.beginPath();
                        ctx.moveTo(p00x, p00y);
                        ctx.lineTo(p10x, p10y);
                        ctx.lineTo(p11x, p11y);
                        ctx.lineTo(p01x, p01y);
                        ctx.closePath();

                        ctx.fillStyle = "#000000";
                        ctx.fill();
                        ctx.strokeStyle = `rgba(255,255,255,${baseAlphaStr})`;
                        ctx.stroke();
                    } else {
                        // Triangle 1: i00 -> i10 -> i11
                        const ax1 = staticColX[c + 1] - staticColX[c];
                        const ay1 = worldY[i10] - worldY[i00];
                        const az1 = 0;

                        const bx1 = staticColX[c + 1] - staticColX[c];
                        const by1 = worldY[i11] - worldY[i00];
                        const bz1 = -CONFIG.rowStep;

                        let nx1 = ay1 * bz1 - az1 * by1;
                        let ny1 = az1 * bx1 - ax1 * bz1;
                        let nz1 = ax1 * by1 - ay1 * bx1;
                        const invLen1 = 1 / (Math.hypot(nx1, ny1, nz1) || 1);
                        nx1 *= invLen1;
                        ny1 *= invLen1;
                        nz1 *= invLen1;

                        const dot1 = Math.max(0, nx1 * lx + ny1 * ly + nz1 * lz);
                        const shade1 = Math.floor(dot1 * 38 * fogFactor);

                        ctx.beginPath();
                        ctx.moveTo(p00x, p00y);
                        ctx.lineTo(p10x, p10y);
                        ctx.lineTo(p11x, p11y);
                        ctx.closePath();

                        ctx.fillStyle = `rgb(${shade1},${shade1},${shade1})`;
                        ctx.fill();
                        ctx.strokeStyle = `rgba(255,255,255,${(baseAlpha * (0.45 + dot1 * 0.55)).toFixed(2)})`;
                        ctx.stroke();

                        // Triangle 2: i00 -> i11 -> i01
                        const ax2 = staticColX[c + 1] - staticColX[c];
                        const ay2 = worldY[i11] - worldY[i00];
                        const az2 = -CONFIG.rowStep;

                        const bx2 = 0;
                        const by2 = worldY[i01] - worldY[i00];
                        const bz2 = -CONFIG.rowStep;

                        let nx2 = ay2 * bz2 - az2 * by2;
                        let ny2 = az2 * bx2 - ax2 * bz2;
                        let nz2 = ax2 * by2 - ay2 * bx2;
                        const invLen2 = 1 / (Math.hypot(nx2, ny2, nz2) || 1);
                        nx2 *= invLen2;
                        ny2 *= invLen2;
                        nz2 *= invLen2;

                        const dot2 = Math.max(0, nx2 * lx + ny2 * ly + nz2 * lz);
                        const shade2 = Math.floor(dot2 * 38 * fogFactor);

                        ctx.beginPath();
                        ctx.moveTo(p00x, p00y);
                        ctx.lineTo(p11x, p11y);
                        ctx.lineTo(p01x, p01y);
                        ctx.closePath();

                        ctx.fillStyle = `rgb(${shade2},${shade2},${shade2})`;
                        ctx.fill();
                        ctx.strokeStyle = `rgba(255,255,255,${(baseAlpha * (0.45 + dot2 * 0.55)).toFixed(2)})`;
                        ctx.stroke();
                    }
                }
            }

            // --------------------------------------------------
            // 5. ATMOSPHERIC HORIZON GLOW & LIGHT BLEED
            // --------------------------------------------------
            ctx.save();
            ctx.globalCompositeOperation = "screen";

            // Elliptical horizon bloom
            ctx.save();
            ctx.translate(halfWidth, horizonY);
            ctx.scale(1, 0.35);

            const bloomRadius = width * 0.45;
            const bloomGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, bloomRadius);
            bloomGrad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
            bloomGrad.addColorStop(0.15, "rgba(220, 230, 255, 0.18)");
            bloomGrad.addColorStop(0.45, "rgba(180, 200, 240, 0.05)");
            bloomGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

            ctx.fillStyle = bloomGrad;
            ctx.beginPath();
            ctx.arc(0, 0, bloomRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Intense focal point core
            const coreRadius = Math.min(width * 0.12, 90);
            const coreGrad = ctx.createRadialGradient(
                halfWidth,
                horizonY,
                0,
                halfWidth,
                horizonY,
                coreRadius
            );
            coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.65)");
            coreGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.2)");
            coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(halfWidth, horizonY, coreRadius, 0, Math.PI * 2);
            ctx.fill();

            // Horizon line
            const lineHalfSpan = width * 0.35;
            const lineGrad = ctx.createLinearGradient(
                halfWidth - lineHalfSpan,
                0,
                halfWidth + lineHalfSpan,
                0
            );
            lineGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
            lineGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.2)");
            lineGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.75)");
            lineGrad.addColorStop(0.7, "rgba(255, 255, 255, 0.2)");
            lineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

            ctx.beginPath();
            ctx.moveTo(halfWidth - lineHalfSpan, horizonY);
            ctx.lineTo(halfWidth + lineHalfSpan, horizonY);
            ctx.strokeStyle = lineGrad;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        const observer = new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting;
        });
        observer.observe(canvas);

        handleResize();
        window.addEventListener("resize", handleResize);
        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
            observer.disconnect();
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
        />
    );
}
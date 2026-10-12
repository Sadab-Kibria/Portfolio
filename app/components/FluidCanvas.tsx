'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FluidSimulation, FluidConfig } from '@/lib/FluidSimulation';

const defaultConfig: FluidConfig = {
  simResolution: 256,
  dyeResolution: 1024,
  curl: 25,
  pressureIterations: 50,
  velocityDissipation: 0.98,
  dyeDissipation: 0.95,
  splatRadius: 0.25,
  forceStrength: 7.5,
  pressureDecay: 0.75,
  threshold: 0.3,
  edgeSoftness: 0.03,
  inkColor: new THREE.Color(1, 1, 1),
};

interface FluidCanvasProps {
  config?: Partial<FluidConfig>;
  heroRef: React.RefObject<HTMLElement | null>;
}

export default function FluidCanvas({ config, heroRef }: FluidCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const hasHover = window.matchMedia('(hover: hover)').matches;
    if (!hasFinePointer || !hasHover || !canvasRef.current) return;

    const mergedConfig: FluidConfig = { ...defaultConfig, ...config };
    let sim: FluidSimulation | null = null;

    const startSim = () => {
      if (sim || !canvasRef.current) return;
      // Restore canvas visibility
      canvasRef.current.style.transition = 'opacity 0.3s ease';
      canvasRef.current.style.opacity = '1';
      sim = new FluidSimulation(canvasRef.current, mergedConfig);
    };

    const stopSim = () => {
      if (!sim || !canvasRef.current) return;
      const s = sim;
      sim = null;
      // Fade out then destroy so it doesn't look stuck
      canvasRef.current.style.transition = 'opacity 0.3s ease';
      canvasRef.current.style.opacity = '0';
      setTimeout(() => {
        s.destroy();
      }, 300); // matches transition duration
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (inside) {
        startSim();
      } else {
        stopSim();
      }
    };

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (sim) {
        sim.destroy();
        sim = null;
      }
    };
  }, [config, heroRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 100,
        mixBlendMode: 'difference',
        opacity: 0,
        transition: 'opacity 0.3s ease',
      }}
    />
  );
}
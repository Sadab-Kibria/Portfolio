// components/ResendBackground.tsx
import React from 'react';

export default function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#000000]"
    >
      {/* ------------------------------------------------------------- */}
      {/* ACCELERATED KEYFRAMES FOR ACTIVE GLOW MOVEMENT                */}
      {/* ------------------------------------------------------------- */}
      <style>{`
        /* 1. Primary Right-Side Keylight Path Movement */
        @keyframes orbit-glow-1 {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.6;
          }
          25% {
            transform: translate3d(-70px, -45px, 0) scale(1.12);
            opacity: 0.85;
          }
          50% {
            transform: translate3d(-110px, 30px, 0) scale(1.03);
            opacity: 0.7;
          }
          75% {
            transform: translate3d(-30px, 60px, 0) scale(0.94);
            opacity: 0.55;
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.6;
          }
        }

        /* 2. Concentrated Hotspot Wander */
        @keyframes orbit-hotspot {
          0% {
            transform: translate3d(0, 0, 0) scale(0.9);
            opacity: 0.5;
          }
          33% {
            transform: translate3d(-50px, -30px, 0) scale(1.2);
            opacity: 0.8;
          }
          66% {
            transform: translate3d(-20px, 40px, 0) scale(1.03);
            opacity: 0.6;
          }
          100% {
            transform: translate3d(0, 0, 0) scale(0.9);
            opacity: 0.5;
          }
        }

        /* 3. Left-Side Atmospheric Drift */
        @keyframes orbit-glow-2 {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.38;
          }
          35% {
            transform: translate3d(80px, -50px, 0) scale(1.16);
            opacity: 0.65;
          }
          70% {
            transform: translate3d(50px, 40px, 0) scale(0.92);
            opacity: 0.42;
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.38;
          }
        }

        /* 4. Center Sheen Breathing & Floating */
        @keyframes float-horizon {
          0%, 100% {
            transform: translate3d(-50%, -50%, 0) scaleY(0.85) scaleX(0.98);
            opacity: 0.55;
          }
          50% {
            transform: translate3d(-50%, calc(-50% - 18px), 0) scaleY(1.25) scaleX(1.04);
            opacity: 0.85;
          }
        }

        /* 5. Razor Beam Light Tracer */
        @keyframes shimmer-sweep {
          0% {
            background-position: -200% center;
            opacity: 0.5;
          }
          50% {
            opacity: 0.85;
          }
          100% {
            background-position: 200% center;
            opacity: 0.5;
          }
        }

        .anim-glow-wander-1 {
          animation: orbit-glow-1 16s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          will-change: transform, opacity;
        }

        .anim-hotspot-wander {
          animation: orbit-hotspot 11s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .anim-glow-wander-2 {
          animation: orbit-glow-2 20s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          will-change: transform, opacity;
        }

        .anim-horizon-float {
          animation: float-horizon 8s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .anim-line-shimmer {
          background-size: 200% auto;
          animation: shimmer-sweep 7s linear infinite;
          will-change: background-position, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .anim-glow-wander-1,
          .anim-hotspot-wander,
          .anim-glow-wander-2,
          .anim-horizon-float,
          .anim-line-shimmer {
            animation: none !important;
          }
        }
      `}</style>

      {/* ------------------------------------------------------------- */}
      {/* ATMOSPHERIC MOVING GLOWS (SLIGHTLY REFINED & DARKER)          */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute inset-0">
        {/* 1. Large Right-Side Keylight Glow (Glides along orbit) */}
        <div
          className="anim-glow-wander-1 absolute top-[20%] sm:top-[25%] right-[5%] sm:right-[12%] h-[650px] w-[650px] rounded-full blur-[115px]"
          style={{
            background:
              'radial-gradient(circle at center, rgba(190, 210, 245, 0.27) 0%, rgba(110, 130, 165, 0.14) 40%, rgba(35, 45, 60, 0.04) 70%, transparent 85%)',
          }}
        />

        {/* 2. Intense Core Specular Hotspot */}
        <div
          className="anim-hotspot-wander absolute top-[28%] sm:top-[32%] right-[15%] sm:right-[20%] h-[320px] w-[320px] rounded-full blur-[55px]"
          style={{
            background:
              'radial-gradient(circle at center, rgba(240, 245, 255, 0.38) 0%, rgba(160, 185, 225, 0.16) 50%, transparent 80%)',
          }}
        />

        {/* 3. Luminous Sweeping Sheen (Breathing in center) */}
        <div
          className="anim-horizon-float absolute top-1/2 left-1/2 h-[340px] w-[140%] blur-[70px]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.025) 15%, rgba(180, 205, 240, 0.22) 50%, rgba(255, 255, 255, 0.05) 85%, transparent 100%)',
          }}
        />

        {/* 4. Specular Floor Razor-Line */}
        <div
          className="anim-line-shimmer absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 h-[1.5px] w-[120%]"
          style={{
            backgroundImage:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 20%, rgba(255,255,255,0.65) 50%, rgba(190,215,250,0.7) 55%, rgba(255,255,255,0.03) 80%, transparent 100%)',
            filter:
              'drop-shadow(0 0 12px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 3px rgba(255, 255, 255, 0.65))',
          }}
        />

        {/* 5. Left-Side Atmospheric Drift */}
        <div
          className="anim-glow-wander-2 absolute top-[25%] sm:top-[30%] left-[2%] sm:left-[6%] h-[500px] w-[650px] rounded-full blur-[140px]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(105, 125, 160, 0.17) 0%, rgba(40, 48, 65, 0.06) 50%, transparent 75%)',
          }}
        />

        {/* 6. Lower Floor Deep Shadow */}
        <div
          className="absolute top-[62%] inset-x-0 bottom-0"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.88) 50%, #000000 100%)',
          }}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FILM GRAIN OVERLAY                                            */}
      {/* ------------------------------------------------------------- */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* SOFT CINEMATIC VIGNETTE                                       */}
      {/* ------------------------------------------------------------- */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 95% 85% at 50% 50%, transparent 50%, rgba(0, 0, 0, 0.55) 78%, #000000 100%)',
        }}
      />

      {/* Edge Falloffs */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#000000] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#000000] to-transparent" />
      <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#000000] to-transparent" />
      <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#000000] to-transparent" />
    </div>
  );
}
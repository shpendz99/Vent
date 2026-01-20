"use client";

import { motion, useScroll, useTransform, useMotionTemplate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type GlitchMorphHeadingProps = {
  from: string;
  to: string;
  eyebrow?: string;
};

export default function GlitchMorphHeading({
  from,
  to,
  eyebrow,
}: GlitchMorphHeadingProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { amount: 0.4, once: true });

  // Freeze progress at 0 until we’ve actually seen the section.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (inView) setArmed(true);
  }, [inView]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Armed progress: before inView, act like progress = 0.
  const p = useTransform(scrollYProgress, (v) => (armed ? v : 0));

  // Morph timings (scroll-driven)
  // 0.00–0.20: intro glitch + blur settles
  // 0.20–0.70: morph A -> B
  // 0.70–1.00: hold B + little “after-glitch”
  const fromOpacity = useTransform(p, [0.2, 0.55], [1, 0]);
  const toOpacity = useTransform(p, [0.35, 0.75], [0, 1]);

  const blurA = useTransform(p, [0.15, 0.35], [6, 0]);
  const blurB = useTransform(p, [0.35, 0.75], [10, 0]);

  const blurAFilter = useMotionTemplate`blur(${blurA}px)`;
  const blurBFilter = useMotionTemplate`blur(${blurB}px)`;

  // Glitch intensity bursts
  // Quick spikes early + a couple mid spikes
  const glitch = useTransform(p, [0, 0.12, 0.2, 0.42, 0.5, 0.62, 0.7, 1], [1, 0.2, 0, 0.9, 0, 0.8, 0, 0]);

  // RGB split amount (px)
  const split = useTransform(glitch, [0, 1], [0, 10]);

  // Scanline opacity
  const scanOpacity = useTransform(glitch, [0, 1], [0, 0.22]);

  // Tiny jitter translate for the whole heading
  const jitterX = useTransform(glitch, [0, 1], [0, 6]);
  const jitterY = useTransform(glitch, [0, 1], [0, 2]);

  return (
    <section ref={sectionRef} className="relative min-h-[500vh] text-white">
      {/* sticky/pinned viewport */}
      <div className="sticky top-0 h-screen flex items-center justify-center px-4">
        <motion.div
          style={{ x: jitterX, y: jitterY }}
          className="relative glitch-morph-heading text-center"
        >
          {eyebrow ? (
            <div className="mb-4 text-xs md:text-sm uppercase tracking-[0.35em] text-neutral-300">
              {eyebrow}
            </div>
          ) : null}

          {/* Scanline overlay */}
          <motion.div
            aria-hidden
            style={{ opacity: scanOpacity }}
            className="pointer-events-none absolute inset-0 z-20"
          >
            <div className="h-full w-full bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.08),transparent)] bg-[length:100%_6px]" />
          </motion.div>

          {/* TEXT A (base + RGB ghosts) */}
          <div className="relative">
            {/* Base A */}
            <motion.h2
              style={{ opacity: fromOpacity, filter: blurAFilter }}
              className="relative z-10 font-display text-4xl md:text-6xl lg:text-7xl uppercase tracking-tight"
            >
              {from}
            </motion.h2>

            {/* RGB split ghosts for A */}
            <motion.h2
              aria-hidden
              style={{
                opacity: fromOpacity,
                x: useTransform(split, (s) => -s),
              }}
              className="absolute inset-0 z-0 font-display text-4xl md:text-6xl lg:text-7xl uppercase tracking-tight text-cyan-300/35 mix-blend-screen"
            >
              {from}
            </motion.h2>
            <motion.h2
              aria-hidden
              style={{
                opacity: fromOpacity,
                x: useTransform(split, (s) => s),
              }}
              className="absolute inset-0 z-0 font-display text-4xl md:text-6xl lg:text-7xl uppercase tracking-tight text-fuchsia-300/30 mix-blend-screen"
            >
              {from}
            </motion.h2>
          </div>

          {/* TEXT B (base + RGB ghosts) */}
          <div className="relative mt-0">
            {/* Base B */}
            <motion.h2
              style={{ opacity: toOpacity, filter: blurBFilter }}
              className="absolute inset-0 z-10 font-display text-4xl md:text-6xl lg:text-7xl uppercase tracking-tight"
            >
              {to}
            </motion.h2>

            {/* RGB split ghosts for B */}
            <motion.h2
              aria-hidden
              style={{
                opacity: toOpacity,
                x: useTransform(split, (s) => -s),
              }}
              className="absolute inset-0 z-0 font-display text-4xl md:text-6xl lg:text-7xl uppercase tracking-tight text-cyan-300/35 mix-blend-screen"
            >
              {to}
            </motion.h2>
            <motion.h2
              aria-hidden
              style={{
                opacity: toOpacity,
                x: useTransform(split, (s) => s),
              }}
              className="absolute inset-0 z-0 font-display text-4xl md:text-6xl lg:text-7xl uppercase tracking-tight text-fuchsia-300/30 mix-blend-screen"
            >
              {to}
            </motion.h2>

            {/* Spacer to preserve layout height (so absolutely positioned B doesn’t collapse) */}
            <h2 className="opacity-0 font-display text-4xl md:text-6xl lg:text-7xl uppercase tracking-tight">
              {to}
            </h2>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

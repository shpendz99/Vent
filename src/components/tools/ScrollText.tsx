"use client";

import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  MotionValue,
} from "framer-motion";
import { useMemo, useRef } from "react";

type ScrollTextProps = {
  eyebrow?: string;
  text: string;

  /**
   * Optional second phrase.
   * If provided, the component becomes a "swap" scroll section:
   * Phrase 1 reveals → holds → fades out → small gap → Phrase 2 reveals → holds.
   */
  secondaryText?: string;

  /**
   * Optional: tweak the scroll timeline (0..1 inside this section).
   * Default values are tuned to feel like:
   * - reveal 1
   * - ~"1.5s" hold (scroll-distance hold)
   * - fade out
   * - ~"0.5s" gap (scroll-distance gap)
   * - reveal 2
   * - hold to end
   */
  timeline?: {
    firstRevealEnd?: number; // default 0.35
    firstHoldEnd?: number; // default 0.45
    firstFadeEnd?: number; // default 0.55
    gapEnd?: number; // default 0.6
    secondRevealEnd?: number; // default 0.85
  };

  /**
   * Section height controls how “long” the holds feel.
   * Bigger = more scroll distance = feels like more time.
   */
  minHeightVh?: number; // default 275
};

function ScrollLetter({
  char,
  index,
  total,
  progress,
}: {
  char: string;
  index: number;
  total: number;
  progress: MotionValue<number>; // local 0..1
}) {
  // Local timeline (0..1) for a single phrase.
  // Keep a little initial dead-zone, then spread letters across the band.
  const bandStart = 0.12;
  const bandEnd = 0.92;
  const bandWidth = bandEnd - bandStart;

  const start = bandStart + (index / total) * bandWidth;
  const end = start + 0.06;

  const clampedStart = Math.min(start, 0.995);
  const clampedEnd = Math.min(end, 1);

  const opacity = useTransform(progress, [clampedStart, clampedEnd], [0.05, 1]);
  const color = useTransform(
    progress,
    [clampedStart, clampedEnd],
    ["hsl(220, 9%, 20%)", "#ffffff"]
  );

  return (
    <motion.span style={{ opacity, color }} className="inline-block">
      {char}
    </motion.span>
  );
}

function Phrase({
  text,
  progress,
  className,
}: {
  text: string;
  progress: MotionValue<number>; // local 0..1
  className: string;
}) {
  const words = useMemo(() => text.split(" "), [text]);
  const totalLetters = text.length;

  return (
    <p className={className}>
      {(() => {
        let runningIndex = 0;

        return words.map((word, wIndex) => {
          const chars = Array.from(word);
          const wordStartIndex = runningIndex;
          runningIndex += word.length + 1;

          return (
            <span
              key={wIndex}
              className="mr-[0.35em] inline-flex whitespace-nowrap"
            >
              {chars.map((char, cIndex) => {
                const letterIndex = wordStartIndex + cIndex;

                return (
                  <ScrollLetter
                    key={`${wIndex}-${cIndex}`}
                    char={char}
                    index={letterIndex}
                    total={totalLetters}
                    progress={progress}
                  />
                );
              })}
            </span>
          );
        });
      })()}
    </p>
  );
}

export default function ScrollText({
  eyebrow = "Defining your quiet",
  text,
  secondaryText,
  timeline,
  minHeightVh = 275,
}: ScrollTextProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const t = {
    firstRevealEnd: timeline?.firstRevealEnd ?? 0.35,
    firstHoldEnd: timeline?.firstHoldEnd ?? 0.45,
    firstFadeEnd: timeline?.firstFadeEnd ?? 0.55,
    gapEnd: timeline?.gapEnd ?? 0.6,
    secondRevealEnd: timeline?.secondRevealEnd ?? 0.85,
  };

  const hasSwap = Boolean(secondaryText?.trim());

  // Blur: heavy at very start, then clears.
  const blurAmount = useTransform(
    scrollYProgress,
    [0, 0.05, 0.3, 1],
    [20, 20, 0, 0]
  );
  const blurFilter = useMotionTemplate`blur(${blurAmount}px)`;

  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.6, 1]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.1, 1], [0.3, 1, 1]);

  // Phrase 1: local reveal progress 0..1 across [0..firstRevealEnd]
  const firstLocal = useTransform(
    scrollYProgress,
    [0, t.firstRevealEnd],
    [0, 1]
  );

  // Phrase 2: local reveal progress 0..1 across [gapEnd..secondRevealEnd]
  const secondLocal = useTransform(
    scrollYProgress,
    [t.gapEnd, t.secondRevealEnd],
    [0, 1]
  );

  // Whole-phrase opacity windows (scroll-driven, so reverse works automatically)
  const firstOpacity = hasSwap
    ? useTransform(
        scrollYProgress,
        [0, t.firstHoldEnd, t.firstFadeEnd],
        [1, 1, 0]
      )
    : useTransform(scrollYProgress, [0, 1], [1, 1]);

  const secondOpacity = hasSwap
    ? useTransform(
        scrollYProgress,
        [t.gapEnd, (t.gapEnd + t.secondRevealEnd) / 2, t.secondRevealEnd],
        [0, 0.6, 1]
      )
    : useTransform(scrollYProgress, [0, 1], [0, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative text-white"
      style={{ minHeight: `${minHeightVh}vh` }}
    >
      {/* Glow background */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ opacity: glowOpacity }}
      >
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,#111827,transparent_70%)]" />
      </motion.div>

      {/* Noise overlay with fade at top/bottom */}
      <div
        className="pointer-events-none absolute inset-0 h-full -z-10 bg-[url('/noisetexture.jpg')] opacity-35 mix-blend-multiply"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 13%, black 87%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 13%, black 87%, transparent 100%)",
        }}
      />

      {/* Pinned content */}
      <div className="sticky top-0 flex h-screen items-center">
        <motion.div
          style={{
            filter: blurFilter,
            opacity: contentOpacity,
          }}
          className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 text-center"
        >
          <div className="mb-2 text-sm uppercase tracking-[0.3em] text-neutral-200 md:mb-6 md:text-base">
            {eyebrow}
          </div>

          <div className="relative">
            {/* Phrase 1 */}
            <motion.div style={{ opacity: firstOpacity }}>
              <Phrase
                text={text}
                progress={firstLocal}
                className="font-display mx-auto flex flex-wrap justify-center text-center text-4xl uppercase md:text-6xl lg:text-7xl text-[48px] md:text-[72px] lg:text-[78px] leading-none font-bold tracking-tight text-text-primary"
              />
            </motion.div>

            {/* Phrase 2 (only if provided) */}
            {hasSwap ? (
              <motion.div
                className="absolute inset-0"
                style={{ opacity: secondOpacity }}
              >
                <Phrase
                  text={secondaryText!}
                  progress={secondLocal}
                  className="font-display mx-auto flex flex-wrap justify-center text-center text-4xl uppercase md:text-6xl lg:text-7xl text-[48px] md:text-[72px] lg:text-[78px] leading-none font-bold tracking-tight text-text-primary"
                />
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

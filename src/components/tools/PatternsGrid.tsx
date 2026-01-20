"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type PatternKey = "overthinking" | "anxiety" | "gratitude" | "lateNight";

type Pattern = {
  key: PatternKey;
  label: string;
  value: number; // 0–100
  hint: string;
  // Tailwind color tokens (keeps your design system vibe)
  glow: string; // used for subtle glow
  fill: string; // used for bar fill
};

const PATTERNS: Pattern[] = [
  {
    key: "overthinking",
    label: "Overthinking",
    value: 44,
    hint: "Loops + late analysis.",
    glow: "shadow-[0_0_18px_rgba(96,165,250,0.30)]",
    fill: "bg-sky-300/80",
  },
  {
    key: "anxiety",
    label: "Anxiety",
    value: 28,
    hint: "Tension spikes, then settles.",
    glow: "shadow-[0_0_18px_rgba(45,212,191,0.28)]",
    fill: "bg-teal-300/80",
  },
  {
    key: "gratitude",
    label: "Gratitude",
    value: 18,
    hint: "Small wins recorded.",
    glow: "shadow-[0_0_18px_rgba(250,204,21,0.22)]",
    fill: "bg-yellow-300/80",
  },
  {
    key: "lateNight",
    label: "Late night",
    value: 10,
    hint: "After-hours reflection.",
    glow: "shadow-[0_0_18px_rgba(168,85,247,0.22)]",
    fill: "bg-fuchsia-300/70",
  },
];

type TooltipState = {
  title: string;
  value: number;
  hint: string;
  x: number;
  y: number;
};

export default function PatternsGrid() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(wrapRef, { margin: "-20% 0px -20% 0px", once: true });

  const [hovered, setHovered] = useState<PatternKey | null>(null);
  const [tip, setTip] = useState<TooltipState | null>(null);
  const [isCardHover, setIsCardHover] = useState(false);

  // Exit delay (0.5s) like your calendar
  const exitTimer = useRef<number | null>(null);

  // Portal mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const patterns = useMemo(() => PATTERNS, []);

  function clearExitTimer() {
    if (exitTimer.current) {
      window.clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }
  }

  function scheduleHideTooltip() {
    clearExitTimer();
    exitTimer.current = window.setTimeout(() => {
      setHovered(null);
      setTip(null);
    }, 500);
  }

  function onBarEnter(p: Pattern) {
    clearExitTimer();
    setHovered(p.key);
  }

  function onBarLeave() {
    scheduleHideTooltip();
  }

  function onBarMove(e: React.MouseEvent, p: Pattern) {
    // Tooltip should be top-right of cursor & ABOVE everything -> fixed + portal
    const offsetX = 16;
    const offsetY = 16;

    setTip({
      title: p.label,
      value: p.value,
      hint: p.hint,
      x: e.clientX + offsetX,
      y: e.clientY + offsetY,
    });
  }

  return (
    <div
      ref={wrapRef}
      className="mt-3 relative"
      onMouseEnter={() => setIsCardHover(true)}
      onMouseLeave={() => {
        setIsCardHover(false);
        scheduleHideTooltip();
      }}
    >

      {/* Bars */}
      <div className="space-y-2.5">
        {patterns.map((p) => {
          const isActive = hovered === p.key;
          const isDim = hovered && hovered !== p.key;

          return (
            <div key={p.key} className="flex items-center gap-2">
              {/* Label */}
              <div
                className={[
                  "w-[110px] text-[10px] md:text-[11px] uppercase tracking-[0.18em]",
                  isDim ? "text-slate-500" : "text-slate-300",
                ].join(" ")}
              >
                {p.label}
              </div>

              {/* Track + fill */}
              <div
                className={[
                  "relative h-2.5 flex-1 rounded-full border border-slate-800 bg-slate-900/60",
                  "transition-all duration-300 ease-out",
                  isActive ? "brightness-110" : "",
                  isDim ? "opacity-50" : "opacity-100",
                ].join(" ")}
                onMouseEnter={() => onBarEnter(p)}
                onMouseLeave={onBarLeave}
                onMouseMove={(e) => onBarMove(e, p)}
              >
                <motion.div
                  className={[
                    "absolute left-0 top-0 h-full rounded-full",
                    p.fill,
                    isActive ? p.glow : "",
                  ].join(" ")}
                  initial={{ width: "0%" }}
                  animate={{
                    width: inView ? `${p.value}%` : "0%",
                    opacity: isDim ? 0.35 : 1,
                    filter: isActive ? "brightness(1.15)" : "brightness(1)",
                  }}
                  transition={{
                    // Slightly slower like you asked
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              </div>

              {/* Value */}
              <div
                className={[
                  "w-[34px] text-right text-[10px] md:text-[11px] tabular-nums",
                  isDim ? "text-slate-500" : "text-slate-300",
                ].join(" ")}
              >
                {p.value}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Tooltip (portal so it NEVER gets clipped by the card/grid) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {tip ? (
              <motion.div
                key="patterns-tooltip"
                initial={{ opacity: 0, y: 6, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: 6,
                  scale: 0.99,
                  transition: { duration: 0.35, delay: 0.5 }, // 0.5s exit delay
                }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "fixed",
                  left: tip.x,
                  top: tip.y,
                  zIndex: 9999,
                  pointerEvents: "none",
                  maxWidth: 260,
                }}
                className="
                  rounded-xl border border-slate-700/60
                  bg-[rgba(3,7,18,0.92)]
                  shadow-[0_25px_60px_rgba(0,0,0,0.55)]
                  backdrop-blur-md
                  px-3 py-2
                  text-slate-100
                "
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">
                    {tip.title}
                  </div>
                  <div className="text-[11px] text-slate-300 tabular-nums">
                    {tip.value}%
                  </div>
                </div>

                <div className="mt-1 text-[12px] leading-snug text-slate-200">
                  {tip.hint}
                </div>

                <div className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  This month
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

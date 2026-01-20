"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type DayMood = "bad" | "okay" | "great" | null;
const MOODS: Exclude<DayMood, null>[] = ["bad", "okay", "great"];

type DayEntry = {
  mood: Exclude<DayMood, null>;
  dateLabel: string;
  title: string;
  body: string;
};

const moodMeta = {
  bad: { label: "BAD DAY", dot: "bg-red-400" },
  okay: { label: "OKAY DAY", dot: "bg-amber-400" },
  great: { label: "GREAT DAY", dot: "bg-emerald-400" },
} as const;

const badCopy = [
  {
    title: "Hard day",
    body: "Everything felt loud today, so I took it slow and wrote a few honest lines.",
  },
  {
    title: "Low energy",
    body: "I didn’t have much in me. I still showed up for myself — that matters.",
  },
  {
    title: "Heavy thoughts",
    body: "The spiral tried to win. I paused, breathed, and didn’t feed it.",
  },
  {
    title: "Overwhelmed",
    body: "Too much at once. I picked one small thing and let that be enough.",
  },
];

const okayCopy = [
  {
    title: "Okay day",
    body: "A mixed one — some anxious moments, some calm. I stayed with it.",
  },
  {
    title: "Steady",
    body: "Not amazing, not awful. Just steady. I’ll take steady.",
  },
  {
    title: "Better later",
    body: "The morning was rough, but it softened. I’m glad I kept going.",
  },
  {
    title: "Neutral",
    body: "Nothing huge happened. I’m learning to appreciate the quiet.",
  },
];

const greatCopy = [
  {
    title: "Great day",
    body: "I felt lighter today. I reached out and didn’t isolate.",
  },
  {
    title: "Good momentum",
    body: "Small wins stacked up. I’m proud of the way I handled today.",
  },
  {
    title: "Present",
    body: "I stayed in the moment. It was simple, and it felt good.",
  },
  {
    title: "Clear mind",
    body: "My thoughts were calmer. I wrote, walked, and reset.",
  },
];

function randomPick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildRandomCalendar(total = 28): (DayEntry | null)[] {
  const highlightedCount = Math.floor(Math.random() * 4) + 5; // 5–8
  const indices = new Set<number>();
  while (indices.size < highlightedCount) indices.add(Math.floor(Math.random() * total));

  // simple fake dates that look believable
  const startDay = Math.floor(Math.random() * 10) + 10; // 10–19
  const month = "Dec";
  const year = 2025;

  return Array.from({ length: total }).map((_, i) => {
    if (!indices.has(i)) return null;

    const mood = randomPick(MOODS);
    const pack =
      mood === "bad" ? badCopy : mood === "okay" ? okayCopy : greatCopy;
    const copy = randomPick(pack);

    const day = startDay + i;
    const dateLabel = `${day}th ${month} ${year}`;

    return { mood, dateLabel, ...copy };
  });
}

/** Border + subtle glow (keeps your base dark cell) */
function cellMoodClass(mood: Exclude<DayMood, null>) {
  switch (mood) {
    case "bad":
      return [
        "border-red-400/55",
        "shadow-[inset_0_0_0_1px_rgba(248,113,113,0.35),0_0_18px_rgba(248,113,113,0.10)]",
      ].join(" ");
    case "okay":
      return [
        "border-amber-300/55",
        "shadow-[inset_0_0_0_1px_rgba(252,211,77,0.35),0_0_18px_rgba(252,211,77,0.10)]",
      ].join(" ");
    case "great":
      return [
        "border-emerald-300/55",
        "shadow-[inset_0_0_0_1px_rgba(110,231,183,0.35),0_0_18px_rgba(110,231,183,0.10)]",
      ].join(" ");
  }
}

function CalendarTooltip({
  x,
  y,
  entry,
}: {
  x: number;
  y: number;
  entry: DayEntry;
}) {
  const meta = moodMeta[entry.mood];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{
          opacity: { duration: 0.25, ease: "easeOut" },
          y: { duration: 0.25, ease: "easeOut" },
          scale: { duration: 0.25, ease: "easeOut" },
        }}
        style={{ top: y + 14, left: x + 14 }}
        className="fixed z-[9999] w-[210px] rounded-xl border border-slate-700/60 
                   bg-[rgba(3,7,18,0.92)] p-3 shadow-2xl backdrop-blur"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400">{entry.dateLabel}</p>
            <p className="mt-1 text-[13px] font-medium text-slate-100 leading-snug">
              {entry.title}
            </p>
            <p className="mt-1 text-[12px] text-slate-200/90 leading-snug">
              {entry.body}
            </p>
          </div>
          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />
        </div>

        <p className="mt-2 text-[10px] tracking-[0.22em] text-slate-400">
          {meta.label}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Drop this directly inside your BentoCard (design stays the same).
 */
export default function CalendarBentoContent() {
  const [days, setDays] = useState<(DayEntry | null)[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; entry: DayEntry } | null>(
    null
  );

  useEffect(() => {
    setDays(buildRandomCalendar(28));
  }, []);

  return (
    <>
      <div className="mt-3 grid grid-cols-7 gap-[2px] text-[9px] text-slate-400">
        {days.map((entry, i) => {
          const isActive = entry !== null;

          return (
            <div
              key={i}
              onMouseMove={(e) => {
                if (!entry) return;
                setTooltip({ x: e.clientX, y: e.clientY, entry });
              }}
              onMouseLeave={() => setTooltip(null)}
              className={[
                "aspect-square rounded-md bg-slate-900/60 border border-slate-800 transition-all duration-150",
                isActive ? cellMoodClass(entry!.mood) : "",
                isActive ? "hover:brightness-110" : "",
              ].join(" ")}
            />
          );
        })}
      </div>

      {tooltip && (
        <CalendarTooltip x={tooltip.x} y={tooltip.y} entry={tooltip.entry} />
      )}
    </>
  );
}

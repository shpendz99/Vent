"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

type PrivateEntry = {
  id: string;
  title: string;
  when: "Today" | "Yesterday" | "2 days ago";
  preview: string;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export default function PrivateCard() {
  const [isHover, setIsHover] = useState(false);

  const entries = useMemo<PrivateEntry[]>(
    () => [
      {
        id: "e1",
        title: "Rough day at work",
        when: "Today",
        preview: "Couldn’t switch my brain off. Wrote it down instead.",
      },
      {
        id: "e2",
        title: "Late-night thoughts",
        when: "Yesterday",
        preview: "Grateful, anxious, and tired—still trying to be kind to myself.",
      },
    ],
    []
  );

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >

      {/* Content wrapper */}
      <div className="mt-3">
        <motion.ul
          className="space-y-2"
          animate={isHover ? "hover" : "rest"}
          variants={{
            rest: {},
            hover: {},
          }}
        >
          {entries.map((entry, idx) => (
            <PrivateRow
              key={entry.id}
              entry={entry}
              index={idx}
              parentHover={isHover}
            />
          ))}
        </motion.ul>
      </div>
    </div>
  );
}

function PrivateRow({
  entry,
  index,
  parentHover,
}: {
  entry: {
    title: string;
    when: string;
    preview: string;
  };
  index: number;
  parentHover: boolean;
}) {
  return (
    <motion.li
      className={cn(
        "group relative overflow-hidden rounded-md",
        "border border-slate-800/70 bg-slate-900/40"
      )}
      initial={false}
      animate={parentHover ? "cardHover" : "cardRest"}
      variants={{
        cardRest: {
          y: 0,
          filter: "blur(1.2px)",
          opacity: 0.92,
          transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
        },
        cardHover: {
          y: 0,
          filter: "blur(0px)",
          opacity: 1,
          transition: {
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
            delay: index * 0.04,
          },
        },
      }}
      whileHover="rowHover"
    >
      {/* subtle row highlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0"
        variants={{
          rowHover: { opacity: 1 },
        }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background:
            "radial-gradient(1200px circle at 20% 20%, rgba(56,189,248,0.12), transparent 60%)",
        }}
      />

      {/* inner */}
      <motion.div
        className="relative flex items-start justify-between gap-3 px-3 py-2"
        initial={false}
        animate={parentHover ? "hover" : "rest"}
        variants={{
          rest: {
            x: 0,
            transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
          },
          hover: {
            x: 6, // “slide in” slightly
            transition: {
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
              delay: index * 0.04,
            },
          },
        }}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-semibold text-slate-100">
              {entry.title}
            </div>

            <div className="shrink-0 rounded-full border border-slate-800/70 bg-slate-950/40 px-2 py-0.5 text-[10px] text-slate-300/80">
              {entry.when}
            </div>
          </div>

          <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-300/80">
            {entry.preview}
          </div>
        </div>

        {/* tiny affordance */}
        <motion.div
          className="shrink-0"
          variants={{
            rowHover: { opacity: 1, y: 0 },
          }}
          initial={{ opacity: 0, y: 2 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="
              rounded-md border border-slate-700/60
              bg-slate-950/40 px-2 py-1
              text-[10px] uppercase tracking-[0.18em]
              text-slate-200/80
              backdrop-blur
            "
          >
            Open
          </div>
        </motion.div>
      </motion.div>
    </motion.li>
  );
}

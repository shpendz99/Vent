"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ROOM_FILTERS,
  ROOM_POSTS,
  FeedFilter,
  RoomName,
} from "../data/roomFeed";

const pillColors: Record<RoomName, string> = {
  Overthinking: "text-sky-200",
  Anxiety: "text-rose-200",
  Gratitude: "text-amber-200",
  "Late night": "text-indigo-200",
};

const FILTER_META: Record<FeedFilter, { label: string; emoji?: string }> = {
  All: { label: "ALL" },
  Overthinking: { label: "OVERTHINKING", emoji: "🧠" },
  Anxiety: { label: "ANXIETY", emoji: "😰" },
  Gratitude: { label: "GRATITUDE", emoji: "✨" },
  "Late night": { label: "LATE NIGHT", emoji: "🌙" },
};

const ALL_ROOMS: RoomName[] = [
  "Overthinking",
  "Anxiety",
  "Gratitude",
  "Late night",
];

// --- NEW: helper to convert "3 hr. ago", "23 min. ago", "1 day ago" → minutes
function timeAgoToMinutes(timeAgo: string): number {
  const [rawValue, rawUnit] = timeAgo.split(" ");
  const value = Number(rawValue);
  const unit = rawUnit?.toLowerCase() ?? "";

  if (Number.isNaN(value)) return Number.POSITIVE_INFINITY;

  if (unit.startsWith("min")) return value;
  if (unit.startsWith("hr")) return value * 60;
  if (unit.startsWith("day")) return value * 60 * 24;

  return Number.POSITIVE_INFINITY;
}

// Pre-sorted posts: most recent first
const SORTED_POSTS = [...ROOM_POSTS].sort(
  (a, b) => timeAgoToMinutes(a.timeAgo) - timeAgoToMinutes(b.timeAgo)
);

export function RoomsFeed() {
  // null = "All" active; array = specific rooms selected
  const [selectedRooms, setSelectedRooms] = useState<RoomName[] | null>(null);

  const isAllActive = selectedRooms === null;

  const visibleItems =
    isAllActive || selectedRooms.length === 0
      ? SORTED_POSTS
      : SORTED_POSTS.filter((item) => selectedRooms.includes(item.room));

  function handleToggle(filter: FeedFilter) {
    if (filter === "All") {
      setSelectedRooms(null);
      return;
    }

    const room = filter as RoomName;

    if (selectedRooms === null) {
      setSelectedRooms([room]);
      return;
    }

    let next: RoomName[];

    if (selectedRooms.includes(room)) {
      next = selectedRooms.filter((r) => r !== room);
    } else {
      next = [...selectedRooms, room];
    }

    if (next.length === 0) {
      setSelectedRooms(null);
      return;
    }

    if (next.length === ALL_ROOMS.length) {
      setSelectedRooms(null);
      return;
    }

    setSelectedRooms(next);
  }
  return (
    <div className="space-y-4">
      {/* FILTER PILLS */}
      <div className="flex flex-wrap gap-2 text-[11px] md:text-xs">
        {ROOM_FILTERS.map((filter) => {
          const meta = FILTER_META[filter];

          const active =
            filter === "All"
              ? isAllActive
              : !isAllActive && selectedRooms!.includes(filter as RoomName);

          return (
            <button
              key={filter}
              type="button"
              onClick={() => handleToggle(filter)}
              className={`
    inline-flex items-center gap-1
    rounded-md                      
    border border-slate-700/70      
    px-3.5 py-1.5                 
    uppercase tracking-[0.14em]
    text-[10px] md:text-[11px]
    cursor-pointer select-none
    shadow-[0_2px_4px_rgba(0,0,0,0.35)]
    transition-all duration-150
    ${
      active
        ? "border-sky-400/80 bg-slate-900/80 text-sky-100 shadow-[0_0_12px_rgba(56,189,248,0.45)]"
        : "bg-slate-900/40 text-slate-400 hover:border-slate-500 hover:text-slate-100"
    }
  `}
            >
              <span>{meta.label}</span>
              {meta.emoji && (
                <span className="text-[13px] md:text-sm leading-none">
                  {meta.emoji}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* FEED LIST + GRADIENT (no inner scrolling, BentoCard clips overflow) */}
      <div className="relative">
        <div className="space-y-3 md:space-y-3.5 pb-8">
          <AnimatePresence mode="popLayout">
            {visibleItems.map((item) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{
                  duration: 0.35, // 0.18 + ~0.35 → noticeably slower
                  ease: "easeOut",
                }}
                className="w-full rounded-xl bg-[#020616] border border-slate-800 px-4 py-3 md:px-5 md:py-4"
              >
                {/* Top row: title + time, room on right */}
                <div className="flex items-start justify-between gap-4 text-[11px] md:text-sm text-slate-200">
                  <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{item.timeAgo}</span>
                  </div>
                  <span
                    className={`text-xs md:text-sm font-medium ${
                      pillColors[item.room]
                    }`}
                  >
                    {item.room}
                  </span>
                </div>

                {/* Body */}
                <p className="mt-2 text-[12px] md:text-sm leading-relaxed text-slate-300">
                  {item.body}
                </p>

                {/* Username bottom-right */}
                <div className="mt-3 flex justify-end">
                  <span className="text-[11px] md:text-xs text-slate-400">
                    {item.username}
                  </span>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom gradient, clipped by BentoCard overflow-hidden */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-sky-500/20 via-slate-900/95 to-transparent" />
      </div>
    </div>
  );
}

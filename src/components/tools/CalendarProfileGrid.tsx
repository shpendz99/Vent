"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useToastStore } from "@/hooks/use-toast-store";

type DayMood = "Bad" | "Average" | "Good" | null;

interface JournalEntry {
  id: string; // Added ID for editing/deleting
  day: number;
  content: string;
  mood?: DayMood;
}

const getMoodStyles = (mood?: DayMood) => {
  switch (mood) {
    case "Bad":
      return {
        base: "bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
        text: "text-red-400",
        ring: "ring-red-400/50",
        bar: "bg-red-500",
      };
    case "Average":
      return {
        base: "bg-orange-500/10 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]",
        text: "text-orange-400",
        ring: "ring-orange-400/50",
        bar: "bg-orange-500",
      };
    case "Good":
    default:
      return {
        base: "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
        text: "text-emerald-400",
        ring: "ring-emerald-400/50",
        bar: "bg-emerald-500",
      };
  }
};

import JournalModal from "./JournalModal";

// ...

export default function CalendarProfileGrid() {
  const [viewDate, setViewDate] = useState(new Date());
  const [entries, setEntries] = useState<Record<number, JournalEntry>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const addToast = useToastStore((state) => state.addToast);

  // Last 3 months logic
  const last3Months = useMemo(() => {
    const months = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d);
    }
    return months;
  }, []);

  const { cells, monthName, year } = useMemo(() => {
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const totalDays = new Date(year, month + 1, 0).getDate();

    return {
      cells: Array.from({ length: totalDays }, (_, i) => i + 1),
      monthName: viewDate.toLocaleString("default", { month: "long" }),
      year,
    };
  }, [viewDate]);

  useEffect(() => {
    async function fetchJournalData() {
      const supabase = supabaseBrowser();
      const startOfMonth = new Date(year, viewDate.getMonth(), 1).toISOString();
      const endOfMonth = new Date(
        year,
        viewDate.getMonth() + 1,
        0,
        23,
        59,
        59
      ).toISOString();

      const { data, error } = await supabase
        .from("journals") // Reading from journals table
        .select("id, created_at, content, mood")
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth);

      if (data && !error) {
        const mappedEntries: Record<number, JournalEntry> = {};
        data.forEach((item) => {
          const day = new Date(item.created_at).getDate();
          mappedEntries[day] = {
            id: item.id,
            day,
            content: item.content,
            mood: item.mood,
          };
        });
        setEntries(mappedEntries);
      }
    }

    fetchJournalData();
    fetchJournalData();
  }, [viewDate, year, refreshKey]);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const supabase = supabaseBrowser();

    const { error } = await supabase
      .from("journals")
      .delete()
      .eq("id", deletingId);

    if (error) {
      addToast("Failed to delete entry", "error");
    } else {
      addToast("Entry deleted successfully", "success");
      setRefreshKey((p) => p + 1);
      setSelectedEntry(null);
    }
    setIsDeleting(false);
    setDeletingId(null);
  };

  return (
    <div className="w-full flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 relative z-20">
        <h3 className="text-lg font-medium text-slate-100">Calendar Journal</h3>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors"
          >
            {viewDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-[#111016] border border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {last3Months.map((date, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setViewDate(date);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {date.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 h-full">
        {/* LEFT SIDE: GRID + FOOTER */}
        <div className="flex flex-col gap-6 shrink-0">
          {/* CONSTRAINED GRID CONTAINER */}
          <div className="grid grid-cols-7 gap-2 max-w-fit">
            {cells.map((day) => {
              const entry = entries[day];
              const hasEntry = !!entry;
              const isSelected = selectedEntry?.day === day;
              const styles = getMoodStyles(entry?.mood);

              return (
                <div
                  key={day}
                  onClick={() => {
                    if (hasEntry) {
                      setSelectedEntry(entry);
                    } else {
                      // Basic placeholder for empty day, no ID yet
                      setSelectedEntry({
                        id: "",
                        day,
                        content: "",
                        mood: null,
                      });
                    }
                  }}
                  className={`
                    aspect-square w-12 h-12 rounded-lg border transition-all relative flex items-center justify-center cursor-pointer
                    ${
                      hasEntry
                        ? `${styles.base}`
                        : "bg-white/4 border-white/5 hover:bg-white/[0.05]"
                    }
                    ${
                      isSelected
                        ? `ring-2 ${
                            hasEntry ? styles.ring : "ring-emerald-400/50"
                          }`
                        : ""
                    }
                    `}
                >
                  <span
                    className={`
                    text-[10px] font-medium transition-colors
                    ${hasEntry ? styles.text : "text-white/10"}
                    `}
                  >
                    {day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider">
              You have journaled{" "}
              <span className="text-emerald-400">
                {Object.keys(entries).length}
              </span>{" "}
              times this month
            </p>
            <button
              onClick={() => {
                const today = new Date();
                const isCurrentMonth =
                  today.getMonth() === viewDate.getMonth() &&
                  today.getFullYear() === viewDate.getFullYear();

                const existingEntry = isCurrentMonth
                  ? entries[today.getDate()]
                  : null;

                if (existingEntry) {
                  setEditingEntry(existingEntry);
                  addToast(
                    "Opening your existing entry for today...",
                    "success"
                  );
                }

                setIsJournalModalOpen(true);
              }}
              className="cursor-pointer relative inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-[radial-gradient(circle_at_top,var(--accent-primary),#0284C7)] border border-borderc-accent text-white shadow-[0_0_0_0_rgba(56,189,248,0)] hover:shadow-[0_0_30px_2px_rgba(56,189,248,0.35)] hover:brightness-110 transition-all duration-200 ease-out rounded-md"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: DETAILS */}
        <div className="flex-1 border-l border-white/5 pl-8 min-h-[300px] flex flex-col">
          {selectedEntry ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300 group">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`h-8 w-1 rounded-full transition-colors duration-300 ${
                    getMoodStyles(selectedEntry.mood).bar
                  }`}
                />
                <div>
                  <h4 className="text-lg font-medium text-white">
                    {viewDate.toLocaleString("default", { month: "long" })}{" "}
                    {selectedEntry.day}
                  </h4>
                  <p className="text-xs text-white/40 uppercase tracking-widest">
                    {viewDate.getFullYear()}
                  </p>
                </div>
              </div>

              <div className="prose prose-invert prose-sm max-w-none">
                {selectedEntry.content ? (
                  <p className="text-[12px] md:text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                    {selectedEntry.content}
                  </p>
                ) : (
                  <p className="text-slate-500 italic">
                    No journal entry for this day.
                  </p>
                )}
              </div>

              {selectedEntry.content && (
                <div className="mt-2 flex items-center justify-end gap-3 select-none">
                  <button
                    onClick={() => {
                      setEditingEntry(selectedEntry);
                      setIsJournalModalOpen(true);
                    }}
                    className="cursor-pointer text-[10px] uppercase tracking-widest font-bold text-white/20 group-hover:text-white/60 hover:text-white! transition-all duration-300"
                  >
                    Edit
                  </button>
                  <span className="text-white/20 group-hover:text-white/60 text-[10px] transition-colors duration-300">
                    •
                  </span>
                  <button
                    onClick={() => setDeletingId(selectedEntry.id)}
                    className="cursor-pointer text-[10px] uppercase tracking-widest font-bold text-white/20 group-hover:text-white/60 hover:text-red-400! transition-all duration-300"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <div className="h-16 w-16 mobile-icon-bg rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                <div className="h-2 w-2 bg-white rounded-full app-icon-pulse" />
              </div>
              <p className="text-sm font-medium">Select a date to view entry</p>
            </div>
          )}
        </div>
      </div>

      {/* JOURNAL MODAL */}
      {/* JOURNAL MODAL */}
      <JournalModal
        open={isJournalModalOpen}
        onClose={() => {
          setIsJournalModalOpen(false);
          setEditingEntry(null);
        }}
        onPosted={() => {
          setRefreshKey((prev) => prev + 1);
          // If editing, keep selected but refresh data? Or just close?
          // fetchJournalData uses refreshKey so it will update.
          // If we edited the currently selected entry, 'selectedEntry' state is stale.
          // We should ideally re-select it or clear it.
          // For simplicity, we can let the user re-select or implement specific update logic.
          // Actually, if we just edited, we might want to see the changes immediately.
          // But 'selectedEntry' is local state.
          // A simple fix is to clear selectedEntry or update it.
          // Let's clear it for now to force re-selection (or re-fetch logic can handle update if we synced it).
          if (editingEntry) {
            // Maybe keep it open?
            // Actually, the simplest UX is to re-click.
            setSelectedEntry(null);
          }
        }}
        initialContent={editingEntry?.content}
        initialMood={editingEntry?.mood}
        journalId={editingEntry?.id}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {deletingId && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setDeletingId(null)}
                  className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-70 flex items-center justify-center pointer-events-none p-4"
                >
                  <div className="w-full max-w-sm bg-[#0b0f19] border border-white/10 rounded-xl p-6 shadow-2xl pointer-events-auto">
                    <h3 className="text-sm font-semibold text-white mb-2">
                      Are you sure?
                    </h3>
                    <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                      This action cannot be undone. This journal entry will be
                      permanently deleted.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button
                        disabled={isDeleting}
                        onClick={() => handleDelete()}
                        className="px-4 py-2 rounded-md bg-white/5 border border-white/5 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-4 py-2 rounded-md bg-white text-black text-xs font-bold hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

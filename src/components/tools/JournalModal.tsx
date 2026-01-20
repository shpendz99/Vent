"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useToastStore } from "@/hooks/use-toast-store";
import { autoCorrectText } from "@/lib/autoCorrect";

interface JournalModalProps {
  open: boolean;
  onClose: () => void;
  onPosted?: () => void;
  initialContent?: string;
  initialMood?: Mood | null;
  journalId?: string;
}

type Mood = "Bad" | "Average" | "Good";

export default function JournalModal({
  open,
  onClose,
  onPosted,
  initialContent = "",
  initialMood = null,
  journalId,
}: JournalModalProps) {
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const addToast = useToastStore((state) => state.addToast);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => textareaRef.current?.focus(), 50);

    // Load initial data
    setContent(initialContent);
    setMood(initialMood);

    return () => {
      document.body.style.overflow = "unset";
      clearTimeout(t);
    };
  }, [open, initialContent, initialMood]);

  const canSubmit = useMemo(() => {
    const hasContent = content.trim().length >= 3;
    const hasMood = mood !== null;
    return hasContent && hasMood && !submitting;
  }, [content, mood, submitting]);

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("You must be signed in to post.");

      const generatedTitle =
        content.trim().split(/\s+/).slice(0, 5).join(" ") + "...";

      const payload = {
        user_id: user.id,
        content: content.trim(),
        title: generatedTitle,
        mood: mood,
      };

      let error;
      if (journalId) {
        const { error: updateErr } = await supabase
          .from("journals")
          .update(payload)
          .eq("id", journalId);
        error = updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from("journals")
          .insert(payload);
        error = insertErr;
      }

      if (error) throw error;

      addToast(
        journalId
          ? "Journal entry updated successfully!"
          : "Journal entry saved successfully!",
        "success"
      );
      onPosted?.();
      onClose();
    } catch (e: any) {
      addToast(e.message || "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-60 bg-black/55 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-70 flex items-start justify-center pt-20 px-4 sm:pt-24 pointer-events-none"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl overflow-hidden rounded-2xl pointer-events-auto border border-white/10 bg-gradient-to-b from-[#0b0f19]/90 to-[#070a12]/90 shadow-[0_20px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/6 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h2 className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
                  {journalId ? "Edit Journal Entry" : "New Journal Entry"}
                </h2>
                <button
                  onClick={onClose}
                  className="shrink-0 rounded-md px-2 py-1 text-[11px] text-white/55 hover:text-white/80 border border-white/10 bg-white/3 transition-colors"
                >
                  Esc
                </button>
              </div>

              <div className="p-6">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(autoCorrectText(e.target.value))}
                  placeholder="How was your day?"
                  className="w-full h-44 bg-transparent text-[15px] text-white/85 placeholder:text-white/35 outline-none resize-none leading-relaxed search-scroll"
                />
              </div>

              <div className="px-6 py-4 bg-black/20 border-t border-white/10 flex justify-between items-center">
                <div className="flex gap-6">
                  {/* BAD MOOD */}
                  <button
                    onClick={() => setMood("Bad")}
                    className={`text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-300 flex items-center gap-1.5 ${
                      mood === "Bad"
                        ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                        : "text-white/20 hover:text-white/40"
                    }`}
                  >
                    <span className="text-xl">☹️</span> Bad
                  </button>

                  {/* AVERAGE MOOD */}
                  <button
                    onClick={() => setMood("Average")}
                    className={`text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-300 flex items-center gap-1.5 ${
                      mood === "Average"
                        ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                        : "text-white/20 hover:text-white/40"
                    }`}
                  >
                    <span className="text-xl">😐</span> Average
                  </button>

                  {/* GOOD MOOD */}
                  <button
                    onClick={() => setMood("Good")}
                    className={`text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-300 flex items-center gap-1.5 ${
                      mood === "Good"
                        ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                        : "text-white/20 hover:text-white/40"
                    }`}
                  >
                    <span className="text-xl">🙂</span> Good
                  </button>
                </div>

                <button
                  disabled={!canSubmit}
                  onClick={submit}
                  className={`
                    px-6 py-2.5 rounded-md text-[11px] font-bold uppercase tracking-wider
                    transition-all duration-200 ease-out
                    ${
                      canSubmit
                        ? "cursor-pointer text-white border border-border-muted/90 bg-accent-primary/30 hover:bg-accent-primary hover:shadow-[0_0_18px_rgba(56,189,248,0.35)] hover:-translate-y-0.5 hover:brightness-110"
                        : "bg-white/5 text-white/10 border border-white/5 cursor-not-allowed opacity-40 grayscale"
                    }
                  `}
                >
                  {submitting
                    ? "Saving..."
                    : journalId
                    ? "Update Entry"
                    : "Save Journal"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

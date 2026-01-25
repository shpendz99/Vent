"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useToastStore } from "@/hooks/use-toast-store";
import { autoCorrectText } from "@/lib/autoCorrect";

interface PostThoughtModalProps {
  open: boolean;
  onClose: () => void;
  onPosted?: () => void;
}

const FIELDS = [
  { key: "Overthinking", label: "OVERTHINKING", emoji: "🧠" },
  { key: "Anxiety", label: "ANXIETY", emoji: "😰" },
  { key: "Gratitude", label: "GRATITUDE", emoji: "✨" },
  { key: "Late night", label: "LATE NIGHT", emoji: "🌙" },
  { key: "Venting", label: "VENTING", emoji: "🫧" },
];

export default function PostThoughtModal({
  open,
  onClose,
  onPosted,
}: PostThoughtModalProps) {
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Connect to your custom Toast Store
  const addToast = useToastStore((state) => state.addToast);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => textareaRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = "unset";
      clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setContent("");
      setVisibility("public");
      setSelectedRooms([]);
    }
  }, [open]);

  const toggleRoom = (key: string) => {
    setSelectedRooms((prev) =>
      prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key],
    );
  };

  const canSubmit = useMemo(() => {
    const hasContent = content.trim().length >= 3;
    const hasRoom = selectedRooms.length > 0;
    return hasContent && hasRoom && !submitting;
  }, [content, selectedRooms, submitting]);

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("You must be signed in to post.");

      const { error: insertErr } = await supabase.from("thoughts").insert({
        user_id: user.id,
        content: content.trim(),
        visibility: visibility,
        rooms: selectedRooms,
      });

      if (insertErr) throw insertErr;

      // TRIGGER SUCCESS TOAST
      addToast("Thought posted successfully!", "success");

      onPosted?.();
      onClose();
    } catch (e: any) {
      // TRIGGER ERROR TOAST
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
            className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[70] flex items-start justify-center pt-20 px-4 sm:pt-24 pointer-events-none"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl overflow-hidden rounded-2xl pointer-events-auto border border-white/10 bg-gradient-to-b from-[#0b0f19]/90 to-[#070a12]/90 shadow-[0_20px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.06] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h2 className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
                  Post a Thought
                </h2>
                <button
                  onClick={onClose}
                  className="shrink-0 flex items-center justify-center rounded-md w-8 h-8 text-white/55 hover:text-white/80 border border-white/10 bg-white/[0.03] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-8">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(autoCorrectText(e.target.value))}
                  placeholder="What's on your mind?"
                  className="w-full h-44 bg-transparent text-[15px] text-white/85 placeholder:text-white/35 outline-none resize-none leading-relaxed search-scroll"
                />

                <div className="flex flex-wrap gap-2">
                  {FIELDS.map((f) => {
                    const active = selectedRooms.includes(f.key);
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => toggleRoom(f.key)}
                        className={`
                          inline-flex items-center gap-2
                          rounded-md border px-3.5 py-1.5                 
                          uppercase tracking-[0.14em]
                          text-[10px] md:text-[11px]
                          cursor-pointer select-none
                          shadow-[0_2px_4px_rgba(0,0,0,0.35)]
                          transition-all duration-150
                          ${
                            active
                              ? "border-sky-400/80 bg-slate-900/80 text-sky-100 shadow-[0_0_12px_rgba(56,189,248,0.45)]"
                              : "border-slate-700/70 bg-slate-900/40 text-slate-400 hover:border-slate-500 hover:text-slate-100"
                          }
                        `}
                      >
                        <span>{f.label}</span>
                        <span className="text-[13px] md:text-sm leading-none">
                          {f.emoji}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="px-6 py-4 bg-black/20 border-t border-white/10 flex justify-between items-center">
                <div className="flex gap-6">
                  <button
                    onClick={() => setVisibility("public")}
                    className={`text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                      visibility === "public"
                        ? "text-sky-400"
                        : "text-white/20 hover:text-white/40"
                    }`}
                  >
                    Public
                  </button>
                  <button
                    onClick={() => setVisibility("private")}
                    className={`text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                      visibility === "private"
                        ? "text-sky-400"
                        : "text-white/20 hover:text-white/40"
                    }`}
                  >
                    Private
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
                  {submitting ? "Posting..." : "Post Thought"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

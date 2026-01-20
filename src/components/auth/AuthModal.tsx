"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import SignInForm from "./SignInForm";
import SignUpWizard from "./SignUpWizard";

type Props = {
  open: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
  onModeChange: (mode: "signin" | "signup") => void;
};

export default function AuthModal({ open, onClose, mode, onModeChange }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Lock scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  const title = mode === "signup" ? "Create your account" : "Welcome back";

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — match SearchOverlay */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Modal wrapper — match SearchOverlay */}
          <motion.div
            className="fixed inset-0 z-[70] flex items-start justify-center pt-20 px-4 sm:pt-24"
            initial={{ opacity: 0, y: -10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={onClose}
          >
            {/* Card — match SearchOverlay */}
            <div
              className={[
                "w-full max-w-2xl overflow-hidden rounded-2xl",
                "border border-white/10",
                "bg-gradient-to-b from-[#0b0f19]/90 to-[#070a12]/90",
                "shadow-[0_20px_80px_rgba(0,0,0,0.6)]",
                "ring-1 ring-white/[0.06]",
                "backdrop-blur-xl",
              ].join(" ")}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header — match SearchOverlay */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="text-[15px] font-medium text-white/85">{title}</div>

                <button
                  onClick={onClose}
                  className={[
                    "shrink-0 rounded-md px-2 py-1 text-[11px]",
                    "text-white/55 hover:text-white/80",
                    "border border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                    "transition-colors",
                  ].join(" ")}
                >
                  Esc
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-5">
                {mode === "signup" ? (
                  <SignUpWizard
                    onDone={onClose}
                    onSwitchToSignIn={() => onModeChange("signin")}
                  />
                ) : (
                  <SignInForm
                    onDone={onClose}
                    onSwitchToSignUp={() => onModeChange("signup")}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { CheckCircle2, X } from "lucide-react";
import { useToastStore } from "@/hooks/use-toast-store";

type Props = {
  email: string;
  password: string;
  username: string;
  displayName: string;
  intent: string;
  onPrev: () => void;
  onDone: () => void;
};

const PENDING_KEY = "ventura_pending_signup";

const secondaryBtnClass =
  "flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[14px] text-white/85 " +
  "hover:bg-white/[0.06] disabled:opacity-50 transition-colors";

const primaryBtnClass =
  "flex-1 rounded-xl bg-white/10 px-4 py-3 text-[14px] text-white/85 " +
  "hover:bg-white/15 disabled:opacity-50 transition-colors";

export default function StepVerify({
  email,
  password,
  username,
  displayName,
  intent,
  onPrev,
  onDone,
}: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const hasSentInitial = useRef(false);

  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/auth/callback?next=/dashboard`;
  }, []);

  // Effect to auto-hide toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  async function handleSignUp(isResend = false) {
    const supabase = supabaseBrowser();
    setError(null);
    setStatus("sending");

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          username: username.toLowerCase().trim(),
          display_name: displayName.trim(),
          intent: intent.trim(),
        },
      },
    });

    if (signUpError) {
      console.error("Signup Error:", signUpError);

      // CHECK FOR EXISTING USER
      if (
        signUpError.message.includes("User already registered") ||
        signUpError.message.toLowerCase().includes("already registered") ||
        signUpError.message.toLowerCase().includes("already associated")
      ) {
        addToast(
          "This email is already associated with an account. Please sign in instead.",
          "error",
        );
        setStatus("idle"); // Reset so they can change email or go back
        return;
      }

      setError(signUpError.message);
      setStatus("error");
      return;
    }

    setStatus("sent");
    if (isResend) {
      setShowToast(true); // Trigger the Dribbble-style notification
    }
  }

  useEffect(() => {
    if (!hasSentInitial.current) {
      hasSentInitial.current = true;
      handleSignUp();
    }
  }, []);

  return (
    <div className="relative space-y-5">
      {/* --- DRIBBBLE STYLE TOAST --- */}
      {showToast && (
        <div className="absolute -top-20 left-0 right-0 z-50 flex justify-center animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#121212] p-4 shadow-2xl shadow-black/50 min-w-[300px]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
              <CheckCircle2 size={18} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-medium text-white/90">
                Verification resent
              </div>
              <div className="text-[11px] text-white/40">
                Check your inbox again.
              </div>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-white/20 hover:text-white/50"
            >
              <X size={16} />
            </button>
            {/* Progress bar timer */}
            <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-white/5 overflow-hidden rounded-full">
              <div
                className="h-full bg-emerald-500 animate-shrink-width"
                style={{ animationDuration: "5s" }}
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="text-[14px] font-medium text-white/85">
          Step 3 — Confirm your email
        </div>
        <div className="mt-1 text-xs text-white/45">
          We sent a link to{" "}
          <span className="text-white/80 font-medium">{email}</span>.
        </div>
      </div>

      {status === "sent" && !showToast && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/45 ring-1 ring-white/[0.06]">
          <p className="text-emerald-400 font-medium mb-1">Check your inbox.</p>
          If you don’t see it, check your **Spam** folder.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onPrev} className={secondaryBtnClass}>
          Go Back
        </button>

        <button
          type="button"
          onClick={() => handleSignUp(true)}
          disabled={status === "sending"}
          className={primaryBtnClass}
        >
          {status === "sending" ? "Sending..." : "Resend Email"}
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={onDone}
          className="text-[11px] text-white/30 hover:text-white/50"
        >
          I'll confirm it later
        </button>
      </div>
    </div>
  );
}

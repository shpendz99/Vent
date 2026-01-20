"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[14px] text-white/85 " +
  "outline-none placeholder:text-white/35 focus:border-white/20 focus:ring-1 focus:ring-white/10 transition";

const primaryBtnClass =
  "w-full rounded-xl bg-white/10 px-4 py-3 text-[14px] text-white/85 hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed transition-colors";

const linkBtnClass =
  "text-xs text-white/45 hover:text-white/70 transition-colors";

export default function ResetPasswordRequest({
  onBackToSignIn,
}: {
  onBackToSignIn?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("sending");

    const supabase = supabaseBrowser();
    const redirectTo = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) {
      setStatus("idle");
      setError(error.message);
      return;
    }

    setStatus("sent");
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[14px] font-medium text-white/85">
          Reset your password
        </div>
        <div className="mt-1 text-xs text-white/45">
          Enter your email and we’ll send you a secure reset link.
        </div>
      </div>

      <form onSubmit={send} className="space-y-3">
        <input
          className={inputClass}
          placeholder="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error ? <div className="text-xs text-red-400">{error}</div> : null}

        <button
          type="submit"
          disabled={!email || status === "sending"}
          className={primaryBtnClass}
        >
          {status === "sending" ? "Sending…" : "Send reset link"}
        </button>
      </form>

      {status === "sent" ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/60 ring-1 ring-white/[0.06]">
          Email sent. Check your inbox (and spam). Open the newest link.
        </div>
      ) : null}

      {onBackToSignIn ? (
        <button type="button" onClick={onBackToSignIn} className={linkBtnClass}>
          Back to sign in
        </button>
      ) : null}
    </div>
  );
}

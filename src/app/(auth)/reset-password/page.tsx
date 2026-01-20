"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[14px] text-white/85 " +
  "outline-none placeholder:text-white/35 focus:border-white/20 focus:ring-1 focus:ring-white/10 transition";

const primaryBtnClass =
  "w-full rounded-xl bg-white/10 px-4 py-3 text-[14px] text-white/85 hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed transition-colors";

const linkBtnClass =
  "text-xs text-white/45 hover:text-white/70 transition-colors";

type Status = "preparing" | "ready" | "saving" | "done" | "invalid";

function parseRecoveryParams() {
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

  const search = typeof window !== "undefined" ? window.location.search : "";
  const searchParams = new URLSearchParams(search);

  return {
    access_token: hashParams.get("access_token"),
    refresh_token: hashParams.get("refresh_token"),
    type: hashParams.get("type"),
    code: searchParams.get("code"),
    error: hashParams.get("error") || searchParams.get("error"),
    error_code: hashParams.get("error_code") || searchParams.get("error_code"),
    error_description:
      hashParams.get("error_description") || searchParams.get("error_description"),
  };
}

export default function ResetPasswordPage() {
  const router = useRouter();

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [status, setStatus] = useState<Status>("preparing");
  const [error, setError] = useState<string | null>(null);

  const pwOk = pw.length >= 6;
  const matchOk = pw.length > 0 && pw2.length > 0 && pw === pw2;

  const supabase = useMemo(() => supabaseBrowser(), []);

  useEffect(() => {
    let cancelled = false;

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY") {
        setError(null);
        setStatus("ready");
      }
    });

    (async () => {
      // 0) If Supabase already told us the link is expired/invalid, show it
      const params = parseRecoveryParams();
      if (params.error || params.error_code) {
        setStatus("invalid");
        setError(
          params.error_description
            ? decodeURIComponent(params.error_description.replace(/\+/g, " "))
            : "This reset link is invalid or expired. Please request a new one."
        );
        return;
      }

      // 1) If we already have a session, allow reset UI
      const { data: sessionData } = await supabase.auth.getSession();
      if (cancelled) return;

      if (sessionData.session) {
        setStatus("ready");
        return;
      }

      // 2) PKCE flow: exchange code for session
      if (params.code) {
        const { error } = await supabase.auth.exchangeCodeForSession(params.code);
        if (cancelled) return;

        if (!error) {
          setStatus("ready");
          return;
        }
      }

      // 3) Older hash token flow
      if (params.access_token && params.refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });

        if (cancelled) return;

        if (!error) {
          setStatus("ready");
          return;
        }
      }

      // Nothing worked
      setStatus("invalid");
      setError("This reset link is invalid or expired. Please request a new one.");
    })();

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!pwOk) return setError("Password must be 6+ characters.");
    if (!matchOk) return setError("Passwords do not match.");

    setStatus("saving");

    const { error } = await supabase.auth.updateUser({ password: pw });

    if (error) {
      setStatus("ready");
      setError(error.message);
      return;
    }

    setStatus("done");
    router.replace("/dashboard");
  }

  const showForm = status === "ready" || status === "saving";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className={[
          "w-full max-w-lg overflow-hidden rounded-2xl",
          "border border-white/10",
          "bg-gradient-to-b from-[#0b0f19]/90 to-[#070a12]/90",
          "shadow-[0_20px_80px_rgba(0,0,0,0.6)]",
          "ring-1 ring-white/[0.06]",
          "backdrop-blur-xl",
        ].join(" ")}
      >
        <div className="border-b border-white/10 px-4 py-3">
          <div className="text-[15px] font-medium text-white/85">
            Reset your password
          </div>
          <div className="mt-1 text-xs text-white/45">
            Choose a secure password (minimum 6 characters).
          </div>
        </div>

        <div className="px-5 py-5 space-y-3">
          {status === "preparing" ? (
            <div className="text-xs text-white/45">Preparing reset…</div>
          ) : null}

          {error ? <div className="text-xs text-red-400">{error}</div> : null}

          {status === "invalid" ? (
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className={linkBtnClass}
            >
              Request a new reset link
            </button>
          ) : null}

          {showForm ? (
            <form onSubmit={onSubmit} className="space-y-3">
              <input
                className={inputClass}
                placeholder="New password"
                type="password"
                autoComplete="new-password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                required
              />

              <input
                className={inputClass}
                placeholder="Confirm new password"
                type="password"
                autoComplete="new-password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                required
              />

              <div className="flex items-center justify-between text-xs">
                <span className="text-white/35">Minimum 6 characters</span>
                {pw2.length > 0 ? (
                  <span
                    className={
                      matchOk ? "text-emerald-300/80" : "text-red-300/80"
                    }
                  >
                    {matchOk ? "Passwords match" : "Passwords don’t match"}
                  </span>
                ) : (
                  <span className="text-white/35"> </span>
                )}
              </div>

              <button
                type="submit"
                disabled={!pw || !pw2 || status === "saving" || !pwOk || !matchOk}
                className={primaryBtnClass}
              >
                {status === "saving" ? "Saving…" : "Update password"}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}

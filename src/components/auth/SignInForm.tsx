"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

type Props = {
  onDone: () => void;
  onSwitchToSignUp: () => void;
  onForgotPassword?: () => void;
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[14px] text-white/85 " +
  "outline-none placeholder:text-white/35 " +
  "focus:border-white/20 focus:ring-1 focus:ring-white/10 transition";

const primaryBtnClass =
  "w-full rounded-xl bg-white/10 px-4 py-3 text-[14px] text-white/85 hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed transition-colors";

const linkBtnClass =
  "text-xs text-white/45 hover:text-white/70 transition-colors";

export default function SignInForm({
  onDone,
  onSwitchToSignUp,
  onForgotPassword,
}: Props) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Submit clicked. Attempting login...");
    setError(null);
    setLoading(true);

    const supabase = supabaseBrowser();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login Error:", error);
      setLoading(false);
      return setError(error.message);
    }

    console.log("LOGGED IN SUCCESSFULLY:", data.user);

    // Prevent loader from showing again if it hasn't finished yet
    sessionStorage.setItem("hasSeenLoader", "true");

    // 1. Refresh the router to update the server's view of the cookies
    router.refresh();

    // 2. Give the browser 800ms to settle the cookies on the Vercel production domain
    setTimeout(() => {
      onDone();
      window.location.href = "/dashboard";
    }, 800);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className={inputClass}
          placeholder="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setError(null);
            setEmail(e.target.value);
          }}
          required
        />

        <input
          className={inputClass}
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setError(null);
            setPassword(e.target.value);
          }}
          required
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (onForgotPassword) return onForgotPassword();
              router.push("/forgot-password");
            }}
            className="text-xs text-white/45 hover:text-white/70 transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        {error ? <div className="text-xs text-red-400">{error}</div> : null}

        <button disabled={loading} className={primaryBtnClass}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <button onClick={onSwitchToSignUp} className={linkBtnClass}>
        Don’t have an account? <span className="text-white/70">Sign up</span>
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";

type Props = {
  email: string;
  password: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  onNext: () => void;
  onSwitchToSignIn: () => void;
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[14px] text-white/85 " +
  "outline-none placeholder:text-white/35 " +
  "focus:border-white/20 focus:ring-1 focus:ring-white/10 transition";

const primaryBtnClass =
  "w-full rounded-xl bg-white/10 px-4 py-3 text-[14px] text-white/85 hover:bg-white/15 disabled:opacity-60 transition-colors";

const linkBtnClass =
  "text-xs text-white/45 hover:text-white/70 transition-colors";

function validEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}

export default function StepAccount({
  email,
  password,
  setEmail,
  setPassword,
  onNext,
  onSwitchToSignIn,
}: Props) {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const emailOk = validEmail(email);
  const passwordOk = password.length >= 6;
  const confirmOk = confirmPassword.length > 0 && confirmPassword === password;

  function next() {
    setError(null);

    if (!emailOk) return setError("Enter a valid email address.");
    if (!passwordOk) return setError("Password must be 6+ characters.");
    if (!confirmOk) return setError("Passwords do not match.");

    onNext();
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[14px] font-medium text-white/85">
          Step 1 — Create your account
        </div>
        <div className="mt-1 text-xs text-white/45">
          No real name needed. You can stay anonymous.
        </div>
      </div>

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
        autoComplete="new-password"
        value={password}
        onChange={(e) => {
          setError(null);
          setPassword(e.target.value);
        }}
        required
      />

      <input
        className={inputClass}
        placeholder="Confirm password"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => {
          setError(null);
          setConfirmPassword(e.target.value);
        }}
        required
      />

      {/* Small helper row (optional but makes it feel “thoughtful”) */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/35">Minimum 6 characters</span>
        {confirmPassword.length > 0 ? (
          <span className={confirmOk ? "text-emerald-300/80" : "text-red-300/80"}>
            {confirmOk ? "Passwords match" : "Passwords don’t match"}
          </span>
        ) : (
          <span className="text-white/35"> </span>
        )}
      </div>

      {error ? <div className="text-xs text-red-400">{error}</div> : null}

      <button
        type="button"
        onClick={next}
        className={primaryBtnClass}
        disabled={!emailOk || !passwordOk || !confirmOk}
      >
        Next
      </button>

      <button type="button" onClick={onSwitchToSignIn} className={linkBtnClass}>
        Already have an account?{" "}
        <span className="text-white/70 cursor-pointer">Sign in</span>
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import AuthModal from "./AuthModal";

export default function AuthLauncher() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signup");

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMode("signin");
          setOpen(true);
        }}
        className="text-xs text-text-muted hover:text-text-secondary"
      >
        LOG IN
      </button>

      <button
        type="button"
        onClick={() => {
          setMode("signup");
          setOpen(true);
        }}
        className="rounded-md bg-background-tertiary px-3 py-2 text-xs text-text-primary border border-borderc-default hover:bg-background-tertiary/80"
      >
        SIGN UP
      </button>

      <AuthModal
        open={open}
        onClose={() => setOpen(false)}
        mode={mode}
        onModeChange={setMode}
      />
    </>
  );
}

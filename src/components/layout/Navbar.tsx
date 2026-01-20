"use client";

import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { SearchOverlay } from "../tools/SearchOverlay";
import AuthModal from "../auth/AuthModal"; // ✅ adjust path if needed

const mobileMenuVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease: "easeInOut" },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 18,
    },
  },
};

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ auth modal state
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");

  function openAuth(mode: "signin" | "signup") {
    setAuthMode(mode);
    setAuthOpen(true);
    setMobileOpen(false); // ✅ close mobile menu when opening modal
  }

  return (
    <>
      {/* NAVBAR PILL */}
      <header className="fixed top-4 left-1/2 z-50 w-[min(90%,1300px)] -translate-x-1/2 rounded-md border border-border-muted/90 bg-[#111016]/20 backdrop-blur-xs shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between px-4 py-2 md:px-6 md:py-3">
          {/* Brand */}
          <div className="flex items-end gap-2">
            <h1 className="flex items-baseline leading-none">
              <span className="text-3xl font-semibold">V</span>
              <span className="text-lg font-medium -ml-1">entura</span>
            </h1>
          </div>

          {/* DESKTOP NAV (lg and up) */}
          <div className="hidden lg:flex items-center space-x-1">
            <SearchOverlay />

            <button
              onClick={() => openAuth("signin")}
              className="cursor-pointer inline-flex items-center justify-center
                px-3 py-2
                text-[11px] font-semibold uppercase tracking-wider
                bg-transparent
                text-text-secondary
                border border-transparent
               hover:text-text-primary
                hover:border-borderc-accent
                hover:bg-borderc-accent/10
                hover:-translate-y-0.5 hover:brightness-110
                transition-all duration-200 ease-out
                rounded-md"
            >
              Log In
            </button>

            <button
              onClick={() => openAuth("signup")}
              className="cursor-pointer inline-flex items-center justify-center px-4 py-2 text-[11px] font-semibold uppercase tracking-wider
                text-white
                border border-border-muted/90
              bg-accent-primary/30
                rounded-md

                hover:bg-accent-primary
                hover:shadow-[0_0_18px_rgba(56,189,248,0.35)]
                hover:-translate-y-0.5 hover:brightness-110

                transition-all duration-200 ease-out"
            >
              Sign Up
            </button>
          </div>

          {/* MOBILE NAV (below lg) */}
          <div className="flex items-center lg:hidden">
            {/* Burger / close button */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-[#38BDF8]/80 text-background-primary text-lg font-bold shadow-inner shadow-black/40"
              aria-label="Toggle menu"
            >
              {mobileOpen ? "✕" : "≡"}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DROPDOWN MENU – detached card below navbar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="
              fixed z-40
              left-1/2 top-24
              w-[min(90%,1300px)]
              -translate-x-1/2
            "
          >
            <div className="rounded-3xl border border-border-muted/90 bg-[#111016]/96 px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.55)] lg:hidden">
              {/* Search */}
              <motion.div variants={itemVariants} className="mb-3">
                <SearchOverlay />
              </motion.div>

              {/* Log in */}
              <motion.button
                variants={itemVariants}
                onClick={() => openAuth("signin")}
                className=" cursor-pointer mb-2 flex w-full items-center uppercase justify-center rounded-none tracking-wide px-3 py-2 text-sm font-medium text-text-secondary hover:bg-background-tertiary/60 transition-colors"
              >
                Log In
              </motion.button>

              {/* Divider */}
              <div className="my-1 h-px w-full bg-border-muted/70" />

              {/* Sign up */}
              <motion.button
                variants={itemVariants}
                onClick={() => openAuth("signup")}
                className=" cursor-pointer font-semibold mt-1 flex w-full items-center justify-center rounded-md px-3 py-2 text-sm uppercase tracking-wide  hover:bg-background-tertiary/70 transition-colors"
              >
                Sign Up
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ AUTH MODAL */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
};

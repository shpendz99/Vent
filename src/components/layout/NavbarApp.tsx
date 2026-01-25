"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, Transition, Variants } from "framer-motion";
import {
  LayoutDashboard,
  Rss,
  Settings,
  LogOut,
  PlusCircle,
  User as UserIcon,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { SearchOverlay } from "../tools/SearchOverlay";
import PostThoughtModal from "@/components/tools/PostThoughtModal";

// --- ANIMATION CONFIG ---

// SIDEBAR CONTAINER
const sidebarVariants: Variants = {
  expanded: {
    width: "260px",
    transition: {
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1],
      when: "beforeChildren", // Wait for width to finish before showing children
    },
  },
  collapsed: {
    width: "80px",
    transition: {
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1],
      delay: 0.3, // Wait 0.3s for children to fade out before collapsing width
      when: "afterChildren",
    },
  },
};

// TEXT ITEMS
const textVariants: Variants = {
  hidden: { opacity: 0, x: -10, display: "none" },
  visible: (i: number) => ({
    display: "block",
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.1 + i * 0.05, // Stagger effect after sidebar opens
      duration: 0.3,
    },
  }),
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.2 }, // Fast fade out
    transitionEnd: { display: "none" },
  },
};

// TOGGLE BUTTON TOOLTIP
const tooltipVariants: Variants = {
  hidden: { opacity: 0, x: 10, scale: 0.9 },
  visible: { opacity: 1, x: 0, scale: 1 },
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHoveringToggle, setIsHoveringToggle] = useState(false);

  const handleLogout = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <>
      <motion.aside
        initial="collapsed"
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        // Updated styling to match Navbar.tsx
        // rounded-md, border-border-muted/90, bg-[#111016]/20
        // Keeping sticky/height logic
        className="sticky top-4 h-[calc(100vh-2rem)] ml-4 z-50 hidden lg:flex flex-col rounded-md border border-border-muted/90 bg-[#111016]/95 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.35)]"
      >
        {/* INNER WRAPPER for content clipping */}
        <div className="flex-1 flex flex-col overflow-hidden w-full h-full relative">
          {/* LOGO - Static Position */}
          <div className="h-20 flex items-center justify-center shrink-0">
            <span className="text-3xl font-semibold text-white tracking-tighter">
              V
            </span>
          </div>

          <nav className="flex-1 px-3 space-y-2 mt-4">
            <SidebarAction
              custom={0}
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
              active={pathname === "/dashboard"}
              expanded={isExpanded}
              href="/dashboard"
            />
            <SidebarAction
              custom={1}
              icon={<Rss size={20} />}
              label="Feed"
              active={pathname === "/feed"}
              expanded={isExpanded}
              href="/feed"
            />
          </nav>

          <div className="px-3 pb-6 space-y-3 border-t border-white/5 pt-6 relative">
            {/* SEARCH */}
            <motion.div layout>
              <SearchOverlay isSidebar expanded={isExpanded} />
            </motion.div>

            {/* POST THOUGHT */}
            <motion.button
              layout
              onClick={() => setIsModalOpen(true)}
              className="flex items-center w-full h-12 rounded-xl bg-transparent hover:bg-white/5 cursor-pointer group overflow-hidden relative"
            >
              <motion.div
                layout="position"
                className="w-12 h-12 flex items-center justify-center shrink-0"
              >
                <PlusCircle
                  size={22}
                  className="text-sky-400 group-hover:scale-110 transition-transform"
                />
              </motion.div>
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.span
                    custom={2}
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="text-[14px] font-medium text-white/90 whitespace-nowrap pl-2"
                  >
                    Post Thought
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <div className="h-px bg-white/5 my-2" />

            <SidebarAction
              custom={3}
              icon={<Settings size={18} />}
              label="Settings"
              expanded={isExpanded}
              href="/settings"
            />

            <SidebarAction
              custom={4}
              icon={<LogOut size={18} />}
              label="Sign out"
              expanded={isExpanded}
              onClick={handleLogout}
              className="text-red-400/60 hover:text-red-400"
            />

            {/* USER PROFILE */}
            <motion.div
              layout
              className={`mt-2 flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/5 ${
                !isExpanded && "justify-center"
              }`}
            >
              <motion.div
                layout="position"
                className="h-8 w-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center shrink-0"
              >
                <UserIcon size={14} className="text-white/40" />
              </motion.div>
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.div
                    custom={5}
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden whitespace-nowrap"
                  >
                    <p className="text-[11px] font-bold text-white leading-none">
                      Shpend
                    </p>
                    <p className="text-[9px] text-white/30 mt-1">
                      Personal Pro
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* TOGGLE BUTTON - Outside the overflow-hidden wrapper but inside the aside */}
        <div
          className="absolute -right-3 top-24 z-50 flex items-center justify-center"
          onMouseEnter={() => setIsHoveringToggle(true)}
          onMouseLeave={() => setIsHoveringToggle(false)}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {isHoveringToggle && (
              <motion.div
                variants={tooltipVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="absolute left-full ml-2 px-2 py-1 rounded-md bg-white text-black text-[10px] whitespace-nowrap font-medium pointer-events-none"
              >
                {isExpanded ? "Collapse menu" : "Open Menu"}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 rounded-full bg-slate-100 text-black flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] border border-white/20 hover:scale-110 hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-300"
          >
            {isExpanded ? (
              <ChevronLeft size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>
        </div>
      </motion.aside>

      <PostThoughtModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPosted={() => router.refresh()}
      />
    </>
  );
}

import Link from "next/link";

// ... existing code ...

function SidebarAction({
  icon,
  label,
  onClick,
  expanded,
  active,
  custom,
  href,
  className = "",
}: any) {
  const content = (
    <>
      <motion.div
        layout="position"
        className="w-12 h-12 flex items-center justify-center shrink-0"
      >
        {icon}
      </motion.div>
      <AnimatePresence mode="wait">
        {expanded && (
          <motion.span
            custom={custom}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-[13px] font-medium whitespace-nowrap pl-2"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );

  const containerClass = `flex items-center w-full h-12 rounded-xl cursor-pointer overflow-hidden relative ${
    active
      ? "bg-white/10 text-white"
      : "text-white/40 hover:bg-white/5 hover:text-white"
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={containerClass}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      layout
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className={containerClass}
    >
      {content}
    </motion.button>
  );
}

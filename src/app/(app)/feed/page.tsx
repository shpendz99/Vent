"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CalendarProfileGrid from "@/components/tools/CalendarProfileGrid";
import { Lock, MessageSquare, Heart, MoreHorizontal } from "lucide-react";

const FILTERS = [
  { label: "ALL", emoji: "" },
  { label: "OVERTHINKING", emoji: "🧠" },
  { label: "ANXIETY", emoji: "😰" },
  { label: "GRATITUDE", emoji: "✨" },
  { label: "LATE NIGHT", emoji: "🌙" },
];

import { supabaseBrowser } from "@/lib/supabase/client";
import { useEffect } from "react";

// Types
type Thought = {
  id: string;
  content: string;
  created_at: string;
  rooms: string[];
  user_id: string;
  profiles: {
    username: string;
  } | null;
};

export default function FeedPage() {
  // null = "ALL" active; string[] = specific filters selected
  const [selectedFilters, setSelectedFilters] = useState<string[] | null>(null);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedThoughts, setExpandedThoughts] = useState<Set<string>>(
    new Set(),
  );
  const [showSidebar, setShowSidebar] = useState(true);
  const isPro = false;

  const ALL_LABELS = FILTERS.slice(1).map((f) => f.label); // Exclude "ALL"

  useEffect(() => {
    // Load module settings
    const storedSidebar = localStorage.getItem("ventora_module_sidebar");
    if (storedSidebar !== null) setShowSidebar(storedSidebar === "true");

    async function fetchThoughts() {
      setLoading(true);
      // Artificial delay for loading skeleton as requested
      const minDelay = new Promise((resolve) => setTimeout(resolve, 1000));

      const supabase = supabaseBrowser();

      try {
        // 1. Fetch Thoughts
        // Note: We select user_id explicitly to map it later
        const { data: thoughtsData, error: thoughtsError } = await supabase
          .from("thoughts")
          .select("id, content, created_at, rooms, user_id")
          .eq("visibility", "public")
          .order("created_at", { ascending: false });

        if (thoughtsError) {
          console.error("Error fetching thoughts table:", thoughtsError);
          throw thoughtsError;
        }

        // 2. Fetch Profiles for those thoughts
        const userIds = Array.from(
          new Set(
            (thoughtsData || []).map((t: any) => t.user_id).filter(Boolean),
          ),
        );

        let profilesMap: Record<string, { username: string }> = {};

        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", userIds);

          if (profilesError) {
            console.error("Error fetching profiles:", profilesError);
          } else {
            profilesData?.forEach((p: any) => {
              profilesMap[p.id] = { username: p.username };
            });
          }
        }

        // 3. Merge
        const combined = (thoughtsData || []).map((t: any) => ({
          ...t,
          profiles: profilesMap[t.user_id] || null,
        }));

        setThoughts(combined as Thought[]);
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        await minDelay;
        setLoading(false);
      }
    }

    fetchThoughts();
  }, []);

  function handleToggle(label: string) {
    if (label === "ALL") {
      setSelectedFilters(null);
      return;
    }

    if (selectedFilters === null) {
      setSelectedFilters([label]);
      return;
    }

    let next: string[];
    if (selectedFilters.includes(label)) {
      next = selectedFilters.filter((l) => l !== label);
    } else {
      next = [...selectedFilters, label];
    }

    // If nothing selected, go back to ALL
    if (next.length === 0) {
      setSelectedFilters(null);
      return;
    }

    // If all options selected, go back to ALL
    if (next.length === ALL_LABELS.length) {
      setSelectedFilters(null);
      return;
    }

    setSelectedFilters(next);
  }

  const isAllActive = selectedFilters === null;

  // Filter Logic
  const filteredThoughts = thoughts.filter((thought) => {
    if (isAllActive) return true;

    // Check if any of the thought's rooms match any of the selected filters
    const thoughtRoomsLower = (thought.rooms || []).map((r) => r.toLowerCase());
    const selectedFiltersLower = selectedFilters.map((f) => f.toLowerCase());

    return thoughtRoomsLower.some((r) => selectedFiltersLower.includes(r));
  });

  const toggleExpand = (id: string) => {
    setExpandedThoughts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Time Ago Helper
  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min. ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr. ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  // Room Colors Helper from RoomsFeed
  const pillColors: Record<string, string> = {
    Overthinking: "text-sky-200",
    Anxiety: "text-rose-200",
    Gratitude: "text-amber-200",
    "Late night": "text-indigo-200",
    Venting: "text-slate-200", // Fallback
  };

  return (
    <main className="relative min-h-screen bg-[#030712] overflow-x-hidden">
      {/* Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          height: "100vh",
          backgroundImage:
            `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),` +
            `linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(circle at 50% 0%, black 10%, rgba(0,0,0,0.5) 40%, transparent 80%)",
        }}
      />

      <div className="relative z-10 pt-24 lg:pt-10 pb-20 w-[min(90%,1300px)] mx-auto">
        {/* TOP FILTERS */}
        <div className="flex flex-wrap gap-3 mb-12">
          {FILTERS.map((filter) => {
            const active =
              filter.label === "ALL"
                ? isAllActive
                : !isAllActive && selectedFilters?.includes(filter.label);

            return (
              <button
                key={filter.label}
                onClick={() => handleToggle(filter.label)}
                className={`
                 inline-flex items-center gap-1
                 rounded-md                      
                 border      
                 px-3.5 py-1.5                 
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
                {filter.label} {filter.emoji}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col xl:flex-row gap-12 max-w-7xl">
          {/* LEFT: FEED STREAM */}
          <section className="flex-1 space-y-6 min-w-0">
            <div className="max-w-3xl w-full space-y-6">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  // SKELETON LOADING
                  [1, 2, 3].map((i) => (
                    <motion.div
                      key={`skeleton-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full rounded-xl bg-[#020616] border border-slate-800 px-4 py-3 md:px-5 md:py-4 animate-pulse"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                        <div className="h-4 bg-slate-800 rounded w-16"></div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <div className="h-3 bg-slate-800 rounded w-full"></div>
                        <div className="h-3 bg-slate-800 rounded w-5/6"></div>
                      </div>
                      <div className="flex justify-end mt-4 pt-2">
                        <div className="h-3 bg-slate-800 rounded w-24"></div>
                      </div>
                    </motion.div>
                  ))
                ) : filteredThoughts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 text-white/30 text-sm"
                  >
                    No thoughts found matching filters.
                  </motion.div>
                ) : (
                  filteredThoughts.map((thought) => {
                    const mainRoom = thought.rooms?.[0] || "Venting";
                    const colorClass = pillColors[mainRoom] || "text-slate-200";
                    const isExpanded = expandedThoughts.has(thought.id);
                    // Approx check for 3-4 lines (same as PrivateProfileCard)
                    const isLong = thought.content.length > 240;

                    return (
                      <motion.article
                        key={thought.id}
                        layout
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{
                          duration: 0.35,
                          ease: "easeOut",
                        }}
                        className="w-full rounded-xl bg-[#020616] border border-slate-800 px-4 py-3 md:px-5 md:py-4"
                      >
                        {/* Top Row: Title, Time, Tag */}
                        <div className="flex items-start justify-between gap-4 text-[11px] md:text-sm text-slate-200">
                          <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
                            <span className="font-medium text-slate-200">
                              Thread
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">
                              {formatTimeAgo(thought.created_at)}
                            </span>
                          </div>

                          <span
                            className={`text-xs md:text-sm font-medium ${colorClass}`}
                          >
                            {mainRoom}
                          </span>
                        </div>

                        {/* Body with Truncation */}
                        <div className="mt-2 text-[12px] md:text-sm leading-relaxed text-slate-300">
                          {isLong && !isExpanded ? (
                            <>
                              {thought.content.slice(0, 240)}...{" "}
                              <button
                                onClick={() => toggleExpand(thought.id)}
                                className="text-sky-400 hover:underline font-medium ml-1 relative z-10 cursor-pointer"
                              >
                                Show more
                              </button>
                            </>
                          ) : (
                            <>
                              {thought.content}
                              {isLong && isExpanded && (
                                <div className="mt-1">
                                  <button
                                    onClick={() => toggleExpand(thought.id)}
                                    className="text-slate-500 hover:text-slate-300 text-xs hover:underline relative z-10"
                                  >
                                    Show less
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Bottom Row: Just Username */}
                        <div className="mt-3 flex justify-end">
                          <span className="text-[11px] md:text-xs text-slate-400">
                            @{thought.profiles?.username || "anonymous"}
                          </span>
                        </div>
                      </motion.article>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* RIGHT: PRO PERK SIDEBAR */}
          {showSidebar && (
            <aside className="hidden xl:block xl:w-[400px]">
              <div className="sticky top-10 space-y-8">
                <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/1 backdrop-blur-sm p-6">
                  {/* Visual Block for non-pro users */}
                  {!isPro && (
                    <div className="absolute inset-0 z-20 bg-[#030712]/40 backdrop-blur-xs flex flex-col items-center justify-center p-8 text-center">
                      <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/60">
                        <Lock size={20} />
                      </div>
                      <h3 className="text-white font-bold tracking-tight mb-2">
                        Calendar Insights
                      </h3>
                      <p className="text-[12px] text-white/40 mb-6 leading-relaxed">
                        Visualize your mental journey and track consistency with
                        Pro.
                      </p>
                      <button className="cursor-pointer relative inline-flex items-center justify-center px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white border border-borderc-accent bg-[radial-gradient(circle_at_top,var(--accent-primary),#0284C7)] shadow-[0_0_0_0_rgba(56,189,248,0)] hover:shadow-[0_0_30px_2px_rgba(56,189,248,0.35)] hover:brightness-110 transition-all duration-200 ease-out rounded-md">
                        Upgrade Now
                      </button>
                    </div>
                  )}

                  <div
                    className={
                      !isPro ? "opacity-20 grayscale pointer-events-none" : ""
                    }
                  >
                    <CalendarProfileGrid />
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}

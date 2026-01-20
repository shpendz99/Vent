"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";

type FilterType = "All" | "Public" | "Private";

const FILTERS: { id: FilterType; label: string; emoji?: string }[] = [
  { id: "All", label: "ALL" },
  { id: "Public", label: "PUBLIC", emoji: "🌍" },
  { id: "Private", label: "PRIVATE", emoji: "🔒" },
];

type Thought = {
  id: string;
  type: "Public" | "Private";
  title: string;
  timeAgo: string;
  body: string;
  username?: string; // We'll keep this optional
};

const typeColors: Record<"Public" | "Private", string> = {
  Public: "text-sky-200",
  Private: "text-rose-200",
};

// Helper: Time ago
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

// Helper: Extract title from content
function extractTitle(content: string) {
  if (!content) return "New Thought";
  // Attempt to split by first sentence or first 5-6 words
  const firstSentence = content.split(/[.!?]/)[0];
  // If the first sentence is reasonably short, use it
  if (firstSentence.length > 5 && firstSentence.length < 50)
    return firstSentence;

  // Otherwise truncate to first 5 words
  const words = content.split(" ");
  return words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");
}

export default function PrivateProfileCard() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedThoughts, setExpandedThoughts] = useState<Set<string>>(
    new Set()
  );
  const [privacyMode, setPrivacyMode] = useState(false);
  const supabase = supabaseBrowser();

  useEffect(() => {
    // Check privacy mode
    const savedPrivacy = localStorage.getItem("ventora_privacy_mode");
    setPrivacyMode(savedPrivacy === "true");

    async function fetchThoughts() {
      setLoading(true);
      // 1. Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 2. Fetch thoughts
      const { data, error } = await supabase
        .from("thoughts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const formatted: Thought[] = data.map((item: any) => ({
          id: item.id,
          type: item.visibility === "public" ? "Public" : "Private",
          title: extractTitle(item.content),
          timeAgo: formatTimeAgo(item.created_at),
          body: item.content,
        }));
        setThoughts(formatted);
      }
      setLoading(false);
    }

    fetchThoughts();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedThoughts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visibleItems =
    activeFilter === "All"
      ? thoughts
      : thoughts.filter((t) => t.type === activeFilter);

  return (
    <div className="w-full space-y-4">
      {/* HEADER + FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Thoughts</h2>
          {/* Removed post count as per request */}
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`
                  inline-flex items-center gap-1
                  rounded-md                      
                  border border-slate-700/70      
                  px-3.5 py-1.5                 
                  uppercase tracking-[0.14em]
                  text-[10px] md:text-[11px]
                  cursor-pointer select-none
                  shadow-[0_2px_4px_rgba(0,0,0,0.35)]
                  transition-all duration-150
                  ${
                    isActive
                      ? "border-sky-400/80 bg-slate-900/80 text-sky-100 shadow-[0_0_12px_rgba(56,189,248,0.45)]"
                      : "bg-slate-900/40 text-slate-400 hover:border-slate-500 hover:text-slate-100"
                  }
                `}
              >
                <span>{filter.label}</span>
                {filter.emoji && (
                  <span className="text-[13px] md:text-sm leading-none">
                    {filter.emoji}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* FEED LIST */}
      <div className="relative">
        {/* Limits height and allows scroll if needed. Added 'search-scroll' for custom styling */}
        <div className="space-y-3 pb-4 max-h-[400px] overflow-y-auto pr-1 search-scroll">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Loading thoughts...
              </div>
            ) : visibleItems.length > 0 ? (
              visibleItems.map((item) => {
                const isExpanded = expandedThoughts.has(item.id);
                // Approx check for "long" text.
                // Let's say ~240 chars fits 3 lines, so >300 is safe bet for 4+ lines.
                // Or we can be stricter.
                const isLong = item.body.length > 280;

                return (
                  <motion.article
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{
                      duration: 0.35,
                      ease: "easeOut",
                    }}
                    className="w-full rounded-xl bg-[#020616] border border-slate-800 px-4 py-3 md:px-5 md:py-4 group"
                  >
                    {/* Top row: title + time, type on right */}
                    <div className="flex items-start justify-between gap-4 text-[11px] md:text-sm text-slate-200">
                      <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{item.timeAgo}</span>
                      </div>
                      <span
                        className={`text-xs md:text-sm font-medium ${
                          typeColors[item.type]
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>

                    {/* Body */}
                    <div
                      className={`mt-2 text-[12px] md:text-sm leading-relaxed text-slate-300 transition-all duration-300
                        ${
                          privacyMode
                            ? "filter blur-sm select-none hover:blur-none"
                            : ""
                        }
                      `}
                    >
                      {isLong && !isExpanded ? (
                        <>
                          {item.body.slice(0, 280)}...{" "}
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="text-sky-400 hover:underline font-medium ml-1 relative z-10 cursor-pointer"
                          >
                            Show more
                          </button>
                        </>
                      ) : (
                        <>
                          {item.body}
                          {isLong && isExpanded && (
                            <div className="mt-1">
                              <button
                                onClick={() => toggleExpand(item.id)}
                                className="text-slate-500 hover:text-slate-300 text-xs hover:underline relative z-10"
                              >
                                Show less
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Username bottom-right if public */}
                    {item.username && (
                      <div className="mt-3 flex justify-end">
                        <span className="text-[11px] md:text-xs text-slate-400">
                          {item.username}
                        </span>
                      </div>
                    )}
                  </motion.article>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                {visibleItems.length === 0 && !loading
                  ? "No thoughts found."
                  : ""}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

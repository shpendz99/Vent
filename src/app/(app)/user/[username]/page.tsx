"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { MessageSquare, Globe, Zap, Heart } from "lucide-react";

export default function PublicProfilePage() {
  const params = useParams();
  const rawUsername = params.username as string; // captures "@peter"
  const username = rawUsername.replace("%40", "@"); // handles URL encoding

  /* LEFT: FEED STREAM */
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Set<string>>(
    new Set(),
  );

  // Helper functions
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

  // Mood colors for border and glow
  const moodColors: Record<string, string> = {
    Overthinking:
      "border-l-sky-400 shadow-[inset_10px_0_20px_-10px_rgba(56,189,248,0.15)]",
    Anxiety:
      "border-l-rose-400 shadow-[inset_10px_0_20px_-10px_rgba(251,113,133,0.15)]",
    Gratitude:
      "border-l-amber-400 shadow-[inset_10px_0_20px_-10px_rgba(251,191,36,0.15)]",
    "Late night":
      "border-l-indigo-400 shadow-[inset_10px_0_20px_-10px_rgba(129,140,248,0.15)]",
    Venting:
      "border-l-slate-400 shadow-[inset_10px_0_20px_-10px_rgba(148,163,184,0.15)]",
  };

  const moodLeftBorder: Record<string, string> = {
    Overthinking: "bg-sky-500",
    Anxiety: "bg-rose-500",
    Gratitude: "bg-amber-500",
    "Late night": "bg-indigo-500",
    Venting: "bg-slate-500",
  };

  const toggleExpand = (id: string) => {
    setExpandedThoughts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = supabaseBrowser();

      // 1. Fetch Profile by Username
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", username)
        .single();

      if (profileError || !profileData) {
        console.error("Error fetching profile:", profileError);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // 2. Fetch Public Thoughts for this User
      const { data: thoughtsData, error: thoughtsError } = await supabase
        .from("thoughts")
        .select("id, content, created_at, rooms, user_id")
        .eq("user_id", profileData.id)
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

      if (thoughtsError) {
        console.error("Error fetching thoughts:", thoughtsError);
      } else {
        // Map thoughts to include profile info
        const mappedThoughts = thoughtsData.map((t: any) => ({
          ...t,
          profiles: { username: profileData.username },
        }));
        setThoughts(mappedThoughts);
      }
      setLoading(false);
    }
    fetchData();
  }, [username]);

  // Render a single thought card
  const renderThoughtCard = (thought: any) => {
    const mainRoom = thought.rooms?.[0] || "Venting";
    const borderClass =
      moodColors[mainRoom] ||
      "border-l-slate-400 shadow-[inset_10px_0_20px_-10px_rgba(148,163,184,0.15)]";
    const leftBarColor = moodLeftBorder[mainRoom] || "bg-slate-500";
    const isExpanded = expandedThoughts.has(thought.id);
    const isLong = thought.content.length > 240;

    return (
      <article
        key={thought.id}
        className={`
          relative overflow-hidden rounded-xl 
          bg-gradient-to-br from-[#0b0f19] to-[#05080f]
          border border-white/5 
          px-5 py-5 
          transition-all duration-300 hover:border-white/10
        `}
      >
        {/* Glowing Left Border Stripe */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-[3px] ${leftBarColor} shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10`}
        />

        {/* Inner Glow Effect */}
        <div
          className={`absolute inset-0 pointer-events-none opacity-20 ${borderClass}`}
        />

        {/* Top Row: Title, Date, Public Badge */}
        <div className="flex items-center justify-between gap-4 mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              <img
                src={
                  profile?.avatar_url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
                }
                alt="avatar"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-white/90 leading-tight">
                {profile?.display_name ||
                  thought.profiles?.username ||
                  "Anonymous"}
              </span>
              <span className="text-[11px] text-white/40">
                {formatTimeAgo(thought.created_at)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
              <Globe size={10} /> Public
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="relative z-10">
          <p className="text-[13px] md:text-[14px] leading-relaxed text-slate-300 font-light">
            {isLong && !isExpanded ? (
              <>
                {thought.content.slice(0, 240)}...{" "}
                <button
                  onClick={() => toggleExpand(thought.id)}
                  className="text-sky-400 hover:text-sky-300 font-medium ml-1 cursor-pointer transition-colors"
                >
                  Read more
                </button>
              </>
            ) : (
              <>
                {thought.content}
                {isLong && isExpanded && (
                  <div className="mt-1">
                    <button
                      onClick={() => toggleExpand(thought.id)}
                      className="text-white/40 hover:text-white/60 text-xs mt-2 transition-colors"
                    >
                      Show less
                    </button>
                  </div>
                )}
              </>
            )}
          </p>
        </div>

        {/* Footer / Interaction Placeholder */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-end gap-4 relative z-10">
          <div className="flex items-center gap-1.5 text-white/20 hover:text-white/40 transition-colors cursor-pointer group">
            <Heart
              size={14}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="text-[11px] font-medium">0</span>
          </div>
        </div>
      </article>
    );
  };

  const leftColumnThoughts = thoughts.filter((_, i) => i % 2 === 0);
  const rightColumnThoughts = thoughts.filter((_, i) => i % 2 !== 0);

  return (
    <main className="relative min-h-screen bg-[#030712] overflow-x-hidden">
      {/* Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          height: "100vh",
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(circle at 50% 0%, black 10%, rgba(0,0,0,0.5) 40%, transparent 80%)",
        }}
      />

      <div className="relative z-10 pt-16 pb-20 px-6 ml-20 lg:ml-32">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* USER HEADER */}
          <div className="max-w-[720px] space-y-6">
            <div className="h-28 w-28 rounded-full border border-white/10 bg-white/5 p-1 overflow-hidden">
              <img
                src={
                  profile?.avatar_url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
                }
                className="w-full h-full rounded-full object-cover"
                alt="profile"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-bold text-white tracking-tight italic">
                {profile?.display_name || username}'s Void
              </h1>
              <p className="text-[12px] text-white/20 font-bold uppercase tracking-[0.5em]">
                Public Reflections
              </p>
            </div>
          </div>

          <div className="w-full">
            {/* PUBLIC THOUGHTS GRID */}
            <section className="w-full">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-40 rounded-xl bg-[#020616] border border-slate-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : thoughts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/5 mb-4">
                    <MessageSquare className="text-white/20" size={32} />
                  </div>
                  <h3 className="text-white/60 font-medium">
                    No public thoughts yet
                  </h3>
                  <p className="text-white/30 text-sm mt-1">
                    Check back later to see what{" "}
                    {profile?.display_name || username} shares.
                  </p>
                </div>
              ) : (
                <>
                  {/* MOBILE: Single Column */}
                  <div className="md:hidden flex flex-col gap-6">
                    {thoughts.map((thought) => renderThoughtCard(thought))}
                  </div>

                  {/* DESKTOP: 2-Col Masonry (Split Even/Odd) */}
                  <div className="hidden md:grid grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col gap-6">
                      {leftColumnThoughts.map((thought) =>
                        renderThoughtCard(thought),
                      )}
                    </div>
                    <div className="flex flex-col gap-6">
                      {rightColumnThoughts.map((thought) =>
                        renderThoughtCard(thought),
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

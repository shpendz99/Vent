"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

import { supabaseBrowser } from "@/lib/supabase/client";

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

  // Helper functions from Feed
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

  const pillColors: Record<string, string> = {
    Overthinking: "text-sky-200",
    Anxiety: "text-rose-200",
    Gratitude: "text-amber-200",
    "Late night": "text-indigo-200",
    Venting: "text-slate-200",
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
        // Map thoughts to include profile info (for consistency with Feed card structure)
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
          {/* USER HEADER - Moved out to align Sidebar with Thoughts */}
          <div className="max-w-[720px] space-y-6">
            <div className="h-28 w-28 rounded-full border border-white/10 bg-white/5 p-1 overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
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

          <div className="flex flex-col xl:flex-row gap-12 items-start">
            {/* LEFT: PUBLIC THOUGHTS */}
            <section className="flex-1 max-w-[720px] space-y-6">
              {loading ? (
                <div className="text-white/30 text-sm">Loading thoughts...</div>
              ) : thoughts.length === 0 ? (
                <div className="text-white/30 text-sm">
                  No public thoughts yet.
                </div>
              ) : (
                thoughts.map((thought) => {
                  const mainRoom = thought.rooms?.[0] || "Venting";
                  const colorClass = pillColors[mainRoom] || "text-slate-200";
                  const isExpanded = expandedThoughts.has(thought.id);
                  const isLong = thought.content.length > 240;

                  return (
                    <article
                      key={thought.id}
                      className="w-full rounded-xl bg-[#020616] border border-slate-800 px-4 py-3 md:px-5 md:py-4 transition-colors"
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
                    </article>
                  );
                })
              )}
            </section>

            {/* RIGHT: INSIGHTS SIDEBAR */}
            <aside className="xl:w-[380px] sticky top-10">
              <div className="w-full rounded-xl bg-[#020616] border border-slate-800 p-6 space-y-8">
                <h4 className="text-lg font-medium text-slate-200">Insights</h4>

                <div className="space-y-6">
                  {/* Mood Stability */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-300">
                      <span>Mood Stability</span>
                      <span>75%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-400 rounded-full"
                        style={{ width: "75%" }}
                      />
                    </div>
                  </div>

                  {/* Journal Consistency */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-300">
                      <span>Journal Consistency</span>
                      <span>40%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: "40%" }}
                      />
                    </div>
                  </div>

                  {/* Anxiety Levels */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-300">
                      <span>Anxiety Levels</span>
                      <span>60%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-400 rounded-full"
                        style={{ width: "60%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

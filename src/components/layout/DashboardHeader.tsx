"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function DashboardHeader() {
  const [profile, setProfile] = useState<{ display_name: string } | null>(null);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    async function getHeaderData() {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();
        setProfile(data);
        const { count } = await supabase
          .from("thoughts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        setPostCount(count || 0);
      }
    }
    getHeaderData();
  }, []);

  return (
    <div className="flex flex-col space-y-6">
      <div className="space-y-2">
        <h1 className="text-[44px] md:text-[68px] font-bold tracking-tight text-white leading-[1.05]">
          Good evening,{" "}
          <span className="text-white/85">
            {profile?.display_name || "Shpend"}
          </span>
          .
        </h1>
        <p className="text-[11px] md:text-[12px] text-white/30 font-bold uppercase tracking-[0.5em] ml-1">
          You have posted {postCount} {postCount === 1 ? "time" : "times"} this
          week
        </p>
      </div>
      <div className="h-[1px] w-28 bg-gradient-to-r from-white/20 to-transparent" />
    </div>
  );
}

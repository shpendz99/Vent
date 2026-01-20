"use server";

import { supabaseServer } from "@/lib/supabase/server";

export type SearchUser = {
  id: string;
  name: string;
  username: string;
};

export type SearchThought = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
  } | null;
};

export type SearchSuggestions = {
  users: SearchUser[];
  thoughts: SearchThought[];
};

export async function getRandomSuggestions(): Promise<SearchSuggestions> {
  const supabase = supabaseServer();

  try {
    // 1. Fetch Random Users (up to 3)
    // We'll fetch up to 10 to shuffle, same as before
    const { data: profiles, error: profilesError, count } = await supabase
      .from("profiles")
      .select("id, display_name, username", { count: 'exact' })
      .limit(10);

    console.log("Fetching profiles...", { 
      count: profiles?.length, 
      error: profilesError?.message, 
      firstProfile: profiles?.[0] 
    });

    let finalUsers: SearchUser[] = [];

    if (!profilesError && profiles && profiles.length > 0) {
      const formattedUsers: SearchUser[] = profiles.map((p) => ({
        id: p.id,
        name: p.display_name || p.username || "Unknown",
        username: p.username || "unknown",
      }));

      // Shuffle and pick 3
      if (formattedUsers.length <= 3) {
        finalUsers = formattedUsers;
      } else {
        finalUsers = formattedUsers.sort(() => 0.5 - Math.random()).slice(0, 3);
      }
    }

    // 2. Fetch Random Public Thoughts (up to 3)
    // Fetch thoughts first without the join to avoid relation errors
    const { data: thoughts, error: thoughtsError } = await supabase
      .from("thoughts")
      .select("id, content, created_at, user_id")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(10);

    let finalThoughts: SearchThought[] = [];

    if (!thoughtsError && thoughts && thoughts.length > 0) {
      // Manually fetch profiles for these thoughts
      const userIds = Array.from(new Set(thoughts.map(t => t.user_id)));
      
      const { data: thoughtProfiles, error: profileFetchError } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);
        
      const profileMap = new Map();
      if (thoughtProfiles) {
        thoughtProfiles.forEach(p => profileMap.set(p.id, p));
      }

      const thoughtsWithProfiles = thoughts.map(t => ({
        ...t,
        profiles: { username: profileMap.get(t.user_id)?.username || "anonymous" }
      }));

      // Shuffle and pick 3
      let candidates = thoughtsWithProfiles as unknown as SearchThought[];
      if (candidates.length <= 3) {
        finalThoughts = candidates;
      } else {
        finalThoughts = candidates.sort(() => 0.5 - Math.random()).slice(0, 3);
      }
    }

    // Check auth state for debugging
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("Search Action - User:", user?.id, "Auth Error:", authError?.message);

    if (profilesError) console.error("Profiles Error:", profilesError);
    if (thoughtsError) console.error("Thoughts Error:", thoughtsError);

    console.log("Random suggestions fetched:", {
      usersCount: finalUsers.length,
      thoughtsCount: finalThoughts.length,
      profilesError: profilesError?.message,
      thoughtsError: thoughtsError?.message
    });

    return {
      users: finalUsers,
      thoughts: finalThoughts,
    };
  } catch (err) {
    console.error("Unexpected error in getRandomSuggestions:", err);
    return { users: [], thoughts: [] };
  }
}

export async function searchGlobal(query: string): Promise<SearchSuggestions> {
  const supabase = supabaseServer();
  const q = `%${query}%`;

  try {
    // 1. Search Users
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name, username")
      .or(`display_name.ilike.${q},username.ilike.${q}`)
      .limit(5);

    let foundUsers: SearchUser[] = [];

    if (!profilesError && profiles) {
      foundUsers = profiles.map((p) => ({
        id: p.id,
        name: p.display_name || p.username || "Unknown",
        username: p.username || "unknown",
      }));
    }

    // 2. Search Thoughts
    // Fetch without nested select first
    const { data: thoughts, error: thoughtsError } = await supabase
      .from("thoughts")
      .select("id, content, created_at, user_id")
      .eq("visibility", "public")
      .ilike("content", q)
      .order("created_at", { ascending: false })
      .limit(5);

    let foundThoughts: SearchThought[] = [];

    if (!thoughtsError && thoughts && thoughts.length > 0) {
      // Manually fetch profiles
      const userIds = Array.from(new Set(thoughts.map(t => t.user_id)));
      const { data: thoughtProfiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

      const profileMap = new Map();
      if (thoughtProfiles) {
        thoughtProfiles.forEach(p => profileMap.set(p.id, p));
      }

      foundThoughts = thoughts.map(t => ({
        ...t,
        profiles: { username: profileMap.get(t.user_id)?.username || "anonymous" }
      })) as SearchThought[];
    }

    return {
      users: foundUsers,
      thoughts: foundThoughts,
    };
  } catch (err) {
    console.error("Unexpected error in searchGlobal:", err);
    return { users: [], thoughts: [] };
  }
}

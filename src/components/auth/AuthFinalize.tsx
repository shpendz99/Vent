"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

const PENDING_KEY = "ventura_pending_signup";
const REDIRECT_KEY = "ventura_redirected_after_confirm";

function sentKey(email: string) {
  return `ventura_signup_link_sent:${email.toLowerCase()}`;
}

export default function AuthFinalize() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    (async () => {
      const DO_NOT_AUTO_REDIRECT = ["/reset-password", "/forgot-password"];
      if (DO_NOT_AUTO_REDIRECT.includes(pathname)) {
        sessionStorage.removeItem(REDIRECT_KEY);
        return;
      }

      if (sessionStorage.getItem(REDIRECT_KEY) === "1") return;

      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return;

      // 1) Try to finish onboarding from localStorage (same device/browser)
      let intentToSave: string | null = null;

      const raw = localStorage.getItem(PENDING_KEY);
      if (raw) {
        try {
          const pending = JSON.parse(raw) as { email: string; intent: string; createdAt: number };
          intentToSave = pending.intent ?? null;

          // clear local keys
          localStorage.removeItem(PENDING_KEY);
          localStorage.removeItem(sentKey(pending.email));
        } catch {
          // ignore parse errors
          localStorage.removeItem(PENDING_KEY);
        }
      }

      // 2) Fallback: use user metadata (works even if confirm happens on another device)
      if (!intentToSave) {
        intentToSave = (user.user_metadata as any)?.intent ?? null;
      }

      // Save profile if we have intent
      if (intentToSave) {
        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert({ id: user.id, intent: intentToSave }, { onConflict: "id" });

        if (upsertError) {
          console.error("Profile upsert failed:", upsertError);
          // Don't redirect-loop if DB temporarily fails
          return;
        }
      }

      // Redirect to dashboard after session is established
      const target = "/dashboard";
      if (pathname === target) return;

      sessionStorage.setItem(REDIRECT_KEY, "1");
      router.replace(target);
    })();
  }, [router, pathname]);

  return null;
}

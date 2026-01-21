"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState("Finalising sign in…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const supabase = supabaseBrowser();

        const code = searchParams.get("code");
        const next = searchParams.get("next") || "/dashboard";

        // ✅ Guard: no code in URL = nothing to exchange
        if (!code) {
          setMsg("Missing code in callback URL.");
          // send somewhere safe
          router.replace("/");
          return;
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (cancelled) return;

        if (error) {
          console.error("exchangeCodeForSession error:", error);
          setMsg(error.message || "Could not sign you in.");
          router.replace("/?auth=error");
          return;
        }

        // ✅ Success → go to dashboard (or next)
        router.replace(next);
      } catch (e) {
        console.error(e);
        setMsg("Something went wrong finishing sign in.");
        router.replace("/?auth=error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-sm text-white/70">
        {msg}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="rounded-2xl border border-white/10 bg-white/3 px-6 py-5 text-sm text-white/70">
            Finalising sign in…
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

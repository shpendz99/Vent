"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import NavbarApp from "@/components/layout/NavbarApp";
import { Navbar } from "@/components/layout/Navbar";
import { CustomToaster } from "@/components/tools/CustomToaster";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <div className="flex min-h-screen bg-[#030712]">
      {/* DESKTOP SIDEBAR - Only show if logged in */}
      {isLoggedIn && <NavbarApp />}

      {/* MOBILE NAVBAR - Show for everyone, pass auth state */}
      <div className="block lg:hidden">
        <Navbar isLoggedIn={isLoggedIn} />
      </div>

      <main className="flex-1 relative">{children}</main>

      <CustomToaster />
    </div>
  );
}

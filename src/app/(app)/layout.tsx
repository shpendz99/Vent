"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import NavbarApp from "@/components/layout/NavbarApp";
import { Navbar } from "@/components/layout/Navbar";
import { CustomToaster } from "@/components/tools/CustomToaster";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/"); // public landing
        return;
      }

      setReady(true);
    })();
  }, [router]);

  if (!ready) return null;

  // We need a context or just a simple layout shift.
  // Since the Sidebar state is internal to NavbarApp, we can't easily sync the margin without lifting state.
  // HOWEVER, the user asked for "reactable component" and "slightly push".
  // Best approach: Make NavbarApp NOT fixed, but sticky or just relative within a flex container.
  // But wait, my previous Sidebar code used `fixed` positioning.
  // I should probably change sidebar to `sticky` or proper flex item in the next step if I want it to push.
  // For now, let's just scaffold the flex layout assuming NavbarApp will be updated to be a flex item.

  return (
    <div className="flex min-h-screen bg-[#030712]">
      {/* 
        DESKTOP SIDEBAR 
        NavbarApp (aka Sidebar) is hidden on mobile (lg:hidden) inside the component itself or via wrapper 
        (It currently has 'hidden lg:flex' class).
      */}
      <NavbarApp />

      {/* 
        MOBILE NAVBAR
        We only show this on screens < lg. 
      */}
      <div className="block lg:hidden">
        <Navbar isLoggedIn={true} />
      </div>

      <main className="flex-1 relative">{children}</main>

      <CustomToaster />
    </div>
  );
}

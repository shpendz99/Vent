"use client";

import DashboardHeader from "@/components/layout/DashboardHeader";
import CalendarProfileGrid from "@/components/tools/CalendarProfileGrid";
import PrivateProfileCard from "@/components/tools/PrivateProfileCard";
import InsightProfileStats from "@/components/tools/InsightProfileStats";

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen bg-[#030712] overflow-x-hidden text-slate-200">
      {/* GRID BACKGROUND */}
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
          WebkitMaskImage:
            "radial-gradient(circle at 50% 0%, black 10%, rgba(0,0,0,0.5) 40%, transparent 80%)",
        }}
      />

      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-transparent via-[#030712]/50 to-[#030712]" />

      <div className="relative z-10 pt-10 pb-20 px-4 max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <DashboardHeader />
        </section>

        {/* THOUGHTS SECTION */}
        <section className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          <div className="rounded-2xl border border-white/5 bg-white/1 backdrop-blur-sm shadow-xl p-5 md:p-6">
            <PrivateProfileCard />
          </div>
        </section>

        {/* BOTTOM SPLIT SECTION */}
        <section className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          {/* CALENDAR (75%) */}
          <div className="w-full lg:w-[75%] flex flex-col">
            <div className="flex-1 rounded-2xl border border-white/5 bg-white/1 backdrop-blur-sm shadow-xl p-5 md:p-6 relative overflow-visible">
              <div className="w-full flex justify-center">
                <CalendarProfileGrid />
              </div>
            </div>
          </div>

          {/* INSIGHTS (25%) */}
          <div className="w-full lg:w-[25%] flex flex-col">
            <div className="flex-1 rounded-2xl border border-white/5 bg-white/1 backdrop-blur-sm shadow-xl min-h-[300px]">
              <InsightProfileStats />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

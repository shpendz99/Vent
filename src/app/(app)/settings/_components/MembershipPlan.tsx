"use client";

import { motion } from "framer-motion";
import { Check, Info } from "lucide-react";
import { useToastStore } from "@/hooks/use-toast-store";

export default function MembershipPlan() {
  const addToast = useToastStore((state) => state.addToast);

  const handleNotify = () => {
    addToast("You've been added to the waitlist!", "success");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* CURRENT PLAN - STANDARD */}
        <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-8 relative overflow-hidden opacity-50 hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 right-0 p-4">
            <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wider text-white/60">
              Current Plan
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Standard</h3>
          <div className="text-3xl font-bold text-white mb-6">Free</div>

          <ul className="space-y-4 mb-8">
            {[
              "Basic Journaling",
              "Daily Inspiration Quotes",
              "Mood Tracking",
              "Public Community Access",
              "Limited History (30 days)",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-sm text-white/60"
              >
                <Check size={16} className="text-white/40" />
                {item}
              </li>
            ))}
          </ul>

          <button
            disabled
            className="w-full py-3 rounded-xl border border-white/10 bg-transparent text-xs font-bold uppercase tracking-wider text-white/30 cursor-not-allowed"
          >
            Active
          </button>
        </div>

        {/* PRO PLAN - COMING SOON */}
        <div className="flex-1 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent p-8 relative overflow-hidden opacity-50 hover:opacity-90 transition-opacity duration-500 group">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-accent-primary/20 blur-3xl rounded-full group-hover:bg-accent-primary/30 transition-colors" />

          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            Ventora Pro
            <span className="px-2 py-0.5 rounded text-[9px] bg-accent-primary/20 text-accent-primary border border-accent-primary/30">
              SOON
            </span>
          </h3>
          <div className="text-3xl font-bold text-white/50 mb-6 flex items-baseline gap-1">
            $TBD{" "}
            <span className="text-sm font-normal text-white/20">/ month</span>
          </div>

          <ul className="space-y-4 mb-8">
            {[
              "Unlimited History & Backup",
              "AI-Powered Insights",
              "Advanced Analytics",
              "Private Community Access",
              "Priority Support",
              "Custom Themes & Fonts",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-sm text-white/80"
              >
                <div className="p-0.5 rounded-full bg-accent-primary/20">
                  <Check size={12} className="text-accent-primary" />
                </div>
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={handleNotify}
            className="w-full cursor-pointer relative inline-flex items-center justify-center
                       px-8 py-3 text-[11px] font-semibold uppercase tracking-wider
                       text-white border border-borderc-accent
                       bg-[radial-gradient(circle_at_top,var(--accent-primary),#0284C7)]
                       shadow-[0_0_0_0_rgba(56,189,248,0)]
                       hover:shadow-[0_0_30px_2px_rgba(56,189,248,0.35)]
                       hover:brightness-110
                       transition-all duration-200 ease-out rounded-md"
          >
            Notify Me
          </button>

          <p className="text-center mt-3 text-[10px] text-white/30">
            Join the waitlist to get early access.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

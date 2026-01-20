"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Import the component you created
import AccountSection from "./_components/AccountsSection";
import MembershipPlan from "./_components/MembershipPlan";
import DataSection from "./_components/DataSection";

const TABS = [
  { id: "account", label: "Account" },
  { id: "membership", label: "Membership", badge: "Coming Soon" },
  { id: "data", label: "Data" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");

  return (
    <div className="w-full px-10 py-10 min-h-screen text-white bg-[#030712] relative">
      {/* Optional: Add the same grid background as the Dashboard for consistency */}

      <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>

      {/* --- SLIDING NAV --- */}
      <nav className="flex items-center gap-2 p-1 rounded-lg bg-white/5 border border-white/10 w-fit mb-12">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 cursor-pointer flex items-center gap-2
              ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              }
            `}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-white/10 rounded-md shadow-sm border border-white/5"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
            {tab.badge && (
              <span className="relative z-10 px-1.5 py-0.5 text-[9px] font-bold bg-white/20 rounded text-white/90">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* --- CONTENT AREA --- */}
      <div className="relative mt-10">
        <AnimatePresence mode="wait">
          {activeTab === "account" && <AccountSection key="account-tab" />}

          {activeTab === "membership" && (
            <MembershipPlan key="membership-tab" />
          )}

          {activeTab === "data" && <DataSection key="data-tab" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

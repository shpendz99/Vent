"use client";

import { motion } from "framer-motion";

const STATS = [
  { label: "Mood Stability", value: 75, color: "bg-emerald-400" },
  { label: "Journal Consistency", value: 40, color: "bg-amber-400" },
  { label: "Anxiety Levels", value: 60, color: "bg-rose-400" },
];

export default function InsightProfileStats() {
  return (
    <div className="h-full w-full p-5 flex flex-col">
      <h3 className="text-lg font-medium text-slate-100 mb-6">Insights</h3>

      <div className="flex-1 flex flex-col justify-center space-y-6">
        {STATS.map((stat, i) => (
          <div key={stat.label}>
            <div className="flex justify-between mb-2 text-xs md:text-sm text-slate-300">
              <span>{stat.label}</span>
              <span>{stat.value}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.value}%` }}
                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                className={`h-full rounded-full ${stat.color}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

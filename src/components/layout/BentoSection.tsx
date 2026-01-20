"use client";

import React from "react";
import { motion } from "framer-motion";
import { RoomsFeed } from "../tools/RoomsFeed";
import { SearchPreview } from "../tools/SearchPreview";
import CalendarBentoContent from "../tools/CalendarMoodGrid";
import PrivateCard from "../tools/PrivateCard";
import PatternsGrid from "../tools/PatternsGrid";

type BentoCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
  delay?: number;
};

const BentoCard: React.FC<BentoCardProps> = ({
  eyebrow,
  title,
  description,
  children,
  className = "",
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.9, // slower & smoother
        ease: [0.22, 0.55, 0.25, 0.95],
        delay,
      }}
      className={`
        relative
        flex flex-col
        overflow-hidden
        rounded-md
        border border-white/10
        bg-slate-900/70
        p-5 sm:p-6 lg:p-8
        shadow-[0_18px_45px_rgba(15,23,42,0.65)]
        ${className}
      `}
    >
      {/* EYEBROW */}
      {eyebrow && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {eyebrow}
        </p>
      )}

      {/* TITLE */}
      <h3 className="mt-1 text-sm sm:text-base lg:text-lg font-semibold text-slate-50">
        {title}
      </h3>

      {/* DESCRIPTION */}
      <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
        {description}
      </p>

      {/* CHILDREN – hidden on XS + SM */}
      {children && (
        <div className="hidden md:block mt-4 flex-1">{children}</div>
      )}
    </motion.div>
  );
};

const BentoSection: React.FC = () => {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
            YOUR MIND, AT A GLANCE
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-50">
            Rooms, journals, and patterns{" "}
            <span className="text-slate-300">all in one place.</span>
          </h2>
        </div>

        {/* GRID */}
        <div
          className="
            grid grid-cols-1
            md:grid-cols-2
            lg:grid-cols-4
            gap-4 sm:gap-5 lg:gap-6
            md:auto-rows-[240px]
            lg:auto-rows-[260px]
          "
        >
          {/* ROOMS */}
          <BentoCard
            eyebrow="Rooms"
            title="Rooms for every kind of thought."
            description="Overthinking, anxiety, gratitude and more."
            className="md:col-span-2 lg:col-span-2 lg:row-span-2"
            delay={0}
          >
            <RoomsFeed />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#0b0f1a]/60 to-transparent rounded-b-xl" />
          </BentoCard>

          {/* PRIVATE */}
          <BentoCard
            eyebrow="Private"
            title="Journals that stay with you."
            description="Write anything. Private entries never appear in public rooms."
            delay={0.15}
          >
            <PrivateCard />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#0b0f1a]/60 to-transparent rounded-b-xl" />
          </BentoCard>

          {/* CALENDAR */}
          <BentoCard
            eyebrow="Calendar"
            title="See your days at a glance."
            description="Bad days, better days, mapped in one place."
            delay={0.2}
          >
            <CalendarBentoContent />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#0b0f1a]/60 to-transparent rounded-b-xl" />
          </BentoCard>

          {/* SEARCH */}
          <BentoCard
            eyebrow="Search"
            title="Search your mind."
            description="Find entries by word, feeling, or room."
            delay={0}
          >
            {/* Only the search bar should go full width */}
            <div className="-mx-1 sm:-mx-2 lg:-mx-3">
              <SearchPreview />
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#0b0f1a]/60 to-transparent rounded-b-xl" />
          </BentoCard>

          {/* PATTERNS */}
          <BentoCard
            eyebrow="Patterns"
            title="Notice your patterns."
            description="See which rooms you visit most this month."
            delay={0.35}
          >
            <PatternsGrid />
          </BentoCard>
        </div>
      </div>
    </section>
  );
};

export default BentoSection;

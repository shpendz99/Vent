"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type Mood = "Overthinking" | "Anxiety" | "Gratitude" | "Late night" | "Venting";

type FeedItem = {
  title: string;
  time: string;
  mood: Mood;
  handle: string;
  excerpt: string;
};

const MOOD_DOT: Record<Mood, string> = {
  Overthinking: "bg-sky-400",
  Anxiety: "bg-amber-400",
  Gratitude: "bg-yellow-300",
  "Late night": "bg-violet-400",
  Venting: "bg-rose-400",
};

const FEED: FeedItem[] = [
  {
    title: "Fear of dying",
    time: "3 hr ago",
    mood: "Overthinking",
    handle: "@user5678",
    excerpt: "I keep imagining falling asleep and not waking up…",
  },
  {
    title: "Noise in my head",
    time: "18 min ago",
    mood: "Anxiety",
    handle: "@mira_09",
    excerpt: "Everything feels louder today. Even silence feels like pressure.",
  },
  {
    title: "Small win",
    time: "1 hr ago",
    mood: "Gratitude",
    handle: "@jaylen",
    excerpt: "I answered one email I’ve been avoiding for weeks. Tiny, but…",
  },
  {
    title: "Late night spiral",
    time: "11:42 pm",
    mood: "Late night",
    handle: "@softsignal",
    excerpt: "I replay conversations and rewrite them until I hate myself…",
  },
  {
    title: "I snapped",
    time: "Yesterday",
    mood: "Venting",
    handle: "@nocturne",
    excerpt: "I’m tired of being the “strong one.” I don’t want advice, I wa…",
  },
  {
    title: "Body anxiety",
    time: "2 hr ago",
    mood: "Anxiety",
    handle: "@luna_note",
    excerpt: "My stomach is in knots for no reason. I keep checking if…",
  },
  {
    title: "Why can’t I stop",
    time: "48 min ago",
    mood: "Overthinking",
    handle: "@orbiting",
    excerpt: "I make a plan, then I plan the plan, then I plan the failure…",
  },
  {
    title: "A quiet moment",
    time: "Today",
    mood: "Gratitude",
    handle: "@emberline",
    excerpt: "Sunlight hit my desk and I felt calm for five whole minutes. I…",
  },
  {
    title: "Tight chest",
    time: "6 hr ago",
    mood: "Anxiety",
    handle: "@signalnoise",
    excerpt: "I’m not in danger, but my body thinks I am. I want the alarm …",
  },
  {
    title: "Unsent message",
    time: "10:58 pm",
    mood: "Late night",
    handle: "@paperghost",
    excerpt: "I typed a paragraph to someone and deleted it. It sti…",
  },
];

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <div className="rounded-xl border border-slate-800/70 bg-slate-950/35 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:translate-x-[2px]">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-slate-300">{item.title}</span>
          <span className="text-slate-600">•</span>
          <span>{item.time}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${MOOD_DOT[item.mood]}`} />
          <span className="text-slate-300">{item.mood}</span>
        </div>
      </div>

      <div className="mt-2 text-sm text-slate-200 leading-snug">
        {item.excerpt}
      </div>

      <div className="mt-1 text-xs text-slate-500">{item.handle}</div>
    </div>
  );
}

export default function CarouselFields() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(sectionRef, { margin: "-20% 0px -20% 0px" });

  const [paused, setPaused] = useState(false);

  const paragraphs = useMemo(
    () => [
      "Ventura is built for overthinking—without the doom-scroll. Post a thought, choose a room, and let it live somewhere safe instead of in your head.",
      "Some days you just need to put it down. No debate. No performance. Just a quiet place to unload the loop and keep moving.",
      "Read what others share, then write when you’re ready. A small entry can be enough to change how heavy a day feels.",
    ],
    [],
  );

  const [pIndex, setPIndex] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const id = window.setInterval(() => {
      setPIndex((i) => (i + 1) % paragraphs.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [inView, paragraphs.length]);

  // Duplicate for seamless loop
  const items = useMemo(() => [...FEED, ...FEED], []);

  return (
    <section ref={sectionRef} className="relative w-full py-24">
      <div className="mx-auto max-w-6xl px-4">
        {/* ✅ TEXT ABOVE (recommended) */}
        <div className="mx-auto max-w-6xl px-4">
          {/* FEED FIRST */}
          <div
            className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950/15 p-4"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#050816] to-transparent z-10" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#050816] to-transparent z-10" />

            <div className="h-[420px]">
              <div
                className="marquee"
                style={{ animationPlayState: paused ? "paused" : "running" }}
              >
                {items.map((item, idx) => (
                  <div key={`${item.title}-${idx}`} className="mb-3">
                    <FeedCard item={item} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 text-xs text-slate-500">
              Hover the feed to pause.
            </div>
          </div>

          {/* TEXT BELOW (like your previous design) */}
          <div className="mt-14 max-w-4xl">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-50">
              A calmer place
              <br />
              to put it down.
            </h2>

            <div className="mt-4 max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.p
                  key={pIndex}
                  initial={{ opacity: 0, filter: "blur(14px)", y: 6 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  exit={{
                    opacity: 0,
                    filter: "blur(14px)",
                    y: -6,
                    transition: { duration: 0.55, ease: "easeInOut" },
                  }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="text-base md:text-lg leading-relaxed text-slate-300"
                >
                  {paragraphs[pIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes verticalMarquee {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .marquee {
          animation: verticalMarquee 26s linear infinite; /* slower */
          will-change: transform;
        }
      `}</style>
    </section>
  );
}

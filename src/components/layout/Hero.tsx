"use client";

import AnimatedText from "../tools/AnimatedText";
import YoutubeEmbed from "../tools/YoutubeEmbed";

export default function Hero() {
  return (
    <section
      className="relative min-h-screen w-full overflow-visible max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      style={{ marginTop: "calc(-1 * var(--navbar-height, 200px))" }}
    >
      {/* Grid overlay */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-0"
        style={{
          top: 0,
          height: "calc(100vh + var(--navbar-height, 80px))",
          backgroundImage:
            `linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),` +
            `linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: "0 0",
          maskImage:
            "radial-gradient(ellipse at 50% 20%, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.05) 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 20%, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.05) 85%)",
        }}
      />

      {/* TEXT AREA ---------------------------------------------------------- */}
      <div
        className="relative z-10 flex flex-col items-center justify-start px-4 text-center"
        style={{ marginTop: "calc(var(--navbar-height, 80px) + 12rem)" }}
      >
        <AnimatedText
          as="h1"
          delay={0}
          className="text-[48px] md:text-[72px] lg:text-[120px] leading-none font-bold tracking-tight text-text-primary max-w-6xl mx-auto"
        >
          A quieter place for your thoughts.
        </AnimatedText>

        <AnimatedText
          as="p"
          delay={0.3}
          className="mt-4 max-w-2xl text-sm md:text-base text-text-secondary leading-relaxed"
        >
          Share publicly when you want to be heard. Reflect privately when you
          want to understand yourself. Rooms for overthinking, anxiety,
          gratitude, late nights and more.
        </AnimatedText>

        <AnimatedText as="div" delay={0.6} className="mt-8">
          <button className="cursor-pointer relative inline-flex items-center justify-center px-8 py-3 text-sm md:text-base font-semibold uppercase tracking-wider text-white border border-borderc-accent bg-[radial-gradient(circle_at_top,var(--accent-primary),#0284C7)] shadow-[0_0_0_0_rgba(56,189,248,0)] hover:shadow-[0_0_30px_2px_rgba(56,189,248,0.35)] hover:brightness-110 transition-all duration-200 ease-out rounded-md">
            Get Started
          </button>
        </AnimatedText>
      </div>

      {/* VIDEO + GLOW ------------------------------------------------------- */}
      <div className="hidden lg:block relative z-10  flex-col items-center justify-start px-4 text-center left-1/2 max-w-6xl -translate-x-1/2 translate-y-[25%] pointer-events-none">
        <div className="relative pointer-events-none">
          {/* Pulsing glow behind the video container */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="h-full w-[150%] rounded-full bg-accent-overthinking/30 blur-3xl animate-pulse" />
          </div>

          {/* Video tray/container */}
          <div className="overflow-hidden bg-[rgba(3,7,18,0.96)] border border-slate-600/60 border-y-slate-500/80 shadow-[0_40px_80px_rgba(0,0,0,0.7)] rounded-md p-1 z-50">
            <YoutubeEmbed videoId="l3HklRyAYDc" className="w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

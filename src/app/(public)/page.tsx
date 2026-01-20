import BentoSection from "@/components/layout/BentoSection";
import CarouselFields from "@/components/layout/CarouselFeeds";
import Hero from "@/components/layout/Hero";
import ScrollText from "@/components/tools/ScrollText";

export default function Home() {
  return (
    <main className="relative flex flex-col">
      <Hero />

      <ScrollText
        eyebrow="Defining your quiet"
        text="Release Your Thoughts Digitally"
      />

      <BentoSection />

      <ScrollText
        eyebrow="A DIFFERENT KIND OF SOCIAL"
        text="Most entries are never replied to."
        secondaryText="That’s the point."
        // Optional tweak if you want the “wait” to feel longer:
        minHeightVh={700}
      />

      <CarouselFields />
    </main>
  );
}

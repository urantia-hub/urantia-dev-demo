import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SectionWrapper } from "@/components/SectionWrapper";
import { SearchSection } from "@/components/sections/SearchSection";
import { QuoteSection } from "@/components/sections/QuoteSection";
import { AudioSection } from "@/components/sections/AudioSection";
import { EntitySection } from "@/components/sections/EntitySection";
import { LookupSection } from "@/components/sections/LookupSection";
import { RoadmapSection } from "@/components/sections/RoadmapSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SectionWrapper
          id="search"
          title="Semantic Search"
          subtitle="Ask a question and find conceptually related passages — not just keyword matches."
        >
          <SearchSection />
        </SectionWrapper>
        <SectionWrapper
          id="quote"
          title="Random Quote"
          subtitle="Discover inspiring passages from the Urantia Papers."
        >
          <QuoteSection />
        </SectionWrapper>
        <SectionWrapper
          id="audio"
          title="Audio Player"
          subtitle="Listen to any passage read aloud in multiple voices."
        >
          <AudioSection />
        </SectionWrapper>
        <SectionWrapper
          id="entities"
          title="Entity Explorer"
          subtitle="Browse 4,400+ beings, places, and concepts mentioned in the Urantia Papers."
        >
          <EntitySection />
        </SectionWrapper>
        <SectionWrapper
          id="lookup"
          title="Passage Lookup"
          subtitle="Look up any passage by reference and see its surrounding context."
        >
          <LookupSection />
        </SectionWrapper>
        <SectionWrapper
          id="roadmap"
          title="Coming Soon"
          subtitle="What we're building next for the Urantia community."
        >
          <RoadmapSection />
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
}

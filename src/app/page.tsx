import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SectionWrapper } from "@/components/SectionWrapper";
import { SearchSection } from "@/components/sections/SearchSection";
import { BibleSearchSection } from "@/components/sections/BibleSearchSection";
import { QuoteSection } from "@/components/sections/QuoteSection";
import { AudioSection } from "@/components/sections/AudioSection";
import { EntitySection } from "@/components/sections/EntitySection";
import { LookupSection } from "@/components/sections/LookupSection";
import { ReadingPlanSection } from "@/components/sections/ReadingPlanSection";
import { AccountSection } from "@/components/sections/AccountSection";
import { RoadmapSection } from "@/components/sections/RoadmapSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Dark wrapper lets the hero glow bleed into the first section */}
        <div className="relative overflow-hidden bg-gray-950">
          <Hero />
          <SectionWrapper
            id="search"
            title="Semantic Search"
            subtitle="Ask a question and find conceptually related passages — not just keyword matches."
            variant="transparent"
          >
            <SearchSection />
          </SectionWrapper>
        </div>
        <SectionWrapper
          id="bible-search"
          title="Bible × Urantia Search"
          subtitle="Search the entire Bible in plain English — every result ships with the Urantia paragraphs that parallel it. The only API of its kind."
          variant="alt"
        >
          <BibleSearchSection />
        </SectionWrapper>
        <SectionWrapper
          id="quote"
          title="Random Quote"
          subtitle="Discover inspiring passages from the Urantia Papers."
          variant="alt"
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
          variant="alt"
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
          id="reading-plan"
          title="Reading Plan Builder"
          subtitle="Generate a multi-day reading plan from any topic — powered by semantic search."
          variant="alt"
        >
          <ReadingPlanSection />
        </SectionWrapper>
        <SectionWrapper
          id="account"
          title="Your Account"
          subtitle="Sign in to manage bookmarks, notes, reading progress, and preferences — powered by @urantia/auth."
        >
          <AccountSection />
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

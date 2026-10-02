import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MoreDemos } from "@/components/MoreDemos";
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
import { DEMOS, type DemoId } from "@/lib/demos";

function Demo({ id, variant, children }: { id: DemoId; variant?: "default" | "alt"; children: React.ReactNode }) {
  return (
    <SectionWrapper id={id} title={DEMOS[id].title} subtitle={DEMOS[id].subtitle} variant={variant}>
      {children}
    </SectionWrapper>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Demo id="search">
          <SearchSection />
        </Demo>
        <MoreDemos />
        <Demo id="bible-search">
          <BibleSearchSection />
        </Demo>
        <Demo id="quote" variant="alt">
          <QuoteSection />
        </Demo>
        <Demo id="audio">
          <AudioSection />
        </Demo>
        <Demo id="entities" variant="alt">
          <EntitySection />
        </Demo>
        <Demo id="lookup">
          <LookupSection />
        </Demo>
        <Demo id="reading-plan" variant="alt">
          <ReadingPlanSection />
        </Demo>
        <Demo id="account">
          <AccountSection />
        </Demo>
        <Demo id="roadmap" variant="alt">
          <RoadmapSection />
        </Demo>
      </main>
      <Footer />
    </>
  );
}

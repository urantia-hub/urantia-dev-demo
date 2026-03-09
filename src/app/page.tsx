import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SectionWrapper } from "@/components/SectionWrapper";
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
          <p className="text-gray-500">Demo loading...</p>
        </SectionWrapper>
        <SectionWrapper
          id="quote"
          title="Random Quote"
          subtitle="Discover inspiring passages from the Urantia Papers."
        >
          <p className="text-gray-500">Demo loading...</p>
        </SectionWrapper>
        <SectionWrapper
          id="audio"
          title="Audio Player"
          subtitle="Listen to any passage read aloud in multiple voices."
        >
          <p className="text-gray-500">Demo loading...</p>
        </SectionWrapper>
        <SectionWrapper
          id="entities"
          title="Entity Explorer"
          subtitle="Browse 4,400+ beings, places, and concepts mentioned in the Urantia Papers."
        >
          <p className="text-gray-500">Demo loading...</p>
        </SectionWrapper>
        <SectionWrapper
          id="lookup"
          title="Passage Lookup"
          subtitle="Look up any passage by reference and see its surrounding context."
        >
          <p className="text-gray-500">Demo loading...</p>
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
}

// Every demo section on the home page, in page order. The page and the
// "More demos" index both read this list, so they cannot disagree.
export const DEMOS = {
  search: {
    title: "Semantic Search",
    subtitle: "Ask a question and find passages related in meaning, not only by keyword.",
  },
  "bible-search": {
    title: "Bible × Urantia Search",
    subtitle:
      "Search the Bible in plain English. Every result comes with the Urantia paragraphs that parallel it.",
  },
  quote: {
    title: "Random Quote",
    subtitle: "Discover passages from the Urantia Papers.",
  },
  audio: {
    title: "Audio Player",
    subtitle: "Listen to any passage read aloud in multiple voices.",
  },
  entities: {
    title: "Entity Explorer",
    subtitle: "Browse more than 4,400 entities: the beings, places, and concepts in the Urantia Papers.",
  },
  lookup: {
    title: "Passage Lookup",
    subtitle: "Look up any passage by reference and see its surrounding context.",
  },
  "reading-plan": {
    title: "Reading Plan Builder",
    subtitle: "Build a multi-day reading plan from any topic, with semantic search.",
  },
  account: {
    title: "Your Account",
    subtitle: "Sign in to manage bookmarks, notes, reading progress, and preferences with @urantia/auth.",
  },
  roadmap: {
    title: "Coming Soon",
    subtitle: "What we are building next for the Urantia community.",
  },
} as const;

export type DemoId = keyof typeof DEMOS;

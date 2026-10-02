// The MCP server shipped (https://api.urantia.dev/mcp), so it is not listed here.
const ROADMAP_ITEMS = [
  {
    title: "Translations",
    description:
      "Spanish, French, Portuguese, German, and Korean. AI translations of more than 14,500 paragraphs.",
  },
  {
    title: "ElevenLabs Audio",
    description:
      "Premium multi-voice narration with natural-sounding AI voices across the entire book.",
  },
  {
    title: "Entity Graph",
    description:
      "A visual explorer of the relationships between beings, places, and concepts across papers.",
  },
  {
    title: "Awesome Urantia",
    description: "A curated directory of community-built projects and tools.",
  },
];

export function RoadmapSection() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {ROADMAP_ITEMS.map((item) => (
        <div key={item.title} className="rounded-2xl border border-dashed border-gray-300 bg-white p-6">
          <h3 className="text-base font-semibold text-ink">{item.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

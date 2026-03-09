const ROADMAP_ITEMS = [
  {
    icon: "\u{1F30D}",
    title: "Translations",
    description:
      "Spanish, French, Portuguese, German, Korean \u2014 AI-powered translations of all 14,500+ paragraphs",
  },
  {
    icon: "\u{1F399}\uFE0F",
    title: "ElevenLabs Audio",
    description:
      "Premium multi-voice narration with natural-sounding AI voices across the entire book",
  },
  {
    icon: "\u{1F517}",
    title: "Entity Graph",
    description:
      "Visual explorer showing relationships between beings, places, and concepts across papers",
  },
  {
    icon: "\u{1F916}",
    title: "MCP Server",
    description:
      "Connect the Urantia Papers directly to Claude and other AI assistants",
  },
  {
    icon: "\u2B50",
    title: "Awesome Urantia",
    description:
      "A curated directory of community-built projects and tools",
  },
];

export function RoadmapSection() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ROADMAP_ITEMS.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 transition-colors hover:border-gray-300 hover:bg-gray-50"
        >
          <span className="text-2xl" role="img" aria-label={item.title}>
            {item.icon}
          </span>
          <h3 className="mt-3 text-base font-semibold text-gray-700">
            {item.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-400">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}

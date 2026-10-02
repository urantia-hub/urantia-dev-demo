import { DEMOS, type DemoId } from "@/lib/demos";

// The index below the first demo. It replaces a long row of nav items.
const INDEX: DemoId[] = ["bible-search", "quote", "audio", "entities", "lookup", "reading-plan", "account", "roadmap"];

export function MoreDemos() {
  return (
    <section id="more-demos" className="scroll-mt-20 border-b border-line bg-surface py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">More demos</h2>
        <p className="mt-2 text-base text-ink-soft">Each one calls the same public API.</p>
        <ul className="mt-8 grid gap-x-10 sm:grid-cols-2">
          {INDEX.map((id) => (
            <li key={id} className="border-t border-line">
              <a href={`#${id}`} className="group block py-4">
                <span className="font-semibold text-ink group-hover:text-amber-ink">{DEMOS[id].title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{DEMOS[id].subtitle}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
